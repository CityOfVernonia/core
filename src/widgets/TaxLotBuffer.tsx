import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Graphic from '@arcgis/core/Graphic';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import { unparse } from 'papaparse';

const CSS = {
  content: 'cov-tax-lot-buffer--content',
};

/**
 * Buffer a tax lot.
 */
@subclass('TaxLotBuffer')
export default class TaxLotBuffer extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      view: esri.MapView;
      layer: esri.FeatureLayer;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view: { map },
      _graphics,
    } = this;

    map.add(_graphics);

    this.addHandles(
      this.watch(['state', '_visible', '_selectedFeature'], (): void => {
        const { state, _visible, _selectedFeature } = this;
        if (state === 'buffered') return;
        this.state = _visible && _selectedFeature ? 'selected' : 'ready';
      }),
    );
  }

  view!: esri.MapView;

  layer!: esri.FeatureLayer;

  @property()
  protected state: 'ready' | 'selected' | 'buffering' | 'buffered' | 'error' = 'ready';

  @property({
    aliasOf: 'view.popup.visible',
  })
  private _visible!: boolean;

  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  private _selectedFeature!: esri.Graphic;

  private _graphics = new GraphicsLayer({
    listMode: 'hide',
  });

  private _bufferSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [255, 222, 62],
      width: 2,
      style: 'short-dash',
    },
  });

  private _featureSymbol = new SimpleFillSymbol({
    color: [20, 158, 206, 0.1],
    outline: {
      color: [20, 158, 206],
      width: 1.5,
    },
  });

  private _resultSymbol = new SimpleFillSymbol({
    color: [237, 81, 81, 0.1],
    outline: {
      color: [237, 81, 81],
      width: 1.5,
    },
  });

  private _distance = 0;

  private _id = '';

  private _results: esri.FeatureSet['features'] | [] = [];

  onHide(): void {
    this._clear();
  }

  private _clear(): void {
    const {
      view: { popup },
      _graphics,
    } = this;

    popup.clear();
    popup.close();

    this.state = 'ready';

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

    this.state = 'buffering';

    const result = (await layer.queryFeatures({
      objectIds: [_selectedFeature.attributes[objectIdField]],
      outFields: [objectIdField, 'TAXLOT_ID'],
      returnGeometry: true,
      outSpatialReference: spatialReference,
    })) as esri.FeatureSet;

    // handle error
    if (!result.features && !result.features[0]) {
      this.state = 'error';
      return;
    }

    const { geometry, attributes } = result.features[0];

    this._distance = parseInt((event.target as HTMLFormElement).querySelector('calcite-input')?.value || '10');

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
      this.state = 'error';
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

    view.goTo(this._results);

    this.state = 'buffered';
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

    const a = document.createElement('a');
    a.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(unparse(json))}`);
    a.setAttribute('download', `${_id}_${_distance}_buffer_results.csv`);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render(): tsx.JSX.Element {
    const { id, state, _distance, _id, _results } = this;

    const form = `buffer_form_${id}`;

    return (
      <calcite-panel heading="Tax Lot Buffer">
        <div class={CSS.content} hidden={state !== 'ready'}>
          <calcite-notice icon="information" open="">
            <div slot="message">Select a tax lot in the map to buffer.</div>
          </calcite-notice>
        </div>
        <div class={CSS.content} hidden={state !== 'selected'}>
          <form id={form} onsubmit={this._buffer.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom: 0;">
              Buffer distance (feet)
              <calcite-input type="number" min="10" max="5000" step="10" value="250"></calcite-input>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          form={form}
          hidden={state !== 'selected'}
          slot={state === 'selected' ? 'footer-actions' : null}
          type="submit"
          width="full"
        >
          Buffer
        </calcite-button>
        <div class={CSS.content} hidden={state !== 'buffering'}>
          <calcite-progress text="Buffering" type="indeterminate"></calcite-progress>
        </div>
        <div class={CSS.content} hidden={state !== 'buffered'}>
          <calcite-notice icon="information" open="">
            <div slot="message">
              {_results.length} tax lots within {_distance} feet of tax lot {_id}.
            </div>
          </calcite-notice>
        </div>
        <calcite-button
          hidden={state !== 'buffered'}
          icon-start="file-csv"
          slot={state === 'buffered' ? 'footer-actions' : null}
          width="full"
          onclick={this._download.bind(this)}
        >
          Download
        </calcite-button>
        <calcite-button
          appearance="outline"
          hidden={state !== 'buffered'}
          slot={state === 'buffered' ? 'footer-actions' : null}
          width="full"
          onclick={this._clear.bind(this)}
        >
          Clear
        </calcite-button>
        <div class={CSS.content} hidden={state !== 'error'}>
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
