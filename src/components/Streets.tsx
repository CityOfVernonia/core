import esri = __esri;

interface LegendInfo {
  contentType: string;
  imageData: string;
  label: string;
}

interface I {
  featureInfo:
    | {
        feature: esri.Graphic;
        networkData: [HashMap<esri.FeatureSet>, HashMap<esri.FeatureSet>, HashMap<esri.FeatureSet>] | [];
        m: number;
        z: number;
      }
    | nullish;
  state: 'home' | 'feature';
}

export interface StreetsProperties extends esri.WidgetProperties {
  centerlines: esri.FeatureLayer;

  streets: esri.GroupLayer;

  streetsInfo: esri.MapImageLayer;

  view: esri.MapView;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import HighlightOptions from '@arcgis/core/views/support/HighlightOptions';
import {
  load as projectLoad,
  isLoaded as projectLoaded,
  execute as project,
} from '@arcgis/core/geometry/operators/projectOperator';
import { getNearestCoordinate } from '@arcgis/core/geometry/operators/proximityOperator';
import { execute as planarLength } from '@arcgis/core/geometry/operators/lengthOperator';
import { execute as distance } from '@arcgis/core/geometry/operators/distanceOperator';
import { execute as contains } from '@arcgis/core/geometry/operators/containsOperator';
// import { referenceElement } from './support';
import StreetsInfoDialog from './StreetsInfoDialog';
import { publish } from 'pubsub-js';
import { ROAD_LAYER_TOPIC } from './Basemap';

const CSS_BASE = 'cov--streets';

const CSS = {
  dataSelect: `${CSS_BASE}_data-select`,
  notice: `${CSS_BASE}_notice`,
  table: 'esri-widget__table',
  tableBlock: `${CSS_BASE}_table-block`,
};

const LEGEND_INFOS: { [key: number]: LegendInfo[] } = [];

const DATA_LAYER_IDS = [10, 11, 12, 20, 21, 22];

const STATIONING_IDS = [1, 2];

const DIRECTIONAL_ARROWS_ID = 3;

const HANDLES = {
  HIGHLIGHT: 'highlight-handle',
  VIEW_CLICK: 'view-click-handle',
};

const HIGHLIGHT_NAME = 'cov-streets';

let KEY = 0;

const SURFACE_CONDITIONS = {
  1: 'Poor',
  2: 'Marginal',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent',
};

const SURFACE_TYPES = {
  U: 'UNIMPROVED (Open for Travel)',
  D: 'GRADED & DRAINED (Natural Surface)',
  G: 'GRADED AND DRAINED (Gravel)',
  O: 'OIL MAT',
  A: 'ASPHALT CONCRETE',
  N: 'CONCRETE, BRICK, STONE',
  Z: 'OTHER, UNKNOWN',
};

const SYMBOLS = {
  end: new SimpleMarkerSymbol({
    color: 'red',
    style: 'square',
    size: 10,
    outline: {
      color: 'white',
      width: 1,
    },
  }),
  location: new SimpleMarkerSymbol({
    color: 'orange',
    style: 'diamond',
    size: 12,
    outline: {
      color: 'white',
      width: 1,
    },
  }),
  start: new SimpleMarkerSymbol({
    color: 'green',
    style: 'circle',
    size: 11,
    outline: {
      color: 'white',
      width: 1,
    },
  }),
};

const RELATIONSHIP_IDS = {
  SurfaceCondition: 0,
  SurfaceType: 0,
  SurfaceWidth: 0,
};

@subclass('cov.components.Streets')
export default class Streets extends Widget {
  constructor(properties: StreetsProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { centerlines, streets, streetsInfo, view, _graphics } = this;

    view.map?.add(_graphics);

    this._centerlinesView = await view.whenLayerView(centerlines);

    // depreciated - add and use named `HighlightOptions` to `view.highlights` collection
    // https://arcg.is/inbTa1#highlights
    // this._centerlinesView.highlightOptions = {
    //   fillOpacity: 0.1,
    //   haloOpacity: 0.5,
    // };

    // throws error `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading '0')`
    view.highlights.add(
      new HighlightOptions({
        name: HIGHLIGHT_NAME,
        fillOpacity: 0.1,
        haloOpacity: 0.5,
      }),
    );

    await streetsInfo.load();

    const legendJSON = await (await fetch(`${streetsInfo.url}/legend?f=json`)).json();

    legendJSON.layers.forEach((layer: { layerId: number; legend: LegendInfo[] }) => {
      const { layerId, legend } = layer;

      if (DATA_LAYER_IDS.indexOf(layerId) !== -1) {
        LEGEND_INFOS[layerId] = legend;
      }
    });

    centerlines.relationships?.forEach((relationship: esri.Relationship): void => {
      const { id, name } = relationship;

      if (name && name in RELATIONSHIP_IDS) RELATIONSHIP_IDS[name as 'SurfaceCondition'] = id;
    });

    const visibility = watch(
      (): boolean => this.visible,
      (visible: boolean): void => {
        streets.visible = visible;

        if (visible) {
          view.closePopup();

          this.addHandles(view.on('click', this._viewClick.bind(this)), HANDLES.VIEW_CLICK);

          publish(ROAD_LAYER_TOPIC, false);
        } else {
          this.removeHandles(HANDLES.VIEW_CLICK);

          this._reset();

          publish(ROAD_LAYER_TOPIC, true);
        }
      },
    );

    this.addHandles([visibility]);

    if (!projectLoaded()) await projectLoad();
  }

