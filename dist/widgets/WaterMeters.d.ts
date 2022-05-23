import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Vernonia water meters widget.
 */
export default class WaterMeters extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Water meters feature layer.
         */
        layer: esri.FeatureLayer;
        /**
         * Print service URL.
         */
        printServiceUrl: string;
    });
    postInitialize(): void;
    protected search: esri.SearchViewModel;
    protected print: esri.PrintViewModel;
    view: esri.MapView;
    layer: esri.FeatureLayer;
    printServiceUrl: string;
    protected state: 'search' | 'print' | 'labels';
    private _controller;
    private _searchResults;
    private _printResults;
    /**
     * Controller abort;
     */
    private _abortSearch;
    /**
     * Search for features.
     * @param evt
     */
    private _search;
    /**
     * Select a feature, set as popup feature and zoom to.
     * @param result
     */
    private _selectFeature;
    /**
     * Set labeling to selected attribute.
     * @param evt
     */
    private _setLabeling;
    /**
     * Toggle labels on and off.
     * @param evt
     */
    private _toggleLabels;
    /**
     * Print the map.
     */
    private _print;
    render(): tsx.JSX.Element;
}
