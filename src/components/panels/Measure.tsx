//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

export interface MeasureConstructorProperties extends esri.WidgetProperties {
  units?: Units;
  /**
   * Map view to measure.
   */
  view: esri.MapView;
}

export interface UnitsDropdownConstructorProperties extends esri.WidgetProperties {
  /**
   * Link text.
   */
  text: string;
  /**
   * Unit type.
   */
  type: 'area' | 'elevation' | 'latitudeLongitude' | 'length';
  /**
   * Units instance.
   */
  units: Units;
}

/**
 * Internal types.
 */
interface _Measure {
  type: 'area' | 'coordinates' | 'elevation' | 'length' | 'profile';
  profileStatistics: {
    avgElevation: number;
    avgNegativeSlope: number;
    avgPositiveSlope: number;
    elevationGain: number;
    elevationLoss: number;
    maxDistance: number;
    maxElevation: number;
    maxNegativeSlope: number;
    maxPositiveSlope: number;
    minElevation: number;
  };
  profileStatisticsFormatted: {
    avgElevation: string;
    avgNegativeSlope: string;
    avgPositiveSlope: string;
    elevationGain: string;
    elevationLoss: string;
    totalLength: string;
    maxDistance: string;
    maxElevation: string;
    maxNegativeSlope: string;
    maxPositiveSlope: string;
    minElevation: string;
  };
}

/**
 * Measure state and data.
 */
interface _MeasureState {
  /**
   * Operational state of the widget.
   */
  operation?:
    | 'ready'
    | 'measure-length'
    | 'length'
    | 'measure-area'
    | 'area'
    | 'measure-coordinates'
    | 'coordinates'
    | 'measure-elevation'
    | 'elevation'
    | 'measure-profile'
    | 'profile';
  /**
   * Length value.
   */
  length?: number;
  /**
   * Area value.
   */
  area?: number;
  /**
   * Perimeter value.
   */
  perimeter?: number;
  /**
   * Location longitude.
   */
  longitude?: number | string;
  /**
   * Location latitude.
   */
  latitude?: number | string;
  /**
   * Elevation value.
   */
  elevation?: number;
  /**
   * Current length polyline.
   */
  lengthGeometry?: esri.Polyline | null;
  /**
   * Current area polygon.
   */
  areaGeometry?: esri.Polygon | null;
  /**
   * Current location point.
   */
  coordinatesGeometry?: esri.Point | null;
  /**
   * Current elevation point.
   */
  elevationGeometry?: esri.Point | null;
  /**
   * Current profile polyline.
   */
  profileGeometry?: esri.Polyline | null;
}

import type { AreaUnitInfo, ElevationUnitInfo, LatitudeLongitudeUnitInfo, LengthUnitInfo } from './../../support/Units';

//////////////////////////////////////
// Modules
//////////////////////////////////////
// base
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
// sketch
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
// geometry
import Units from './../../support/Units';
import { Point, Polyline } from '@arcgis/core/geometry';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { geodesicArea, geodesicLength, simplify } from '@arcgis/core/geometry/geometryEngine';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { midpoint, textAngle, queryFeatureGeometry } from './../../support/geometryUtils';
// symbols
import { CIMSymbol, SimpleFillSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
// profile
import ElevationProfileViewModel from '@arcgis/core/widgets/ElevationProfile';
import ElevationProfileLineGround from '@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround';
import Color from '@arcgis/core/Color';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  measureButtons: 'cov-panels--measure_measure-buttons',
  notice: 'cov-panels--measure_notice',
  options: 'cov-panels--measure_options',
  profile: 'cov-panels--measure_profile',
  profileOptions: 'cov-panels--measure_profile-options',
  profileStatistics: 'cov-panels--measure_profile-statistics',
  results: 'cov-panels--measure_results',
  resultsRow: 'cov-panels--measure_results-row',
};

const CURSOR_EVENT_KEY = 'cursor-events';

const MEASURE_STATE: _MeasureState = {
  area: 0,
  areaGeometry: null,
  coordinatesGeometry: null,
  elevation: 0,
  elevationGeometry: null,
  latitude: 0,
  length: 0,
  lengthGeometry: null,
  longitude: 0,
  operation: 'ready',
  perimeter: 0,
  profileGeometry: null,
};

let PRIMARY: [number, number, number] = [237, 81, 81];
let SECONDARY: [number, number, number] = [255, 255, 255];

export const setMeasureColors = (primary: [number, number, number], secondary: [number, number, number]): void => {
  PRIMARY = primary;
  SECONDARY = secondary;
};

/**
 * Panel component for measuring in a map.
 */
