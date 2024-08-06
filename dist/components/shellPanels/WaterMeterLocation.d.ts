import esri = __esri;
/**
 * WaterMetersLocation constructor properties.
 */
export interface WaterMetersLocationProperties extends esri.WidgetProperties {
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
export default class WaterMetersLocation extends Widget {
    constructor(properties: WaterMetersLocationProperties);
    postInitialize(): Promise<void>;
    layer: esri.FeatureLayer;
    printServiceUrl: string;
    view: esri.MapView;
    private _clickHandle;
    private _feature;
    private _layerView;
    private _printViewModel;
    private _searchAbortController;
    private _searchResults;
    private _searchViewModel;
    private _print;
    private _search;
    private _searchAbort;
    private _selectSuggestFeature;
    private _selectFeature;
    private _clearFeature;
    private _clickEvent;
    render(): tsx.JSX.Element;
    private _renderFeature;
}
