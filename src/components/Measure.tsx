import esri = __esri;

interface I {
  measure: 'area' | 'coordinates' | 'elevation' | 'length';
  state: {
    areaGeometry?: esri.Polygon | null;
    coordinatesGeometry?: esri.Point;
    elevationGeometry?: esri.Point;
    lengthGeometry?: esri.Polyline | null;
    operation?: 'area' | 'coordinates' | 'cursor' | 'elevation' | 'length';
  };
}

/**
 * Measure properties.
 */
export interface MeasureProperties extends esri.WidgetProperties {
  /**
   * Map view to measure.
   */
  view: esri.MapView;
}

import type { AreaUnitInfo, CoordinatesUnitInfo, ElevationUnitInfo, LengthUnitInfo } from './../support/Units';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import {
  isLoaded as coordinateFormatterLoaded,
  load as coordinateFormatterLoad,
  toLatitudeLongitude,
} from '@arcgis/core/geometry/coordinateFormatter';
import {
  isLoaded as geodeticAreaLoaded,
  load as geodeticAreaLoad,
  execute as geodeticArea,
} from '@arcgis/core/geometry/operators/geodeticAreaOperator';
import {
  isLoaded as geodeticLengthLoaded,
  load as geodeticLengthLoad,
  execute as geodeticLength,
} from '@arcgis/core/geometry/operators/geodeticLengthOperator';
import { execute as simplify } from '@arcgis/core/geometry/operators/simplifyOperator';
import { midpoint, textAngle } from './../support/geometryUtils';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Sketch from './Measure/Sketch';
import Units, { FEET_IN_METERS } from '../support/Units';
import UnitsDropdown from './UnitsDropdown';
import { referenceElement } from './support';

const CSS_BASE = 'cov--measure';

const CSS = {
  buttons: `${CSS_BASE}_buttons`,
  options: `${CSS_BASE}_options`,
  results: `${CSS_BASE}_results`,
};

const HANDLE_KEYS = {
  CURSOR_KEY: 'measure-cursor',
  SKETCH_KEY: 'measure-sketch',
};

let KEY = 0;

const MEASURE_STATE: I['state'] = {
  areaGeometry: null,

  coordinatesGeometry: new Point({ latitude: 0, longitude: 0 }),

  elevationGeometry: new Point({ hasZ: true, latitude: 0, longitude: 0, z: 0 }),

  lengthGeometry: null,

  operation: 'cursor',
};

/**
 * Measure area, length, coordinates and elevation in a map.
 */