@subclass('cov.panels.Measure')
class Measure extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: MeasureConstructorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      _elevationProfile,
      _elevationProfileLineGround,
      _labels,
      _layer,
      _pointSymbol,
      _polylineSymbol,
      _polygonSymbol,
      _sketch,
    } = this;

    // serviceable view
    await view.when();

    // load coordinate formatter
    coordinateFormatter.load();

    // sketch view model
    _sketch.view = view;
    _sketch.layer = _layer;

    // sketch symbols
    // @ts-expect-error not typed
    _sketch.activeVertexSymbol = _pointSymbol;
    // @ts-expect-error not typed
    _sketch.vertexSymbol = _pointSymbol;
    // @ts-expect-error not typed
    _sketch.activeLineSymbol = _polylineSymbol;
    _sketch.activeFillSymbol = _polygonSymbol;

    // add sketch layers
    const measureLayers = new GroupLayer({ layers: [_layer, _labels], listMode: 'hide' });
    view.map.add(measureLayers);

    // initialize elevation profile
    _elevationProfile.view = view;
    _elevationProfile.profiles.removeAll();
    _elevationProfileLineGround.color = new Color(PRIMARY);
    _elevationProfile.profiles.add(_elevationProfileLineGround);

    // snapping layers
    const layers = view.map.layers;
    layers.forEach(this._addSnappingLayer.bind(this));
    const layerAdd = layers.on('after-add', (event: { item: esri.Layer }): void => {
      this._addSnappingLayer(event.item);
      // keep the layers on top
      layers.reorder(measureLayers, layers.length - 1);
    });

    // handle widget visibility events
    const widgetVisible = this.watch('visible', (visible: boolean): void => {
      if (visible) {
        this._createCursorEvents();
      } else {
        this._reset();
        this.removeHandles(CURSOR_EVENT_KEY);
      }
    });

    // this.watch('_selectedFeature', (feature: esri.Graphic): void => {
    //   console.log(feature);
    // });

    // this.watch('_popupVisible', (visible: boolean): void => {
    //   console.log(visible);
    // });

    // handle unit changes
    const unitsChange = this.watch(
      ['areaUnit', 'coordinateUnit', 'elevationUnit', 'lengthUnit'],
      this._unitsChangeEvent.bind(this),
    );

    // add handles
    this.addHandles([layerAdd, widgetVisible, unitsChange]);

    // loaded
    this.loaded = true;
    this.emit('load');

    // debug
    // console.log(this);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  view!: esri.MapView;

  @property()
  protected loaded = false;

  /**
   * Units instance and units.
   */
  units = new Units();
  @property({ aliasOf: 'units.areaUnit' })
  protected areaUnit!: string;
  @property({ aliasOf: 'units.latitudeLongitudeUnit' })
  protected latitudeLongitudeUnit!: string;
  @property({ aliasOf: 'units.elevationUnit' })
  protected elevationUnit!: string;
  @property({ aliasOf: 'units.lengthUnit' })
  protected lengthUnit!: string;

  ///////////////////////////////////////
  // Variables
  //////////////////////////////////////
  /**
   * Abort controller for cursor elevation queries.
   */
  private _cursorElevationAbortController: AbortController | null = null;

  /**
   * Point with latitude, longitude and z of the cursor.
   */
  private _cursor = new Point({
    hasZ: true,
    latitude: 0,
    longitude: 0,
    z: 0,
  });

  /**
   * Ground instance for elevations.
   */
  @property({ aliasOf: 'view.map.ground' })
  private _ground!: esri.Ground;

  @property()
  private _measureState: _MeasureState = MEASURE_STATE;

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature?: esri.Graphic;
  @property({ aliasOf: 'view.popup.visible' })
  private _popupVisible!: boolean;

  /**
   * SketchViewModel, layers, and symbols.
   */
  private _sketch = new SketchViewModel({
    snappingOptions: {
      enabled: true,
      featureEnabled: true,
      selfEnabled: true,
    },
    updateOnGraphicClick: false,
  });
  private _sketchHandle: IHandle | null = null;
  private _sketchCoordinatesHandle: IHandle | null = null;
  private _labels = new GraphicsLayer();
  private _layer = new GraphicsLayer();
  @property({ aliasOf: '_sketch.pointSymbol' })
  private _pointSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 6,
    color: SECONDARY,
    outline: {
      width: 1,
      color: PRIMARY,
    },
  });
  @property({ aliasOf: '_sketch.polylineSymbol' })
  private _polylineSymbol = new CIMSymbol({
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
                offsetAlongLine: 0,
              },
            ],
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            width: 2.25,
            color: [...SECONDARY, 255],
          },
          {
            type: 'CIMSolidStroke',
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            width: 2.25,
            color: [...PRIMARY, 255],
          },
        ],
      },
    },
  });
  @property({ aliasOf: '_sketch.polygonSymbol' })
  private _polygonSymbol = new SimpleFillSymbol({
    color: [...PRIMARY, 0.125],
    outline: {
      width: 0,
    },
  });
  private _textSymbol = new TextSymbol({
    color: PRIMARY,
    haloColor: SECONDARY,
    haloSize: 2,
    horizontalAlignment: 'center',
    verticalAlignment: 'middle',
    font: {
      size: 10,
      // weight: 'bold',
    },
  });

  @property({ aliasOf: '_sketch.snappingOptions.featureSources' })
  private _snappingSources!: esri.Collection<esri.FeatureSnappingLayerSource>;
  @property({ aliasOf: '_sketch.snappingOptions.featureEnabled' })
  private _snapping!: boolean;
  @property({ aliasOf: '_sketch.snappingOptions.selfEnabled' })
  private _guides!: boolean;

  //////////////////////////////////////
  // Profile instances
  //////////////////////////////////////
  private _elevationProfile = new ElevationProfileViewModel({
    unit: 'feet',
    visibleElements: {
      legend: false,
      chart: true,
      clearButton: false,
      settingsButton: false,
      sketchButton: false,
      selectButton: false,
      uniformChartScalingToggle: false,
    },
  });
  private _elevationProfileLineGround = new ElevationProfileLineGround();

  @property({ aliasOf: '_elevationProfile.viewModel.uniformChartScaling' })
  private _uniformChartScaling!: boolean;

  @property({ aliasOf: '_elevationProfile.viewModel.statistics' })
  private _profileStatistics?: _Measure['profileStatistics'] | null;

  //////////////////////////////////////
  // Private methods (snapping)
  //////////////////////////////////////
  private _addSnappingLayer(layer: esri.Layer): void {
    const { _snappingSources } = this;

    if (layer.type === 'group') {
      (layer as GroupLayer).layers.forEach((_layer: esri.Layer): void => {
        this._addSnappingLayer(_layer);
      });
      return;
    }

    const { id, listMode, title } = layer;

    if ((listMode === 'hide' || !title) && !id.includes('markup')) return;

    // @ts-expect-error not typed
    if (layer.internal === true) return;

    _snappingSources.add(
      new FeatureSnappingLayerSource({
        //@ts-expect-error class will filter out non-snappable layers
        layer,
      }),
    );
  }

  //////////////////////////////////////
  // Private methods (events)
  //////////////////////////////////////
  private _createCursorEvents(): void {
    const { view, _cursor, _ground } = this;

    // cursor coordinates
    const cursorCoordinateHandle = view.on('pointer-move', (screenPoint: esri.ScreenPoint): void => {
      const { latitude, longitude } = view.toMap(screenPoint);
      _cursor.latitude = latitude;
      _cursor.longitude = longitude;
    });

    // cursor elevation
    const cursorElevationHandle = view.on('pointer-move', async (screenPoint: esri.ScreenPoint): Promise<void> => {
      const {
        _cursorElevationAbortController,
        _measureState: { operation },
      } = this;

      if (_cursorElevationAbortController) {
        _cursorElevationAbortController.abort();
        this._cursorElevationAbortController = null;
      }

      const controller = new AbortController();
      this._cursorElevationAbortController = controller;

      try {
        const { geometry } = await _ground.queryElevation(view.toMap(screenPoint), {
          signal: controller.signal,
        });

        if (this._cursorElevationAbortController !== controller) return;
        this._cursorElevationAbortController = null;

        const z = (geometry as esri.Point).z;

        _cursor.z = z;

        if (operation === 'measure-elevation') {
          const elevationGeometry = _cursor.clone();
          this._updateMeasureState({ elevation: z, elevationGeometry });
          this._addLabels(elevationGeometry);
        }
      } catch (error: any) {
        this._cursorElevationAbortController = null;
        if (error.message !== 'Aborted') console.log('elevation query error', error);
      }
    });

    this.addHandles([cursorCoordinateHandle, cursorElevationHandle], CURSOR_EVENT_KEY);
  }

  /**
   * Wire measure button event.
   * @param type
   * @param button
   */
  private _buttonMeasureEvent(type: _Measure['type'], button: HTMLCalciteButtonElement): void {
    button.addEventListener('click', this._measure.bind(this, type));
  }

  private _unitsChangeEvent(): void {
    const {
      elevationUnit,
      _elevationProfile,
      _measureState: { areaGeometry, coordinatesGeometry, elevationGeometry, lengthGeometry, operation },
    } = this;

    // area update
    if (areaGeometry) this._area(areaGeometry);
    if (operation === 'area' && areaGeometry) this._addLabels(areaGeometry);

    // length update
    if (lengthGeometry) this._length(lengthGeometry);
    if (operation === 'length' && lengthGeometry) this._addLabels(lengthGeometry);

    // coordinates update
    if (operation === 'coordinates' && coordinatesGeometry) {
      this._coordinates(coordinatesGeometry);
      this._addLabels(coordinatesGeometry);
    }

    // elevation update
    if (operation === 'elevation' && elevationGeometry) this._addLabels(elevationGeometry);

    _elevationProfile.unit = elevationUnit as esri.SystemOrLengthUnit;
  }

  //////////////////////////////////////
  // Private methods (measure)
  //////////////////////////////////////
  private _area(polygon: esri.Polygon): void | { area: number; perimeter: number } {
    const { areaUnit, lengthUnit } = this;

    // measure length (perimeter)
    let perimeter = geodesicLength(polygon, lengthUnit as any);

    // simplify and remeasure length if required
    if (perimeter < 0) perimeter = geodesicLength(simplify(polygon), lengthUnit as any);

    let area = geodesicArea(polygon, areaUnit as any);

    // simplify and remeasure area if required
    if (area < 0) area = geodesicArea(simplify(polygon) as esri.Polygon, areaUnit as any);

    this._updateMeasureState({ perimeter, area });
  }

  private _areaEvent(event: esri.SketchViewModelCreateEvent, allGraphics?: boolean): void {
    const {
      _sketch: { layer },
    } = this;
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    // reset on cancel
    if (state === 'cancel' || !graphic) {
      this._reset();
      return;
    }

    // measure
    this._area(geometry as esri.Polygon);

    // completed
    if (state === 'complete') {
      this._updateMeasureState({
        operation: 'area',
        areaGeometry: geometry as esri.Polygon,
      });

      // add outline and vertex graphics
      this._addGraphics(geometry as esri.Polygon, allGraphics);
    }

    // add labels
    this._addLabels(
      geometry as esri.Polygon,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  private _coordinates(point: esri.Point) {
    const { latitude, longitude } = this._formatLatitudeLongitude(point);
    this._updateMeasureState({ latitude, longitude });
  }

  private _coordinatesEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      _sketch: { layer },
      _sketchCoordinatesHandle,
    } = this;
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    // reset on cancel
    if (state === 'cancel' || !graphic) {
      this._reset();
      return;
    }

    if (state !== 'complete') return;

    if (_sketchCoordinatesHandle) {
      _sketchCoordinatesHandle.remove();
      this._sketchCoordinatesHandle = null;
    }

    this._coordinates(geometry as esri.Point);

    this._updateMeasureState({ operation: 'coordinates', coordinatesGeometry: geometry as esri.Point });

    // add labels
    this._addLabels(
      geometry as esri.Point,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  private _elevationEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      _sketch: { layer },
    } = this;
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    // reset on cancel
    if (state === 'cancel' || !graphic) {
      this._reset();
      return;
    }

    if (state !== 'complete') return;
    this._updateMeasureState({ operation: 'elevation' });
    const z = this._cursor.z;
    (geometry as esri.Point).z = z;
    this._updateMeasureState({ elevation: z, elevationGeometry: geometry as esri.Point });

    // add labels
    this._addLabels(
      geometry as esri.Point,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  private _length(polyline: Polyline): void {
    const { lengthUnit } = this;

    // measure length
    let length = geodesicLength(polyline, lengthUnit as any);

    // simplify and remeasure length if required
    if (length < 0) length = geodesicLength(simplify(polyline), lengthUnit as any);

    // set state
    this._updateMeasureState({ length });
  }

  private _lengthEvent(event: esri.SketchViewModelCreateEvent, allGraphics?: boolean): void {
    const {
      _sketch: { layer },
    } = this;
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    // reset on cancel
    if (state === 'cancel' || !graphic) {
      this._reset();
      return;
    }

    // measure
    this._length(geometry as esri.Polyline);

    // completed
    if (state === 'complete') {
      this._updateMeasureState({
        operation: 'length',
        lengthGeometry: geometry as esri.Polyline,
      });
      // add additional graphics
      this._addGraphics(geometry as esri.Polyline, allGraphics);
    }

    // add labels
    this._addLabels(
      geometry as esri.Polyline,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  private _profileEvent(event: esri.SketchViewModelCreateEvent): void {
    const { _elevationProfile } = this;
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    // reset on cancel
    if (state === 'cancel' || !graphic) {
      this._reset();
      return;
    }

    if (state !== 'complete') return;

    _elevationProfile.input = new Graphic({
      geometry,
    });

    this._updateMeasureState({ operation: 'profile', profileGeometry: geometry as esri.Polyline });

    // add additional graphics
    this._addGraphics(geometry as Polyline);
  }

  /**
   * Initiate measuring.
   * @param type
   */
  private _measure(type: _Measure['type']): void {
    const { view, _sketch } = this;

    this._reset();

    this._updateMeasureState({ operation: `measure-${type}` });

    // create handle
    this._sketchHandle = _sketch.on('create', this[`_${type}Event`].bind(this));

    // coordinates handle
    if (type === 'coordinates')
      this._sketchCoordinatesHandle = view.on('pointer-move', (screenPoint: esri.ScreenPoint): void => {
        const point = view.toMap(screenPoint);
        this._coordinates(point);
        this._addLabels(point);
      });

    // sketch
    _sketch.create(type === 'length' || type === 'profile' ? 'polyline' : type === 'area' ? 'polygon' : 'point');
  }

  private _reset(): void {
    const { _elevationProfile, _labels, _layer, _sketch } = this;

    // don't use deconstructed properties to remove handles
    this._sketchHandle?.remove();
    this._sketchHandle = null;

    // reset elevation
    // @ts-expect-error force reset to `null`
    _elevationProfile.input = null;

    // cancel sketch
    _sketch.cancel();
    _layer.removeAll();
    _labels.removeAll();

    // update state
    this._updateMeasureState(MEASURE_STATE);
  }

  /**
   * Update `_measureState`.
   * @param state
   */
  private _updateMeasureState(state: _MeasureState): void {
    this._measureState = {
      ...this._measureState,
      ...state,
    };
  }

  private async _measureSelectedFeature(): Promise<void> {
    const {
      view,
      _measureState: { operation },
      _popupVisible,
      _selectedFeature,
    } = this;

    view.closePopup();

    if (operation !== 'ready' || !_popupVisible || !_selectedFeature) return;

    // @ts-expect-error not typed
    const layer = (_selectedFeature.layer || _selectedFeature.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;

    let geometry = _selectedFeature.geometry;

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic: _selectedFeature,
        outSpatialReference: view.spatialReference,
      });

    const event = {
      state: 'complete',
      graphic: new Graphic({
        geometry,
      }),
    } as esri.SketchViewModelCreateEvent;

    switch (geometry.type) {
      case 'polygon':
        this._areaEvent(event, true);
        break;
      case 'polyline':
        this._lengthEvent(event, true);
        break;
      default:
        break;
    }
  }

  //////////////////////////////////////
  // Private methods (graphics support)
  //////////////////////////////////////
  /**
   * Add additional graphics when complete.
   * @param geometry
   */
  private _addGraphics(geometry: esri.Polyline | esri.Polygon, allGraphics?: boolean): void {
    const {
      view: { spatialReference },
      _sketch: { layer },
      _pointSymbol,
      _polygonSymbol,
      _polylineSymbol,
    } = this;
    const { type } = geometry;

    // add polygon outline
    if (type === 'polygon' && allGraphics) {
      layer.add(
        new Graphic({
          geometry,
          symbol: _polygonSymbol,
        }),
      );
    }

    if (type === 'polygon' || (type === 'polyline' && allGraphics)) {
      layer.add(
        new Graphic({
          geometry,
          symbol: _polylineSymbol,
        }),
      );
    }

    // add vertices
    const coordinates = type === 'polyline' ? geometry.paths[0] : geometry.rings[0];
    layer.addMany(
      coordinates.map((coordinate: number[]): Graphic => {
        const [x, y] = coordinate;
        return new Graphic({
          geometry: new Point({ x, y, spatialReference }),
          symbol: _pointSymbol,
        });
      }),
    );
  }

  private _addLabels(geometry: esri.Point | Polyline | esri.Polygon, layer?: esri.GraphicsLayer): void {
    const {
      _labels,
      _measureState: { area, elevation, latitude, length, longitude, operation },
      _round,
    } = this;
    const { type } = geometry;

    // remove all labels
    _labels.removeAll();

    if (layer)
      layer.removeMany(
        layer.graphics
          .filter((graphic: esri.Graphic): boolean => {
            return graphic.symbol && graphic.symbol.type === 'text';
          })
          .toArray(),
      );

    const _layer = layer || _labels;

    // area labels
    if ((operation === 'area' || operation === 'measure-area') && type === 'polygon' && area && area > 0)
      _layer.addMany([
        ...this._createPolylineLabels(geometry),
        new Graphic({
          geometry: geometry.centroid,
          symbol: this._createTextSymbol({ text: _round(area) }),
        }),
      ]);

    // length labels
    if ((operation === 'length' || operation === 'measure-length') && type === 'polyline' && length && length > 0)
      _layer.addMany(this._createPolylineLabels(geometry));

    // coordinate labels
    if ((operation === 'coordinates' || operation === 'measure-coordinates') && type === 'point')
      _layer.add(
        new Graphic({
          geometry,
          symbol: this._createTextSymbol({ text: `${latitude}\n${longitude}`, point: true }),
        }),
      );

    // elevation labels
    if ((operation === 'elevation' || operation === 'measure-elevation') && type === 'point')
      _layer.add(
        new Graphic({
          geometry,
          symbol: this._createTextSymbol({ text: this._formatElevation(elevation, false), point: true }),
        }),
      );
  }

  private _createPolylineLabels(geometry: esri.Polyline | esri.Polygon): Graphic[] {
    const { lengthUnit, _round } = this;

    const paths = geometry.type === 'polyline' ? geometry.paths[0] : geometry.rings[0];

    const graphics: Graphic[] = [];

    // measure each polyline segment
    paths.forEach((point: number[], index: number, path: number[][]): void => {
      const a = path[index];
      const b = path[index + 1];

      if (!a || !b) return;

      // create polyline
      const polyline = new Polyline({
        paths: [[a, b]],
        spatialReference: geometry.spatialReference,
      });

      // measure length
      let length = geodesicLength(polyline, lengthUnit as any);

      // simplify and remeasure length if required
      if (length < 0) length = geodesicLength(simplify(polyline), lengthUnit as any);

      // round
      length = this._round(length, 2);

      graphics.push(
        new Graphic({
          geometry: midpoint(polyline),
          symbol: this._createTextSymbol({
            text: _round(length),
            angle: textAngle({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }),
          }),
        }),
      );
    });

    return graphics;
  }

  /**
   *
   * @param options
   * @returns
   */
  private _createTextSymbol(options: { text: string | number; point?: boolean; angle?: number }): esri.TextSymbol {
    const { _textSymbol } = this;
    const { text, point, angle } = options;
    const symbol = _textSymbol.clone();
    symbol.text = typeof text === 'string' ? text : text.toLocaleString();
    if (point) {
      symbol.horizontalAlignment = 'left';
      symbol.xoffset = 8;
    }
    if (angle) symbol.angle = angle;
    return symbol;
  }

  //////////////////////////////////////
  // Private methods (misc helpers)
  //////////////////////////////////////
  /**
   * Return formatted latitude, longitude and elevation of the cursor.
   * @returns
   */
  private _cursorInfo(): { latitude: number | string; longitude: number | string; elevation: string } {
    const { _cursor } = this;

    const { latitude, longitude } = this._formatLatitudeLongitude(_cursor);

    return {
      latitude,
      longitude,
      elevation: this._formatElevation(_cursor.z),
    };
  }

  private _formatElevation(elevation?: number, includeUnit?: boolean): string {
    const { elevationUnit, units, _round } = this;
    let _elevation = elevation || 0;
    if (elevationUnit === 'feet') _elevation = _elevation * 3.28084;
    return includeUnit === false
      ? _round(_elevation).toLocaleString()
      : `${_round(_elevation).toLocaleString()} ${units.getUnitLabel('elevation', elevationUnit)}`;
  }

  private _formatLatitudeLongitude(point: esri.Point): { latitude: number | string; longitude: number | string } {
    const { latitudeLongitudeUnit, _round } = this;

    let _point = point.clone();

    if (_point.spatialReference.isWebMercator) _point = webMercatorToGeographic(_point) as esri.Point;

    let { latitude, longitude } = _point;

    let lat: string;
    let lng: string;

    if (latitudeLongitudeUnit === 'decimal') {
      latitude = _round(latitude, 6);
      longitude = _round(longitude, 6);
    } else if (latitudeLongitudeUnit === 'dms') {
      const dms = coordinateFormatter.toLatitudeLongitude(_point, 'dms', 2);
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');

      lat = dms.substring(0, index + 1);
      const latParts = lat.split(' ');
      //@ts-expect-error force assign
      latitude = `${latParts[0]}°${latParts[1]}'${latParts[2].slice(0, latParts[2].length - 1) + '" ' + latParts[2].slice(latParts[2].length - 1)}`;

      lng = dms.substring(index + 2, dms.length);
      const lngParts = lng.split(' ');
      //@ts-expect-error force assign
      longitude = `${lngParts[0]}°${lngParts[1]}'${lngParts[2].slice(0, lngParts[2].length - 1) + '" ' + lngParts[2].slice(lngParts[2].length - 1)}`;
    }

    return {
      latitude,
      longitude,
    };
  }

  private _measureInfo(): {
    area: string;
    elevation: string;
    latitude: string | number;
    length: string;
    longitude: string | number;
    perimeter: string;
  } {
    const {
      areaUnit,
      lengthUnit,
      units,
      _measureState: { area, elevation, latitude, length, longitude, perimeter },
      _round,
    } = this;

    return {
      area: `${_round(area || 0).toLocaleString()} ${units.getUnitLabel('area', areaUnit)}`,
      elevation: this._formatElevation(elevation),
      latitude: latitude || 0,
      length: `${_round(length || 0).toLocaleString()} ${units.getUnitLabel('length', lengthUnit)}`,
      longitude: longitude || 0,
      perimeter: `${_round(perimeter || 0).toLocaleString()} ${units.getUnitLabel('length', lengthUnit)}`,
    };
  }

  private _profileStatisticsInfo(): _Measure['profileStatisticsFormatted'] {
    const {
      _elevationProfile: { input },
      _elevationProfileLineGround: { samples },
      _profileStatistics,
      _round,
    } = this;

    if (!_profileStatistics)
      return {
        avgElevation: '',
        avgNegativeSlope: '',
        avgPositiveSlope: '',
        elevationGain: '',
        elevationLoss: '',
        totalLength: '',
        maxDistance: '',
        maxElevation: '',
        maxNegativeSlope: '',
        maxPositiveSlope: '',
        minElevation: '',
      };

    const {
      avgElevation,
      avgNegativeSlope,
      avgPositiveSlope,
      elevationGain,
      elevationLoss,
      maxDistance,
      maxElevation,
      maxNegativeSlope,
      maxPositiveSlope,
      minElevation,
    } = _profileStatistics;

    let totalLength = 0;

    if (input && samples) {
      samples.forEach((sample: esri.ElevationProfileSample, index: number): void => {
        if (index === 0) return;
        totalLength += Math.sqrt(
          Math.pow(samples[index].distance - samples[index - 1].distance, 2) +
            Math.pow((samples[index].elevation as number) - (samples[index - 1].elevation as number), 2),
        );
      });
    }

    return {
      avgElevation: `${_round(avgElevation).toLocaleString()}`,
      avgNegativeSlope: `-${_round(avgNegativeSlope, 1)}%`,
      avgPositiveSlope: `${_round(avgPositiveSlope, 1)}%`,
      elevationGain: `${_round(elevationGain).toLocaleString()}`,
      elevationLoss: `${_round(elevationLoss).toLocaleString()}`,
      totalLength: `${_round(totalLength).toLocaleString()}`,
      maxDistance: `${_round(maxDistance).toLocaleString()}`,
      maxElevation: `${_round(maxElevation).toLocaleString()}`,
      maxNegativeSlope: `-${_round(maxNegativeSlope, 1)}%`,
      maxPositiveSlope: `${_round(maxPositiveSlope, 1)}%`,
      minElevation: `${_round(minElevation).toLocaleString()}`,
    };
  }

  /**
   * Round a number.
   * @param value Number to round
   * @param digits Number of significant digits
   * @returns number
   */
  private _round(value: number, digits?: number): number {
    if (typeof value !== 'number') return 0;
    return Number(value.toFixed(digits || 2));
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const {
      view: { scale },
      _measureState: { operation },
    } = this;

    const { latitude, longitude, elevation } = this._cursorInfo();

    const {
      area,
      elevation: _elevation,
      latitude: _latitude,
      length,
      longitude: _longitude,
      perimeter,
    } = this._measureInfo();

    const { avgElevation, elevationGain, elevationLoss, totalLength, maxElevation, minElevation } =
      this._profileStatisticsInfo();

    return (
      <calcite-panel heading="Measure">
        {/* header actions */}
        <calcite-action icon="gear" slot="header-actions-end" text="Options">
          <calcite-tooltip close-on-click="" placement="bottom" slot="tooltip">
            Options
          </calcite-tooltip>
        </calcite-action>

        {/* options */}
        <calcite-popover
          auto-close=""
          closable=""
          heading="Options"
          placement="bottom"
          scale="s"
          afterCreate={this._referenceElement.bind(this)}
        >
          <div class={CSS.options}>
            <calcite-label layout="inline">
              <calcite-switch
                checked=""
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._snapping = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Snapping
            </calcite-label>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                checked=""
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._guides = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Guides
            </calcite-label>
          </div>
        </calcite-popover>

        {/* measure buttons */}
        <div class={CSS.measureButtons}>
          <calcite-button
            icon-start="measure-line"
            afterCreate={this._buttonMeasureEvent.bind(this, 'length')}
          ></calcite-button>
          <calcite-tooltip placement="bottom" close-on-click="" afterCreate={this._referenceElement.bind(this)}>
            Length
          </calcite-tooltip>
          <calcite-button
            icon-start="measure-area"
            afterCreate={this._buttonMeasureEvent.bind(this, 'area')}
          ></calcite-button>
          <calcite-tooltip placement="bottom" close-on-click="" afterCreate={this._referenceElement.bind(this)}>
            Area
          </calcite-tooltip>
          <calcite-button
            icon-start="point"
            afterCreate={this._buttonMeasureEvent.bind(this, 'coordinates')}
          ></calcite-button>
          <calcite-tooltip placement="bottom" close-on-click="" afterCreate={this._referenceElement.bind(this)}>
            Coordinates
          </calcite-tooltip>
          <calcite-button
            icon-start="altitude"
            afterCreate={this._buttonMeasureEvent.bind(this, 'elevation')}
          ></calcite-button>
          <calcite-tooltip placement="bottom" close-on-click="" afterCreate={this._referenceElement.bind(this)}>
            Elevation
          </calcite-tooltip>
          <calcite-button
            icon-start="graph-time-series"
            afterCreate={this._buttonMeasureEvent.bind(this, 'profile')}
          ></calcite-button>
          <calcite-tooltip placement="bottom" close-on-click="" afterCreate={this._referenceElement.bind(this)}>
            Profile
          </calcite-tooltip>
        </div>

        {/* cursor info */}
        <div class={CSS.results} hidden={operation !== 'ready'}>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'latitudeLongitude', 'Latitude')}></div>
            <div>: {latitude}</div>
          </div>
          <div class={CSS.resultsRow}>Longitude: {longitude}</div>
          <hr></hr>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'elevation', 'Elevation')}></div>
            <div>: {elevation}</div>
          </div>
          <hr></hr>
          <div class={CSS.resultsRow}>Scale: 1:{Math.round(scale).toLocaleString()}</div>
        </div>

        {/* area */}
        <div class={CSS.results} hidden={operation !== 'area' && operation !== 'measure-area'}>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'area', 'Area')}></div>
            <div>: {area}</div>
          </div>
          <hr></hr>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'length', 'Perimeter')}></div>
            <div>: {perimeter}</div>
          </div>
        </div>

        {/* length */}
        <div class={CSS.results} hidden={operation !== 'length' && operation !== 'measure-length'}>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'length', 'Length')}></div>
            <div>: {length}</div>
          </div>
        </div>

        {/* coordinates */}
        <div class={CSS.results} hidden={operation !== 'coordinates' && operation !== 'measure-coordinates'}>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'latitudeLongitude', 'Latitude')}></div>
            <div>: {_latitude}</div>
          </div>
          <div class={CSS.resultsRow}>Longitude: {_longitude}</div>
        </div>

        {/* elevation */}
        <div class={CSS.results} hidden={operation !== 'elevation' && operation !== 'measure-elevation'}>
          <div class={CSS.resultsRow}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'elevation', 'Elevation')}></div>
            <div>: {_elevation}</div>
          </div>
        </div>

        {/* profile */}
        <calcite-notice class={CSS.notice} hidden={operation !== 'measure-profile'} icon="line-straight" open="">
          <div slot="message">Draw a line to create a profile.</div>
        </calcite-notice>
        <div class={CSS.profile} hidden={operation !== 'profile'}>
          <div class={CSS.profileOptions}>
            <div afterCreate={this._createUnitsDropdown.bind(this, 'elevation', 'Elevation unit')}></div>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._uniformChartScaling = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Uniform scale
            </calcite-label>
          </div>
          <div
            afterCreate={(container: HTMLDivElement): void => {
              this._elevationProfile.container = container;
            }}
          ></div>
          <div class={CSS.profileStatistics}>
            <table>
              <tr>
                <th>Length (3D)</th>
                <th>Gain</th>
                <th>Loss</th>
              </tr>
              <tr>
                <td>{totalLength}</td>
                <td>{elevationGain}</td>
                <td>{elevationLoss}</td>
              </tr>
              <tr>
                <th>Min</th>
                <th>Max</th>
                <th>Avg</th>
              </tr>
              <tr>
                <td>{minElevation}</td>
                <td>{maxElevation}</td>
                <td>{avgElevation}</td>
              </tr>
            </table>
          </div>
        </div>

        {/* cancel/clear button */}
        <calcite-button
          appearance="outline"
          hidden={operation === 'ready'}
          slot={operation === 'ready' ? null : 'footer'}
          width="full"
          onclick={this._reset.bind(this)}
        >
          {operation?.includes('measure') ? 'Cancel' : 'Clear'}
        </calcite-button>

        {/* measure selected */}
        {/* {this._renderMeasureSelectedFeatureButton()} */}
      </calcite-panel>
    );
  }

  /**
   * Create a UnitsDropdown.
   * @param type
   * @param text
   * @param container
   */
  _createUnitsDropdown(
    type: 'area' | 'elevation' | 'latitudeLongitude' | 'length',
    text: string,
    container: HTMLDivElement,
  ): void {
    new UnitsDropdown({
      text,
      type,
      units: this.units,
      container,
    });
  }

  /**
   * Set tooltip or popover `referenceElement` property.
   * @param element HTMLCalciteTooltipElement | HTMLCalcitePopoverElement
   */
  private _referenceElement(element: HTMLCalciteTooltipElement | HTMLCalcitePopoverElement): void {
    const reference = element.previousElementSibling;
    if (reference) element.referenceElement = reference;
  }

  private _renderMeasureSelectedFeatureButton(): tsx.JSX.Element | null {
    const {
      _measureState: { operation },
      _popupVisible,
      _selectedFeature,
    } = this;

    if (operation !== 'ready' || !_popupVisible || !_selectedFeature) return null;

    const type = _selectedFeature.geometry.type;

    if (type !== 'polygon' && type !== 'polyline') return null;

    const text = {
      polygon: 'Area',
      polyline: 'Length',
    };

    const icon = {
      polygon: 'measure-area',
      polyline: 'measure-line',
    };

    return (
      <calcite-button
        appearance="outline"
        icon-start={icon[type]}
        slot="footer"
        width="full"
        onclick={this._measureSelectedFeature.bind(this)}
      >
        Selected {text[type]}
      </calcite-button>
    );
  }
}

