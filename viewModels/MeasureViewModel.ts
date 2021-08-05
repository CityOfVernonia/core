/**
 * Provides logic for measuring widgets.
 */
import cov = __cov;

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { watch, whenOnce, pausable } from '@arcgis/core/core/watchUtils';

import Accessor from '@arcgis/core/core/Accessor';

import SnappingOptions from '@arcgis/core/views/interactive/snapping/SnappingOptions';

import UnitsViewModel from './UnitsViewModel';

import Draw from '@arcgis/core/views/draw/Draw';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Color from '@arcgis/core/Color';

import { load as coordinateFormatterLoad, toLatitudeLongitude } from '@arcgis/core/geometry/coordinateFormatter';
import { geodesicArea, geodesicLength, simplify } from '@arcgis/core/geometry/geometryEngine';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { Point, Polygon, Polyline } from '@arcgis/core/geometry';
import { SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import { midpoint } from '../support/cogo';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';

@subclass('cov.viewModels.MeasureViewModel')
export default class MeasureViewModel extends Accessor {
  @property()
  view!: esri.MapView;

  @property()
  showText = true;

  // @property()
  // snappingOptions = new SnappingOptions({
  //   enabled: true,
  // });

  // @property()
  // color = [64, 64, 64];

  // @property()
  // fillColor = [64, 64, 64, 0.15];

  @property()
  color = [244, 124, 60];

  @property()
  fillColor = [244, 124, 60, 0.15];

  @property()
  protected hasGround = false;

  @property()
  protected state: cov.MeasureState = {
    action: 'ready',
    length: 0,
    area: 0,
    x: 0,
    y: 0,
    z: 0,
  };

  @property()
  protected sketchViewModel = new SketchViewModel({
    snappingOptions: new SnappingOptions({
      enabled: true,
    }),
  });

  @property()
  protected units = new UnitsViewModel();

  @property()
  protected draw = new Draw();

  @property()
  protected ground!: esri.Ground;

  @property()
  protected layer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  private _coordCenterHandle!: esri.PausableWatchHandle;
  @property()
  private _coordFormatHandle!: esri.PausableWatchHandle;

  @property()
  private _elevCenterHandle!: esri.PausableWatchHandle;
  @property()
  private _elevFormatHandle!: esri.PausableWatchHandle;

  @property()
  private _color!: Color;

  @property()
  private _fillColor!: Color;

  constructor(properties?: cov.MeasureViewModelProperties) {
    super(properties);
    whenOnce(this, 'view', this._init.bind(this));
  }

  /**
   * Clear any graphics, resume paused handles and reset state.
   */
  clear(): void {
    const { view, draw, layer, _coordCenterHandle, _coordFormatHandle, _elevCenterHandle, _elevFormatHandle } = this;
    _coordCenterHandle.resume();
    _coordFormatHandle.resume();
    this._setLocation(view.center);
    if (_elevCenterHandle && _elevFormatHandle) {
      _elevCenterHandle.resume();
      _elevFormatHandle.resume();
      this._setElevation(view.center);
    }
    draw.reset();
    layer.removeAll();
    this.state = {
      ...this.state,
      action: 'ready',
      length: 0,
      area: 0,
    };
  }

  /**
   * Start measuring length.
   */
  length(): void {
    const {
      view,
      view: { spatialReference },
      draw,
    } = this;

    this.clear();

    this.state.action = 'measuringLength';
    const action = draw.create('polyline', {
      mode: 'click',
    });
    view.focus();

    action.on(['vertex-add', 'cursor-update', 'vertex-remove', 'draw-complete'], (evt: any) => {
      const polyline = new Polyline({
        paths: evt.vertices,
        spatialReference,
      });
      if (evt.type === 'draw-complete') {
        this.state.action = 'length';
      }
      this._length(polyline);
    });
  }

  private _length(polyline: Polyline): void {
    const {
      layer,
      _color,
      units: { lengthUnit },
      showText,
    } = this;

    layer.removeAll();

    let length = geodesicLength(polyline, lengthUnit);
    if (length < 0) {
      const simplifiedPolyline = simplify(polyline);
      if (simplifiedPolyline) {
        length = geodesicLength(simplifiedPolyline, lengthUnit);
      }
    }
    length = Number(length.toFixed(2));

    this.state = {
      ...this.state,
      length,
    };

    // add polyline graphics
    layer.addMany([
      new Graphic({
        geometry: polyline,
        symbol: new SimpleLineSymbol({
          cap: 'butt',
          join: 'round',
          color: _color,
          width: 3,
        }),
      }),
      new Graphic({
        geometry: polyline,
        symbol: new SimpleLineSymbol({
          style: 'dash',
          cap: 'butt',
          join: 'round',
          color: 'white',
          width: 1.5,
        }),
      }),
    ]);

    // add vertices graphics
    polyline.paths[0].forEach(this._addMarker.bind(this));

    // add text graphic
    if (showText) {
      this._addText(midpoint(polyline), `${this.state.length.toLocaleString()} ${lengthUnit}`);
    }
  }

  /**
   * Start measuring ares.
   */
  area(): void {
    const {
      view,
      view: { spatialReference },
      draw,
    } = this;

    this.clear();

    this.state.action = 'measuringArea';
    const action = draw.create('polygon', {
      mode: 'click',
    });
    view.focus();

    action.on(['vertex-add', 'cursor-update', 'vertex-remove', 'draw-complete'], (evt: any) => {
      const polygon = new Polygon({
        rings: evt.vertices,
        spatialReference,
      });
      if (evt.type === 'draw-complete') {
        this.state.action = 'area';
      }

      this._area(polygon);
    });
  }

  private _area(polygon: Polygon): void {
    const {
      layer,
      _color,
      _fillColor,
      units: { lengthUnit, areaUnit },
      showText,
    } = this;

    layer.removeAll();

    let area = geodesicArea(polygon, areaUnit);
    if (area < 0) {
      const simplifiedPolygon = simplify(polygon) as Polygon;
      if (simplifiedPolygon) {
        area = geodesicArea(simplifiedPolygon, areaUnit);
      }
    }

    const length = geodesicLength(polygon, lengthUnit);

    this.state = {
      ...this.state,
      length,
      area,
    };

    layer.addMany([
      new Graphic({
        geometry: polygon,
        symbol: new SimpleFillSymbol({
          color: _fillColor,
          outline: {
            cap: 'butt',
            join: 'round',
            color: _color,
            width: 3,
          },
        }),
      }),
      new Graphic({
        geometry: polygon,
        symbol: new SimpleFillSymbol({
          color: [0, 0, 0, 0],
          outline: {
            style: 'dash',
            cap: 'butt',
            join: 'round',
            color: 'white',
            width: 1.5,
          },
        }),
      }),
    ]);

    // add vertices graphics
    polygon.rings[0].forEach(this._addMarker.bind(this));

    // add text graphic
    if (showText) {
      this._addText(polygon.centroid, `${this.state.area.toLocaleString()} ${areaUnit}`);
    }
  }

  /**
   * Start querying location.
   */
  location(): void {
    const {
      view,
      view: { spatialReference },

      sketchViewModel,

      draw,
      _coordCenterHandle,
      _coordFormatHandle,
    } = this;

    this.clear();

    _coordCenterHandle.pause();
    _coordFormatHandle.pause();

    this.state.action = 'queryingLocation';
    const action = draw.create('point', {});
    view.focus();

    action.on(['cursor-update', 'draw-complete'], (evt: any) => {
      const [x, y] = evt.coordinates;
      const point = new Point({
        x,
        y,
        spatialReference,
      });
      if (evt.type === 'draw-complete') {
        this.state.action = 'location';
      }
      this._setLocation(point);
      this._location(point);
    });
  }

  private _location(point: Point) {
    const { layer, showText } = this;
    const { x, y } = point;
    layer.removeAll();
    this._addMarker([x, y]);
    if (showText) {
      this._addText(point, `${this.state.x} ${this.state.y}`);
    }
  }

  /**
   * Start querying elevation.
   */
  elevation(): void {
    const {
      view,
      view: { spatialReference },
      hasGround,
      draw,
      _elevCenterHandle,
      _elevFormatHandle,
    } = this;

    if (!hasGround) return;

    this.clear();

    _elevCenterHandle.pause();
    _elevFormatHandle.pause();

    this.state.action = 'queryingElevation';
    const action = draw.create('point', {});
    view.focus();

    action.on(['cursor-update', 'draw-complete'], (evt: any) => {
      const [x, y] = evt.coordinates;
      const point = new Point({
        x,
        y,
        spatialReference,
      });
      if (evt.type === 'draw-complete') {
        this.state.action = 'elevation';
      }
      this._setElevation(point);
      this._elevation(point);
    });
  }

  private _elevation(point: Point): void {
    const {
      units: { elevationUnit },
      layer,
      showText,
    } = this;
    const { x, y } = point;
    layer.removeAll();
    this._addMarker([x, y]);
    if (showText) {
      this._addText(point, `${this.state.z.toLocaleString()} ${elevationUnit}`);
    }
  }

  /**
   * Initalize.
   * @param view
   */
  private _init(view: esri.MapView): void {
    const { map } = view;
    const {
      sketchViewModel,
      sketchViewModel: { snappingOptions },
      draw,
      color,
      fillColor,
      layer,
      units,
    } = this;

    // initialize draw and colors
    sketchViewModel.view = view;

    // snapping
    map.allLayers.forEach((_layer: esri.Layer) => {
      const { type } = _layer;
      if (type === 'feature' || type === 'graphics' || type === 'geojson' || type === 'csv') {
        snappingOptions.featureSources.add(
          new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: _layer,
          }),
        );
      }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    draw.view = view;

    view.map.add(layer);
    this._color = new Color(color);
    this._fillColor = new Color(fillColor);

    // initialize coordinates
    coordinateFormatterLoad();
    this._setLocation(view.center);
    this._coordCenterHandle = pausable(view, 'center', this._setLocation.bind(this));
    this._coordFormatHandle = pausable(units, 'locationUnit', this._setLocation.bind(this, view.center));

    // initialize elevation
    if (view.map.ground.layers.length) {
      this._initElevation(view, units);
    } else {
      watch(view, 'map.ground.layers.length', this._initElevation.bind(this, view, units));
    }

    // wire units change
    watch(
      units,
      ['lengthUnit', 'areaUnit', 'locationUnit', 'elevationUnit'],
      (_value: string, _old: string, updated: string) => {
        const {
          state: { action },
          layer: { graphics },
        } = this;
        let graphic: Graphic;

        switch (updated) {
          case 'lengthUnit':
            if (action !== 'length' && action !== 'measuringLength') break;
            graphic = graphics.find((graphic: Graphic) => {
              return graphic.geometry.type === 'polyline';
            });
            this._length(graphic.geometry as Polyline);
            break;
          case 'areaUnit':
            if (action !== 'area' && action !== 'measuringArea') break;
            graphic = graphics.find((graphic: Graphic) => {
              return graphic.geometry.type === 'polygon';
            });
            this._area(graphic.geometry as Polygon);
            break;
          case 'locationUnit':
            if (action !== 'location' && action !== 'queryingLocation') break;
            graphic = graphics.find((graphic: Graphic) => {
              return graphic.geometry.type === 'point';
            });
            this._location(graphic.geometry as Point);
            break;
          case 'elevationUnit':
            if (action !== 'elevation' && action !== 'queryingElevation') break;
            graphic = graphics.find((graphic: Graphic) => {
              return graphic.geometry.type === 'point';
            });
            this._elevation(graphic.geometry as Point);
            break;
          default:
            break;
        }
      },
    );
  }

  /**
   * Intialize elevation.
   * @param view
   * @param units
   */
  private _initElevation(view: esri.MapView, units: UnitsViewModel): void {
    this.hasGround = true;
    this.ground = view.map.ground;
    this._setElevation(view.center);
    this._elevCenterHandle = pausable(view, 'center', this._setElevation.bind(this));
    this._elevFormatHandle = pausable(units, 'elevationUnit', this._setElevation.bind(this, view.center));
  }

  /**
   * Update state<x, y>.
   * @param point
   */
  private _setLocation(point: esri.Point): void {
    const { units } = this;
    if (units.locationUnit === 'dec') {
      this.state = {
        ...this.state,
        y: Number(point.latitude.toFixed(6)),
        x: Number(point.longitude.toFixed(6)),
      };
    } else {
      const dms = toLatitudeLongitude(webMercatorToGeographic(point) as esri.Point, 'dms', 2);
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
      this.state = {
        ...this.state,
        y: dms.substring(0, index + 1),
        x: dms.substring(index + 2, dms.length),
      };
    }
  }

  /**
   * Update state<z>.
   * @param point
   */
  private _setElevation(point: esri.Point): void {
    const { units } = this;
    this.ground
      .queryElevation(point)
      .then((result: esri.ElevationQueryResult) => {
        const z = Number(
          ((result.geometry as esri.Point).z * (units.elevationUnit === 'feet' ? 3.2808399 : 1)).toFixed(2),
        );
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

  private _addMarker(coordinates: number[]): void {
    const {
      view: { spatialReference },
      layer,
      _color,
    } = this;
    const [x, y] = coordinates;
    const graphic = new Graphic({
      geometry: new Point({ x, y, spatialReference }),
      symbol: new SimpleMarkerSymbol({
        style: 'x',
        size: 8,
        outline: {
          color: _color,
          width: 2,
        },
      }),
    });
    layer.add(graphic);
  }

  private _addText(geometry: Point, text: string): void {
    const { layer, _color } = this;
    layer.add(
      new Graphic({
        geometry,
        symbol: new TextSymbol({
          text,
          color: _color,
          haloColor: 'white',
          haloSize: 1.5,
          yoffset: 10,
          font: {
            size: 10,
            weight: 'bold',
          },
        }),
      }),
    );
  }
}
