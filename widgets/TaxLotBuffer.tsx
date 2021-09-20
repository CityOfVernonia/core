/**
 * Widget for buffering tax lots.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import { hexColors, rgbColors } from './../support/colors';
import { propertyInfoUrl } from '@vernonia/assessor-urls/src/AssessorURLs';
import { unparse } from 'papaparse';

// styles
import './TaxLotBuffer.scss';
import Collection from '@arcgis/core/core/Collection';
const CSS = {
  base: 'cov-tax-lot-buffer cov-widget',
  title: 'cov-tax-lot-buffer--title',
  results: 'cov-tax-lot-buffer--results',
};

// class export
@subclass('cov.widgets.TaxLotBuffer')
export default class TaxLotBuffer extends Widget {
  @property()
  view!: esri.MapView;

  @property()
  layer!: esri.FeatureLayer;

  @property({
    aliasOf: 'view.popup.visible',
  })
  private _visible!: boolean;

  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  private _selectedFeature!: esri.Graphic;

  @property()
  private _distanceInput!: HTMLCalciteInputElement;

  @property()
  private _graphics = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  private _bufferSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: hexColors.yellow,
      width: 2.5,
      style: 'short-dash',
    },
  });

  @property()
  private _resultSymbol = new SimpleFillSymbol({
    color: [...rgbColors.red, 0.25],
    outline: {
      color: hexColors.red,
      width: 1,
    },
  });

  @property()
  private _feature: esri.Graphic | null = null;

  @property()
  private _results: esri.FeatureSet['features'] | [] = [];

  @property()
  private _listItems: esri.Collection<tsx.JSX.Element> = new Collection();

  constructor(properties: cov.TaxLotBufferProperties) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view: { map },
      _graphics,
    } = this;
    map.add(_graphics);
  }

  private _isTaxLot(): esri.Graphic | null {
    const { layer, _visible, _selectedFeature } = this;
    return _visible && _selectedFeature && _selectedFeature.layer === layer ? _selectedFeature : null;
  }

  private _initBuffer(event: Event): void {
    const {
      view,
      layer,
      layer: { objectIdField },
      _selectedFeature,
    } = this;
    const button = event.target as HTMLCalciteButtonElement;
    button.loading = true;

    layer
      .queryFeatures({
        objectIds: [_selectedFeature.attributes[objectIdField]],
        outFields: [objectIdField, 'TAXLOT_ID'],
        returnGeometry: true,
        outSpatialReference: view.spatialReference,
      })
      .then((result: esri.FeatureSet) => {
        this._feature = result.features[0];
        this._buffer(button, result.features[0]);
      })
      .catch(() => {
        button.loading = false;
      });
  }

  private _buffer(button: HTMLCalciteButtonElement, result: esri.Graphic): void {
    const {
      view,
      layer,
      layer: { objectIdField },
      _distanceInput: { value },
      _graphics,
      _bufferSymbol,
      _resultSymbol,
      _listItems,
    } = this;
    const { geometry, attributes } = result;

    const buffer = geodesicBuffer(geometry, parseInt(value || '10'), 'feet') as esri.Polygon;

    layer
      .queryFeatures({
        where: `${objectIdField} <> ${attributes[objectIdField]}`,
        geometry: buffer,
        outFields: ['*'],
        returnGeometry: true,
        outSpatialReference: view.spatialReference,
      })
      .then((result: esri.FeatureSet) => {
        const { features } = result;
        this._results = features;
        features.forEach((feature: esri.Graphic) => {
          const { attributes } = feature;
          feature.symbol = _resultSymbol;
          _graphics.add(feature);
          _listItems.add(
            <calcite-list-item
              label={attributes.TAXLOT_ID}
              description={attributes.OWNER}
              onclick={(): void => {
                view.popup.clear();
                view.popup.open({
                  features: [feature],
                });
              }}
            >
              {attributes.ACCOUNT_IDS.split(',').map((account: string): tsx.JSX.Element => {
                return (
                  <calcite-action
                    scale="s"
                    slot="actions-end"
                    icon="launch"
                    onclick={(): void => {
                      window.open(propertyInfoUrl(account, 2021), '_blank');
                    }}
                  ></calcite-action>
                );
              })}
            </calcite-list-item>,
          );
        });
        _graphics.add(
          new Graphic({
            geometry: buffer,
            symbol: _bufferSymbol,
          }),
        );
        view.goTo(features);
        view.popup.close();
        button.loading = false;
      })
      .catch(() => {
        button.loading = false;
      });
  }

  private _clear(): void {
    const { _graphics, _listItems } = this;
    _graphics.removeAll();
    this._results = [];
    this._feature = null;
    _listItems.removeAll();
  }

  private _downloadCSV(): void {
    const { _feature, _results } = this;
    if (!_results.length) return;

    const json = _results.map((feature: Graphic) => {
      const { attributes } = feature;

      // just need one account link in download
      const accounts = attributes.ACCOUNT_IDS.split(',').map((account: string) => {
        return propertyInfoUrl(account, 2021);
      });

      const result = {
        'Tax Lot': attributes.TAXLOT_ID,
        Owner: attributes.OWNER,
        Address: attributes.ADDRESS,
        Account: accounts[0] || ' ',
      };

      return result;
    });

    const csv = unparse(json);

    const a = document.createElement('a');
    a.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    a.setAttribute('download', `${_feature?.attributes.TAXLOT_ID}_BufferResults.csv`);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render(): tsx.JSX.Element {
    const {
      _results: { length },
    } = this;

    return (
      <div class={CSS.base}>
        <div class={CSS.title}>Tax Lot Buffer</div>
        {length ? <div>{this._renderResults()}</div> : this._renderBuffer()}
      </div>
    );
  }

  private _renderBuffer(): tsx.JSX.Element {
    const selected = this._isTaxLot();
    const attributes = selected ? selected.attributes : null;

    return selected ? (
      <div>
        <calcite-label>
          Buffer distance (feet)
          <calcite-input
            type="number"
            min="10"
            max="5000"
            step="10"
            value="250"
            bind={this}
            afterCreate={storeNode}
            data-node-ref="_distanceInput"
          ></calcite-input>
        </calcite-label>
        <calcite-button width="full" onclick={this._initBuffer.bind(this)}>
          Buffer {attributes.TAXLOT_ID}
        </calcite-button>
      </div>
    ) : (
      <p>Select a tax lot in the map to buffer.</p>
    );
  }

  private _renderResults(): tsx.JSX.Element | null {
    const {
      _results: { length },
      _feature,
      _distanceInput: { value },
      _listItems,
    } = this;

    return (
      <div class={CSS.results}>
        <p>
          {length} tax lots within {value} feet of {_feature?.attributes.TAXLOT_ID}.
        </p>
        <calcite-button width="full" icon-start="file-csv" onclick={this._downloadCSV.bind(this)}>
          Download CSV
        </calcite-button>
        <calcite-button width="full" icon-start="x" onclick={this._clear.bind(this)}>
          Clear
        </calcite-button>
        {_listItems.toArray()}
      </div>
    );
  }
}
