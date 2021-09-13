/**
 * Measure widget.
 */

// namespaces and types
import cov = __cov;

// base imports
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
// view models
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import UnitsViewModel from './../viewModels/UnitsViewModel';
// graphics, symbols, etc.
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point } from '@arcgis/core/geometry';
import { CIMSymbol, SimpleFillSymbol, SimpleMarkerSymbol } from '@arcgis/core/symbols';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
// measure modules
import { geodesicArea, geodesicLength, simplify } from '@arcgis/core/geometry/geometryEngine';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';

// styles
import './Measure.scss';
const CSS = {
  base: 'cov-tabbed-widget cov-measure',
  row: 'cov-measure--row',
  result: 'cov-measure--result',
  clearButton: 'cov-measure--clear-button',
};

let KEY = 0;

// class export
@subclass('cov.widgets.Measure')
export default class Measure extends Widget {
  @property()
  protected sketch = new SketchViewModel({
    layer: new GraphicsLayer({
      listMode: 'hide',
    }),
    updateOnGraphicClick: false,
  });

  @property({
    aliasOf: 'sketch.snappingOptions.enabled',
  })
  snappingEnabled = true;

  @property({
    aliasOf: 'sketch.pointSymbol',
  })
  pointSymbol = new SimpleMarkerSymbol({
    style: 'cross',
    size: 12,
    outline: {
      width: 1.5,
      color: [255, 133, 27],
    },
  });

  @property({
    aliasOf: 'sketch.polylineSymbol',
  })
  polylineSymbol = new CIMSymbol({
    data: {
      type: 'CIMSymbolReference',
      symbol: {
        type: 'CIMLineSymbol',
        symbolLayers: [
          {
            type: 'CIMSolidStroke',
            effects: [
              {
                type: 'CIMGeometricEffectDashes',
                dashTemplate: [4.75, 4.75],
                lineDashEnding: 'HalfPattern',
                controlPointEnding: 'NoConstraint',
              },
            ],
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            miterLimit: 10,
            width: 2,
            color: [255, 255, 255, 255],
          },
          {
            type: 'CIMSolidStroke',
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            miterLimit: 10,
            width: 3,
            color: [255, 133, 27, 255],
          },
        ],
      },
    },
  });

  @property({
    aliasOf: 'sketch.polygonSymbol',
  })
  polygonSymbol = new SimpleFillSymbol({
    color: [255, 133, 27, 0.25],
    outline: {
      width: 0,
    },
  });

  @property()
  units = new UnitsViewModel();

  @property({
    aliasOf: 'sketch.view',
  })
  view!: esri.MapView;

  @property()
  layer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  protected state: cov.MeasureState = {
    action: 'ready',
    length: 0,
    area: 0,
    x: 0,
    y: 0,
    z: 0,
    measureGeometry: null,
    locationPoint: new Point(),
    elevationPoint: new Point(),
  };

  @property()
  private _sketchCreateHandle: IHandle | null = null;

  @property()
  _coordinateHandle!: IHandle | null;

  @property()
  _elevationHandle!: IHandle | null;

