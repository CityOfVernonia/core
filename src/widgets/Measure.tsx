import esri = __esri;

interface MeasureProperties extends esri.WidgetProperties {
  /**
   * Map view to measure in.
   */
  view: esri.MapView;
  /**
   * Default length unit.
   */
  lengthUnit?: string;
  /**
   * Length units to include.
   * <UNIT>:<NAME> e.g. {feet: 'Feet'}
   */
  lengthUnits?: { [key: string]: string };
  /**
   * Default area unit.
   */
  areaUnit?: string;
  /**
   * Area units to include.
   * <UNIT>:<NAME> e.g. {'square-feet': 'Feet'}
   */
  areaUnits?: { [key: string]: string };
  /**
   * Default location unit.
   */
  locationUnit?: string;
  /**
   * Length units to include.
   */
  locationUnits?: { [key: string]: string };
  /**
   * Default elevation unit.
   */
  elevationUnit?: string;
  /**
   * Length units to include.
   */
  elevationUnits?: { [key: string]: string };
  /**
   * Labels visible.
   * @default true
   */
  labelsVisible?: boolean;
  /**
   * Add units to labels.
   * @default false
   */
  labelUnits?: boolean;
  /**
   * Length, area and elevation precision.
   * @default 2
   */
  unitsPrecision?: number;
  /**
   * Decimal degrees precision.
   * @default 6
   */
  degreesPrecision?: number;
  /**
   * Format numbers, e.i. thousand separated, etc.
   * @default true
   */
  localeFormat?: boolean;
}

interface MeasureState {
  /**
   * Operational state of the widget.
   */
  operation:
    | 'ready'
    | 'measure-length'
    | 'length'
    | 'measure-area'
    | 'area'
    | 'measure-location'
    | 'location'
    | 'measure-elevation'
    | 'elevation'
    | 'measure-profile'
    | 'profile';
  /**
   * Longitude of cursor.
   */
  x: number | string;
  /**
   * Latitude of cursor.
   */
  y: number | string;
  /**
   * Elevation of cursor.
   */
  z: number;
  /**
   * Length or perimeter value.
   */
  length: number;
  /**
   * Area value.
   */
  area: number;
  /**
   * Location longitude.
   */
  locationX: number | string;
  /**
   * Location latitude.
   */
  locationY: number | string;
  /**
   * Elevation value.
   */
  elevation: number;
  /**
   * Current length polyline.
   */
  lengthGeometry: Polyline | null;
  /**
   * Current area polygon.
   */
  areaGeometry: esri.Polygon | null;
  /**
   * Current location point.
   */
  locationGeometry: esri.Point | null;
  /**
   * Current elevation point.
   */
  elevationGeometry: esri.Point | null;
  /**
   * Current profile polyline.
   */
  profileGeometry: Polyline | null;
}

