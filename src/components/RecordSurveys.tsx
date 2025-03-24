import esri = __esri;

interface I {
  surveyInfo: {
    feature: esri.Graphic;
    listItem: tsx.JSX.Element;
    infoTable: tsx.JSX.Element;
  };
  viewState: 'ready' | 'selected' | 'searching' | 'results' | 'info' | 'error';
}

export interface RecordSurveyProperties extends esri.WidgetProperties {
  surveysUrl: string;
  taxLots: esri.FeatureLayer;
  view: esri.MapView;
}

import type SurveySearchDialog from './SurveySearchDialog';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Graphic from '@arcgis/core/Graphic';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import {
  load as bufferLoad,
  isLoaded as bufferLoaded,
  execute as geodesicBuffer,
} from '@arcgis/core/geometry/operators/geodesicBufferOperator';

const CSS_BASE = 'cov--record-surveys';

const CSS = {
  background: `${CSS_BASE}_background`,
  infoPagination: `${CSS_BASE}_info-pagination`,
  searching: `${CSS_BASE}_searching`,
};

let KEY = 0;

@subclass('cov.components.RecordSurveys')
export default class RecordSurveys extends Widget {
  constructor(properties: RecordSurveyProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.addHandles([
      watch((): boolean => this._popupVisible, this._setState.bind(this)),
      watch((): esri.Graphic | nullish => this._selectedFeature, this._setState.bind(this)),
      watch((): I['viewState'] => this._viewState, this._setState.bind(this)),
      watch((): boolean => this.visible, this._clear.bind(this)),
    ]);
  }

  surveysUrl!: string;

  taxLots!: esri.FeatureLayer;

  view!: esri.MapView;

  private _graphics!: esri.GraphicsLayer;

  @property({ aliasOf: 'view.popup.visible' })
  private _popupVisible!: boolean;

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature!: esri.Graphic;

  @property()
  private _selectedResult: esri.Graphic | null = null;

  private _surveys!: esri.GeoJSONLayer;

  @property()
  private _surveyInfoIndex: number | null = null;

  private _surveyInfos: esri.Collection<I['surveyInfo']> = new Collection();

  private _surveySearchDialog?: SurveySearchDialog;

  private _symbols = {
    highlight: new SimpleFillSymbol({
      color: [255, 222, 62, 0.3],
      outline: {
        color: [255, 222, 62],
        width: 2,
      },
    }),
    survey: new SimpleFillSymbol({
      color: [237, 81, 81, 0.05],
      outline: {
        color: [237, 81, 81],
        width: 1,
      },
    }),
    taxLot: new SimpleFillSymbol({
      color: [20, 158, 206, 0.5],
      outline: {
        color: [20, 158, 206],
        width: 2,
      },
    }),
  };

  @property()
  private _viewState: I['viewState'] = 'ready';

  private _clear(): void {
    const { _graphics, _surveyInfos } = this;
    if (_graphics) _graphics.removeAll();
    _surveyInfos.removeAll();
    this._selectedResult = null;
    this._viewState = 'ready';
  }

  private async _loadLayers(): Promise<void> {
    const { surveysUrl, view } = this;

    this._graphics = new (await import('@arcgis/core/layers/GraphicsLayer')).default({ listMode: 'hide' });

    view.map.add(this._graphics);

    this._surveys = new (await import('@arcgis/core/layers/GeoJSONLayer')).default({ url: surveysUrl });
  }

  private _setState(): void {
    const { _popupVisible, _viewState } = this;

    if (_viewState === 'results' || _viewState === 'searching' || _viewState === 'info' || _viewState === 'error')
      return;

    this._viewState = _popupVisible && this._taxLotSelected() ? 'selected' : 'ready';
  }

