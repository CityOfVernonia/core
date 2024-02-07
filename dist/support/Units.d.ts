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
import Accessor from '@arcgis/core/core/Accessor';
/**
 * Centralized units management Accessor.
 */
export default class Units extends Accessor {
    constructor(properties?: UnitsConstructorProperties);
    areaUnit: esri.AreaUnit;
    areaUnitInfos: esri.Collection<AreaUnitInfo>;
    coordinateUnit: esri.LinearUnit;
    coordinateUnitInfos: esri.Collection<CoordinateUnitInfo>;
    elevationUnit: esri.LinearUnit;
    elevationUnitInfos: esri.Collection<ElevationUnitInfo>;
    latitudeLongitudeUnit: 'decimal' | 'dms';
    latitudeLongitudeUnitInfos: esri.Collection<LatitudeLongitudeUnitInfo>;
    lengthUnit: esri.LinearUnit;
    lengthUnitInfos: esri.Collection<LengthUnitInfo>;
    getUnitLabel(type: 'area' | 'coordinate' | 'elevation' | 'latitudeLongitude' | 'length', unit: string): string;
    getUnitName(type: 'area' | 'coordinate' | 'elevation' | 'latitudeLongitude' | 'length', unit: string): string;
}
export {};
