//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

export interface TaxLotBufferConstructorProperties extends esri.WidgetProperties {
  /**
   * Tax lot layer.
   */
  layer: esri.FeatureLayer;
  /**
   * Map view.
   */
  view: esri.MapView;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Graphic from '@arcgis/core/Graphic';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import { unparse } from 'papaparse';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  content: 'cov-panels--tax-lot-buffer_content',
};

/**
 * A widget for buffering a tax lot and downloading results.
 */
@subclass('cov.panels.TaxLotBuffer')
class TaxLotBuffer extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: TaxLotBufferConstructorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view: { map },
      _graphics,
    } = this;

    map.add(_graphics);

    this.addHandles([
      this.watch(['_viewState', '_visible', '_selectedFeature'], (): void => {
        const { _viewState, _visible, _selectedFeature } = this;
        if (_viewState === 'buffered') return;
        this._viewState = _visible && _selectedFeature ? 'selected' : 'ready';
      }),
      this.watch('visible', (visible: boolean): void => {
        if (!visible) this._clear();
      }),
    ]);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  layer!: esri.FeatureLayer;

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _bufferSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [255, 222, 62],
      width: 2,
      style: 'short-dash',
    },
  });

  private _distance = 0;

  private _featureSymbol = new SimpleFillSymbol({
    color: [20, 158, 206, 0.1],
    outline: {
      color: [20, 158, 206],
      width: 1.5,
    },
  });

  private _graphics = new GraphicsLayer({
    listMode: 'hide',
  });

  private _id = '';

  private _results: esri.FeatureSet['features'] | [] = [];

  private _resultSymbol = new SimpleFillSymbol({
    color: [237, 81, 81, 0.1],
    outline: {
      color: [237, 81, 81],
      width: 1.5,
    },
  });

  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  private _selectedFeature!: esri.Graphic;

  @property()
  protected _viewState: 'ready' | 'selected' | 'buffering' | 'buffered' | 'error' = 'ready';

  @property({
    aliasOf: 'view.popup.visible',
  })
  private _visible!: boolean;

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private _clear(): void {
    const { view, _graphics } = this;
    view.closePopup();
    this._viewState = 'ready';
    _graphics.removeAll();
  }

  private async _buffer(event: Event): Promise<void> {
    const {
      view,
      view: { spatialReference },
      layer,
      layer: { objectIdField },
      _selectedFeature,
      _graphics,
      _bufferSymbol,
      _featureSymbol,
      _resultSymbol,
    } = this;

    event.preventDefault();

    this._viewState = 'buffering';

    const result = (await layer.queryFeatures({
      objectIds: [_selectedFeature.attributes[objectIdField]],
      outFields: [objectIdField, 'TAXLOT_ID'],
      returnGeometry: true,
      outSpatialReference: spatialReference,
    })) as esri.FeatureSet;

    // handle error
    if (!result.features && !result.features[0]) {
      this._viewState = 'error';
      return;
    }

    const { geometry, attributes } = result.features[0];

    this._distance = parseInt((event.target as HTMLFormElement).querySelector('calcite-input-number')?.value || '10');

    this._id = attributes.TAXLOT_ID;

    const buffer = geodesicBuffer(geometry, this._distance, 'feet') as esri.Polygon;

    const bufferResults = (await layer.queryFeatures({
      where: `${objectIdField} <> ${attributes[objectIdField]}`,
      geometry: buffer,
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: spatialReference,
    })) as esri.FeatureSet;

    // handle error
    if (!bufferResults.features) {
      this._viewState = 'error';
      return;
    }

    this._results = bufferResults.features;

    bufferResults.features.forEach((graphic: esri.Graphic): void => {
      graphic.symbol = _resultSymbol;
      _graphics.add(graphic);
    });
    _graphics.add(
      new Graphic({
        geometry,
        symbol: _featureSymbol,
      }),
    );
    _graphics.add(
      new Graphic({
        geometry: buffer,
        symbol: _bufferSymbol,
      }),
    );
    view.closePopup();
    view.goTo(this._results);
    this._viewState = 'buffered';
  }

  private _download(): void {
    const { _id, _distance, _results } = this;

    if (!_results.length) return;

    const json = _results.map((feature: Graphic) => {
      const { attributes } = feature;
      // just need one account link in download
      const accounts = attributes.ACCOUNT_IDS.split(',').map((account: string) => {
        return `https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${account}&QueryYear=2023&Roll=R`;
      });
      const result = {
        'Tax Lot': attributes.TAXLOT_ID,
        Owner: attributes.OWNER,
        Address: attributes.ADDRESS,
        Account: accounts[0] || ' ',
      };
      return result;
    });

    const a = Object.assign(document.createElement('a'), {
      href: `data:text/csv;charset=utf-8,${encodeURIComponent(unparse(json))}`,
      download: `${_id}_${_distance}_buffer_results.csv`,
      style: {
        display: 'none',
      },
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { id, _viewState, _distance, _id, _results } = this;

    const form = `buffer_form_${id}`;

    return (
      <calcite-panel heading="Tax Lot Buffer">
        {/* ready state */}
        <div class={CSS.content} hidden={_viewState !== 'ready'}>
          <calcite-notice icon="cursor-click" open="">
            <div slot="message">Select a tax lot in the map to buffer.</div>
          </calcite-notice>
        </div>

        {/* selected state */}
        <div class={CSS.content} hidden={_viewState !== 'selected'}>
          <form id={form} onsubmit={this._buffer.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom: 0;">
              Distance
              <calcite-input-number min="10" max="5000" step="10" suffix-text="feet" value="250"></calcite-input-number>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          form={form}
          hidden={_viewState !== 'selected'}
          slot={_viewState === 'selected' ? 'footer' : null}
          type="submit"
          width="full"
        >
          Buffer
        </calcite-button>

        {/* buffering state */}
        <div class={CSS.content} hidden={_viewState !== 'buffering'}>
          <calcite-progress text="Buffering" type="indeterminate"></calcite-progress>
        </div>

        {/* buffered state */}
        <div class={CSS.content} hidden={_viewState !== 'buffered'}>
          <calcite-notice icon="information" open="">
            <div slot="title">{_id}</div>
            <div slot="message">
              {_results.length} tax lots within {_distance} feet.
            </div>
          </calcite-notice>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'buffered'}
          slot={_viewState === 'buffered' ? 'footer' : null}
          width="full"
          onclick={this._clear.bind(this)}
        >
          Clear
        </calcite-button>
        <calcite-button
          hidden={_viewState !== 'buffered'}
          icon-start="file-csv"
          slot={_viewState === 'buffered' ? 'footer' : null}
          width="full"
          onclick={this._download.bind(this)}
        >
          Download
        </calcite-button>

        {/* error state */}
        <div class={CSS.content} hidden={_viewState !== 'error'}>
          <calcite-notice icon="exclamation-mark-circle" kind="danger" open="">
            <div slot="message">An error has occurred.</div>
            <calcite-link slot="link" onclick={this._clear.bind(this)}>
              Try again
            </calcite-link>
          </calcite-notice>
        </div>
      </calcite-panel>
    );
  }
}

export default TaxLotBuffer;
