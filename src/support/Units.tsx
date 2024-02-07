//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Shared unit info properties.
 */
interface UnitInfo {
  /**
   * Label for the unit, e.g., `ft²` for `feet`.
   */
  label: string;
  /**
   * Name of the unit, e.g., `Sq feet` for `square-feet`.
   */
  name: string;
}

/**
 * Available area unit infos.
 */
export interface AreaUnitInfo extends UnitInfo {
  /**
   * Area unit.
   */
  unit: esri.AreaUnit;
}

/**
 * Available coordinate unit infos.
 */
export interface CoordinateUnitInfo extends UnitInfo {
  /**
   * Coordinate system latest WKID.
   */
  latestWkid: esri.SpatialReferenceProperties['wkid'];
  /**
   * Coordinate system unit.
   */
  unit: esri.LinearUnit;
  /**
   * Coordinate system WKID.
   */
  wkid: esri.SpatialReferenceProperties['wkid'];
}

/**
 * Available elevation unit infos.
 */
export interface ElevationUnitInfo extends UnitInfo {
  /**
   * Elevation unit.
   */
  unit: esri.LinearUnit;
}

/**
 * Available latitude/longitude unit infos.
 */
export interface LatitudeLongitudeUnitInfo extends UnitInfo {
  /**
   * Latitude/longitude unit.
   */
  unit: 'decimal' | 'dms';
}

/**
 * Available length unit infos.
 */
export interface LengthUnitInfo extends UnitInfo {
  /**
   * Length unit.
   */
  unit: esri.LinearUnit;
}

/**
 * `Units` constructor properties.
 */
export interface UnitsConstructorProperties {
  areaUnit?: esri.AreaUnit;
  areaUnitInfos?: AreaUnitInfo[];
  coordinateUnit?: esri.LinearUnit;
  coordinateUnitInfos?: CoordinateUnitInfo[];
  elevationUnit?: esri.LinearUnit;
  elevationUnitInfos?: ElevationUnitInfo[];
  latitudeLongitudeUnit?: 'decimal' | 'dms';
  latitudeLongitudeUnitInfos?: LatitudeLongitudeUnitInfo[];
  lengthUnit?: esri.LinearUnit;
  lengthUnitInfos?: LengthUnitInfo[];
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
import Collection from '@arcgis/core/core/Collection';

/**
 * Centralized units management Accessor.
 */
@subclass('cov.support.Units')
export default class Units extends Accessor {
  constructor(properties?: UnitsConstructorProperties) {
    super(properties);
    this.areaUnit = this.areaUnitInfos.getItemAt(0).unit;
    this.coordinateUnit = this.coordinateUnitInfos.getItemAt(0).unit;
    this.elevationUnit = this.elevationUnitInfos.getItemAt(0).unit;
    this.latitudeLongitudeUnit = this.latitudeLongitudeUnitInfos.getItemAt(0).unit;
    this.lengthUnit = this.lengthUnitInfos.getItemAt(0).unit;

    if (properties) {
      const {
        areaUnit,
        areaUnitInfos,
        coordinateUnit,
        coordinateUnitInfos,
        elevationUnit,
        elevationUnitInfos,
        latitudeLongitudeUnit,
        latitudeLongitudeUnitInfos,
        lengthUnit,
        lengthUnitInfos,
      } = properties;

      if (areaUnitInfos) this.areaUnitInfos = new Collection(areaUnitInfos);
      if (areaUnit) this.areaUnit = areaUnit;

      if (coordinateUnitInfos) this.coordinateUnitInfos = new Collection(coordinateUnitInfos);
      if (coordinateUnit) this.coordinateUnit = coordinateUnit;

      if (elevationUnitInfos) this.elevationUnitInfos = new Collection(elevationUnitInfos);
      if (elevationUnit) this.elevationUnit = elevationUnit;

      if (latitudeLongitudeUnitInfos) this.latitudeLongitudeUnitInfos = new Collection(latitudeLongitudeUnitInfos);
      if (latitudeLongitudeUnit) this.latitudeLongitudeUnit = latitudeLongitudeUnit;

      if (lengthUnitInfos) this.lengthUnitInfos = new Collection(lengthUnitInfos);
      if (lengthUnit) this.lengthUnit = lengthUnit;
    }
  }

  @property()
  areaUnit!: esri.AreaUnit;

  areaUnitInfos: esri.Collection<AreaUnitInfo> = new Collection([
    {
      label: 'acres',
      name: 'Acres',
      unit: 'acres',
    },
    {
      label: 'ft²',
      name: 'Sq feet',
      unit: 'square-feet',
    },
    {
      label: 'm²',
      name: 'Sq meters',
      unit: 'square-meters',
    },
    {
      label: 'km²',
      name: 'Sq kilometers',
      unit: 'square-kilometers',
    },
    {
      label: 'mi²',
      name: 'Sq miles',
      unit: 'square-miles',
    },
  ]);

  @property()
  coordinateUnit!: esri.LinearUnit;

  coordinateUnitInfos: esri.Collection<CoordinateUnitInfo> = new Collection([
    {
      label: 'Oregon Statewide Lambert',
      latestWkid: 6557,
      name: 'NAD 1983 (2011) Oregon Statewide Lambert (Intl Feet)',
      unit: 'feet',
      wkid: 102970,
    },
  ]);

  @property()
  elevationUnit!: esri.LinearUnit;

  elevationUnitInfos: esri.Collection<ElevationUnitInfo> = new Collection([
    {
      label: 'ft',
      name: 'Feet',
      unit: 'feet',
    },
    {
      label: 'm',
      name: 'Meters',
      unit: 'meters',
    },
  ]);

  @property()
  latitudeLongitudeUnit!: 'decimal' | 'dms';

  latitudeLongitudeUnitInfos: esri.Collection<LatitudeLongitudeUnitInfo> = new Collection([
    {
      label: 'dd',
      name: 'Decimal degrees',
      unit: 'decimal',
    },
    {
      label: 'dms',
      name: 'Degrees minutes seconds',
      unit: 'dms',
    },
  ]);

  @property()
  lengthUnit!: esri.LinearUnit;

  lengthUnitInfos: esri.Collection<LengthUnitInfo> = new Collection([
    {
      label: 'ft',
      name: 'Feet',
      unit: 'feet',
    },
    {
      label: 'm',
      name: 'Meters',
      unit: 'meters',
    },
    {
      label: 'mi',
      name: 'Miles',
      unit: 'miles',
    },
    {
      label: 'km',
      name: 'Kilometers',
      unit: 'kilometers',
    },
  ]);

  getUnitLabel(type: 'area' | 'coordinate' | 'elevation' | 'latitudeLongitude' | 'length', unit: string): string {
    const info = this[`${type}UnitInfos`].find(
      (unitInfo: AreaUnitInfo | ElevationUnitInfo | LatitudeLongitudeUnitInfo | LengthUnitInfo): boolean => {
        return unitInfo.unit === unit;
      },
    );
    return info ? info.label : '';
  }

  getUnitName(type: 'area' | 'coordinate' | 'elevation' | 'latitudeLongitude' | 'length', unit: string): string {
    const info = this[`${type}UnitInfos`].find(
      (unitInfo: AreaUnitInfo | ElevationUnitInfo | LatitudeLongitudeUnitInfo | LengthUnitInfo): boolean => {
        return unitInfo.unit === unit;
      },
    );
    return info ? info.name : '';
  }
}
