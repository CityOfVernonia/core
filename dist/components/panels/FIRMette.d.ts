import esri = __esri;
/**
 * FIRMette constructor properties.
 */
export interface FIRMetteProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Panel component for generating FEMA FIRMette PDFs.
 */
declare class FIRMette extends Widget {
    constructor(properties: FIRMetteProperties);
    postInitialize(): void;
    view: esri.MapView;
    private _firmetteURL;
    private _graphic;
    private _point;
    private _viewClickHandle?;
    private _viewState;
    private _error;
    private _graphicVisible;
    private _print;
    private _printCheck;
    private _printComplete;
    private _reset;
    private _viewClickEvent;
    render(): tsx.JSX.Element;
}
export default FIRMette;
