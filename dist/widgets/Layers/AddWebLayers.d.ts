/// <reference types="@esri/calcite-components" />
import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class AddWebLayers extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties: esri.WidgetProperties & {
        view: esri.MapView;
    });
    view: esri.MapView;
    private _add;
    render(): tsx.JSX.Element;
}
