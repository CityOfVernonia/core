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
  base: 'cov-survey-search',
  content: 'cov-survey-search--content',
  table: 'esri-widget__table',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
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
      surveys: esri.FeatureLayer;
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
    this.own(
      this.watch(['state', '_visible', '_selectedFeature'], (): void => {
        const { taxLots, state, _visible, _selectedFeature } = this;
        if (state === 'results' || state === 'searching' || state === 'error') return;
        this.state = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
      }),
    );
  }

  /**
   * Map view.
   */
  view!: esri.MapView;

  /**
   * Tax lots layer.
   */
  taxLots!: esri.FeatureLayer;

  /**
   * Surveys layer.
   */
  surveys!: esri.FeatureLayer;

  /**
   * View state of widget.
   */
  @property()
  protected state: 'ready' | 'selected' | 'searching' | 'results' | 'error' = 'ready';

  /**
   * Popup visibility for watching.
   */
  @property({
    aliasOf: 'view.popup.visible',
  })
  private _visible!: boolean;

  /**
   * Popup selected feature for watching.
   */
  @property({
    aliasOf: 'view.popup.selectedFeature',
  })
  private _selectedFeature!: esri.Graphic;

  /**
   * Result list items.
   */
  private _results: Collection<tsx.JSX.Element> = new Collection();

  /**
   * Graphics layer for result geometry.
   */
  private _graphics = new GraphicsLayer({
    listMode: 'hide',
  });

  /**
   * Convenience on hide method.
   */
  onHide(): void {
    this._clear();
  }

  /**
   * Clear/reset.
   */
  private _clear(): void {
    const { _results, _graphics } = this;
    _results.removeAll();
    _graphics.removeAll();
    this.state = 'ready';
  }

  /**
   * Search surveys.
   */
  private async _search(): Promise<void> {
    const {
      view,
      view: { spatialReference },
      taxLots,
      taxLots: { objectIdField },
      surveys,
      _selectedFeature,
      _results,
      _graphics,
    } = this;
    // clear
    _results.removeAll();
    _graphics.removeAll();
    this.state = 'searching';
    // query feature
    const featureQuery = await (taxLots.queryFeatures({
      where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
      returnGeometry: true,
      outSpatialReference: spatialReference,
    }) as Promise<esri.supportFeatureSet>);
    // feature
    const feature = featureQuery.features[0];
    // handle error
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
    }) as Promise<esri.supportFeatureSet>);
    // features
    const features = featuresQuery.features;
    // handle error
    if (!features) {
      this.state = 'error';
      return;
    }
    // sort by date
    features.sort((a, b) => (a.attributes.SurveyDate > b.attributes.SurveyDate ? -1 : 1));
    // add clear
    _results.add(
      <calcite-list-item key={KEY++} non-interactive="">
        <calcite-action
          slot="actions-start"
          scale="s"
          text="Clear"
          text-enabled=""
          icon="x"
          onclick={this._clear.bind(this)}
        ></calcite-action>
      </calcite-list-item>,
    );
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
      const url = `https://gis.columbiacountymaps.com/Surveys/${SVY_IMAGE}`;
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
            container: document.createElement('table'),
          });
          return popup.container as HTMLElement;
        },
      });
      // add to graphics layer
      _graphics.add(feature);
      // add result item
      _results.add(
        <calcite-list-item key={KEY++} label={title} description={`${type} - ${date}`} non-interactive="">
          <calcite-action
            slot="actions-end"
            icon="flash"
            scale="s"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', this._flash.bind(this, feature));
            }}
          ></calcite-action>
          <calcite-action
            slot="actions-end"
            icon="download"
            scale="s"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                window.open(url, '_blank');
              });
            }}
          ></calcite-action>
        </calcite-list-item>,
      );
    });
    // add clear
    _results.add(
      <calcite-list-item key={KEY++} non-interactive="">
        <calcite-action
          slot="actions-start"
          scale="s"
          text="Clear"
          text-enabled=""
          icon="x"
          onclick={this._clear.bind(this)}
        ></calcite-action>
      </calcite-list-item>,
    );
    // zoom to features
    view.goTo(_graphics.graphics);
    // set state
    setTimeout((): void => {
      this.state = 'results';
    }, 1000);
  }

  /**
   * Flash feature.
   * @param feature
   */
  private _flash(feature: esri.Graphic): void {
    const { view } = this;
    // symbols
    const symbol = (feature.symbol as SimpleFillSymbol).clone();
    const flashSymbol = symbol.clone();
    flashSymbol.color.a = 0.25;
    // set flash symbol
    feature.symbol = flashSymbol;
    // zoom to feature
    view.goTo((feature.geometry as esri.Polygon).extent.expand(1.5));
    // revert to original symbol
    setTimeout((): void => {
      feature.symbol = symbol;
    }, 1250);
  }

  /**
   * Render the widget.
   * @returns
   */
  render(): tsx.JSX.Element {
    const { state, _results } = this;
    return (
      <calcite-panel class={CSS.base} heading="Survey Search">
        <div class={CSS.content} hidden={state !== 'ready'}>
          Select a tax lot in the map to search for related surveys and plats.
        </div>
        <div class={CSS.content} hidden={state !== 'selected'}>
          <calcite-button width="full" onclick={this._search.bind(this)}>
            Search
          </calcite-button>
        </div>
        <div class={CSS.content} hidden={state !== 'searching'}>
          <calcite-progress text="Searching related surveys" type="indeterminate"></calcite-progress>
        </div>
        <div hidden={state !== 'results'}>
          <calcite-list>{_results.toArray()}</calcite-list>
        </div>
        <div class={CSS.content} hidden={state !== 'error'}>
          <p>An error occurred searching surveys.</p>
          <calcite-button width="full" onclick={this._clear.bind(this)}>
            Reset
          </calcite-button>
        </div>
      </calcite-panel>
    );
  }
}

/**
 * Survey popup content.
 */
@subclass('cov.widgets.SurveySearch.PopupContent')
class PopupContent extends Widget {
  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);
  }

  /**
   * Graphic of interest.
   */
  graphic!: esri.Graphic;

  /**
   * Render the widget.
   * @returns
   */
  render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { SurveyType, Client, Firm, SurveyDate, SVY_IMAGE },
      },
    } = this;
    return (
      <table class={CSS.table}>
        <tr>
          <th class={CSS.th}>Type</th>
          <td class={CSS.td}>{SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase()}</td>
        </tr>
        <tr>
          <th class={CSS.th}>Date</th>
          <td class={CSS.td}>
            {SurveyDate ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT) : 'Unknown date'}
          </td>
        </tr>
        <tr>
          <th class={CSS.th}>Client</th>
          <td class={CSS.td}>{Client}</td>
        </tr>
        <tr>
          <th class={CSS.th}>Surveyor</th>
          <td class={CSS.td}>{Firm}</td>
        </tr>
        <tr>
          <th class={CSS.th}>&nbsp;</th>
          <td class={CSS.td}>
            <calcite-link href={`https://gis.columbiacountymaps.com/Surveys/${SVY_IMAGE}`} target="_blank">
              Download Survey
            </calcite-link>
          </td>
        </tr>
      </table>
    );
  }
}
