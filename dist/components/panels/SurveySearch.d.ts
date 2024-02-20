import esri = __esri;
/**
 * Survey Search widget properties.
 */
export interface SurveySearchConstructorProperties extends esri.WidgetProperties {
    /**
     * Surveys GeoJSONLayer URL.
     */
    surveysGeoJSONUrl: string;
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
declare class SurveySearch extends Widget {
    constructor(properties: SurveySearchConstructorProperties);
    postInitialize(): void;
    surveysGeoJSONUrl: string;
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
    private _graphics;
    private _selectedTaxLot;
    private _selectedTaxLotSymbol;
    private _selectedResult;
    private _selectedSymbol;
    _surveys: esri.GeoJSONLayer;
    private _surveyInfos;
    private _surveyInfoIndex;
    private _resultSymbol;
    private _viewState;
    private _visible;
    private _clear;
    private _search;
    private _setSelectedResult;
    private _selectNextPrevious;
    render(): tsx.JSX.Element;
}
export default SurveySearch;
