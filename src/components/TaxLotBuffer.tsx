import esri = __esri;

interface I {
  viewState: 'ready' | 'selected' | 'buffering' | 'results' | 'error';
}

export interface TaxLotBufferProperties extends esri.WidgetProperties {
  taxLots: esri.FeatureLayer;
  view: esri.MapView;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
// import Collection from '@arcgis/core/core/Collection';
import Graphic from '@arcgis/core/Graphic';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import {
  load as bufferLoad,
  isLoaded as bufferLoaded,
  execute as geodesicBuffer,
} from '@arcgis/core/geometry/operators/geodesicBufferOperator';
import { propertyInfoUrl } from './../support/taxLotUtils';
import { unparse } from 'papaparse';

const CSS_BASE = 'cov--tax-lot-buffer';

const CSS = {
  background: `${CSS_BASE}_background`,
  buffering: `${CSS_BASE}_buffering`,
};

@subclass('cov.components.TaxLotBuffer')
export default class TaxLotBuffer extends Widget {
  constructor(properties: TaxLotBufferProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.addHandles([
      watch((): boolean => this._popupVisible, this._setState.bind(this)),
      watch((): esri.Graphic | nullish => this._selectedFeature, this._setState.bind(this)),
      watch((): I['viewState'] => this._viewState, this._setState.bind(this)),
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          if (!visible) this._clear();
        },
      ),
    ]);
  }

  taxLots!: esri.FeatureLayer;

  view!: esri.MapView;

  private _distance = 250;

  private _graphics!: esri.GraphicsLayer;

  @property({ aliasOf: 'view.popup.visible' })
  private _popupVisible!: boolean;

  private _results: esri.Graphic[] = [];

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature!: esri.Graphic;

  private _symbols = {
    buffer: new SimpleFillSymbol({
      color: [0, 0, 0, 0],
      outline: {
        color: [255, 222, 62],
        width: 2,
        style: 'short-dash',
      },
    }),
    results: new SimpleFillSymbol({
      color: [237, 81, 81, 0.1],
      outline: {
        color: [237, 81, 81],
        width: 1.5,
      },
    }),
    taxLot: new SimpleFillSymbol({
      color: [20, 158, 206, 0.1],
      outline: {
        color: [20, 158, 206],
        width: 1.5,
      },
    }),
  };

  private _taxLotId = '';

  @property()
  private _viewState: I['viewState'] = 'ready';

  private async _buffer(event: Event): Promise<void> {
    event.preventDefault();

    const {
      taxLots,
      taxLots: { objectIdField },
      view,
      view: { spatialReference },
      _distance,
      _selectedFeature,
      _symbols,
    } = this;

    if (!this._taxLotSelected()) {
      this._viewState = 'error';
      return;
    }

    this._viewState = 'buffering';

    if (!this._graphics) await this._loadLayer();

    const { _graphics } = this;

    try {
      const featureQuery = await taxLots.queryFeatures({
        where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
        returnGeometry: true,
        outSpatialReference: spatialReference,
      });

      const feature = featureQuery.features[0];

      if (!feature) {
        this._viewState = 'error';
        return;
      }

      this._taxLotId = feature.attributes.TAXLOT_ID;

      if (!bufferLoaded()) await bufferLoad();

      const geometry = geodesicBuffer(feature.geometry as esri.Polygon, _distance, { unit: 'feet' }) as esri.Polygon;

      const bufferQuery = await taxLots.queryFeatures({
        where: `${objectIdField} <> ${_selectedFeature.attributes[objectIdField]}`,
        geometry,
        returnGeometry: true,
        outFields: ['*'],
        outSpatialReference: spatialReference,
      });

      const features = bufferQuery.features;

      view.closePopup();

      this._results = features.map((_feature: esri.Graphic): esri.Graphic => {
        const { _symbols } = this;

        _feature.symbol = _symbols.results.clone();

        _feature.popupTemplate = null;

        _graphics.add(_feature);

        return _feature;
      });

      _graphics.add(
        new Graphic({
          geometry: feature.geometry,
          symbol: _symbols.taxLot.clone(),
          popupTemplate: null,
        }),
      );

      _graphics.add(
        new Graphic({
          geometry,
          symbol: _symbols.buffer.clone(),
          popupTemplate: null,
        }),
      );

      view.goTo(_graphics.graphics);

      setTimeout((): void => {
        this._viewState = 'results';
      }, 1000);
    } catch (error) {
      console.log(error);

      this._viewState = 'error';
    }
  }

  private _clear(): void {
    const { _graphics } = this;

    if (_graphics) _graphics.removeAll();

    this._results = [];

    this._viewState = 'ready';
  }

  private async _download(event: Event): Promise<void> {
    const {
      _distance,
      taxLots,
      taxLots: { objectIdField },
      _results,
      _taxLotId,
    } = this;

    const button = event.target as HTMLCalciteButtonElement;

    if (!_results.length) return;

    button.loading = true;

    button.disabled = true;

    try {
      const taxDataResults = await taxLots.queryRelatedFeatures({
        objectIds: _results.map((result: esri.Graphic): number => {
          return result.attributes[objectIdField];
        }),
        outFields: ['M_ADDRESS', 'M_CITY', 'M_STATE', 'M_ZIP'],
        relationshipId: 0,
      });

      const json = _results.map((result: esri.Graphic): object => {
        const { TAXLOT_ID, ACCELA_MT, ACCOUNT_IDS, TAXMAP, ADDRESS, ACRES } = result.attributes;

        const objectId = result.attributes[objectIdField];

        const accountLink = ACCOUNT_IDS
          ? ACCOUNT_IDS.split(',').map((account: string) => {
              return propertyInfoUrl(account);
            })[0]
          : 'NO ACCOUNT';

        const data = {
          TAXLOT_ID,
          ACCELA_MT,
          ACCOUNT_IDS: ACCOUNT_IDS || 'UNKNOWN',
          TAXMAP,
          ADDRESS,
          ACRES,
          ACCOUNT_LINK: accountLink || '',
          M_ADDRESS: '',
          M_CITY: '',
          M_STATE: '',
          M_ZIP: '',
        };

        const feature = taxDataResults[objectId]?.features[0] as esri.Graphic;

        if (feature) {
          const { M_ADDRESS, M_CITY, M_STATE, M_ZIP } = feature.attributes;

          return Object.assign(data, {
            M_ADDRESS,
            M_CITY,
            M_STATE,
            M_ZIP,
          });
        }

        return data;
      });

      const a = Object.assign(document.createElement('a'), {
        href: `data:text/csv;charset=utf-8,${encodeURIComponent(unparse(json))}`,
        download: `${_taxLotId}_${_distance}_buffer_results.csv`,
        style: {
          display: 'none',
        },
      });

      a.click();

      button.loading = false;

      button.disabled = false;
    } catch (error) {
      console.log(error);

      button.loading = false;

      button.disabled = false;

      this._viewState = 'error';
    }
  }

  private async _loadLayer(): Promise<void> {
    const { view } = this;

    this._graphics = new (await import('@arcgis/core/layers/GraphicsLayer')).default({ listMode: 'hide' });

    view.map.add(this._graphics);
  }

  private _setState(): void {
    const { _popupVisible, _viewState } = this;

    if (_viewState === 'results' || _viewState === 'buffering' || _viewState === 'error') return;

    this._viewState = _popupVisible && this._taxLotSelected() ? 'selected' : 'ready';
  }

  private _taxLotSelected(): boolean {
    const { taxLots, _selectedFeature } = this;

    return _selectedFeature && _selectedFeature.layer === taxLots;
  }

  override render(): tsx.JSX.Element {
    const {
      _distance,
      _results: { length },
      _viewState,
    } = this;

    return (
      <calcite-panel
        heading="Tax Lot Buffer"
        class={this.classes(CSS_BASE, _viewState === 'buffering' || _viewState === 'selected' ? CSS.background : null)}
      >
        {/* ready */}
        {_viewState === 'ready' ? (
          <calcite-notice icon="cursor-click" kind="brand" open style="width: 100%;">
            <div slot="message">Select a tax lot in the map to buffer.</div>
          </calcite-notice>
        ) : null}

        {/* selected */}
        {/* form and form id do not work with button using this rendering pattern */}
        {_viewState === 'selected'
          ? [
              <form onsubmit={this._buffer.bind(this)}>
                <calcite-label style="--calcite-label-margin-bottom: 0;">
                  Distance
                  <calcite-input-number
                    min="10"
                    max="5000"
                    step="10"
                    suffix-text="feet"
                    value="250"
                    afterCreate={this._inputAfterCreate.bind(this)}
                  ></calcite-input-number>
                </calcite-label>
              </form>,
              <calcite-button slot="footer" width="full" onclick={this._buffer.bind(this)}>
                Buffer
              </calcite-button>,
            ]
          : null}

        {/* buffering */}
        {_viewState === 'buffering' ? (
          <div class={CSS.buffering}>
            <calcite-progress text="Buffering tax lot" type="indeterminate"></calcite-progress>
          </div>
        ) : null}

        {/* results */}
        {_viewState === 'results'
          ? [
              <calcite-notice icon="information" kind="brand" open style="width: 100%;">
                <div slot="message">
                  {length} tax lots within {_distance} feet.
                </div>
              </calcite-notice>,
              <calcite-button appearance="outline" slot="footer" width="half" onclick={this._clear.bind(this)}>
                Clear
              </calcite-button>,
              <calcite-button icon-start="file-csv" slot="footer" width="half" onclick={this._download.bind(this)}>
                Download
              </calcite-button>,
            ]
          : null}

        {/* error */}
        {_viewState === 'error' ? (
          <calcite-notice icon="exclamation-mark-circle" kind="danger" open style="width: 100%;">
            <div slot="message">An error occurred.</div>
            <calcite-link slot="link" onclick={this._clear.bind(this)}>
              Try again
            </calcite-link>
          </calcite-notice>
        ) : null}
      </calcite-panel>
    );
  }

  private _inputAfterCreate(input: HTMLCalciteInputNumberElement): void {
    input.addEventListener('calciteInputNumberInput', (): void => {
      this._distance = Number(input.value);
    });
  }
}
