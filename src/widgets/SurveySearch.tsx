//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

export interface SurveySearchProperties extends esri.WidgetProperties {
  /**
   * Surveys layer.
   */
  surveys: esri.FeatureLayer | esri.GeoJSONLayer;
  /**
   * Tax lots layer.
   */
  taxLots: esri.FeatureLayer;
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
import Collection from '@arcgis/core/core/Collection';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  content: 'cov-widgets--survey-search_content',
  contentSearching: 'cov-widgets--survey-search_content-searching',
  table: 'esri-widget__table',
};

let KEY = 0;

/**
 * Search surveys related to a tax lot.
 */
@subclass('cov.widgets.SurveySearch')
export default class SurveySearch extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: SurveySearchProperties) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view: { map },
      _graphics,
    } = this;
    // add graphics layer
    map.add(_graphics);
    // enable search when tax lot is selected feature of popup
    this.addHandles(
      this.watch(['_viewState', '_visible', '_selectedFeature'], (): void => {
        const { taxLots, _viewState, _visible, _selectedFeature } = this;
        if (_viewState === 'results' || _viewState === 'searching' || _viewState === 'info' || _viewState === 'error')
          return;
        this._viewState = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
      }),
    );
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  surveys!: esri.FeatureLayer | esri.GeoJSONLayer;

  taxLots!: esri.FeatureLayer;

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _infoFeature!: esri.Graphic;

  private _graphics = new GraphicsLayer({ listMode: 'hide' });

  private _results: Collection<tsx.JSX.Element> = new Collection();

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature!: esri.Graphic;

  private _selectedFeatureSymbol = new SimpleFillSymbol({
    color: [20, 158, 206, 0.5],
    outline: {
      color: [20, 158, 206],
      width: 2,
    },
  });

  @property()
  private _selectedResult: esri.Graphic | null = null;

  private _selectedSymbol = new SimpleFillSymbol({
    color: [255, 222, 62, 0.3],
    outline: {
      color: [255, 222, 62],
      width: 2,
    },
  });

  private _resultSymbol = new SimpleFillSymbol({
    color: [237, 81, 81, 0.05],
    outline: {
      color: [237, 81, 81],
      width: 1,
    },
  });

  @property()
  private _viewState: 'ready' | 'selected' | 'searching' | 'results' | 'info' | 'error' = 'ready';

  @property({ aliasOf: 'view.popup.visible' })
  private _visible!: boolean;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  onHide(): void {
    this._clear();
  }

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private _clear(): void {
    const { _results, _graphics } = this;
    _results.removeAll();
    _graphics.removeAll();
    this._selectedResult = null;
    this._viewState = 'ready';
  }

  private async _search(): Promise<void> {
    const {
      view,
      view: { spatialReference },
      taxLots,
      taxLots: { objectIdField },
      surveys,
      _selectedFeature,
      _selectedFeatureSymbol,
      _resultSymbol,
      _results,
      _graphics,
      _graphics: { graphics },
    } = this;
    _results.removeAll();
    _graphics.removeAll();
    this._viewState = 'searching';

    const featureQuery = await (taxLots.queryFeatures({
      where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
      returnGeometry: true,
      outSpatialReference: spatialReference,
    }) as Promise<esri.FeatureSet>);

    const feature = featureQuery.features[0];

    feature.symbol = _selectedFeatureSymbol.clone();

    graphics.add(feature);

    if (!feature) {
      this._viewState = 'error';
      return;
    }
    // query surveys
    const featuresQuery = await (surveys.queryFeatures({
      geometry: geodesicBuffer(feature.geometry, 10, 'feet') as esri.Polygon,
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: spatialReference,
    }) as Promise<esri.FeatureSet>);
    // features
    const features = featuresQuery.features;
    // handle error
    if (!features) {
      this._viewState = 'error';
      return;
    }

    view.closePopup();

    // sort by date
    features.sort((a: any, b: any) => (a.attributes.Timestamp > b.attributes.Timestamp ? -1 : 1));

    features.forEach((feature: esri.Graphic): void => {
      const {
        attributes: { Subdivision, SurveyId, SurveyDate, SurveyType, SurveyUrl },
      } = feature;

      const title = Subdivision ? Subdivision : SurveyId;

      // set symbol
      feature.symbol = _resultSymbol.clone();

      // add to graphics layer
      _graphics.add(feature);

      // add result item
      _results.add(
        <calcite-list-item
          key={KEY++}
          label={title}
          description={`${SurveyType} - ${SurveyDate}`}
          afterCreate={(listItem: HTMLCalciteListItemElement): void => {
            listItem.addEventListener('calciteListItemSelect', this._setSelectedResult.bind(this, feature));
          }}
        >
          <calcite-action
            icon="information"
            slot="actions-end"
            text="View info"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                this._infoFeature = feature;
                this._viewState = 'info';
              });
            }}
          >
            <calcite-tooltip close-on-click="" placement="leading" slot="tooltip">
              Info
            </calcite-tooltip>
          </calcite-action>
          <calcite-action
            slot="actions-end"
            icon="file-pdf"
            text="View PDF"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                window.open(SurveyUrl, '_blank');
              });
            }}
          >
            <calcite-tooltip close-on-click="" placement="leading" slot="tooltip">
              View PDF
            </calcite-tooltip>
          </calcite-action>
        </calcite-list-item>,
      );
    });
    // zoom to features
    view.goTo(_graphics.graphics);
    // set state
    setTimeout((): void => {
      this._viewState = 'results';
    }, 1000);
  }

  private _setSelectedResult(feature: esri.Graphic): void {
    const {
      _selectedResult,
      _selectedSymbol,
      _resultSymbol,
      _graphics: { graphics },
    } = this;
    if (_selectedResult) _selectedResult.symbol = _resultSymbol.clone();
    this._selectedResult = feature;
    feature.symbol = _selectedSymbol.clone();
    graphics.reorder(feature, graphics.length - 1);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _infoFeature, _viewState, _selectedFeature, _results } = this;
    return (
      <calcite-panel heading="Survey Search">
        {/* ready state */}
        <div class={CSS.content} hidden={_viewState !== 'ready'}>
          <calcite-notice icon="cursor-click" open="">
            <div slot="message">Select a tax lot in the map to search for related surveys and plats.</div>
          </calcite-notice>
        </div>

        {/* selected state */}
        <div class={CSS.content} hidden={_viewState !== 'selected'}>
          {_selectedFeature ? (
            <calcite-notice icon="search" open="">
              <div slot="message">
                {_selectedFeature.attributes.TAXLOT_ID}
                <br></br>
                {_selectedFeature.attributes.OWNER}
              </div>
            </calcite-notice>
          ) : null}
        </div>
        <calcite-button
          hidden={_viewState !== 'selected'}
          slot={_viewState === 'selected' ? 'footer' : null}
          width="full"
          onclick={this._search.bind(this)}
        >
          Search Surveys
        </calcite-button>

        {/* searching state */}
        <div class={CSS.contentSearching} hidden={_viewState !== 'searching'}>
          <calcite-progress text="Searching related surveys" type="indeterminate"></calcite-progress>
        </div>

        {/* results state */}
        <div hidden={_viewState !== 'results'}>
          <calcite-list>{_results.toArray()}</calcite-list>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'results'}
          slot={_viewState === 'results' ? 'footer' : null}
          width="full"
          onclick={this._clear.bind(this)}
        >
          Clear
        </calcite-button>

        {/* info state */}
        {this._renderInfo()}
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'info'}
          slot={_viewState === 'info' ? 'footer' : null}
          width="full"
          onclick={(): void => {
            this._viewState = 'results';
          }}
        >
          Back
        </calcite-button>
        <calcite-button
          hidden={_viewState !== 'info'}
          slot={_viewState === 'info' ? 'footer' : null}
          width="full"
          onclick={(): void => {
            if (_infoFeature) window.open(_infoFeature.attributes.SurveyUrl, '_blank');
          }}
        >
          View PDF
        </calcite-button>

        {/* error state */}
        <div class={CSS.content} hidden={_viewState !== 'error'}>
          <calcite-notice icon="exclamation-mark-circle" kind="danger" open="">
            <div slot="message">An error occurred searching surveys.</div>
            <calcite-link onclick={this._clear.bind(this)} slot="link">
              Try again
            </calcite-link>
          </calcite-notice>
        </div>
      </calcite-panel>
    );
  }

  private _renderInfo(): tsx.JSX.Element | null {
    const { _infoFeature, _viewState } = this;
    if (!_infoFeature || _viewState !== 'info') return null;
    const { SurveyType, SurveyId, SurveyDate, FileDate, Comments, Sheets, Subdivision, Client, Firm } =
      _infoFeature.attributes;
    this._setSelectedResult(_infoFeature);
    return (
      <table key={KEY++} class={CSS.table}>
        <tr>
          <th>Id</th>
          <td>{SurveyId}</td>
        </tr>
        <tr>
          <th>Type</th>
          <td>{SurveyType}</td>
        </tr>
        {Subdivision ? (
          <tr>
            <th>Name</th>
            <td>{Subdivision}</td>
          </tr>
        ) : null}
        <tr>
          <th>Client</th>
          <td>{Client}</td>
        </tr>
        <tr>
          <th>Firm</th>
          <td>{Firm}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>{SurveyDate}</td>
        </tr>
        <tr>
          <th>Filed</th>
          <td>{FileDate}</td>
        </tr>
        <tr>
          <th>Comments</th>
          <td>{Comments}</td>
        </tr>
        <tr>
          <th>Pages</th>
          <td>{Sheets}</td>
        </tr>
      </table>
    );
  }
}