  readonly centerlines!: esri.FeatureLayer;

  readonly streets!: esri.GroupLayer;

  readonly streetsInfo!: esri.MapImageLayer;

  readonly view!: esri.MapView;

  @property()
  private _about = 'Functional classification';

  private _centerlinesView!: esri.FeatureLayerView;

  @property()
  private _featureInfo: I['featureInfo'] | null = null;

  private _graphics = new GraphicsLayer({
    listMode: 'hide',
  });

  @property({ aliasOf: 'view.map.ground' })
  private _ground!: esri.Ground;

  @property()
  private _legendIndex = 10;

  private _streetsInfoDialog = new StreetsInfoDialog();

  @property()
  private _viewState: I['state'] = 'home';

  private async _viewClick(event: esri.ViewClickEvent): Promise<void> {
    const { centerlines, view, _centerlinesView, _graphics, _ground } = this;

    event.stopPropagation();

    this.removeHandles(HANDLES.HIGHLIGHT);

    _graphics.removeAll();

    try {
      // feature for attributes and and highlighting
      const feature = (
        await _centerlinesView.queryFeatures({
          geometry: event.mapPoint,
          distance: view.resolution * 3,
          outFields: ['*'],
        })
      ).features[0];

      if (!feature) {
        this._reset();

        return;
      }

      // add highlight
      this.addHandles(_centerlinesView.highlight(feature, { name: HIGHLIGHT_NAME }), HANDLES.HIGHLIGHT);

      // non-city assets
      if (feature.attributes.OWNER !== 'City of Vernonia') {
        this._featureInfo = {
          feature,
          networkData: [],
          m: 0,
          z: 0,
        };

        this._viewState = 'feature';

        return;
      }

      // query network data
      const objectId = feature.attributes[centerlines.objectIdField];

      const networkData = await Promise.all([
        // surface width
        centerlines.queryRelatedFeatures({
          relationshipId: RELATIONSHIP_IDS['SurfaceWidth'],
          objectIds: [objectId],
          outFields: ['*'],
          orderByFields: ['BEG_M ASC'],
        }),
        // surface type
        centerlines.queryRelatedFeatures({
          relationshipId: RELATIONSHIP_IDS['SurfaceType'],
          objectIds: [objectId],
          outFields: ['*'],
          orderByFields: ['BEG_M ASC'],
        }),
        // surface condition
        centerlines.queryRelatedFeatures({
          relationshipId: RELATIONSHIP_IDS['SurfaceCondition'],
          objectIds: [objectId],
          outFields: ['*'],
          orderByFields: ['BEG_M ASC'],
        }),
      ]);

      // query geometry
      const geometry = (
        await centerlines.queryFeatures({
          objectIds: [feature.attributes[centerlines.objectIdField]],
          returnGeometry: true,
          returnM: true,
        })
      ).features[0].geometry as esri.Polyline;

      // nearest point of geometry to map point
      const nearestPoint = getNearestCoordinate(
        geometry,
        project(event.mapPoint, centerlines.spatialReference) as esri.Point,
      ).coordinate as esri.Point;

      // get m of nearest coordinate
      let m = geometry.paths[0][0][2] || 0;

      let containsIndex = 0;

      geometry.paths[0].forEach((coordinates: number[], index: number, path: number[][]) => {
        const a = path[index];
        const b = path[index + 1];

        if (containsIndex > 0) return;
        if (!a || !b) return;

        // create polyline
        const polyline = new Polyline({
          paths: [[a, b]],
          spatialReference: geometry.spatialReference,
        });

        if (contains(polyline, nearestPoint)) {
          m += distance(
            nearestPoint,
            new Point({
              x: a[0],
              y: a[1],
              spatialReference: geometry.spatialReference,
            }),
          );
          containsIndex = index;
        } else {
          m += planarLength(polyline, { unit: 'feet' });
        }
      });

      // query z
      const groundPoint = (await _ground.queryElevation(nearestPoint)).geometry as esri.Point;

      const z = groundPoint.z ? groundPoint.z * 3.281 : 0;

      _graphics.addMany([
        new Graphic({
          geometry: project(nearestPoint, view.spatialReference) as esri.Point,
          symbol: SYMBOLS.location.clone(),
        }),
        new Graphic({
          geometry: project(
            new Point({
              x: geometry.paths[0][0][0],
              y: geometry.paths[0][0][1],
              spatialReference: geometry.spatialReference,
            }),
            view.spatialReference,
          ) as esri.Point,
          symbol: SYMBOLS.start.clone(),
        }),
        new Graphic({
          geometry: project(
            new Point({
              x: geometry.paths[0][geometry.paths[0].length - 1][0],
              y: geometry.paths[0][geometry.paths[0].length - 1][1],
              spatialReference: geometry.spatialReference,
            }),
            view.spatialReference,
          ) as esri.Point,
          symbol: SYMBOLS.end.clone(),
        }),
      ]);

      // set feature info
      this._featureInfo = {
        feature,
        networkData,
        m: Number(m.toFixed(2)),
        z: Number(z.toFixed(2)),
      };

      view.goTo(geometry);

      this._viewState = 'feature';
    } catch (error) {
      console.log(error);
    }
  }

