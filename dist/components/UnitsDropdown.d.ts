import esri = __esri;
export interface UnitsDropdownProperties extends esri.WidgetProperties {
    text: string;
    type: 'area' | 'coordinates' | 'elevation' | 'length';
    units: Units;
}
import type Units from './../support/Units';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class UnitsDropdown extends Widget {
    constructor(properties: UnitsDropdownProperties);
    postInitialize(): void;
    text: string;
    type: UnitsDropdownProperties['type'];
    units: Units;
    private _areaUnit;
    private _coordinatesUnit;
    private _elevationUnit;
    private _items;
    private _lengthUnit;
    private _titles;
    render(): tsx.JSX.Element;
}
