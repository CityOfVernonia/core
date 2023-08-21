import esri = __esri;
export interface PrintFIRMetteProperties extends esri.WidgetProperties {
    /**
     * Flood hazard map layer.
     */
    layer: esri.MapImageLayer;
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget for generating and downloading FEMA FIRMettes.
 */
export default class PrintFIRMette extends Widget {
    constructor(properties: PrintFIRMetteProperties);
    layer: esri.MapImageLayer;
    view: esri.MapView;
    private _clickHandle;
    private _layerVisible;
    private _listItems;
    private _printing;
    onShow(): void;
    onHide(): void;
    private _print;
    private _printCheck;
    private _printComplete;
    private _printError;
    private _viewClick;
    render(): tsx.JSX.Element;
    private _switchAfterCreate;
}
