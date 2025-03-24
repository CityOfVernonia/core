import esri = __esri;
export interface RecordSurveyProperties extends esri.WidgetProperties {
    surveysUrl: string;
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class RecordSurveys extends Widget {
    constructor(properties: RecordSurveyProperties);
    postInitialize(): void;
    surveysUrl: string;
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
    private _graphics;
    private _popupVisible;
    private _selectedFeature;
    private _selectedResult;
    private _surveys;
    private _surveyInfoIndex;
    private _surveyInfos;
    private _surveySearchDialog?;
    private _symbols;
    private _viewState;
    private _clear;
    private _loadLayers;
    private _setState;
    private _search;
    private _selectHighlightResult;
    private _showSurveySearch;
    private _taxLotSelected;
    render(): tsx.JSX.Element;
    private _renderInfo;
    private _renderInfoPagination;
    private _renderResultsList;
    private _renderSelectedMessage;
}
