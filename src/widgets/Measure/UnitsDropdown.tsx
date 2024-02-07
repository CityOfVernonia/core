import esri = __esri;

export interface UnitsDropdownConstructorProperties extends esri.WidgetProperties {
  /**
   * Link text.
   */
  text: string;
  /**
   * Unit type.
   */
  type: 'area' | 'coordinate' | 'elevation' | 'length';
  /**
   * Units instance.
   */
  units: Units;
}

import type Units from '../../support/Units';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
// import { gear16 } from '@esri/calcite-ui-icons';

@subclass('cov.widgets.Measure.UnitsDropdown')
export default class UnitsDropdown extends Widget {
  constructor(properties: UnitsDropdownConstructorProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { type, _items } = this;
    const units = this[`${type}Units`];
    const unitType = `${type}Unit` as 'areaUnit'; //make TS happy
    for (const unit in units) {
      _items.push(
        <calcite-dropdown-item
          scale="s"
          afterCreate={(dropdownItem: HTMLCalciteDropdownItemElement): void => {
            dropdownItem.selected = unit === this[unitType];
            dropdownItem.addEventListener('calciteDropdownItemSelect', (): void => {
              this[unitType] = unit;
            });
            this.watch(unitType, (): void => {
              dropdownItem.selected = this[unitType] === unit;
            });
          }}
        >
          {units[unit as keyof typeof units]}
        </calcite-dropdown-item>,
      );
    }
  }

  text = 'Units';

  type!: 'area' | 'coordinate' | 'elevation' | 'length';

  units!: Units;

  @property({ aliasOf: 'units.areaUnit' })
  protected areaUnit!: string;

  @property({ aliasOf: 'units.areaUnits' })
  areaUnits!: { [key: string]: string };

  @property({ aliasOf: 'units.coordinateUnit' })
  protected coordinateUnit!: string;

  @property({ aliasOf: 'units.coordinateUnits' })
  coordinateUnits!: { [key: string]: string };

  @property({ aliasOf: 'units.elevationUnit' })
  protected elevationUnit!: string;

  @property({ aliasOf: 'units.elevationUnits' })
  elevationUnits!: { [key: string]: string };

  @property({ aliasOf: 'units.lengthUnit' })
  protected lengthUnit!: string;

  @property({ aliasOf: 'units.lengthUnits' })
  lengthUnits!: { [key: string]: string };

  private _items: tsx.JSX.Element[] = [];

  render(): tsx.JSX.Element {
    const { text, type, _items } = this;
    return (
      <div>
        <calcite-dropdown overlay-positioning="fixed" scale="s" width-scale="s">
          <calcite-link slot="trigger">{text}</calcite-link>
          <calcite-dropdown-group group-title={`${type.charAt(0).toUpperCase() + type.slice(1)} unit`} scale="s">
            {_items}
          </calcite-dropdown-group>
        </calcite-dropdown>
      </div>
    );
  }
}
