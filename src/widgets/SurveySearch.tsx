import esri = __esri;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Color from '@arcgis/core/Color';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { DateTime } from 'luxon';

const CSS = {
  content: 'cov-survey-search--content',
  contentSearching: 'cov-survey-search--content-searching',
  table: 'esri-widget__table',
};

// colors for results `Candy Shop`
const COLORS = ['#ed5151', '#149ece', '#a7c636', '#9e559c', '#fc921f', '#ffde3e'];

let KEY = 0;

/**
 * Search surveys related to a tax lot.
 */
@subclass('cov.widgets.SurveySearch')
export default class SurveySearch extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
      /**
       * Tax lots layer.
       */
      taxLots: esri.FeatureLayer;
      /**
       * Surveys layer.
       */
      surveys: esri.FeatureLayer | esri.GeoJSONLayer;
      /**
       * Base URL for surveys.
       */
      baseUrl?: string;
    },
  ) {
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
      this.watch(['state', '_visible', '_selectedFeature'], (): void => {
        const { taxLots, state, _visible, _selectedFeature } = this;
        if (state === 'results' || state === 'searching' || state === 'error') return;
        this.state = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
      }),
    );
  }

  view!: esri.MapView;

  taxLots!: esri.FeatureLayer;

  surveys!: esri.FeatureLayer | esri.GeoJSONLayer;

  baseUrl = 'https://cityofvernonia.github.io/vernonia-surveys/surveys/';

  @property()
  protected state: 'ready' | 'selected' | 'searching' | 'results' | 'error' = 'ready';

  @property({ aliasOf: 'view.popup.visible' })
  private _visible!: boolean;

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature!: esri.Graphic;

  private _results: Collection<tsx.JSX.Element> = new Collection();

  private _graphics = new GraphicsLayer({ listMode: 'hide' });

  onHide(): void {
    this._clear();
  }

  private _clear(): void {
    const { _results, _graphics } = this;
    _results.removeAll();
    _graphics.removeAll();
    this.state = 'ready';
  }

  private async _search(): Promise<void> {
    const {
      view,
      view: { popup, spatialReference },
      taxLots,
      taxLots: { objectIdField },
      surveys,
      baseUrl,
      _selectedFeature,
      _results,
      _graphics,
    } = this;
    _results.removeAll();
    _graphics.removeAll();
    this.state = 'searching';

    const featureQuery = await (taxLots.queryFeatures({
      where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
      returnGeometry: true,
      outSpatialReference: spatialReference,
    }) as Promise<esri.FeatureSet>);

    const feature = featureQuery.features[0];

    if (!feature) {
      this.state = 'error';
      return;
    }
    // query surveys
    const featuresQuery = await (surveys.queryFeatures({
      geometry: geodesicBuffer(feature.geometry, 10, 'feet') as esri.Polygon,
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: spatialReference,
      orderByFields: ['SurveyDate DESC'],
    }) as Promise<esri.FeatureSet>);
    // features
    const features = featuresQuery.features;
    // handle error
    if (!features) {
      this.state = 'error';
      return;
    }
    // sort by date
    features.sort((a: any, b: any) => (a.attributes.SurveyDate > b.attributes.SurveyDate ? -1 : 1));
    // handle results
    features.forEach((feature: esri.Graphic): void => {
      const {
        attributes: { SurveyType, SURVEYID, SurveyDate, Subdivisio, SVY_IMAGE },
      } = feature;
      // format attributes
      const type = SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase();
      const date = SurveyDate
        ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT)
        : 'Unknown date';
      const title = SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;
      const url = `${baseUrl}${SVY_IMAGE.replace('.tif', '.pdf')
        .replace('.tiff', '.pdf')
        .replace('.jpg', '.pdf')
        .replace('.jpeg', '.pdf')}`;
      // colors
      const color = new Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      const fillColor = color.clone();
      fillColor.a = 0;
      // set symbol
      feature.symbol = new SimpleFillSymbol({
        color: fillColor,
        outline: {
          color,
          style: 'short-dash-dot',
          width: 2,
        },
      });
      // set popup template
      feature.popupTemplate = new PopupTemplate({
        outFields: ['*'],
        title: (event: { graphic: esri.Graphic }): string => {
          const {
            graphic: {
              attributes: { SurveyType, SURVEYID, Subdivisio },
            },
          } = event;
          return SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;
        },
        content: (event: { graphic: esri.Graphic }): HTMLElement => {
          const popup = new PopupContent({
            graphic: event.graphic,
            baseUrl,
            container: document.createElement('table'),
          });
          return popup.container as HTMLElement;
        },
      });
      // add to graphics layer
      _graphics.add(feature);
      // add result item
      _results.add(
        <calcite-list-item
          key={KEY++}
          label={title}
          description={`${type} - ${date}`}
          afterCreate={(listItem: HTMLCalciteListItemElement): void => {
            listItem.addEventListener('calciteListItemSelect', (): void => {
              if (popup.clear && typeof popup.clear === 'function') popup.clear();
              popup.close();
              popup.open({
                features: [feature],
              });
              view.goTo(feature);
            });
          }}
        >
          <calcite-action
            slot="actions-end"
            icon="file-pdf"
            text="View PDF"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                window.open(url, '_blank');
              });
            }}
          >
            <calcite-tooltip slot="tooltip">View PDF</calcite-tooltip>
          </calcite-action>
        </calcite-list-item>,
      );
    });
    // zoom to features
    view.goTo(_graphics.graphics);
    // set state
    setTimeout((): void => {
      this.state = 'results';
    }, 1000);
  }

  render(): tsx.JSX.Element {
    const { state, _selectedFeature, _results } = this;
    return (
      <calcite-panel heading="Survey Search">
        <div class={CSS.content} hidden={state !== 'ready'}>
          <calcite-notice icon="cursor-click" open="">
            <div slot="message">Select a tax lot in the map to search for related surveys and plats.</div>
          </calcite-notice>
        </div>
        <div class={CSS.content} hidden={state !== 'selected'}>
          {_selectedFeature ? (
            <calcite-notice icon="search" open="">
              <div slot="message">{_selectedFeature.attributes.TAXLOT_ID}</div>
              <calcite-link onclick={this._search.bind(this)} slot="link">
                Search surveys
              </calcite-link>
            </calcite-notice>
          ) : null}
        </div>
        <div class={CSS.contentSearching} hidden={state !== 'searching'}>
          <calcite-progress text="Searching related surveys" type="indeterminate"></calcite-progress>
        </div>
        <div hidden={state !== 'results'}>
          <calcite-list>{_results.toArray()}</calcite-list>
        </div>
        <div class={CSS.content} hidden={state !== 'error'}>
          <calcite-notice icon="exclamation-mark-circle" kind="danger" open="">
            <div slot="message">An error occurred searching surveys.</div>
            <calcite-link onclick={this._clear.bind(this)} slot="link">
              Try again
            </calcite-link>
          </calcite-notice>
        </div>
        <calcite-fab
          hidden={state !== 'results'}
          icon="x"
          slot={state === 'results' ? 'fab' : null}
          text="Clear"
          text-enabled=""
          onclick={this._clear.bind(this)}
        ></calcite-fab>
      </calcite-panel>
    );
  }
}

@subclass('PopupContent')
class PopupContent extends Widget {
  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic; baseUrl: string }) {
    super(properties);
  }

  graphic!: esri.Graphic;

  baseUrl!: string;

  render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { SurveyType, Client, Firm, SurveyDate, SVY_IMAGE },
      },
      baseUrl,
    } = this;
    const url = `${baseUrl}${SVY_IMAGE.replace('.tif', '.pdf')
      .replace('.tiff', '.pdf')
      .replace('.jpg', '.pdf')
      .replace('.jpeg', '.pdf')}`;
    return (
      <table class={CSS.table}>
        <tr>
          <th>Type</th>
          <td>{SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase()}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>
            {SurveyDate ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT) : 'Unknown date'}
          </td>
        </tr>
        <tr>
          <th>Client</th>
          <td>{Client}</td>
        </tr>
        <tr>
          <th>Surveyor</th>
          <td>{Firm}</td>
        </tr>
        <tr>
          <th>&nbsp;</th>
          <td>
            <calcite-link href={url} target="_blank">
              View PDF
            </calcite-link>
          </td>
        </tr>
      </table>
    );
  }
}
