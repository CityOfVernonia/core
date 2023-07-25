import esri = __esri;

export interface GeometryInfoProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

interface Info {
  length: number;
  area: number;
  type: string;
}

import { watch } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { planarLength, planarArea, geodesicLength, geodesicArea } from '@arcgis/core/geometry/geometryEngine';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';

const CSS = {
  base: 'cov-editor__geometry-info',
  result: 'cov-editor__geometry-info--result',
  units: 'cov-editor__geometry-info--units',
};

let KEY = 0;

@subclass('Editor.GeometryInfo')
export default class GeometryInfo extends Widget {
  constructor(properties: GeometryInfoProperties) {
    super(properties);
    coordinateFormatter.load();
  }

  postInitialize(): void {
    this.own(watch(this, 'feature', this._feature.bind(this)));
  }

  layer!: esri.FeatureLayer;

  @property({
    aliasOf: 'layer.spatialReference.isGeographic',
  })
  isGeo!: boolean;

  @property()
  feature: esri.Graphic | null = null;

  @property()
  info: Info = {
    length: 0,
    area: 0,
    type: '',
  };

  /**
   * Current location unit.
   */
  @property()
  locationUnit = 'dec';

  /**
   * Available location unit and display text key/value pairs.
   */
  @property()
  locationUnits = {
    dec: 'Decimal Degrees',
    dms: 'Degrees Minutes Seconds',
  };

  /**
   * Current length unit.
   */
  @property()
  lengthUnit: esri.LinearUnits = 'feet';

  /**
   * Available length unit and display text key/value pairs.
   */
  @property()
  lengthUnits = {
    meters: 'Meters',
    feet: 'Feet',
    kilometers: 'Kilometers',
    miles: 'Miles',
    'nautical-miles': 'Nautical Miles',
    yards: 'Yards',
  };

  /**
   * Current area unit.
   */
  @property()
  areaUnit: esri.AreaUnits = 'acres';

  /**
   * Available area unit and display text key/value pairs.
   */
  @property()
  areaUnits = {
    acres: 'Acres',
    ares: 'Ares',
    hectares: 'Hectacres',
    'square-feet': 'Square Feet',
    'square-meters': 'Square Meters',
    'square-yards': 'Square Yards',
    'square-kilometers': 'Square Kilometers',
    'square-miles': 'Square Miles',
  };

  private _feature(feature: esri.Graphic) {
    if (!feature) return;

    const { isGeo, lengthUnit, areaUnit } = this;

    const {
      geometry,
      geometry: { type },
    } = feature;

    const info: Info = {
      ...this.info,
      ...{
        type,
      },
    };

    if (type === 'polyline') {
      info.length = isGeo ? geodesicLength(geometry, lengthUnit) : planarLength(geometry, lengthUnit);
    }

    if (type === 'polygon') {
      info.length = isGeo ? geodesicLength(geometry, lengthUnit) : planarLength(geometry, lengthUnit);
      info.area = isGeo
        ? geodesicArea(geometry as esri.Polygon, areaUnit)
        : planarArea(geometry as esri.Polygon, areaUnit);
    }

    this.info = {
      ...this.info,
      ...info,
    };
  }

  private _formatValue(value: number): string {
    return Number(value.toFixed(2)).toLocaleString();
  }

  render(): tsx.JSX.Element {
    const { feature, info, locationUnit, lengthUnits, lengthUnit, areaUnits, areaUnit } = this;

    if (!feature) {
      return <div class={CSS.base}>No feature.</div>;
    }

    const type = feature.geometry.type;

    let pointInfo = null;

    if (type === 'point' && locationUnit === 'dec') {
      const { latitude, longitude } = feature.geometry as esri.Point;

      pointInfo = (
        <div>
          <div class={CSS.result}>
            <span>Latitude: </span>
            <span>{`${Number(latitude.toFixed(6))}`}</span>
          </div>
          <div class={CSS.result}>
            <span>Longitude: </span>
            <span>{`${Number(longitude.toFixed(6))}`}</span>
          </div>
        </div>
      );
    } else if (type === 'point' && locationUnit === 'dms') {
      const dms = coordinateFormatter.toLatitudeLongitude(
        webMercatorToGeographic(feature.geometry as esri.Point, false) as esri.Point,
        'dms',
        2,
      );
      const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');

      pointInfo = (
        <div>
          <div class={CSS.result}>
            <span>Latitude: </span>
            <span>{dms.substring(index + 2, dms.length)}</span>
          </div>
          <div class={CSS.result}>
            <span>Longitude: </span>
            <span>{dms.substring(0, index + 1)}</span>
          </div>
        </div>
      );
    }

    return (
      <div class={CSS.base}>
        {/* point */}
        <div hidden={type !== 'point'}>
          {pointInfo}
          <div class={CSS.units}>
            {this._unitSelect('location')}
            <div></div>
          </div>
        </div>
        {/* polyline */}
        <div hidden={type !== 'polyline'}>
          <div class={CSS.result}>
            <span>Length: </span>
            <span>{`${this._formatValue(info.length)} ${(
              (lengthUnits as Record<string, string>)[lengthUnit] as string
            ).toLowerCase()}`}</span>
          </div>
          <div class={CSS.units}>
            {this._unitSelect('length')}
            <div></div>
          </div>
        </div>
        {/* polygon */}
        <div hidden={type !== 'polygon'}>
          <div class={CSS.result}>
            <span>Area: </span>
            <span>{`${this._formatValue(info.area)} ${(
              (areaUnits as Record<string, string>)[areaUnit] as string
            ).toLowerCase()}`}</span>
          </div>
          <div class={CSS.result}>
            <span>Perimeter: </span>
            <span>{`${this._formatValue(info.length)} ${(
              (lengthUnits as Record<string, string>)[lengthUnit] as string
            ).toLowerCase()}`}</span>
          </div>
          <div class={CSS.units}>
            {this._unitSelect('area')}
            {this._unitSelect('length')}
          </div>
        </div>
      </div>
    );
  }

  private _unitSelect(type: 'location' | 'length' | 'area'): tsx.JSX.Element {
    const selected = this[`${type}Unit`];

    const units = this[`${type}Units`] as Record<string, string>;

    const options: tsx.JSX.Element[] = [];

    for (const unit in units) {
      options.push(
        <calcite-option key={KEY++} value={unit} selected={unit === selected}>
          {units[unit]}
        </calcite-option>,
      );
    }

    return (
      <calcite-label>
        {`${type.charAt(0).toUpperCase() + type.slice(1)} unit`}
        <calcite-select
          value={selected}
          afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
            calciteSelect.addEventListener('calciteSelectChange', () => {
              const { feature } = this;
              // @ts-ignore
              this[`${type}Unit`] = calciteSelect.selectedOption.value;
              if (feature) this._feature(feature);
            });
          }}
        >
          {options}
        </calcite-select>
      </calcite-label>
    );
  }
}
