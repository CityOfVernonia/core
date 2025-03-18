import esri = __esri;

export interface UnitsDropdownProperties extends esri.WidgetProperties {
  text: string;
  type: 'area' | 'coordinates' | 'elevation' | 'length';
  units: Units;
}

import type Units from './../support/Units';
import type { AreaUnitInfo, CoordinatesUnitInfo, ElevationUnitInfo, LengthUnitInfo } from './../support/Units';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.components.UnitsDropdown')
export default class UnitsDropdown extends Widget {
  constructor(properties: UnitsDropdownProperties) {
    super(properties);
  }

  override postInitialize(): void {
    const { type, units, _items } = this;

    const unitType = `_${type}Unit` as '_areaUnit' | '_coordinatesUnit' | '_elevationUnit' | '_lengthUnit'; // make ts happy

    units[`${type}UnitInfos`].forEach(
      (unitInfo: AreaUnitInfo | CoordinatesUnitInfo | ElevationUnitInfo | LengthUnitInfo): void => {
        const { name, unit } = unitInfo;

        _items.push(
          <calcite-dropdown-item
            scale="s"
            afterCreate={(dropdownItem: HTMLCalciteDropdownItemElement): void => {
              dropdownItem.selected = unit === this[unitType];

              dropdownItem.addEventListener('calciteDropdownItemSelect', (): void => {
                // @ts-expect-error will always set typed unit type value
                this[unitType] = unit;
              });

              this.addHandles(
                watch(
                  () => unitType,
                  (): void => {
                    dropdownItem.selected = this[unitType] === unit;
                  },
                ),
              );
            }}
          >
            {name}
          </calcite-dropdown-item>,
        );
      },
    );
  }

  text!: string;

  type!: UnitsDropdownProperties['type'];

  units!: Units;

  @property({ aliasOf: 'units.areaUnit' })
  private _areaUnit!: AreaUnitInfo['unit'];

  @property({ aliasOf: 'units.coordinatesUnit' })
  private _coordinatesUnit!: CoordinatesUnitInfo['unit'];

  @property({ aliasOf: 'units.elevationUnit' })
  private _elevationUnit!: ElevationUnitInfo['unit'];

  private _items: tsx.JSX.Element[] = [];

  @property({ aliasOf: 'units.lengthUnit' })
  private _lengthUnit!: LengthUnitInfo['unit'];

  private _titles = {
    area: 'Area units',
    coordinates: 'Lat/Lng format',
    elevation: 'Elevation units',
    length: 'Length units',
  };

  override render(): tsx.JSX.Element {
    const { text, type, _items, _titles } = this;

    return (
      <calcite-dropdown overlay-positioning="fixed" scale="s" width-scale="s">
        <calcite-link slot="trigger">{text}</calcite-link>
        <calcite-dropdown-group group-title={_titles[type]} scale="s" selection-mode="single">
          {_items}
        </calcite-dropdown-group>
      </calcite-dropdown>
    );
  }
}
