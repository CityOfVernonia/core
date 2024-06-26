//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Result information.
 */
interface SurveyInfo {
  feature: esri.Graphic;
  listItem: tsx.JSX.Element;
  infoTable: tsx.JSX.Element;
}

/**
 * Survey Search widget properties.
 */
export interface SurveySearchConstructorProperties extends esri.WidgetProperties {
  /**
   * Surveys GeoJSONLayer URL.
   */
  surveysGeoJSONUrl: string;
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
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  content: 'cov-panels--survey-search_content',
  contentSearching: 'cov-panels--survey-search_content-searching',
  table: 'esri-widget__table',
};

let KEY = 0;

/**
 * Search surveys related to a tax lot.
 */
@subclass('cov.panels.SurveySearch')
class SurveySearch extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: SurveySearchConstructorProperties) {
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
    this.addHandles([
      this.watch(['_viewState', '_visible', '_selectedTaxLot'], (): void => {
        const { taxLots, _viewState, _visible, _selectedTaxLot } = this;
        if (_viewState === 'results' || _viewState === 'searching' || _viewState === 'info' || _viewState === 'error')
          return;
        this._viewState = _visible && _selectedTaxLot && _selectedTaxLot.layer === taxLots ? 'selected' : 'ready';
      }),
      this.watch('visible', (visible: boolean): void => {
        if (!visible) this._clear();
      }),
    ]);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////

  surveysGeoJSONUrl!: string;

  taxLots!: esri.FeatureLayer;

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _graphics = new GraphicsLayer({ listMode: 'hide' });

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedTaxLot!: esri.Graphic;

