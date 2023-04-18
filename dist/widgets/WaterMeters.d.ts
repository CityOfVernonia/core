import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class WaterMeters extends Widget {
    constructor(properties: esri.WidgetProperties & {
        view: esri.MapView;
        layer: esri.FeatureLayer;
        printServiceUrl?: string;
    });
    postInitialize(): void;
    private _printViewModel;
    view: esri.MapView;
    layer: esri.FeatureLayer;
    printServiceUrl: string;
    protected state: 'search' | 'print' | 'labels';
    private _searchViewModel;
    private _searchAbortController;
    private _searchResults;
    private _createSearch;
    private _abortSearch;
    private _search;
    private _selectFeature;
    private _printResults;
    private _print;
    private _labeling;
    render(): tsx.JSX.Element;
}
export declare class WaterMeterPopup extends Widget {
    container: HTMLTableElement;
    constructor(properties: esri.WidgetProperties & {
        graphic: esri.Graphic;
    });
    postInitialize(): Promise<void>;
    graphic: esri.Graphic;
    layer: esri.FeatureLayer;
    objectIdField: string;
    private _rows;
    render(): tsx.JSX.Element;
}
