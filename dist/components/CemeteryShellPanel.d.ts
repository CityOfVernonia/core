import esri = __esri;
export interface CemeteryShellPanelProperties extends esri.WidgetProperties {
    burials: esri.FeatureLayer;
    plots: esri.FeatureLayer;
    printServiceUrl: string;
    reservations: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class CemeteryShellPanel extends Widget {
    constructor(properties: CemeteryShellPanelProperties);
    postInitialize(): Promise<void>;
    readonly burials: esri.FeatureLayer;
    readonly plots: esri.FeatureLayer;
    readonly printServiceUrl: string;
    readonly reservations: esri.FeatureLayer;
    readonly view: esri.MapView;
    private _abortController;
    private _graphicsLayer;
    private _infos;
    private _input;
    private _plotId;
    private _printer?;
    private _printResults;
    private _printTemplate;
    private _results;
    private _segmentedControl;
    private _symbol;
    private _viewState;
    private _abort;
    private _clearPlot;
    private _burialDates;
    private _plotInfo;
    private _print;
    private _search;
    private _setState;
    render(): tsx.JSX.Element;
    private _actionAfterCreate;
    private _inputAfterCreate;
    private _segmentedControlAfterCreate;
}