interface SettingsInfo {
  snapping: boolean;
  labels: boolean;
  labelUnits: boolean;
  localeFormat: boolean;
  uniformChartScaling: boolean;
  color: number[];
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { CIMSymbol, SimpleFillSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import Color from '@arcgis/core/Color';
import { geodesicArea, geodesicLength, simplify } from '@arcgis/core/geometry/geometryEngine';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import ElevationProfileViewModel from '@arcgis/core/widgets/ElevationProfile';
import ElevationProfileLineGround from '@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround';

const CSS = {
  base: 'cov-measure',
  // content containers
  content: 'cov-measure--content',
  optionsContent: 'cov-measure--options-content',
  // controls and results
  row: 'cov-measure--row',
  result: 'cov-measure--result',
  // color selector
  colorSelector: 'cov-measure--color-selector',
  colorSelectorColor: 'cov-measure--color-selector--color',
  colorSelectorColorSelected: 'cov-measure--color-selector--color--selected',
};

let KEY = 0;

const SETTINGS_KEY = 'measure_settings_store';

// arcgis `Candy Shop`
const COLORS = {
  primary: [237, 81, 81],
  secondary: [255, 255, 255],
  colors: [
    [237, 81, 81],
    [20, 158, 206],
    [167, 198, 54],
    [158, 85, 156],
    [252, 146, 31],
    [255, 222, 62],
  ],
};

/**
 * Measure widget for ArcGIS JS API including length, area, location, elevation and ground profiles.
 */
@subclass('cov.widgets.Measure')
export default class Measure extends Widget {
  ////////////////////////////////////////////////////////////////
  // Lifecycle
  ///////////////////////////////////////////////////////////////
  constructor(properties: MeasureProperties) {
    super(properties);

    // load settings from local storage
    this._loadSettings();
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      sketch,
      pointSymbol,
      polylineSymbol,
      polygonSymbol,
      elevationProfile,
      elevationProfileLineGround,
      layers,
      labels,
      labelsVisible,
    } = this;

    await view.when();

    // initialize sketch and snapping
    sketch.view = view;
    // @ts-ignore
    sketch.activeLineSymbol = polylineSymbol;
    // @ts-ignore
    sketch.activeVertexSymbol = pointSymbol;
    // @ts-ignore
    sketch.vertexSymbol = pointSymbol;
    sketch.activeFillSymbol = polygonSymbol;
    view.map.layers.forEach(this._addSnappingLayer.bind(this));

    const layerAdd = view.map.layers.on('after-add', (event: { item: esri.Layer }): void => {
      this._addSnappingLayer(event.item);
      // keep the layers on top
      view.map.layers.reorder(layers, view.map.layers.length - 1);
    });

    // add layers
    labels.visible = labelsVisible;
    layers.addMany([sketch.layer, labels]);
    view.map.add(layers);

    // load coordinate formatter
    coordinateFormatter.load();

    // initialize elevation profile
    elevationProfile.view = view;
    elevationProfile.profiles.removeAll();
    elevationProfileLineGround.color = new Color(this.color);
    elevationProfile.profiles.add(elevationProfileLineGround);

    // cursor coordinates
    const locationHandle = view.on('pointer-move', (screenPoint: esri.ScreenPoint): void => {
      // get coordinates
      const { x, y } = this._location(view.toMap(screenPoint));
      //set state
      this.state = {
        ...this.state,
        x,
        y,
      };
    });

    // location labels when measuring
    const locationLabels = view.on('pointer-move', (screenPoint: esri.ScreenPoint): void => {
      const {
        state: { operation },
      } = this;
      if (operation === 'measure-location') {
        this._addLabels(view.toMap(screenPoint), labels);
      }
    });

    // cursor elevation
    const elevationHandle = view.on('pointer-move', async (screenPoint: esri.ScreenPoint): Promise<void> => {
      // reject if no ground
      if (!view.map.ground) {
        this.state = {
          ...this.state,
          z: -99999,
        };
      }
      // get elevation
      const z = await this._elevation(view.toMap(screenPoint));
      // set state
      this.state = {
        ...this.state,
        z,
      };
    });

    // elevation labels when measuring
    const elevationLabels = view.on('pointer-move', (screenPoint: esri.ScreenPoint): void => {
      const {
        state: { operation },
      } = this;
      if (operation === 'measure-elevation') {
        this._addLabels(view.toMap(screenPoint), labels);
      }
    });

    // watch units to update measurements and displayed units
    const lenghUnitChange = watch((): any => this.lengthUnit, this._unitsChange.bind(this));

    const areaUnitChange = watch((): any => this.areaUnit, this._unitsChange.bind(this));

    const locationUnitChange = watch((): any => this.locationUnit, this._unitsChange.bind(this));

    const elevationUnitChange = watch((): any => this.elevationUnit, this._unitsChange.bind(this));

    // watch settings change except lables and color
    const labelUnitsChange = watch((): any => this.labelUnits, this._updateSettings.bind(this));

    const localeFormatChange = watch((): any => this.localeFormat, this._updateSettings.bind(this));

    const snappingEnabledChange = watch((): any => sketch.snappingOptions.enabled, this._updateSettings.bind(this));

    const uniformChartScalingChange = watch(
      (): any => elevationProfile.viewModel.uniformChartScaling,
      this._updateSettings.bind(this),
    );

    // watch label visibility
    const labelsVisibilityChange = watch(
      (): any => this.labelsVisible,
      (visible): void => {
        labels.visible = visible;
        this._updateSettings();
      },
    );

    const colorChange = watch(
      (): any => this.color,
      (color): void => {
        this._setColors(color);
        this._updateSettings();
        // FIX
        // only updates text color
        // this._unitsChange();
      },
    );

    // own handles
    this.addHandles([
      layerAdd,
      locationHandle,
      locationLabels,
      elevationHandle,
      elevationLabels,
      lenghUnitChange,
      areaUnitChange,
      locationUnitChange,
      elevationUnitChange,
      labelUnitsChange,
      localeFormatChange,
      snappingEnabledChange,
      uniformChartScalingChange,
      labelsVisibilityChange,
      colorChange,
    ]);
  }

  ////////////////////////////////////////////////////////////////
  // Properties
  ///////////////////////////////////////////////////////////////
  /**
   * Map view to measure in.
   */
  view!: esri.MapView;

  @property()
  lengthUnit = 'feet';

  lengthUnits = {
    meters: 'Meters',
    feet: 'Feet',
    kilometers: 'Kilometers',
    miles: 'Miles',
    'nautical-miles': 'Nautical Miles',
  };

  @property()
  areaUnit = 'acres';

  areaUnits = {
    acres: 'Acres',
    'square-feet': 'Square Feet',
    'square-meters': 'Square Meters',
    'square-kilometers': 'Square Kilometers',
    'square-miles': 'Square Miles',
  };

  @property()
  locationUnit = 'dec';

  locationUnits = {
    dec: 'Decimal Degrees',
    dms: 'Degrees Minutes Seconds',
  };

  @property()
  elevationUnit = 'feet';

  elevationUnits = {
    feet: 'Feet',
    meters: 'Meters',
  };

  /**
   * Labels visible.
   */
  @property()
  labelsVisible = true;

  /**
   * Add units to labels.
   */
  @property()
  labelUnits = false;

  /**
   * Length, area and elevation precision.
   */
  unitsPrecision = 2;

  /**
   * Decimal degrees precision.
   */
  degreesPrecision = 6;

  /**
   * Format numbers, e.i. thousand separated, etc.
   */
  @property()
  localeFormat = true;

  ////////////////////////////////////////////////////////////////
  // Internal properties
  ///////////////////////////////////////////////////////////////
  /**
   * Graphics color.
   */
  @property()
  protected color = COLORS.primary;

  /**
   * Sketch VM for draw operations.
   */
  protected sketch = new SketchViewModel({
    layer: new GraphicsLayer({
      listMode: 'hide',
      title: 'Measure',
    }),
    snappingOptions: {
      enabled: true,
      featureEnabled: true,
      selfEnabled: true,
    },
    updateOnGraphicClick: false,
  });

  @property({
    aliasOf: 'sketch.pointSymbol',
  })
  protected pointSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 6,
    color: COLORS.secondary,
    outline: {
      width: 1,
      color: COLORS.primary,
    },
  });

  @property({
    aliasOf: 'sketch.polylineSymbol',
  })
  protected polylineSymbol = new CIMSymbol({
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
                // controlPointEnding: 'NoConstraint',
                offsetAlongLine: 0, // test this
              },
            ],
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            // miterLimit: 10,
            width: 2.25,
            color: [...COLORS.secondary, 255],
          },
          {
            type: 'CIMSolidStroke',
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            // miterLimit: 10,
            width: 2.25,
            color: [...COLORS.primary, 255],
          },
        ],
      },
    },
  });

  @property({
    aliasOf: 'sketch.polygonSymbol',
  })
  protected polygonSymbol = new SimpleFillSymbol({
    color: [...COLORS.primary, 0.125],
    outline: {
      width: 0,
    },
  });

  protected textSymbol = new TextSymbol({
    color: COLORS.primary,
    haloColor: COLORS.secondary,
    haloSize: 2,
    horizontalAlignment: 'center',
    verticalAlignment: 'middle',
    font: {
      size: 10,
      // weight: 'bold',
    },
  });

  protected elevationProfile = new ElevationProfileViewModel({
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

  protected elevationProfileLineGround = new ElevationProfileLineGround();

  protected layers = new GroupLayer({
    listMode: 'hide',
    title: 'Measure Layers',
  });

  protected labels = new GraphicsLayer({
    listMode: 'hide',
    title: 'Measure Labels',
  });

  /**
   * Widget state and measurement values.
   */
  @property()
  protected state: MeasureState = {
    operation: 'ready',
    x: 0,
    y: 0,
    z: 0,
    length: 0,
    area: 0,
    locationX: 0,
    locationY: 0,
    elevation: 0,
    lengthGeometry: null,
    areaGeometry: null,
    locationGeometry: null,
    elevationGeometry: null,
    profileGeometry: null,
  };

  @property()
  protected optionsVisible = false;

  /**
   * Handle for sketch create.
   */
  private _sketchHandle: esri.Handle | null = null;

  ////////////////////////////////////////////////////////////////
  // Public methods
  ///////////////////////////////////////////////////////////////
  /**
   * Convenience method for widget control classes.
   */
  onHide(): void {
    this._reset();
    this.optionsVisible = false;
  }

  ////////////////////////////////////////////////////////////////
  // Private methods
  ///////////////////////////////////////////////////////////////
  /**
   * Handle unit changes.
   */
  private async _unitsChange(): Promise<void> {
    const {
      state: { operation, lengthGeometry, areaGeometry, locationGeometry, elevationGeometry },
      elevationProfile,
    } = this;

    if (lengthGeometry) this._length(lengthGeometry);

    if (operation === 'length' && lengthGeometry) this._addLabels(lengthGeometry);

    if (areaGeometry) this._area(areaGeometry);

    if (operation === 'area' && areaGeometry) this._addLabels(areaGeometry);

    if (locationGeometry) {
      const { x, y } = this._location(locationGeometry);
      this.state = {
        ...this.state,
        locationX: x,
        locationY: y,
      };
    }

    if (operation === 'location' && locationGeometry) this._addLabels(locationGeometry);

    if (elevationGeometry) {
      const z = await this._elevation(elevationGeometry);
      this.state = {
        ...this.state,
        z,
        elevation: z,
      };
    }

    if (operation === 'elevation' && elevationGeometry) this._addLabels(elevationGeometry);

    elevationProfile.unit = this.elevationUnit as 'feet' | 'meters';
  }

  /**
   * Load settings from local storage.
   */
  private _loadSettings(): void {
    const {
      sketch: { snappingOptions },
      elevationProfile: { viewModel },
    } = this;

    const settingsItem = localStorage.getItem(SETTINGS_KEY);

    const settings = settingsItem ? (JSON.parse(settingsItem) as SettingsInfo) : null;

    if (settings) {
      const { snapping, labels, labelUnits, localeFormat, uniformChartScaling, color } = settings;
      snappingOptions.enabled = snapping;

      this.labelsVisible = labels;

      this.labelUnits = labelUnits;

      this.localeFormat = localeFormat;

      viewModel.uniformChartScaling = uniformChartScaling;

      this.color = color;

      this._setColors(color);
    } else {
      this._updateSettings();
    }
  }

  /**
   * Update settings local storage.
   */
  private _updateSettings(): void {
    const {
      sketch: { snappingOptions },
      elevationProfile: { viewModel },
    } = this;
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        snapping: snappingOptions.enabled,

        labels: this.labelsVisible,

        labelUnits: this.labelUnits,

        localeFormat: this.localeFormat,

        uniformChartScaling: viewModel.uniformChartScaling,

        color: this.color,
      } as SettingsInfo),
    );
  }

  /**
   * Set symbol and profile colors.
   * @param color
   */
  private _setColors(color: number[]): void {
    const { pointSymbol, polylineSymbol, polygonSymbol, textSymbol, elevationProfileLineGround } = this;

    pointSymbol.outline.color = new Color(color);

    // @ts-ignore
    polylineSymbol.data.symbol.symbolLayers[1].color = [...color, 255];

    // @ts-ignore
    polygonSymbol.color = new Color([...color, 0.125]);

    textSymbol.color = new Color(color);

    elevationProfileLineGround.color = new Color(color);
  }

  /**
   * Add layer as snapping source.
   * @param layer
   */
  private _addSnappingLayer(layer: esri.Layer): void {
    const {
      sketch: { snappingOptions },
    } = this;

    if (layer.type === 'group') {
      (layer as GroupLayer).layers.forEach((_layer: esri.Layer): void => {
        this._addSnappingLayer(_layer);
      });
      return;
    }

    if (
      (layer.listMode === 'hide' || layer.title === undefined || layer.title === null) &&
      !layer.id.includes('markup')
    )
      return;
    // @ts-ignore
    if (layer.internal === true) return;

    snappingOptions.featureSources.add(
      new FeatureSnappingLayerSource({
        //@ts-ignore
        layer: layer,
      }),
    );
  }

  /**
   * Reset the widget.
   */
  private _reset(): void {
    const {
      sketch,
      sketch: { layer },
      labels,
      elevationProfile,
    } = this;

    // don't use deconstructed properties to remove handles
    this._sketchHandle?.remove();
    this._sketchHandle = null;

    // cancel sketch
    sketch.cancel();
    layer.removeAll();
    labels.removeAll();

    // clear profile
    elevationProfile.viewModel.clear();

    // reset state
    this.state = {
      ...this.state,
      operation: 'ready',
      length: 0,
      area: 0,
    };
  }

  /**
   * Round a number.
   * @param value
   * @param digits
   * @returns number
   */
  private _round(value: number, digits: number): number {
    return Number(value.toFixed(digits));
  }

  /**
   * Format measurement and units for display and labels.
   * @param measurement
   * @param unit
   * @param label
   * @returns string
   */
  private _format(measurement: number, unit: string, label?: boolean): string {
    const { labelUnits, localeFormat } = this;

    const _measurement = localeFormat ? measurement.toLocaleString() : measurement;

    const _unit = unit.replace('-', ' ').replace('square', 'sq');

    return label === true && labelUnits === false ? `${_measurement}` : `${_measurement} ${_unit}`;
  }

  /**
   * Wire unit select event.
   * @param type
   * @param select
   */
  private _unitChangeEvent(type: 'length' | 'area' | 'location' | 'elevation', select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', () => {
      this[`${type}Unit`] = select.selectedOption.value;
    });
  }

  /**
   * Wire measure button event.
   * @param type
   * @param button
   */
  private _measureEvent(
    type: 'length' | 'area' | 'location' | 'elevation' | 'profile',
    button: HTMLCalciteButtonElement,
  ): void {
    button.addEventListener('click', this._measure.bind(this, type));
  }

  /**
   * Wire clear button event.
   * @param button
   */
  private _clearEvent(button: HTMLCalciteButtonElement): void {
    button.addEventListener('click', this._reset.bind(this));
  }

  /**
   * Initiate measuring.
   * @param type
   */
  private _measure(type: 'length' | 'area' | 'location' | 'elevation' | 'profile'): void {
    const { sketch } = this;

    // reset
    this._reset();

    // set state
    this.state = {
      ...this.state,
      operation: `measure-${type}`,
    };

    // create handle
    this._sketchHandle = sketch.on('create', this[`_${type}Event`].bind(this));

    // begin sketch
    sketch.create(type === 'length' || type === 'profile' ? 'polyline' : type === 'area' ? 'polygon' : 'point');
  }

  /**
   * Handle length event.
   * @param event
   */
  private _lengthEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      sketch: { layer },
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
    this._length(geometry as Polyline);

    // completed
    if (state === 'complete') {
      // set state
      this.state = {
        ...this.state,
        operation: 'length',
        lengthGeometry: geometry as Polyline,
      };

      // add additional graphics
      this._addGraphics(geometry as Polyline);
    }

    // add labels
    this._addLabels(geometry as Polyline, graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer));
  }

  /**
   * Measure length and set state.
   * @param polyline
   */
  private _length(polyline: Polyline): void {
    const { unitsPrecision, lengthUnit } = this;

    // measure length
    let length = geodesicLength(polyline, lengthUnit as any);

    // simplify and remeasure length if required
    if (length < 0) length = geodesicLength(simplify(polyline), lengthUnit as any);

    // round
    length = this._round(length, unitsPrecision);

    // set state
    this.state = {
      ...this.state,
      length,
      lengthGeometry: polyline,
    };
  }

  /**
   * Handle area event.
   * @param event
   */
  private _areaEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      sketch: { layer },
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
      // set state
      this.state = {
        ...this.state,
        operation: 'area',
        areaGeometry: geometry as esri.Polygon,
      };

      // add additional graphics
      this._addGraphics(geometry as esri.Polygon);
    } else {
      // add outline
      this._addPolygonOutline(geometry as esri.Polygon, graphic.layer as GraphicsLayer);
    }

    // add labels
    this._addLabels(
      geometry as esri.Polygon,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  /**
   * Measure area and set state.
   * @param polygon
   */
  private _area(polygon: esri.Polygon): void {
    const { unitsPrecision, lengthUnit, areaUnit } = this;

    // measure length (perimeter)
    let length = geodesicLength(polygon, lengthUnit as any);

    // simplify and remeasure length if required
    if (length < 0) length = geodesicLength(simplify(polygon), lengthUnit as any);

    // round
    length = this._round(length, unitsPrecision);

    let area = geodesicArea(polygon, areaUnit as any);

    // simplify and remeasure length if required
    if (area < 0) area = geodesicArea(simplify(polygon) as esri.Polygon, areaUnit as any);

    // round
    area = this._round(area, unitsPrecision);

    // set state
    this.state = {
      ...this.state,
      length,
      area,
      areaGeometry: polygon,
    };
  }

  /**
   * Handle location event and set state.
   * @param event
   */
  private _locationEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      sketch: { layer },
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

    // get coordinates and set state
    if (state === 'complete') {
      const { x, y } = this._location(geometry as esri.Point);

      this.state = {
        ...this.state,
        operation: 'location',
        locationX: x,
        locationY: y,
        locationGeometry: geometry as esri.Point,
      };
    }

    // add labels
    this._addLabels(
      geometry as esri.Point,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  /**
   * Location coordinates.
   * @param point
   * @returns
   */
  private _location(point: esri.Point): { x: number | string; y: number | string } {
    const { degreesPrecision, locationUnit } = this;

    let x: number | string = this._round(point.longitude, degreesPrecision);
    let y: number | string = this._round(point.latitude, degreesPrecision);

    if (locationUnit === 'dms') {
      const dms = coordinateFormatter.toLatitudeLongitude(
        webMercatorToGeographic(point, false) as esri.Point,
        'dms',
        2,
      );
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
      y = dms.substring(0, index + 1);
      x = dms.substring(index + 2, dms.length);
    }

    return { x, y };
  }

  /**
   * Handle elevation event and set state.
   * @param event
   * @returns
   */
  private async _elevationEvent(event: esri.SketchViewModelCreateEvent): Promise<void> {
    const {
      sketch: { layer },
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

    // get coordinates and set state
    if (state === 'complete') {
      const elevation = await this._elevation(geometry as esri.Point);

      this.state = {
        ...this.state,
        operation: 'elevation',
        elevation,
        elevationGeometry: geometry as esri.Point,
      };

      // add labels
      this._addLabels(geometry as esri.Point);
    }

    // add labels
    this._addLabels(
      geometry as esri.Point,
      graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer),
    );
  }

  /**
   * Query elevation.
   * @param point
   * @returns
   */
  private _elevation(point: esri.Point): Promise<number> {
    return new Promise((resolve) => {
      const {
        view: {
          map: { ground },
        },
        unitsPrecision,
        elevationUnit,
      } = this;
      ground
        .queryElevation(point)
        .then((result: esri.ElevationQueryResult): void => {
          resolve(
            this._round((result.geometry as esri.Point).z * (elevationUnit === 'feet' ? 3.2808399 : 1), unitsPrecision),
          );
        })
        .catch((): void => {
          resolve(-99999);
        });
    });
  }

  private async _profileEvent(event: esri.SketchViewModelCreateEvent): Promise<void> {
    const {
      // sketch: { layer },
      elevationProfile,
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

    if (state === 'complete') {
      elevationProfile.input = new Graphic({
        geometry,
      });

      this.state = {
        ...this.state,
        operation: 'profile',
        profileGeometry: geometry as Polyline,
      };

      // add additional graphics
      this._addGraphics(geometry as Polyline);
    }

    // TODO: decide if labeling is necessary
    // add labels
    // this._addLabels(geometry as Polyline, graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer));
  }

  /**
   * Add additional graphics when complete.
   * @param geometry
   */
  private _addGraphics(geometry: Polyline | esri.Polygon): void {
    const {
      view: { spatialReference },
      sketch: { layer },
      pointSymbol,
      polylineSymbol,
    } = this;
    const { type } = geometry;

    // add polygon outline
    if (type === 'polygon') {
      layer.add(
        new Graphic({
          geometry,
          symbol: polylineSymbol,
        }),
      );
    }

    // add vertices for polylines and polygons
    if (type === 'polyline' || type == 'polygon') {
      const coordinates = type === 'polyline' ? geometry.paths[0] : geometry.rings[0];

      layer.addMany(
        coordinates.map((coordinate: number[]): Graphic => {
          const [x, y] = coordinate;
          return new Graphic({
            geometry: new Point({ x, y, spatialReference }),
            symbol: pointSymbol,
          });
        }),
      );
    }
  }

  /**
   * Add outline to area polygon.
   * As of 4.22 api's sketch polyline symbol only shows CIM on active polygon sketch segment.
   * @param geometry
   * @param layer
   */
  private _addPolygonOutline(geometry: esri.Polygon, layer: GraphicsLayer): void {
    const { polylineSymbol } = this;
    const { graphics } = layer;

    layer.removeMany(
      graphics
        .filter((graphic: Graphic): boolean => {
          return graphic.attributes && graphic.attributes.outline === true;
        })
        .toArray(),
    );

    // add to graphics collection to set index
    graphics.add(
      new Graphic({
        geometry,
        attributes: {
          outline: true,
        },
        symbol: polylineSymbol,
      }),
      1,
    );
  }

  /**
   * Add label graphics.
   * @param geometry
   */
  private _addLabels(geometry: esri.Point | Polyline | esri.Polygon, layer?: GraphicsLayer): void {
    const {
      labelsVisible,
      labels,
      state: { operation, area, x, y, z, locationX, locationY, elevation },
      areaUnit,
      elevationUnit,
    } = this;
    const { type } = geometry;

    // remove all labels
    labels.removeAll();

    if (layer)
      layer.removeMany(
        layer.graphics
          .filter((graphic: esri.Graphic): boolean => {
            return graphic.symbol && graphic.symbol.type === 'text';
          })
          .toArray(),
      );

    // measuring length labels
    if (
      (operation === 'measure-length' || operation === 'measure-profile') &&
      type === 'polyline' &&
      layer &&
      labelsVisible
    )
      layer.addMany(this._polylineLabels(geometry));

    // measured length labels
    if ((operation === 'length' || operation === 'profile') && type === 'polyline')
      labels.addMany(this._polylineLabels(geometry));

    // measuring area labels
    if (operation === 'measure-area' && type === 'polygon' && area > 0 && layer && labelsVisible) {
      layer.add(
        new Graphic({
          geometry: geometry.centroid,
          symbol: this._createTextSymbol(this._format(area, areaUnit, true)),
        }),
      );
      layer.addMany(this._polylineLabels(geometry));
    }

    // measured area labels
    if (operation === 'area' && type === 'polygon') {
      labels.add(
        new Graphic({
          geometry: geometry.centroid,
          symbol: this._createTextSymbol(this._format(area, areaUnit, true)),
        }),
      );
      labels.addMany(this._polylineLabels(geometry));
    }

    // measuring location labels
    if (operation === 'measure-location' && type === 'point' && layer && labelsVisible)
      layer.add(
        new Graphic({
          geometry: geometry,
          symbol: this._createTextSymbol(`${y}\n${x}`, true),
        }),
      );

    // measured location labels
    if (operation === 'location' && type === 'point')
      labels.add(
        new Graphic({
          geometry: geometry,
          symbol: this._createTextSymbol(`${locationY}\n${locationX}`, true),
        }),
      );

    // measuring elevation labels
    if (operation === 'elevation' && type === 'point')
      labels.add(
        new Graphic({
          geometry: geometry,
          symbol: this._createTextSymbol(this._format(elevation, elevationUnit, true), true),
        }),
      );

    // measured elevation labels
    if (operation === 'measure-elevation' && type === 'point' && layer && labelsVisible)
      layer.add(
        new Graphic({
          geometry: geometry,
          symbol: this._createTextSymbol(this._format(z, elevationUnit, true), true),
        }),
      );
  }

  /**
   * Create and return new text symbol.
   * @param text
   * @param point
   * @returns
   */
  private _createTextSymbol(text: string, point?: boolean, angle?: number): TextSymbol {
    const { textSymbol } = this;
    const sym = textSymbol.clone();
    sym.text = text;
    if (point) {
      sym.horizontalAlignment = 'left';
      sym.xoffset = 8;
    }
    if (angle) sym.angle = angle;
    return sym;
  }

  private _polylineLabels(geometry: Polyline | esri.Polygon): Graphic[] {
    const { lengthUnit } = this;

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
          geometry: this._midpoint(polyline),
          symbol: this._createTextSymbol(
            this._format(length, lengthUnit, true),
            undefined,
            this._textSymbolAngle(a[0], a[1], b[0], b[1]),
          ),
        }),
      );
    });

    return graphics;
  }

  /**
   * Return midpoint of polyline.
   * @param polyline Polyline
   * @returns esri.Point
   */
  private _midpoint(polyline: Polyline): Point {
    const {
      paths: [path],
      spatialReference,
    } = polyline;

    /**
     * Distance between two points.
     * @param point1 esri.Point | x,y key/value pair
     * @param point2 esri.Point | x,y key/value pair
     * @returns number
     */
    const distance = (point1: Point | { x: number; y: number }, point2: Point | { x: number; y: number }): number => {
      const { x: x1, y: y1 } = point1;
      const { x: x2, y: y2 } = point2;
      return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
    };

    /**
     * Point on the line between two points some distance from point one.
     * @param point1 esri.Point
     * @param point2 esri.Point
     * @param linearDistance number
     * @returns esri.Point
     */
    const linearInterpolation = (point1: Point, point2: Point, linearDistance: number): Point => {
      const { x: x1, y: y1, spatialReference } = point1;
      const { x: x2, y: y2 } = point2;
      const steps = distance(point1, point2) / linearDistance;
      return new Point({
        x: x1 + (x2 - x1) / steps,
        y: y1 + (y2 - y1) / steps,
        spatialReference,
      });
    };

    const segements = path.map((p: number[]) => {
      const [x, y] = p;
      return { x, y };
    });

    let td = 0;
    let dsf = 0;

    for (let i = 0; i < segements.length - 1; i += 1) {
      td += distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] }));
    }

    for (let i = 0; i < segements.length - 1; i += 1) {
      if (dsf + distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] })) > td / 2) {
        const distanceToMidpoint = td / 2 - dsf;
        return linearInterpolation(
          new Point({ ...segements[i], spatialReference }),
          new Point({ ...segements[i + 1], spatialReference }),
          distanceToMidpoint,
        );
      }
      dsf += distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] }));
    }

    return new Point({
      ...segements[0],
      spatialReference,
    });
  }

  /**
   * Text symbol angle between two sets of points.
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns
   */
  private _textSymbolAngle(x1: number, y1: number, x2: number, y2: number): number {
    let angle = (Math.atan2(y1 - y2, x1 - x2) * 180) / Math.PI;

    // quadrants SW SE NW NE
    angle =
      angle > 0 && angle < 90
        ? Math.abs(angle - 180) + 180
        : angle > 90 && angle < 180
          ? (angle = Math.abs(angle - 180))
          : angle <= 0 && angle >= -90
            ? Math.abs(angle)
            : Math.abs(angle) + 180;

    return angle;
  }

  render(): tsx.JSX.Element {
    const {
      id,
      view: { scale },
      optionsVisible,
      state,
      state: { operation, x, y, locationX, locationY },
      unitsPrecision,
      lengthUnit,
      areaUnit,
      elevationUnit,
      elevationProfile: {
        viewModel: { state: profileState, uniformChartScaling },
      },
      localeFormat,
    } = this;

    // @ts-ignore
    const statistics = (this.elevationProfile.viewModel.statistics as any) || null;

    // format values
    const length = `Length: ${this._format(state.length, lengthUnit)}`;
    const area = `Area: ${this._format(state.area, areaUnit)}`;
    const perimeter = length.replace('Length: ', 'Perimeter: ');
    const latitude = `Latitude: ${operation === 'location' ? locationY : y}`;
    const longitude = `Longitude: ${operation === 'location' ? locationX : x}`;
    const elevation = `Elevation: ${
      operation === 'elevation' ? state.elevation.toLocaleString() : state.z.toLocaleString()
    } ${elevationUnit}`;
    const cursorLatitude = `Latitude: ${y}`;
    const cursorLongitude = `Longitude: ${x}`;
    const cursorElevation = `Elevation: ${state.z.toLocaleString()} ${elevationUnit}`;

    // hidden logic for results and cancel/clear button
    const lengthResults = !(operation === 'length' || operation === 'measure-length');
    const areaResults = !(operation === 'area' || operation === 'measure-area');
    const locationResults = !(operation === 'location' || operation === 'measure-location');
    const elevationResults = !(operation === 'elevation' || operation === 'measure-elevation');
    const profileResults = operation !== 'profile' && profileState !== 'created';
    const clearCancel = operation === 'ready';
    const clearCancelText =
      operation === 'measure-length' ||
      operation === 'measure-area' ||
      operation === 'measure-location' ||
      operation === 'measure-elevation' ||
      operation === 'measure-profile'
        ? 'Cancel'
        : 'Clear';

    const tooltips = [0, 1, 2, 3, 4, 5].map((num: number): string => {
      return `tooltip_${id}_${num}_${KEY++}`;
    });

    return (
      <calcite-panel class={CSS.base} heading="Measure">
        {/* show/hide options */}
        <calcite-action
          id={tooltips[0]}
          slot="header-actions-end"
          icon={optionsVisible ? 'x' : 'gear'}
          afterCreate={(action: HTMLCalciteActionElement) => {
            action.addEventListener('click', (): void => {
              this.optionsVisible = !this.optionsVisible;
            });
          }}
        ></calcite-action>
        <calcite-tooltip reference-element={tooltips[0]} placement="bottom" close-on-click="">
          {optionsVisible ? 'Close' : 'Options'}
        </calcite-tooltip>

        {/* measure context */}
        <div class={CSS.content} hidden={optionsVisible}>
          <div class={CSS.row}>
            <calcite-button
              id={tooltips[1]}
              appearance="transparent"
              icon-start="measure-line"
              afterCreate={this._measureEvent.bind(this, 'length')}
            ></calcite-button>
            <calcite-tooltip reference-element={tooltips[1]} placement="bottom" close-on-click="">
              Length
            </calcite-tooltip>
            <calcite-button
              id={tooltips[2]}
              appearance="transparent"
              icon-start="measure-area"
              afterCreate={this._measureEvent.bind(this, 'area')}
            ></calcite-button>
            <calcite-tooltip reference-element={tooltips[2]} placement="bottom" close-on-click="">
              Area
            </calcite-tooltip>
            <calcite-button
              id={tooltips[3]}
              appearance="transparent"
              icon-start="point"
              afterCreate={this._measureEvent.bind(this, 'location')}
            ></calcite-button>
            <calcite-tooltip reference-element={tooltips[3]} placement="bottom" close-on-click="">
              Location
            </calcite-tooltip>
            <calcite-button
              id={tooltips[4]}
              appearance="transparent"
              icon-start="altitude"
              afterCreate={this._measureEvent.bind(this, 'elevation')}
            ></calcite-button>
            <calcite-tooltip reference-element={tooltips[4]} placement="bottom" close-on-click="">
              Elevation
            </calcite-tooltip>
            <calcite-button
              id={tooltips[5]}
              appearance="transparent"
              icon-start="graph-time-series"
              afterCreate={this._measureEvent.bind(this, 'profile')}
            ></calcite-button>
            <calcite-tooltip reference-element={tooltips[5]} placement="bottom" close-on-click="">
              Profile
            </calcite-tooltip>
          </div>

          <div class={CSS.result} hidden={!clearCancel}>
            <span>{cursorLatitude}</span>
            <span>{cursorLongitude}</span>
            <span>{cursorElevation}</span>
            <span>Scale: 1:{localeFormat ? Math.round(scale).toLocaleString() : Math.round(scale)}</span>
          </div>

          <calcite-select hidden={lengthResults} afterCreate={this._unitChangeEvent.bind(this, 'length')}>
            {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
          </calcite-select>

          <div class={CSS.result} hidden={lengthResults}>
            <span>{length}</span>
          </div>

          <div class={CSS.row} hidden={areaResults}>
            <calcite-select afterCreate={this._unitChangeEvent.bind(this, 'area')}>
              {this._renderUnitOptions(this.areaUnits, this.areaUnit)}
            </calcite-select>
            <calcite-select afterCreate={this._unitChangeEvent.bind(this, 'length')}>
              {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
            </calcite-select>
          </div>

          <div class={CSS.result} hidden={areaResults}>
            <span>{area}</span>
            <span>{perimeter}</span>
          </div>

          <calcite-select hidden={locationResults} afterCreate={this._unitChangeEvent.bind(this, 'location')}>
            {this._renderUnitOptions(this.locationUnits, this.locationUnit)}
          </calcite-select>

          <div class={CSS.result} hidden={locationResults}>
            <span>{latitude}</span>
            <span>{longitude}</span>
          </div>

          <calcite-select hidden={elevationResults} afterCreate={this._unitChangeEvent.bind(this, 'elevation')}>
            {this._renderUnitOptions(this.elevationUnits, this.elevationUnit)}
          </calcite-select>

          <div class={CSS.result} hidden={elevationResults}>
            {elevation}
          </div>

          <calcite-select hidden={profileResults} afterCreate={this._unitChangeEvent.bind(this, 'elevation')}>
            {this._renderUnitOptions(this.elevationUnits, this.elevationUnit)}
          </calcite-select>

          <div
            hidden={profileResults}
            afterCreate={(container: HTMLDivElement): void => {
              this.elevationProfile.container = container;
            }}
          ></div>

          <div class={CSS.result} hidden={profileResults}>
            <calcite-label alignment="start" layout="inline-space-between">
              Uniform profile scale
              <calcite-switch
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.checked = uniformChartScaling;
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this.elevationProfile.viewModel.uniformChartScaling = _switch.checked;
                  });
                }}
              ></calcite-switch>
            </calcite-label>
            <span>
              Min elevation:{' '}
              {statistics ? this._format(this._round(statistics.minElevation, unitsPrecision), elevationUnit) : ''}
            </span>
            <span>
              Max elevation:{' '}
              {statistics ? this._format(this._round(statistics.maxElevation, unitsPrecision), elevationUnit) : ''}
            </span>
            <span>
              Avg elevation:{' '}
              {statistics ? this._format(this._round(statistics.avgElevation, unitsPrecision), elevationUnit) : ''}
            </span>
            <span>
              Elevation gain:{' '}
              {statistics ? this._format(this._round(statistics.elevationGain, unitsPrecision), elevationUnit) : ''}
            </span>
            <span>
              Elevation loss:{' '}
              {statistics ? this._format(this._round(statistics.elevationLoss, unitsPrecision), elevationUnit) : ''}
            </span>
          </div>

          <span hidden={clearCancel}>
            <calcite-button afterCreate={this._clearEvent.bind(this)}>{clearCancelText}</calcite-button>
          </span>
        </div>
        {/* options content */}
        <div class={CSS.optionsContent} hidden={!optionsVisible}>
          <calcite-label alignment="start" layout="inline-space-between">
            Feature snapping
            <calcite-switch
              afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                const {
                  sketch: { snappingOptions },
                } = this;
                _switch.checked = snappingOptions.featureEnabled;
                _switch.addEventListener('calciteSwitchChange', (): void => {
                  snappingOptions.featureEnabled = _switch.checked;
                });
              }}
            ></calcite-switch>
          </calcite-label>
          <calcite-label alignment="start" layout="inline-space-between">
            Sketch guides
            <calcite-switch
              afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                const {
                  sketch: { snappingOptions },
                } = this;
                _switch.checked = snappingOptions.selfEnabled;
                _switch.addEventListener('calciteSwitchChange', (): void => {
                  snappingOptions.selfEnabled = _switch.checked;
                });
              }}
            ></calcite-switch>
          </calcite-label>
          <calcite-label alignment="start" layout="inline-space-between">
            Graphic labels
            <calcite-switch
              afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                const { labelsVisible } = this;
                _switch.checked = labelsVisible;
                _switch.addEventListener('calciteSwitchChange', (): void => {
                  this.labelsVisible = _switch.checked;
                });
              }}
            ></calcite-switch>
          </calcite-label>
          <calcite-label alignment="start" layout="inline-space-between">
            Graphic label units
            <calcite-switch
              afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                const { labelUnits } = this;
                _switch.checked = labelUnits;
                _switch.addEventListener('calciteSwitchChange', (): void => {
                  this.labelUnits = _switch.checked;
                });
              }}
            ></calcite-switch>
          </calcite-label>
          <calcite-label alignment="start" layout="inline-space-between">
            Format results
            <calcite-switch
              afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                const { localeFormat } = this;
                _switch.checked = localeFormat;
                _switch.addEventListener('calciteSwitchChange', (): void => {
                  this.localeFormat = _switch.checked;
                });
              }}
            ></calcite-switch>
          </calcite-label>
          <calcite-label>
            Color
            {this._renderColorSelector()}
          </calcite-label>
        </div>
      </calcite-panel>
    );
  }

  ////////////////////////////////////////////////////////////////
  // Rendering methods
  ///////////////////////////////////////////////////////////////
  /**
   * Render unit select options.
   * @param units
   * @param defaultUnit
   * @returns
   */
  private _renderUnitOptions(units: { [key: string]: string }, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <calcite-option key={KEY++} label={units[unit]} value={unit} selected={unit === defaultUnit}></calcite-option>,
      );
    }
    return options;
  }

  /**
   * Render color tiles to select color.
   * @returns
   */
  private _renderColorSelector(): tsx.JSX.Element {
    const { colors } = COLORS;
    const { color: _color } = this;

    return (
      <div class={CSS.colorSelector}>
        {colors.map((color: number[]): tsx.JSX.Element => {
          const selected = color[0] === _color[0] && color[1] === _color[1] && color[2] === _color[2];
          return (
            <div
              class={this.classes(CSS.colorSelectorColor, selected ? CSS.colorSelectorColorSelected : '')}
              style={`background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 1);`}
              afterCreate={(div: HTMLDivElement): void => {
                div.addEventListener('click', (): void => {
                  this.color = color;
                });
              }}
            ></div>
          );
        })}
      </div>
    );
  }
}