  private async _search(): Promise<void> {
    const {
      taxLots,
      taxLots: { objectIdField },
      view,
      view: { spatialReference },
      _selectedFeature,
      _symbols,
    } = this;

    if (!this._taxLotSelected()) {
      this._viewState = 'error';
      return;
    }

    this._viewState = 'searching';

    if (!this._surveys) await this._loadLayers();

    const { _graphics, _surveys } = this;

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

      feature.symbol = _symbols.taxLot.clone();

      _graphics.add(
        new Graphic({
          geometry: feature.geometry,
          symbol: _symbols.taxLot.clone(),
        }),
      );

      if (!bufferLoaded()) await bufferLoad();

      const geometry = geodesicBuffer(feature.geometry as esri.Polygon, 20, { unit: 'feet' }) as esri.Polygon;

      const surveyQuery = await _surveys.queryFeatures({
        geometry,
        returnGeometry: true,
        outFields: ['*'],
        outSpatialReference: spatialReference,
      });

      const features = surveyQuery.features;

      view.closePopup();

      // sort by date
      features.sort((a: esri.Graphic, b: esri.Graphic) => (a.attributes.Timestamp > b.attributes.Timestamp ? -1 : 1));

      features.forEach((feature: esri.Graphic, index: number): void => {
        const { _surveyInfos, _symbols } = this;
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

        feature.symbol = _symbols.survey.clone();

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
                listItem.addEventListener('calciteListItemSelect', this._selectHighlightResult.bind(this, feature));
              }}
            >
              <calcite-action
                icon="information"
                slot="actions-end"
                text="View info"
                afterCreate={(action: HTMLCalciteActionElement): void => {
                  action.addEventListener('click', (): void => {
                    this._selectHighlightResult(feature);
                    this._surveyInfoIndex = index;
                    this._viewState = 'info';
                  });
                }}
              ></calcite-action>
              <calcite-action
                slot="actions-end"
                icon="file-pdf"
                text="View PDF"
                afterCreate={(action: HTMLCalciteActionElement): void => {
                  action.addEventListener('click', (): void => {
                    window.open(SurveyUrl, '_blank');
                  });
                }}
              ></calcite-action>
            </calcite-list-item>
          ),
          infoTable: (
            <table key={KEY++} class="esri-widget__table">
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

      view.goTo(_graphics.graphics);

      setTimeout((): void => {
        this._viewState = 'results';
      }, 1000);
    } catch (error) {
      console.log(error);

      this._viewState = 'error';
    }
  }

  private _selectHighlightResult(feature?: esri.Graphic): void {
    const {
      _graphics: { graphics },
      _selectedResult,
      _symbols,
    } = this;

    if (_selectedResult) _selectedResult.symbol = _symbols.survey.clone();

    if (!feature) return;

    this._selectedResult = feature;

    feature.symbol = _symbols.highlight.clone();

    graphics.reorder(feature, graphics.length - 1);
  }

  private async _showSurveySearch(): Promise<void> {
    const { _surveys, _surveySearchDialog } = this;

    if (!_surveySearchDialog) {
      if (!_surveys) await this._loadLayers();

      this._surveySearchDialog = new (await import('./SurveySearchDialog')).default({ surveys: this._surveys });

      this._surveySearchDialog.container.open = true;
    } else {
      _surveySearchDialog.container.open = true;
    }
  }

  private _taxLotSelected(): boolean {
    const { taxLots, _selectedFeature } = this;

    return _selectedFeature && _selectedFeature.layer === taxLots;
  }

  override render(): tsx.JSX.Element {
    const { _viewState } = this;

    return (
      <calcite-panel
        heading="Record Surveys"
        class={this.classes(
          _viewState !== 'results' && _viewState !== 'info' ? CSS_BASE : null,
          _viewState === 'searching' || _viewState === 'info' ? CSS.background : null,
        )}
      >
        <calcite-action
          icon="search"
          slot="header-actions-end"
          text="Survey Search"
          onclick={this._showSurveySearch.bind(this)}
        >
          <calcite-tooltip slot="tooltip">Survey Search</calcite-tooltip>
        </calcite-action>

        {/* ready */}
        {_viewState === 'ready' ? (
          <calcite-notice icon="cursor-click" kind="brand" open>
            <div slot="message">Select a tax lot in the map to search for related surveys and plats.</div>
          </calcite-notice>
        ) : null}

        {/* selected */}
        {_viewState === 'selected' ? (
          <calcite-notice icon="search" open style="--calcite-notice-width: 100%;">
            {this._renderSelectedMessage()}
            <calcite-link slot="link" onclick={this._search.bind(this)}>
              Search related surveys
            </calcite-link>
          </calcite-notice>
        ) : null}

        {/* searching */}
        {_viewState === 'searching' ? (
          <div class={CSS.searching}>
            <calcite-progress text="Searching related surveys" type="indeterminate"></calcite-progress>
          </div>
        ) : null}

        {/* results */}
        {_viewState === 'results' ? this._renderResultsList() : null}
        {_viewState === 'results' ? (
          <calcite-button appearance="outline" slot="footer" width="full" onclick={this._clear.bind(this)}>
            Clear
          </calcite-button>
        ) : null}

        {/* info */}
        {_viewState === 'info' ? this._renderInfoPagination() : null}
        {_viewState === 'info' ? this._renderInfo() : null}
        {_viewState === 'info' ? (
          <calcite-button
            appearance="outline"
            slot="footer"
            width="full"
            onclick={(): void => {
              this._selectHighlightResult();
              this._viewState = 'results';
            }}
          >
            Back
          </calcite-button>
        ) : null}

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

  private _renderInfo(): tsx.JSX.Element | null {
    const { _surveyInfos, _surveyInfoIndex } = this;

    if (_surveyInfoIndex === null) return null;

    const surveyInfo = _surveyInfos.getItemAt(_surveyInfoIndex);

    return surveyInfo ? surveyInfo.infoTable : null;
  }

  private _renderInfoPagination(): tsx.JSX.Element | null {
    const { _surveyInfos, _surveyInfoIndex } = this;

    if (!_surveyInfos.length || _surveyInfoIndex === null) return null;

    return (
      <div slot="content-top" class={CSS.infoPagination}>
        <calcite-pagination
          page-size="1"
          start-item={`${_surveyInfoIndex + 1}`}
          total-items={`${_surveyInfos.length}`}
          scale="s"
          afterCreate={(pagination: HTMLCalcitePaginationElement): void => {
            pagination.addEventListener('calcitePaginationChange', (): void => {
              const { _surveyInfos } = this;

              const index = pagination.startItem - 1;

              this._surveyInfoIndex = index;

              const surveyInfo = _surveyInfos.getItemAt(index);

              if (surveyInfo) this._selectHighlightResult(surveyInfo.feature);
            });
          }}
        ></calcite-pagination>
      </div>
    );
  }

  private _renderResultsList(): tsx.JSX.Element {
    const { _surveyInfos } = this;

    return (
      <calcite-list>
        {_surveyInfos.toArray().map((info: I['surveyInfo']): tsx.JSX.Element => {
          return info.listItem;
        })}
      </calcite-list>
    );
  }

  private _renderSelectedMessage(): tsx.JSX.Element | null {
    const { _selectedFeature } = this;

    return this._taxLotSelected() ? (
      <div slot="message">
        {_selectedFeature.attributes.TAXLOT_ID}
        <br></br>
        {_selectedFeature.attributes.OWNER}
      </div>
    ) : null;
  }
}