  constructor(properties: cov.MeasureProperties) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view: { map },
      layer,
      sketch,
      pointSymbol,
      polylineSymbol,
      polygonSymbol,
      units,
    } = this;

    // add results layer
    map.add(layer);

    // setup sketch
    // @ts-ignore
    sketch.activeLineSymbol = polylineSymbol;
    // @ts-ignore
    sketch.activeVertexSymbol = pointSymbol;
    // @ts-ignore
    sketch.vertexSymbol = pointSymbol;
    sketch.activeFillSymbol = polygonSymbol;
    // sketch.snappingOptions.enabled = true;
    sketch.snappingOptions.featureEnabled = true;
    sketch.snappingOptions.selfEnabled = false;
    map.allLayers.forEach((_layer: esri.Layer) => {
      const { type } = _layer;
      if (
        type === 'feature' ||
        type === 'graphics' ||
        type === 'geojson' ||
        (type === 'csv' && _layer.listMode !== 'hide' && _layer.title)
      ) {
        sketch.snappingOptions.featureSources.add(
          new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: _layer,
          }),
        );
      }
    });

    // load coordinates
    coordinateFormatter.load();
    this._createCoordinateHandle();

    // load elevation
    this._createElevationHandle();

    // watch for units changes
    watch(
      units,
      ['lengthUnit', 'areaUnit', 'locationUnit', 'elevationUnit'],
      (_value: string, _old: string, updated: string) => {
        const {
          state: { action, measureGeometry, locationPoint, elevationPoint },
        } = this;

        if (updated === 'lengthUnit' && measureGeometry && (action === 'length' || action === 'measuringLength')) {
          this._measure('length', measureGeometry);
        }

        if (updated === 'areaUnit' && measureGeometry && (action === 'area' || action === 'measuringArea')) {
          this._measure('area', measureGeometry);
        }

        if (updated === 'locationUnit') {
          this._location(locationPoint);
        }

        if (updated === 'elevationUnit') {
          this._elevation(elevationPoint);
        }
      },
    );
  }

  /**
   * Create coordinate handle.
   */
  private _createCoordinateHandle(): void {
    const { view } = this;
    this._coordinateHandle = view.on('pointer-move', (screenPoint: esri.ScreenPoint) => {
      const point = view.toMap(screenPoint);
      this.state = {
        ...this.state,
        locationPoint: point,
      };
      this._location(point);
    });
  }

  /**
   * Create elevation handle.
   */
  private _createElevationHandle(): void {
    const { view } = this;
    this._elevationHandle = view.on('pointer-move', (screenPoint: esri.ScreenPoint) => {
      const point = view.toMap(screenPoint);
      this.state = {
        ...this.state,
        elevationPoint: point,
      };
      this._elevation(point);
    });
  }

  /**
   * Clear/reset.
   */
  clear(): void {
    const { sketch, layer } = this;

    // don't use deconstructed properties to remove handles
    this._sketchCreateHandle?.remove();
    this._sketchCreateHandle = null;

    this._coordinateHandle?.remove();
    this._coordinateHandle = null;
    this._createCoordinateHandle();

    this._elevationHandle?.remove();
    this._elevationHandle = null;
    this._createElevationHandle();

    // cancel sketch
    sketch.cancel();
    layer.removeAll();

    // reset state
    this.state = {
      ...this.state,
      action: 'ready',
      length: 0,
      area: 0,
      measureGeometry: null,
    };
  }

  /**
   * Initiate measure length.
   */
  length(): void {
    const { sketch } = this;
    this.clear();
    this.state = {
      ...this.state,
      action: 'measuringLength',
    };
    this._sketchCreateHandle = sketch.on('create', this._length.bind(this));
    sketch.create('polyline');
  }

  /**
   * Handle measure length.
   * @param createEvent
   */
  private _length(createEvent: esri.SketchViewModelCreateEvent): void {
    const { layer, polylineSymbol } = this;
    const {
      state: eventState,
      graphic,
      graphic: { geometry },
    } = createEvent;

    if (eventState === 'cancel' || !graphic) {
      this.clear();
      return;
    }

    this._measure('length', geometry);

    if (eventState === 'complete') {
      this.state = {
        ...this.state,
        action: 'length',
      };
      graphic.symbol = polylineSymbol;
      layer.add(graphic);
      (geometry as esri.Polyline).paths[0].forEach(this._addVertexMarkers.bind(this));
    }
  }

  /**
   * Initiate measure area.
   */
  area(): void {
    const { sketch } = this;
    this.clear();
    this.state = {
      ...this.state,
      action: 'measuringArea',
    };
    this._sketchCreateHandle = sketch.on('create', this._area.bind(this));
    sketch.create('polygon');
  }

  /**
   * Handle measure area.
   * @param createEvent
   */
  private _area(createEvent: esri.SketchViewModelCreateEvent): void {
    const { layer, polylineSymbol, polygonSymbol } = this;
    const {
      state: eventState,
      graphic,
      graphic: { geometry },
    } = createEvent;

    if (eventState === 'cancel' || !graphic) {
      this.clear();
      return;
    }

    this._measure('area', geometry);

    if (eventState === 'complete') {
      this.state = {
        ...this.state,
        action: 'area',
      };
      graphic.symbol = polylineSymbol;
      layer.addMany([
        new Graphic({
          geometry,
          symbol: polygonSymbol,
        }),
        graphic,
      ]);
      (geometry as esri.Polygon).rings[0].forEach(this._addVertexMarkers.bind(this));
    }
  }

  /**
   * Measure polylines and polygons.
   * @param type
   * @param geometry
   */
  private _measure(type: 'length' | 'area', geometry: esri.Geometry): void {
    const {
      units: { lengthUnit, areaUnit },
    } = this;

    let length;
    let area;

    this.state = {
      ...this.state,
      measureGeometry: geometry,
    };

    if (type === 'length' || type === 'area') {
      length = geodesicLength(geometry, lengthUnit);
      if (length < 0) {
        const simplifiedPolyline = simplify(geometry);
        if (simplifiedPolyline) {
          length = geodesicLength(simplifiedPolyline, lengthUnit);
        }
      }
      length = Number(length.toFixed(2));

      this.state = {
        ...this.state,
        length,
      };
    }

    if (type === 'area') {
      area = geodesicArea(geometry as esri.Polygon, areaUnit);
      if (area < 0) {
        const simplifiedPolygon = simplify(geometry) as esri.Polygon;
        if (simplifiedPolygon) {
          area = geodesicArea(simplifiedPolygon, areaUnit);
        }
      }
      area = Number(area.toFixed(2));

      this.state = {
        ...this.state,
        area,
      };
    }
  }

  /**
   * Initiate location.
   */
  location(): void {
    const { sketch } = this;
    this.clear();
    this.state = {
      ...this.state,
      action: 'queryingLocation',
    };
    this._sketchCreateHandle = sketch.on('create', (createEvent: esri.SketchViewModelCreateEvent) => {
      const {
        state: eventState,
        graphic,
        graphic: { geometry },
      } = createEvent;

      if (eventState === 'cancel' || !graphic) {
        this.clear();
        return;
      }
      if (eventState === 'complete') {
        if (this._coordinateHandle) {
          this._coordinateHandle.remove();
          this._coordinateHandle = null;
        }
        this.state = {
          ...this.state,
          action: 'location',
          locationPoint: geometry as esri.Point,
        };
        this._addVertexMarkers([(geometry as esri.Point).x, (geometry as esri.Point).y]);
      }
    });
    sketch.create('point');
  }

  /**
   * Handle location.
   * @param point
   */
  private _location(point: esri.Point): void {
    const {
      units: { locationUnit },
    } = this;
    if (locationUnit === 'dec') {
      this.state = {
        ...this.state,
        y: Number(point.latitude.toFixed(6)),
        x: Number(point.longitude.toFixed(6)),
      };
    } else {
      const dms = coordinateFormatter.toLatitudeLongitude(webMercatorToGeographic(point) as esri.Point, 'dms', 2);
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
      this.state = {
        ...this.state,
        y: dms.substring(0, index + 1),
        x: dms.substring(index + 2, dms.length),
      };
    }
  }

  /**
   * Initiate elevation.
   */
  elevation(): void {
    const { sketch } = this;
    this.clear();
    this.state = {
      ...this.state,
      action: 'queryingElevation',
    };
    this._sketchCreateHandle = sketch.on('create', (createEvent: esri.SketchViewModelCreateEvent) => {
      const {
        state: eventState,
        graphic,
        graphic: { geometry },
      } = createEvent;

      if (eventState === 'cancel' || !graphic) {
        this.clear();
        return;
      }

      if (eventState === 'complete') {
        if (this._elevationHandle) {
          this._elevationHandle.remove();
          this._elevationHandle = null;
        }
        this.state = {
          ...this.state,
          action: 'elevation',
          elevationPoint: geometry as esri.Point,
        };
        this._addVertexMarkers([(geometry as esri.Point).x, (geometry as esri.Point).y]);
      }
    });
    sketch.create('point');
  }

  /**
   * Handle elevation.
   * @param point
   */
  private _elevation(point: esri.Point): void {
    const {
      view: {
        map: { ground },
      },
      units: { elevationUnit },
    } = this;
    ground
      .queryElevation(point)
      .then((result: esri.ElevationQueryResult) => {
        const z = Number(((result.geometry as esri.Point).z * (elevationUnit === 'feet' ? 3.2808399 : 1)).toFixed(2));
        this.state = {
          ...this.state,
          z,
        };
      })
      .catch(() => {
        this.state = {
          ...this.state,
          z: -99999,
        };
      });
  }

  /**
   * Add a vertex marker.
   * @param coordinates
   */
  private _addVertexMarkers(coordinates: number[]): void {
    const {
      view: { spatialReference },
      layer,
      pointSymbol,
    } = this;
    const [x, y] = coordinates;
    const graphic = new Graphic({
      geometry: new Point({ x, y, spatialReference }),
      symbol: pointSymbol,
    });
    layer.add(graphic);
  }

  render(): tsx.JSX.Element {
    const {
      snappingEnabled,
      units,
      units: { elevationUnit },
      state,
    } = this;

    const measureClear = {
      visible:
        state.action === 'measuringLength' ||
        state.action === 'length' ||
        state.action === 'measuringArea' ||
        state.action === 'area',
    };

    const locationClear = {
      visible: state.action === 'queryingLocation' || state.action === 'location',
    };

    const elevationClear = {
      visible: state.action === 'queryingElevation' || state.action === 'elevation',
    };

    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">
              <calcite-icon scale="s" icon="measure"></calcite-icon>
            </calcite-tab-title>
            <calcite-tab-title>
              <calcite-icon scale="s" icon="pin-tear"></calcite-icon>
            </calcite-tab-title>
            <calcite-tab-title>
              <calcite-icon scale="s" icon="altitude"></calcite-icon>
            </calcite-tab-title>
          </calcite-tab-nav>
          {/* measure tab */}
          <calcite-tab active="">
            <div class={CSS.row}>
              <calcite-button icon-start="measure-line" onclick={this.length.bind(this)}>
                Length
              </calcite-button>
              {units.calciteLengthSelect()}
            </div>
            <div class={CSS.row}>
              <calcite-button icon-start="measure-area" onclick={this.area.bind(this)}>
                Area
              </calcite-button>
              {units.calciteAreaSelect()}
            </div>
            <calcite-label layout="inline" alignment="end">
              <calcite-checkbox
                checked={snappingEnabled}
                onclick={() => (this.snappingEnabled = !this.snappingEnabled)}
              ></calcite-checkbox>
              Enable snapping
            </calcite-label>
            {this._renderMeasureResult()}
            <div class={this.classes(CSS.clearButton, measureClear)}>
              <calcite-button width="auto" icon-start="x" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>
          {/* location tab */}
          <calcite-tab>
            <div class={CSS.row}>
              <calcite-button icon-start="pin-tear" onclick={this.location.bind(this)}>
                Location
              </calcite-button>
              {units.calciteLocationSelect()}
            </div>
            <calcite-label layout="inline" alignment="end">
              <calcite-checkbox
                checked={snappingEnabled}
                onclick={() => (this.snappingEnabled = !this.snappingEnabled)}
              ></calcite-checkbox>
              Enable snapping
            </calcite-label>
            <div class={CSS.result}>
              <span>Latitude:</span> {state.y}
            </div>
            <div class={CSS.result}>
              <span>Longitude:</span> {state.x}
            </div>
            <div class={this.classes(CSS.clearButton, locationClear)}>
              <calcite-button width="auto" icon-start="x" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>
          {/* elevation tab */}
          <calcite-tab>
            <div class={CSS.row}>
              <calcite-button icon-start="altitude" onclick={this.elevation.bind(this)}>
                Elevation
              </calcite-button>
              {units.calciteElevationSelect()}
            </div>
            <calcite-label layout="inline" alignment="end">
              <calcite-checkbox
                checked={snappingEnabled}
                onclick={() => (this.snappingEnabled = !this.snappingEnabled)}
              ></calcite-checkbox>
              Enable snapping
            </calcite-label>
            <div class={CSS.result}>
              <span>Elevation:</span> {`${state.z} ${elevationUnit}`}
            </div>
            <div class={this.classes(CSS.clearButton, elevationClear)}>
              <calcite-button width="auto" icon-start="x" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }

  /**
   * Return measure results based on state action and measure properties.
   * @returns
   */
  private _renderMeasureResult(): tsx.JSX.Element {
    const {
      state,
      units: { lengthUnit, areaUnit },
    } = this;
    switch (state.action) {
      case 'length':
      case 'measuringLength':
        return (
          <div key={KEY++} class={CSS.result}>
            <span>Length:</span> {state.length.toLocaleString()} {lengthUnit}
          </div>
        );
      case 'area':
      case 'measuringArea':
        return (
          <div key={KEY++} class={CSS.result}>
            <div>
              <span>Area:</span> {state.area.toLocaleString()} {areaUnit}
            </div>
            <div>
              <span>Perimeter:</span> {state.length.toLocaleString()} {lengthUnit}
            </div>
          </div>
        );
      default:
        return (
          <div key={KEY++} class={CSS.result}>
            Select a measure tool
          </div>
        );
    }
  }
}
