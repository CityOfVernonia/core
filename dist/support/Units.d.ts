import esri = __esri;
interface I {
    type: 'area' | 'coordinates' | 'elevation' | 'length';
}
interface UnitInfo {
    label: string;
    name: string;
}
export interface AreaUnitInfo extends UnitInfo {
    unit: 'acres' | 'square-feet' | 'square-meters' | 'square-kilometers' | 'square-miles';
}
export interface CoordinatesUnitInfo extends UnitInfo {
    unit: 'decimal' | 'dms';
}
export interface ElevationUnitInfo extends UnitInfo {
    unit: 'feet' | 'meters';
}
export interface LengthUnitInfo extends UnitInfo {
    unit: 'feet' | 'meters' | 'miles' | 'kilometers';
}
import Accessor from '@arcgis/core/core/Accessor';
export declare const FEET_IN_METERS = 3.28084;
/**
 * Accessor for handling units.
 */
export default class Units extends Accessor {
    areaUnit: AreaUnitInfo['unit'];
    areaUnitInfos: esri.Collection<AreaUnitInfo>;
    coordinatesUnit: CoordinatesUnitInfo['unit'];
    coordinatesUnitInfos: esri.Collection<CoordinatesUnitInfo>;
    elevationUnit: ElevationUnitInfo['unit'];
    elevationUnitInfos: esri.Collection<ElevationUnitInfo>;
    lengthUnit: LengthUnitInfo['unit'];
    lengthUnitInfos: esri.Collection<LengthUnitInfo>;
    getUnitLabel(type: I['type'], unit: string): string;
    getUnitName(type: I['type'], unit: string): string;
}
export {};