  private _selectedTaxLotSymbol = new SimpleFillSymbol({
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

  _surveys!: esri.GeoJSONLayer;

  private _surveyInfos: esri.Collection<SurveyInfo> = new Collection();

  @property()
  private _surveyInfoIndex: number | null = null;

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
  // Private methods
  //////////////////////////////////////
  private _clear(): void {
    const { _graphics, _surveyInfos } = this;
    _graphics.removeAll();
    _surveyInfos.removeAll();
    this._selectedResult = null;
    this._viewState = 'ready';
  }

  private async _search(): Promise<void> {
    const {
      view,
      view: { spatialReference },
      taxLots,
      taxLots: { objectIdField },
      surveysGeoJSONUrl,
      _selectedTaxLot,
      _selectedTaxLotSymbol,
      _surveys,
      _surveyInfos,
      _resultSymbol,
      _graphics,
      _graphics: { graphics },
    } = this;
    _graphics.removeAll();
    this._viewState = 'searching';

    if (!_surveys) {
      this._surveys = new GeoJSONLayer({ url: surveysGeoJSONUrl });
      this._search();
      return;
    }

    const featureQuery = await (taxLots.queryFeatures({
      where: `${objectIdField} = ${_selectedTaxLot.attributes[objectIdField]}`,
      returnGeometry: true,
      outSpatialReference: spatialReference,
    }) as Promise<esri.FeatureSet>);

    const feature = featureQuery.features[0];

    feature.symbol = _selectedTaxLotSymbol.clone();

    graphics.add(feature);

    if (!feature) {
      this._viewState = 'error';
      return;
    }
    // query surveys
    const featuresQuery = await (_surveys.queryFeatures({
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

    features.forEach((feature: esri.Graphic, index: number): void => {
      const {
        attributes: {
          Client,
          Comments,
          FileDate,
          Firm,
          SurveyDate,
          SurveyType,
          Sheets,
          Subdivision,
          SurveyId,
          SurveyUrl,
        },
      } = feature;

      // set symbol
      feature.symbol = _resultSymbol.clone();

      // add to graphics layer
      _graphics.add(feature);

      const title = Subdivision ? Subdivision : SurveyId;

      _surveyInfos.add({
        feature,
        listItem: (
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
                  this._setSelectedResult(feature);
                  this._surveyInfoIndex = index;
                  this._viewState = 'info';
                });
              }}
            >
              <calcite-tooltip close-on-click="" overlay-positioning="fixed" placement="leading" slot="tooltip">
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
              <calcite-tooltip close-on-click="" overlay-positioning="fixed" placement="trailing" slot="tooltip">
                PDF
              </calcite-tooltip>
            </calcite-action>
          </calcite-list-item>
        ),
        infoTable: (
          <table key={KEY++} class={CSS.table}>
            <tr>
              <th>Survey id</th>
              <td>
                <calcite-link href={SurveyUrl} target="_blank">
                  {SurveyId}
                </calcite-link>
              </td>
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
              <td>{(Sheets as number).toString()}</td>
            </tr>
          </table>
        ),
      });
    });
    // zoom to features
    view.goTo(_graphics.graphics);
    // set state
    setTimeout((): void => {
      this._viewState = 'results';
    }, 1000);
  }

  private _setSelectedResult(feature?: esri.Graphic): void {
    const {
      _selectedResult,
      _selectedSymbol,
      _resultSymbol,
      _graphics: { graphics },
    } = this;
    if (_selectedResult) _selectedResult.symbol = _resultSymbol.clone();
    if (!feature) return;
    this._selectedResult = feature;
    feature.symbol = _selectedSymbol.clone();
    graphics.reorder(feature, graphics.length - 1);
  }

  private _selectNextPrevious(type: 'next' | 'previous'): void {
    const { _surveyInfos, _surveyInfoIndex } = this;
    if (_surveyInfoIndex === null) return;
    const index = type === 'next' ? _surveyInfoIndex + 1 : _surveyInfoIndex - 1;
    const { feature } = _surveyInfos.getItemAt(index);
    if (!feature) return;
    this._setSelectedResult(feature);
    this._surveyInfoIndex = index;
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _viewState, _selectedTaxLot, _surveyInfos, _surveyInfoIndex } = this;
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
          {_selectedTaxLot ? (
            <calcite-notice icon="search" open="">
              <div slot="message">
                {_selectedTaxLot.attributes.TAXLOT_ID}
                <br></br>
                {_selectedTaxLot.attributes.OWNER}
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
        <calcite-list hidden={_viewState !== 'results'}>
          {_surveyInfos
            .map((surveyInfo: SurveyInfo): tsx.JSX.Element => {
              return surveyInfo.listItem;
            })
            .toArray()}
        </calcite-list>
        <calcite-button
          appearance="outline-fill"
          hidden={_viewState !== 'results'}
          slot={_viewState === 'results' ? 'footer' : null}
          width="full"
          onclick={this._clear.bind(this)}
        >
          Clear
        </calcite-button>

        {/* info state */}
        <calcite-action
          disabled={_surveyInfoIndex === null || _surveyInfoIndex === 0}
          hidden={_viewState !== 'info'}
          icon="chevron-left"
          slot={_viewState === 'info' ? 'header-actions-end' : null}
          text="Previous"
          onclick={this._selectNextPrevious.bind(this, 'previous')}
        >
          <calcite-tooltip close-on-click="" label="Previous" placement="bottom" slot="tooltip">
            Previous
          </calcite-tooltip>
        </calcite-action>
        <calcite-action
          disabled={_surveyInfoIndex === null || _surveyInfoIndex === _surveyInfos.length - 1}
          hidden={_viewState !== 'info'}
          icon="chevron-right"
          slot={_viewState === 'info' ? 'header-actions-end' : null}
          text="Next"
          onclick={this._selectNextPrevious.bind(this, 'next')}
        >
          <calcite-tooltip close-on-click="" label="Next" placement="bottom" slot="tooltip">
            Next
          </calcite-tooltip>
        </calcite-action>
        {_surveyInfoIndex !== null ? _surveyInfos.getItemAt(_surveyInfoIndex).infoTable : null}
        <calcite-button
          appearance="outline-fill"
          hidden={_viewState !== 'info'}
          slot={_viewState === 'info' ? 'footer' : null}
          width="full"
          onclick={(): void => {
            this._setSelectedResult();
            this._surveyInfoIndex = null;
            this._viewState = 'results';
          }}
        >
          Back
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
}

export default SurveySearch;
