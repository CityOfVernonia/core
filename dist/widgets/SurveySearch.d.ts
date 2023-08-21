import esri = __esri;
export interface SurveySearchProperties extends esri.WidgetProperties {
    /**
     * Surveys layer.
     */
    surveys: esri.FeatureLayer | esri.GeoJSONLayer;
    /**
     * Tax lots layer.
     */
    taxLots: esri.FeatureLayer;
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Search surveys related to a tax lot.
 */
export default class SurveySearch extends Widget {
    constructor(properties: SurveySearchProperties);
    postInitialize(): void;
    surveys: esri.FeatureLayer | esri.GeoJSONLayer;
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
    private _infoFeature;
    private _graphics;
    private _results;
    private _selectedFeature;
    private _selectedFeatureSymbol;
    private _selectedResult;
    private _selectedSymbol;
    private _resultSymbol;
    private _viewState;
    private _visible;
    onHide(): void;
    private _clear;
    private _search;
    private _setSelectedResult;
    render(): tsx.JSX.Element;
    private _renderInfo;
}
