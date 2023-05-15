import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class PrintFIRMette extends Widget {
    constructor(properties: esri.WidgetProperties & {
        view: esri.MapView;
        layer: esri.MapImageLayer;
    });
    onShow(): void;
    onHide(): void;
    view: esri.MapView;
    layer: esri.MapImageLayer;
    private _layerVisible;
    private _printing;
    private _clickHandle;
    private _viewClick;
    private _print;
    private _printCheck;
    private _printComplete;
    private _printError;
    render(): tsx.JSX.Element;
    private _switchAfterCreate;
    private _listItems;
}
