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

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
import Collection from '@arcgis/core/core/Collection';

export const FEET_IN_METERS = 3.28084;

/**
 * Accessor for handling units.
 */
@subclass('cov.support.Units')
export default class Units extends Accessor {
  @property()
  public areaUnit: AreaUnitInfo['unit'] = 'acres';

  public areaUnitInfos: esri.Collection<AreaUnitInfo> = new Collection([
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
  public coordinatesUnit: CoordinatesUnitInfo['unit'] = 'decimal';

  public coordinatesUnitInfos: esri.Collection<CoordinatesUnitInfo> = new Collection([
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
  public elevationUnit: ElevationUnitInfo['unit'] = 'feet';

  public elevationUnitInfos: esri.Collection<ElevationUnitInfo> = new Collection([
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
  public lengthUnit: LengthUnitInfo['unit'] = 'feet';

  public lengthUnitInfos: esri.Collection<LengthUnitInfo> = new Collection([
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

  public getUnitLabel(type: I['type'], unit: string): string {
    const info = this[`${type}UnitInfos`].find(
      (unitInfo: AreaUnitInfo | CoordinatesUnitInfo | ElevationUnitInfo | LengthUnitInfo): boolean => {
        return unitInfo.unit === unit;
      },
    );
    return info ? info.label : '';
  }

  public getUnitName(type: I['type'], unit: string): string {
    const info = this[`${type}UnitInfos`].find(
      (unitInfo: AreaUnitInfo | CoordinatesUnitInfo | ElevationUnitInfo | LengthUnitInfo): boolean => {
        return unitInfo.unit === unit;
      },
    );
    return info ? info.name : '';
  }
}