/**
 * Link triggered unit selecting dropdown.
 */
@subclass('cov.panels.Measure.UnitsDropdown')
export class UnitsDropdown extends Widget {
  constructor(properties: UnitsDropdownConstructorProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { type, units, _items } = this;
    const unitType = `${type}Unit` as 'areaUnit' | 'elevationUnit' | 'latitudeLongitudeUnit' | 'lengthUnit'; //make TS happy
    units[`${type}UnitInfos`].forEach(
      (unitInfo: AreaUnitInfo | ElevationUnitInfo | LatitudeLongitudeUnitInfo | LengthUnitInfo): void => {
        const { name, unit } = unitInfo;
        _items.push(
          <calcite-dropdown-item
            scale="s"
            afterCreate={(dropdownItem: HTMLCalciteDropdownItemElement): void => {
              dropdownItem.selected = unit === this[unitType];
              dropdownItem.addEventListener('calciteDropdownItemSelect', (): void => {
                (this[unitType] as any) = unit;
              });
              this.watch(unitType, (): void => {
                dropdownItem.selected = this[unitType] === unit;
              });
            }}
          >
            {name}
          </calcite-dropdown-item>,
        );
      },
    );
  }

  text = 'Units';

  type!: 'area' | 'elevation' | 'latitudeLongitude' | 'length';

  units!: Units;

  @property({ aliasOf: 'units.areaUnit' })
  protected areaUnit!: esri.AreaUnit;

  @property({ aliasOf: 'units.elevationUnit' })
  protected elevationUnit!: esri.LengthUnit;

  @property({ aliasOf: 'units.latitudeLongitudeUnit' })
  protected latitudeLongitudeUnit!: 'decimal' | 'dms';

  @property({ aliasOf: 'units.lengthUnit' })
  protected lengthUnit!: esri.LengthUnit;

  private _items: tsx.JSX.Element[] = [];

  private _titles = {
    area: 'Area units',
    elevation: 'Elevation units',
    latitudeLongitude: 'Lat/Lng format',
    length: 'Length units',
  };

  render(): tsx.JSX.Element {
    const { text, type, _items, _titles } = this;
    return (
      <div>
        <calcite-dropdown overlay-positioning="fixed" scale="s" width-scale="s">
          <calcite-link slot="trigger">{text}</calcite-link>
          <calcite-dropdown-group group-title={_titles[type]} scale="s">
            {_items}
          </calcite-dropdown-group>
        </calcite-dropdown>
      </div>
    );
  }
}

export default Measure;
