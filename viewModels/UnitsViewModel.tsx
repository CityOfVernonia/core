/**
 * A view model for managing location, length, area and elevation units and providing utility methods for returning unit <select>s.
 */

// namespaces and types
import cov = __cov;

// base imports
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
import { tsx } from '@arcgis/core/widgets/support/widget';

let KEY = 0;

// class export
@subclass('cov.viewModels.UnitsViewModel')
export default class UnitsViewModel extends Accessor {
  /**
   * CSS class string for <select>s.
   *
   * @default 'esri-select'
   */
  @property()
  selectClass = 'esri-select';

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
  areaUnit: esri.ArealUnits = 'acres';

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

  /**
   * Current elevation unit.
   */
  @property()
  elevationUnit = 'feet';

  /**
   * Available elevation unit and display text key/value pairs.
   */
  @property()
  elevationUnits = {
    feet: 'Feet',
    meters: 'Meters',
  };

  constructor(properties?: cov.UnitsViewModelProperties) {
    super(properties);
  }

  /**
   * Return location <select> which updates `locationUnit` property on change.
   *
   * @param name <select> `name` attribute
   * @param title <select> `title` attribute
   */
  locationSelect(name?: null | string, title?: null | string): tsx.JSX.Element {
    return (
      <select
        class={this.selectClass}
        name={name || ''}
        title={title || ''}
        bind={this}
        onchange={(evt: Event): void => {
          this.locationUnit = (evt.target as HTMLSelectElement).value;
        }}
      >
        {this._createUnitOptions(this.locationUnits, this.locationUnit)}
      </select>
    );
  }

  /**
   * Return length <select> which updates `lengthUnit` property on change.
   *
   * @param name <select> `name` attribute
   * @param title <select> `title` attribute
   */
  lengthSelect(name?: null | string, title?: null | string): tsx.JSX.Element {
    return (
      <select
        class={this.selectClass}
        name={name || ''}
        title={title || ''}
        bind={this}
        onchange={(evt: Event): void => {
          this.lengthUnit = (evt.target as HTMLSelectElement).value as esri.LinearUnits;
        }}
      >
        {this._createUnitOptions(this.lengthUnits, this.lengthUnit.toString())}
      </select>
    );
  }

  /**
   * Return length <calcite-select> which updates `lengthUnit` property on change.
   *
   * @param name <select> `name` attribute
   * @param title <select> `title` attribute
   * @param theme calcite `theme` attribute
   * @param scale calcite `scale` attribute
   */
  calciteLengthSelect(
    name?: null | string,
    title?: null | string,
    theme?: null | 'light' | 'dark',
    scale?: 's' | 'm' | 'l',
  ): tsx.JSX.Element {
    return (
      <calcite-select
        theme={theme || 'light'}
        scale={scale || 'm'}
        name={name || ''}
        title={title || ''}
        bind={this}
        afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
          calciteSelect.addEventListener('calciteSelectChange', () => {
            this.lengthUnit = calciteSelect.selectedOption.value;
          });
        }}
      >
        {this._createCalciteUnitOptions(this.lengthUnits, this.lengthUnit.toString())}
      </calcite-select>
    );
  }

  /**
   * Return area <select> which updates `areaUnit` property on change.
   *
   * @param name <select> `name` attribute
   * @param title <select> `title` attribute
   */
  areaSelect(name?: null | string, title?: null | string): tsx.JSX.Element {
    return (
      <select
        class={this.selectClass}
        name={name || ''}
        title={title || ''}
        bind={this}
        onchange={(evt: Event): void => {
          this.areaUnit = (evt.target as HTMLSelectElement).value as esri.ArealUnits;
        }}
      >
        {this._createUnitOptions(this.areaUnits, this.areaUnit.toString())}
      </select>
    );
  }

  /**
   * Return elevation <select> which updates `elevationUnit` property on change.
   *
   * @param name <select> `name` attribute
   * @param title <select> `title` attribute
   */
  elevationSelect(name?: null | string, title?: null | string): tsx.JSX.Element {
    return (
      <select
        class={this.selectClass}
        name={name || ''}
        title={title || ''}
        bind={this}
        onchange={(evt: Event): void => {
          this.elevationUnit = (evt.target as HTMLSelectElement).value;
        }}
      >
        {this._createUnitOptions(this.elevationUnits, this.elevationUnit)}
      </select>
    );
  }

  // create <options>
  private _createUnitOptions(units: Record<string, string>, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <option key={KEY++} value={unit} selected={unit === defaultUnit}>
          {units[unit]}
        </option>,
      );
    }
    return options;
  }

  // create calcite options
  private _createCalciteUnitOptions(units: Record<string, string>, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <calcite-option key={KEY++} value={unit} selected={unit === defaultUnit}>
          {units[unit]}
        </calcite-option>,
      );
    }
    return options;
  }
}
