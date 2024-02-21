import esri = __esri;
/**
 * WaterMeters constructor properties.
 */
export interface WaterMetersProperties extends esri.WidgetProperties {
    /**
     * Water meter layer.
     */
    layer: esri.FeatureLayer;
    /**
     * Print service URL.
     */
    printServiceUrl: string;
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Shell panel component for water meter apps.
 */
export default class WaterMeters extends Widget {
    constructor(properties: WaterMetersProperties);
    postInitialize(): void;
    layer: esri.FeatureLayer;
    printServiceUrl: string;
    view: esri.MapView;
    private _printResults;
    private _printViewModel;
    private _searchAbortController;
    private _searchResults;
    private _searchViewModel;
    private _viewState;
    private _changeLabels;
    private _print;
    private _search;
    private _searchAbort;
    private _selectFeature;
    render(): tsx.JSX.Element;
}
