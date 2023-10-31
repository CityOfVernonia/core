import esri = __esri;
/**
 * Survey Search widget properties.
 */
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
    private _graphics;
    private _selectedTaxLot;
    private _selectedTaxLotSymbol;
    private _selectedResult;
    private _selectedSymbol;
    private _surveyInfos;
    private _surveyInfoIndex;
    private _resultSymbol;
    private _viewState;
    private _visible;
    onHide(): void;
    private _clear;
    private _search;
    private _setSelectedResult;
    private _selectNextPrevious;
    render(): tsx.JSX.Element;
}
