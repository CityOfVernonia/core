import esri = __esri;
export interface UtilityPlansProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class UtilityPlans extends Widget {
    constructor(properties: UtilityPlansProperties);
    postInitialize(): Promise<void>;
    layer: esri.FeatureLayer;
    view: esri.MapView;
    private _loading;
    private _list;
    private _listItems;
    private _locationList;
    private _locationListItems;
    private _state;
    private _clear;
    private _listItem;
    private _location;
    private _showListUtilityPlan;
    private _showLocationListUtilityPlan;
    render(): tsx.JSX.Element;
    private _clearLinkAfterCreate;
    private _listAfterCreate;
    private _locationListAfterCreate;
    private _locationFabAfterCreate;
}
