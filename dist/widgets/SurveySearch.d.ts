import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Search surveys related to a tax lot.
 */
export default class SurveySearch extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Tax lots layer.
         */
        taxLots: esri.FeatureLayer;
        /**
         * Surveys layer.
         */
        surveys: esri.FeatureLayer;
    });
    postInitialize(): void;
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Tax lots layer.
     */
    taxLots: esri.FeatureLayer;
    /**
     * Surveys layer.
     */
    surveys: esri.FeatureLayer;
    /**
     * View state of widget.
     */
    protected state: 'ready' | 'selected' | 'searching' | 'results' | 'error';
    /**
     * Popup visibility for watching.
     */
    private _visible;
    /**
     * Popup selected feature for watching.
     */
    private _selectedFeature;
    /**
     * Result list items.
     */
    private _results;
    /**
     * Graphics layer for result geometry.
     */
    private _graphics;
    /**
     * Convenience on hide method.
     */
    onHide(): void;
    /**
     * Clear/reset.
     */
    private _clear;
    /**
     * Search surveys.
     */
    private _search;
    /**
     * Flash feature.
     * @param feature
     */
    private _flash;
    /**
     * Render the widget.
     * @returns
     */
    render(): tsx.JSX.Element;
}