  private _reset(): void {
    const { _graphics } = this;

    _graphics.removeAll();

    this.removeHandles(HANDLES.HIGHLIGHT);

    this._viewState = 'home';

    this._featureInfo = null;
  }

  override render(): tsx.JSX.Element {
    const { _about, _featureInfo, _legendIndex, _viewState } = this;

    const heading = _featureInfo
      ? _featureInfo.feature.attributes.LABEL || `Unnamed (${_featureInfo.feature.attributes.FUNC_CLASS})`
      : 'Streets';

    return (
      <calcite-panel class={CSS_BASE} heading={heading}>
        {/* home view */}
        <div hidden={_viewState !== 'home'}>
          {/* data display */}
          <calcite-block collapsible heading="Data display" expanded>
            <div class={CSS.dataSelect}>
              <calcite-select afterCreate={this._dataDisplaySelectAfterCreate.bind(this)}>
                <calcite-option selected value={10}>
                  Functional classification
                </calcite-option>
                <calcite-option value={12}>Ownership</calcite-option>
                <calcite-option value={21}>Surface material</calcite-option>
                <calcite-option value={20}>Surface condition</calcite-option>
                <calcite-option value={22}>Surface width</calcite-option>
                <calcite-option value={11}>ODOT reported</calcite-option>
              </calcite-select>
              <calcite-action
                disabled={_about === 'Ownership' || _about === 'Surface width'}
                icon="question"
                scale="s"
                text="About"
                afterCreate={this._aboutActionAfterCreate.bind(this)}
              ></calcite-action>
            </div>
            {this._renderLegend(_legendIndex)}
          </calcite-block>

          {/* linear referencing */}
          <calcite-block collapsible heading="Linear referencing">
            <calcite-label layout="inline">
              <calcite-switch afterCreate={this._directionalArrowsSwitchAfterCreate.bind(this)}></calcite-switch>
              Directional arrows
            </calcite-label>
            <calcite-label layout="inline">
              <calcite-switch afterCreate={this._stationingSwitchAfterCreate.bind(this)}></calcite-switch>
              Stationing
            </calcite-label>
          </calcite-block>
        </div>

        {/* feature view */}
        {this._renderFeature()}

        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'feature'}
          slot={_viewState === 'feature' ? 'footer' : null}
          width="full"
          afterCreate={this._clearButtonAfterCreate.bind(this)}
        >
          Clear
        </calcite-button>
      </calcite-panel>
    );
  }

