interface IUnits {
  [key: string]: string;
}

export interface UnitsConstructorProperties {
  areaUnit?: string;

  areaUnits?: IUnits;

  coordinateUnit?: string;

  coordinateUnits?: IUnits;

  elevationUnit?: string;

  elevationUnits?: IUnits;

  lengthUnit?: string;

  lengthUnits?: IUnits;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';

/**
 * Centralized units management.
 */
@subclass('cov.support.Units')
export default class Units extends Accessor {
  constructor(properties?: UnitsConstructorProperties) {
    super(properties);
  }

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
  coordinateUnit = 'decimal';

  coordinateUnits = {
    decimal: 'Decimal Degrees',
    dms: 'Degrees Minutes Seconds',
  };

  @property()
  elevationUnit = 'feet';

  elevationUnits = {
    feet: 'Feet',
    meters: 'Meters',
  };

  @property()
  lengthUnit = 'feet';

  lengthUnits = {
    meters: 'Meters',
    feet: 'Feet',
    kilometers: 'Kilometers',
    miles: 'Miles',
    'nautical-miles': 'Nautical Miles',
  };
}