@subclass('cov.components.Measure')
export default class Measure extends Widget {
  constructor(properties: MeasureProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { view, _sketch, _units } = this;

    await view.when();

    _sketch.view = view;

    this.addHandles([
      // component visibility
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          if (visible) {
            this._cursorEvents();
          } else {
            this.removeHandles(HANDLE_KEYS.CURSOR_KEY);

            this._reset();
          }
        },
      ),
      // units
      watch((): AreaUnitInfo['unit'] => _units.areaUnit, this._unitsChanged.bind(this)),
      watch((): CoordinatesUnitInfo['unit'] => _units.coordinatesUnit, this._unitsChanged.bind(this)),
      watch((): ElevationUnitInfo['unit'] => _units.elevationUnit, this._unitsChanged.bind(this)),
      watch((): LengthUnitInfo['unit'] => _units.lengthUnit, this._unitsChanged.bind(this)),
    ]);

    if (!coordinateFormatterLoaded()) await coordinateFormatterLoad();
  }

  readonly view!: esri.MapView;

  private _cursor = new Point({
    hasZ: true,
    latitude: 0,
    longitude: 0,
    z: 0,
  });

  private _cursorAbortController: AbortController | null = null;

  @property({ aliasOf: 'view.map.ground' })
  private _ground!: esri.Ground;

  @property()
  private _state: I['state'] = {
    ...MEASURE_STATE,
    ...{ status: 'loading' },
  };

  private _units = new Units();

  private _sketch = new Sketch();

  private _labels = {
    add: (geometry: esri.Point | esri.Polygon | esri.Polyline): void => {
      const {
        _sketch,
        _sketch: { labels },
        _state: { operation },
      } = this;

      _sketch.clearGraphics('labels');

      if (operation === 'area' && geometry.type === 'polygon')
        labels.addMany([...this._labels.length(geometry), this._labels.area(geometry)]);

      if (operation === 'length' && geometry.type === 'polyline') labels.addMany(this._labels.length(geometry));

      if (operation === 'coordinates' && geometry.type === 'point') {
        const { latitude, longitude } = this._formatters.coordinates(geometry);

        labels.add(
          new Graphic({
            geometry,
            symbol: this._labels.textSymbol({
              pointLabel: true,
              text: `${latitude}\n${longitude}`,
            }),
          }),
        );
      }

      if (operation === 'elevation' && geometry.type === 'point') {
        const {
          _cursor,
          _units: { elevationUnit },
        } = this;

        let z = _cursor.z || 0;

        if (elevationUnit === 'feet') z = z * FEET_IN_METERS;

        labels.add(
          new Graphic({
            geometry,
            symbol: this._labels.textSymbol({
              pointLabel: true,
              text: `${z.toFixed(2)}`,
            }),
          }),
        );
      }
    },

    area: (geometry: esri.Polygon): esri.Graphic => {
      const {
        _units: { areaUnit },
      } = this;

      const graphic = new Graphic();

      if (geometry.rings[0].length < 4) return graphic;

      graphic.geometry = geometry.centroid;

      let area = geodeticArea(geometry, { curveType: 'geodesic', unit: areaUnit });

      if (area < 0) area = geodeticArea(simplify(geometry) as esri.Polygon, { curveType: 'geodesic', unit: areaUnit });

      graphic.symbol = this._labels.textSymbol({
        text: area.toFixed(2),
      });

      return graphic;
    },

    length: (geometry: esri.Polygon | esri.Polyline): esri.Graphic[] => {
      const {
        _units: { lengthUnit },
      } = this;

      const graphics: esri.Graphic[] = [];

      const paths = geometry.type === 'polyline' ? geometry.paths[0] : geometry.rings[0];

      paths.forEach((point: number[], index: number, path: number[][]): void => {
        const a = path[index];
        const b = path[index + 1];

        if (!a || !b) return;

        const polyline = new Polyline({
          paths: [[a, b]],
          spatialReference: geometry.spatialReference,
        });

        let length = geodeticLength(polyline, { curveType: 'geodesic', unit: lengthUnit });

        if (length < 0)
          length = geodeticLength(simplify(geometry) as esri.Polyline, { curveType: 'geodesic', unit: lengthUnit });

        graphics.push(
          new Graphic({
            geometry: midpoint(polyline),
            symbol: this._labels.textSymbol({
              angle: textAngle({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }),
              text: length.toFixed(2),
            }),
          }),
        );
      });

      return graphics;
    },

    textSymbol: (options: { angle?: number; pointLabel?: boolean; text: string }): esri.TextSymbol => {
      const {
        _sketch: { textSymbol },
      } = this;

      const { angle, pointLabel, text } = options;

      const symbol = textSymbol.clone();

      symbol.text = text;

      if (pointLabel) {
        symbol.horizontalAlignment = 'left';

        symbol.xoffset = 8;
      }

      if (angle) symbol.angle = angle;

      return symbol;
    },
  };

  private _areaEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    if (state === 'cancel' || !graphic || geometry?.type !== 'polygon') {
      this._reset();
      return;
    }

    this._setState({
      areaGeometry: geometry,
    });

    this._labels.add(geometry);
  }

  private _coordinatesEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      _cursor,
      _state: { coordinatesGeometry },
    } = this;

    const { state } = event;

    if (state === 'cancel') {
      this._reset();
      return;
    } else if (state === 'complete') {
      this._setState({
        coordinatesGeometry: _cursor.clone(),
      });

      if (coordinatesGeometry) this._labels.add(coordinatesGeometry);
    }
  }

  private _cursorEvents(): void {
    const { view, _cursor, _ground } = this;

    this.addHandles(
      [
        view.on('pointer-move', async (screenPoint: esri.ScreenPoint): Promise<void> => {
          const {
            _cursorAbortController,
            _sketch: { state },
            _state: { operation },
          } = this;

          if (operation === 'area' || operation === 'length') return;

          const mapPoint = view.toMap(screenPoint);

          _cursor.latitude = mapPoint.latitude;

          _cursor.longitude = mapPoint.longitude;

          if (operation === 'coordinates' && state === 'active') {
            const coordinatesGeometry = _cursor.clone();

            this._setState({ coordinatesGeometry });

            this._labels.add(coordinatesGeometry);
          }

          if (_cursorAbortController) {
            _cursorAbortController.abort();

            this._cursorAbortController = null;
          }

          const controller = new AbortController();

          this._cursorAbortController = controller;

          try {
            const { geometry } = await _ground.queryElevation(mapPoint, {
              signal: controller.signal,
            });

            if (this._cursorAbortController !== controller) return;

            this._cursorAbortController = null;

            const z = (geometry as esri.Point).z;

            _cursor.z = z;

            if (operation === 'elevation' && state === 'active') {
              const elevationGeometry = _cursor.clone();

              this._setState({ elevationGeometry });

              this._labels.add(elevationGeometry);
            }
          } catch (error: unknown) {
            this._cursorAbortController = null;

            if (error instanceof Error && error.message !== 'Aborted') console.log('elevation query error', error);
          }
        }),
      ],
      HANDLE_KEYS.CURSOR_KEY,
    );
  }

  private _elevationEvent(event: esri.SketchViewModelCreateEvent): void {
    const { _cursor } = this;

    const { state } = event;

    if (state === 'cancel') {
      this._reset();
      return;
    } else if (state === 'complete')
      this._setState({
        elevationGeometry: _cursor.clone(),
      });
  }

  private _formatters = {
    area: (polygon: esri.Polygon | nullish): string => {
      const {
        _units,
        _units: { areaUnit },
      } = this;

      const label = _units.getUnitLabel('area', areaUnit);

      if (!polygon) return `0 ${label}`;

      let area = 0;

      area = geodeticArea(polygon, {
        curveType: 'geodesic',
        unit: areaUnit,
      });

      if (area < 0)
        area = geodeticArea(simplify(polygon) as esri.Polygon, {
          curveType: 'geodesic',
          unit: areaUnit,
        });

      return `${Number(area.toFixed(2)).toLocaleString()} ${label}`;
    },

    coordinates: (point: esri.Point | nullish): { latitude: number | string; longitude: number | string } => {
      const {
        _units: { coordinatesUnit },
      } = this;

      if (!point)
        return {
          latitude: 0,
          longitude: 0,
        };

      point = point.clone();

      let latitude = point.latitude || 0;

      let longitude = point.longitude || 0;

      if (coordinatesUnit === 'decimal') {
        latitude = Number(latitude.toFixed(6));
        longitude = Number(longitude.toFixed(6));
      }

      if (coordinatesUnit === 'dms') {
        const dms = toLatitudeLongitude(point, 'dms', 2);

        if (!dms) {
          return {
            latitude,
            longitude,
          };
        }

        const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');

        const lat = dms.substring(0, index + 1);

        const latParts = lat.split(' ');

        //@ts-expect-error force assign
        latitude =
          `${latParts[0]}°${latParts[1]}'${latParts[2].slice(0, latParts[2].length - 1) + '" ' + latParts[2].slice(latParts[2].length - 1)}` as string;

        const lng = dms.substring(index + 2, dms.length);

        const lngParts = lng.split(' ');

        //@ts-expect-error force assign
        longitude =
          `${lngParts[0]}°${lngParts[1]}'${lngParts[2].slice(0, lngParts[2].length - 1) + '" ' + lngParts[2].slice(lngParts[2].length - 1)}` as string;
      }

      return {
        latitude,
        longitude,
      };
    },

    elevation: (point: esri.Point | nullish): string => {
      const {
        _units: { elevationUnit },
        _units,
      } = this;

      const label = _units.getUnitLabel('elevation', elevationUnit);

      if (!point) return `0 ${label}`;

      point = point.clone();

      let z = point.z;

      if (!z) return `0 ${label}`;

      if (elevationUnit === 'feet') z = z * FEET_IN_METERS;

      return `${Number(z.toFixed(2)).toLocaleString()} ${label}`;
    },

    length: (geometry: esri.Polygon | esri.Polyline | nullish): string => {
      const {
        _units,
        _units: { lengthUnit },
      } = this;

      const label = _units.getUnitLabel('length', lengthUnit);

      if (!geometry) return `0 ${label}`;

      let length = 0;

      length = geodeticLength(geometry, {
        curveType: 'geodesic',
        unit: lengthUnit,
      });

      if (length < 0)
        length = geodeticLength(simplify(geometry) as esri.Polyline, {
          curveType: 'geodesic',
          unit: lengthUnit,
        });

      return `${Number(length.toFixed(2)).toLocaleString()} ${label}`;
    },
  };

  private _lengthEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      state,
      graphic,
      graphic: { geometry },
    } = event;

    if (state === 'cancel' || !graphic || geometry?.type !== 'polyline') {
      this._reset();
      return;
    }

    this._setState({ lengthGeometry: geometry });

    this._labels.add(geometry);
  }

  private async _measure(type: I['measure']): Promise<void> {
    const { view, _sketch } = this;

    this._reset();

    view.closePopup();

    if (type === 'area' && !geodeticAreaLoaded()) {
      await geodeticAreaLoad();
      if (!geodeticLengthLoaded()) await geodeticLengthLoad();
    }

    if (type === 'length' && !geodeticLengthLoaded()) await geodeticLengthLoad();

    this._setState({ operation: type });

    this.addHandles(_sketch.on('create', this[`_${type}Event`].bind(this)), HANDLE_KEYS.SKETCH_KEY);

    _sketch.create(type === 'length' ? 'polyline' : type === 'area' ? 'polygon' : 'point');
  }

  private _reset(): void {
    const { _sketch } = this;

    this.removeHandles(HANDLE_KEYS.SKETCH_KEY);

    _sketch.cancel();

    _sketch.clearGraphics('all');

    this._setState(MEASURE_STATE);
  }

  private _setState(state: I['state']): void {
    this._state = {
      ...this._state,
      ...state,
    };
  }

  private _unitsChanged(): void {
    const {
      _state: { areaGeometry, coordinatesGeometry, elevationGeometry, lengthGeometry, operation },
    } = this;

    if (operation === 'area' && areaGeometry) this._labels.add(areaGeometry);

    if (operation === 'length' && lengthGeometry) this._labels.add(lengthGeometry);

    if (operation === 'coordinates' && coordinatesGeometry) this._labels.add(coordinatesGeometry);

    if (operation === 'elevation' && elevationGeometry) this._labels.add(elevationGeometry);
  }

  override render(): tsx.JSX.Element {
    const {
      _sketch: {
        snappingOptions: { featureEnabled, selfEnabled },
      },
      _state: { operation },
    } = this;

    return (
      <calcite-panel class={CSS_BASE} heading="Measure">
        {/* options */}
        <calcite-action icon="gear" slot="header-actions-end" text="Options">
          <calcite-tooltip close-on-click="" placement="bottom" slot="tooltip">
            Options
          </calcite-tooltip>
        </calcite-action>
        <calcite-popover
          auto-close=""
          closable
          heading="Options"
          overlay-positioning="fixed"
          placement="bottom-end"
          scale="s"
          afterCreate={referenceElement.bind(this)}
        >
          <div class={CSS.options}>
            <calcite-label layout="inline">
              <calcite-switch
                checked={featureEnabled}
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._sketch.snappingOptions.featureEnabled = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Snapping
            </calcite-label>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                checked={selfEnabled}
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._sketch.snappingOptions.selfEnabled = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Guides
            </calcite-label>
          </div>
        </calcite-popover>

        {/* buttons */}
        <div class={CSS.buttons}>
          <calcite-button icon-start="measure-line" onclick={this._measure.bind(this, 'length')}></calcite-button>
          <calcite-button icon-start="measure-area" onclick={this._measure.bind(this, 'area')}></calcite-button>
          <calcite-button icon-start="point" onclick={this._measure.bind(this, 'coordinates')}></calcite-button>
          <calcite-button icon-start="altitude" onclick={this._measure.bind(this, 'elevation')}></calcite-button>
        </div>

        {/* operations */}
        {operation === 'cursor'
          ? this._renderCursor()
          : operation === 'area'
            ? this._renderArea()
            : operation === 'coordinates'
              ? this._renderCoordinates()
              : operation === 'elevation'
                ? this._renderElevation()
                : operation === 'length'
                  ? this._renderLength()
                  : null}

        {/* cancel/clear footer button */}
        {this._renderCancelClearButton()}
      </calcite-panel>
    );
  }

  private _renderArea(): tsx.JSX.Element {
    const {
      _state: { areaGeometry },
    } = this;

    return (
      <div class={CSS.results} key={KEY++}>
        <div>
          <calcite-dropdown afterCreate={this._renderUnitsDropDown.bind(this, 'area', 'Area')}></calcite-dropdown>:{' '}
          {this._formatters.area(areaGeometry)}
        </div>
        <hr></hr>
        <div>
          <calcite-dropdown
            afterCreate={this._renderUnitsDropDown.bind(this, 'length', 'Perimeter')}
          ></calcite-dropdown>
          : {this._formatters.length(areaGeometry)}
        </div>
      </div>
    );
  }

  private _renderCancelClearButton(): tsx.JSX.Element | null {
    const {
      _sketch: { state },
      _state: { operation },
    } = this;

    if (operation === 'cursor') return null;

    return (
      <calcite-button appearance="outline" key={KEY++} slot="footer" width="full" onclick={this._reset.bind(this)}>
        {state === 'active' ? 'Cancel' : 'Clear'}
      </calcite-button>
    );
  }

  private _renderCoordinates(): tsx.JSX.Element {
    const {
      _state: { coordinatesGeometry },
    } = this;

    const { latitude, longitude } = this._formatters.coordinates(coordinatesGeometry);

    return (
      <div class={CSS.results} key={KEY++}>
        <div>
          <calcite-dropdown
            afterCreate={this._renderUnitsDropDown.bind(this, 'coordinates', 'Latitude')}
          ></calcite-dropdown>
          : {latitude}
        </div>
        <div>Longitude: {longitude}</div>
      </div>
    );
  }

  private _renderCursor(): tsx.JSX.Element {
    const {
      view: { scale },
      _cursor,
    } = this;

    const { latitude, longitude } = this._formatters.coordinates(_cursor);

    return (
      <div class={CSS.results} key={KEY++}>
        <div>
          <calcite-dropdown
            afterCreate={this._renderUnitsDropDown.bind(this, 'coordinates', 'Latitude')}
          ></calcite-dropdown>
          : {latitude}
        </div>
        <div>Longitude: {longitude}</div>
        <hr></hr>
        <div>
          <calcite-dropdown
            afterCreate={this._renderUnitsDropDown.bind(this, 'elevation', 'Elevation')}
          ></calcite-dropdown>
          : {this._formatters.elevation(_cursor)}
        </div>
        <hr></hr>
        <div>Scale: 1:{Number(scale.toFixed(0)).toLocaleString()}</div>
      </div>
    );
  }

  private _renderElevation(): tsx.JSX.Element {
    const {
      _state: { elevationGeometry },
    } = this;

    return (
      <div class={CSS.results} key={KEY++}>
        <div>
          <calcite-dropdown
            afterCreate={this._renderUnitsDropDown.bind(this, 'elevation', 'Elevation')}
          ></calcite-dropdown>
          : {this._formatters.elevation(elevationGeometry)}
        </div>
      </div>
    );
  }

  private _renderLength(): tsx.JSX.Element {
    const {
      _state: { lengthGeometry },
    } = this;

    return (
      <div class={CSS.results} key={KEY++}>
        <div>
          <calcite-dropdown afterCreate={this._renderUnitsDropDown.bind(this, 'length', 'Length')}></calcite-dropdown>:{' '}
          {this._formatters.length(lengthGeometry)}
        </div>
      </div>
    );
  }

  private _renderUnitsDropDown(type: I['measure'], text: string, container: HTMLCalciteDropdownElement): void {
    const { _units: units } = this;

    new UnitsDropdown({
      text,
      type,
      units,
      container,
    });
  }
}