  private _aboutActionAfterCreate(action: HTMLCalciteActionElement): void {
    const { _streetsInfoDialog } = this;

    action.addEventListener('click', (): void => {
      _streetsInfoDialog.show(this._about as 'Functional classification');
    });
  }

  private _clearButtonAfterCreate(button: HTMLCalciteButtonElement): void {
    button.addEventListener('click', this._reset.bind(this));
  }

  private _dataDisplaySelectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', (): void => {
      const { streetsInfo } = this;

      this._about = select.selectedOption.innerText;

      const layerId = select.selectedOption.value;

      DATA_LAYER_IDS.forEach((id: number): void => {
        if (layerId === id) {
          const sublayer = streetsInfo.findSublayerById(id);

          if (sublayer) sublayer.visible = true;
        } else {
          const sublayer = streetsInfo.findSublayerById(id);

          if (sublayer) sublayer.visible = false;
        }
      });

      this._legendIndex = layerId;
    });
  }

  private _directionalArrowsSwitchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    const { streetsInfo } = this;

    _switch.addEventListener('calciteSwitchChange', (): void => {
      const sublayer = streetsInfo.findSublayerById(DIRECTIONAL_ARROWS_ID);

      if (sublayer) sublayer.visible = _switch.checked;
    });
  }

  private _renderFeature(): tsx.JSX.Element | tsx.JSX.Element[] {
    const { centerlines, _featureInfo, _viewState } = this;

    if (!_featureInfo || _viewState !== 'feature') return <div></div>;

    const { feature, m, networkData, z } = _featureInfo;

    const {
      attributes: { FUNC_CLASS, OWNER, MAINTAINER, ODOT_REPORT, VERNONIA },
    } = feature;

    if (VERNONIA === 0)
      return (
        <div class={CSS.notice} key={KEY++}>
          <calcite-notice icon="information" open scale="s">
            <div slot="message">Selected asset is not in Vernonia city limits. Asset data is not available.</div>
          </calcite-notice>
        </div>
      );

    if (VERNONIA === 1 && OWNER !== 'City of Vernonia')
      return [
        <div class={CSS.notice} key={KEY++}>
          <calcite-notice icon="information" open scale="s">
            <div slot="message">Selected asset is not owned by the City. Extended asset data is not available.</div>
          </calcite-notice>
        </div>,
        <calcite-block class={CSS.tableBlock} key={KEY++} label="Asset information" expanded>
          <table class={CSS.table}>
            <tr>
              <th>Classification</th>
              <td>{FUNC_CLASS}</td>
            </tr>
            <tr>
              <th>Owner</th>
              <td>{OWNER}</td>
            </tr>
            <tr>
              <th>ODOT reported</th>
              <td>{ODOT_REPORT === 1 ? 'Yes' : 'No'}</td>
            </tr>
          </table>
        </calcite-block>,
      ];

    const objectId = feature.attributes[centerlines.objectIdField];

    let surface_width = 0;

    let surface_type = '';

    let surface_condition = '';

    let surface_widths = <tr key={KEY++}></tr>;

    if (networkData[0] && networkData[0][objectId]) {
      surface_widths = networkData[0][objectId].features.map((feature: esri.Graphic): tsx.JSX.Element => {
        const { BEG_M, END_M, Width } = feature.attributes;

        if (feature.attributes.BEG_M < m && feature.attributes.END_M > m) surface_width = Width;

        const area = Number(((END_M - BEG_M) * Width).toFixed(0)).toLocaleString();

        return (
          <tr key={KEY++}>
            <th>
              {BEG_M} - {END_M}
            </th>
            <td>
              {Width}' - {area} ft²
            </td>
          </tr>
        );
      });
    }

    let surface_types = <tr key={KEY++}></tr>;

    if (networkData[1] && networkData[1][objectId]) {
      surface_types = networkData[1][objectId].features.map((feature: esri.Graphic): tsx.JSX.Element => {
        const { BEG_M, END_M, SURF_TYPE } = feature.attributes;

        if (feature.attributes.BEG_M < m && feature.attributes.END_M > m)
          surface_type = SURFACE_TYPES[SURF_TYPE as 'U'];

        return (
          <tr key={KEY++}>
            <th>
              {BEG_M} - {END_M}
            </th>
            <td>{SURFACE_TYPES[SURF_TYPE as 'U']}</td>
          </tr>
        );
      });
    }

    let surface_conditions = <tr key={KEY++}></tr>;

    if (networkData[2] && networkData[2][objectId]) {
      surface_conditions = networkData[2][objectId].features.map((feature: esri.Graphic): tsx.JSX.Element => {
        const { BEG_M, END_M, SURF_CONDITION } = feature.attributes;

        if (feature.attributes.BEG_M < m && feature.attributes.END_M > m)
          surface_condition = SURFACE_CONDITIONS[SURF_CONDITION as 1];

        return (
          <tr key={KEY++}>
            <th>
              {BEG_M} - {END_M}
            </th>
            <td>{SURFACE_CONDITIONS[SURF_CONDITION as 1]}</td>
          </tr>
        );
      });
    }

    return [
      <calcite-block class={CSS.tableBlock} key={KEY++} label="Asset information" expanded>
        <table class={CSS.table}>
          <tr>
            <th>Classification</th>
            <td>{FUNC_CLASS}</td>
          </tr>
          <tr>
            <th>Owner</th>
            <td>{OWNER}</td>
          </tr>
          <tr>
            <th>Maintainer</th>
            <td>{MAINTAINER}</td>
          </tr>
          <tr>
            <th>ODOT reported</th>
            <td>{ODOT_REPORT === 1 ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <th>Station (m)</th>
            <td>{m}</td>
          </tr>
          <tr>
            <th>Elevation</th>
            <td>{z}'</td>
          </tr>
          <tr>
            <th>Surface type</th>
            <td>{surface_type}</td>
          </tr>
          <tr>
            <th>Surface condition</th>
            <td>{surface_condition}</td>
          </tr>
          <tr>
            <th>Surface width</th>
            <td>{surface_width}</td>
          </tr>
        </table>
      </calcite-block>,
      <calcite-block class={CSS.tableBlock} collapsible heading="Surface types" key={KEY++}>
        <table class={CSS.table}>{surface_types}</table>
      </calcite-block>,
      <calcite-block class={CSS.tableBlock} collapsible heading="Surface conditions" key={KEY++}>
        <table class={CSS.table}>{surface_conditions}</table>
      </calcite-block>,
      <calcite-block class={CSS.tableBlock} collapsible heading="Surface widths and areas" key={KEY++}>
        <table class={CSS.table}>{surface_widths}</table>
      </calcite-block>,
    ];
  }

  private _renderLegend(index: number): tsx.JSX.Element | null {
    const legendInfo = LEGEND_INFOS[index];

    if (legendInfo) {
      return (
        <table>
          {legendInfo.map((legendInfo: LegendInfo): tsx.JSX.Element => {
            const { contentType, imageData, label } = legendInfo;

            return (
              <tr key={KEY++}>
                <td>
                  <img src={`data:${contentType};base64,${imageData}`}></img>
                </td>
                <td>{label}</td>
              </tr>
            );
          })}
        </table>
      );
    } else {
      setTimeout(this._renderLegend.bind(this, index), 250);

      return null;
    }
  }

  private _stationingSwitchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    const { streetsInfo } = this;

    _switch.addEventListener('calciteSwitchChange', (): void => {
      STATIONING_IDS.forEach((id: number): void => {
        const sublayer = streetsInfo.findSublayerById(id);

        if (sublayer) sublayer.visible = _switch.checked;
      });
    });
  }
}
