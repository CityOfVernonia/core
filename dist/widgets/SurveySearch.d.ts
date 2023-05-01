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
        surveys: esri.FeatureLayer | esri.GeoJSONLayer;
        /**
         * Base URL for surveys.
         */
        baseUrl?: string;
    });
    postInitialize(): void;
    view: esri.MapView;
    taxLots: esri.FeatureLayer;
    surveys: esri.FeatureLayer | esri.GeoJSONLayer;
    baseUrl: string;
    protected state: 'ready' | 'selected' | 'searching' | 'results' | 'error';
    private _visible;
    private _selectedFeature;
    private _results;
    private _graphics;
    onHide(): void;
    private _clear;
    private _search;
    render(): tsx.JSX.Element;
}
