/**
 * Simple info widget for displaying text.
 */

// namespaces and types
import cov = __cov;

// base imports
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';

// styles
import './TaxLotSurveys.scss';
const CSS = {
  base: 'cov-tax-lot-surveys cov-widget',
  results: 'cov-tax-lot-surveys--results',
  result: 'cov-tax-lot-surveys--result',
  resultStrong: 'cov-tax-lot-surveys--strong',
  resultSmall: 'cov-tax-lot-surveys--small',
};

// class export
@subclass('cov.widgets.TaxLotSurveys')
export default class TaxLotSurveys extends Widget {
  @property()
  view!: esri.MapView;

  @property()
  taxLotLayer!: esri.FeatureLayer;

  @property()
  surveysLayer!: esri.FeatureLayer;

  @property()
  symbol = new SimpleFillSymbol({
    color: [255, 0, 0, 0.1],
    outline: {
      color: [255, 0, 0, 0.5],
      width: 1,
    },
  });

  @property()
  highlightSymbol = new SimpleFillSymbol({
    color: [255, 0, 0, 0.5],
    outline: {
      color: [255, 0, 0, 1],
      width: 2,
    },
  });

  @property()
  protected graphicsLayer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  private _selectedFeature!: esri.Graphic;

  @property()
  private _results: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _bufferInput!: HTMLCalciteInputElement;

  constructor(properties: cov.TaxLotSurveysProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      graphicsLayer,
    } = this;

    await view.when();

    map.add(graphicsLayer);
  }

  /**
   * Is popup visible and selected feature a tax lot?
   * @returns boolean
   */
  private _isTaxLot(): boolean {
    const { view, taxLotLayer, _selectedFeature } = this;

    if (!_selectedFeature || !view.popup.visible) return false;

    return taxLotLayer === _selectedFeature.layer;
  }

  /**
   * Clear results.
   */
  private _clear(): void {
    const { graphicsLayer, _results } = this;

    graphicsLayer.removeAll();

    _results.removeAll();
  }

  /**
   * Query surveys.
   */
  private _querySurveys(): void {
    const {
      view,
      taxLotLayer,
      surveysLayer,
      symbol,
      graphicsLayer,
      _selectedFeature,
      _selectedFeature: { layer },
      _results,
      _bufferInput,
    } = this;

    const objectIdField = (layer as esri.FeatureLayer).objectIdField;

    this._clear();

    taxLotLayer
      .queryFeatures({
        where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
        returnGeometry: true,
        outSpatialReference: view.spatialReference,
      })
      .then((results: esri.supportFeatureSet) => {
        let distance = parseInt(_bufferInput.value || '0');
        distance = distance < 10 ? 10 : distance;

        const geometry = geodesicBuffer(results.features[0].geometry, distance, 'feet') as esri.Polygon;

        surveysLayer
          .queryFeatures({
            geometry,
            outFields: ['*'],
            returnGeometry: true,
            outSpatialReference: view.spatialReference,
            orderByFields: ['SurveyDate DESC'],
          })
          .then((results: esri.supportFeatureSet) => {
            results.features.sort((a, b) => (a.attributes.SurveyDate > b.attributes.SurveyDate ? -1 : 1));

            results.features.forEach((feature: esri.Graphic) => {
              feature.symbol = symbol;

              graphicsLayer.add(feature);

              _results.add(this._createResult(feature));
            });
          });
      });
  }

  private _createResult(feature: esri.Graphic): tsx.JSX.Element {
    const {
      attributes: { SurveyType, SURVEYID, Client, Firm, SurveyDate, Subdivisio, SVY_IMAGE },
    } = feature;

    const type =
      SurveyType === 'Survey' || SurveyType === 'Partition' || SurveyType === 'Subdivision' ? SurveyType : 'Other';

    const title = SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;

    const url = `https://gis.columbiacountymaps.com/Surveys/${SVY_IMAGE}`;

    return (
      <div class={CSS.result}>
        <div class={CSS.resultStrong}>{type}</div>
        <div>
          <calcite-link
            href={url}
            target="_blank"
            onclick={() => {
              window.open(url, '_blank');
            }}
          >
            {title}
          </calcite-link>
          &nbsp;&nbsp;
          <calcite-link
            href={url}
            target="_blank"
            onclick={() => {
              this._highlight(feature);
            }}
          >
            Highlight
          </calcite-link>
        </div>
        <div class={CSS.resultSmall}>
          <span class={CSS.resultStrong}>Client:</span> {Client}
        </div>
        <div class={CSS.resultSmall}>
          <span class={CSS.resultStrong}>Surveyor:</span> {Firm}
        </div>
        <div class={CSS.resultSmall}>
          <span class={CSS.resultStrong}>Date:</span> {new Date(SurveyDate).toISOString().split('T')[0]}
        </div>
      </div>
    );
  }

  private _highlight(feature: esri.Graphic): void {
    const { geometry } = feature;
    const { view, symbol, highlightSymbol } = this;

    view.goTo(geometry);

    feature.symbol = highlightSymbol;

    setTimeout(() => {
      feature.symbol = symbol;
    }, 1500);
  }

  render(): tsx.JSX.Element {
    const { _results } = this;

    const isTaxLot = this._isTaxLot();

    if (isTaxLot && !_results.length) {
      return (
        <div class={CSS.base}>
          <calcite-label layout="default">
            Buffer distance (feet)
            <calcite-input
              type="number"
              min="0"
              max="500"
              step="1"
              value="0"
              afterCreate={(input: HTMLCalciteInputElement) => {
                this._bufferInput = input;
              }}
            ></calcite-input>
          </calcite-label>
          <calcite-button onclick={this._querySurveys.bind(this)}>Query Surveys</calcite-button>
        </div>
      );
    } else if (_results.length) {
      return (
        <div class={CSS.base}>
          <div class={CSS.results}>{_results.toArray()}</div>
          <calcite-button onclick={this._clear.bind(this)}>Clear</calcite-button>
        </div>
      );
    } else {
      return <div class={CSS.base}>Select a tax lot in the map to query related surveys.</div>;
    }
  }
}
