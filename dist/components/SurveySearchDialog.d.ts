import esri = __esri;
export interface SurveySearchDialogProperties extends esri.WidgetProperties {
    surveys: esri.GeoJSONLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class SurveySearchDialog extends Widget {
    private _container;
    get container(): HTMLCalciteDialogElement;
    set container(value: HTMLCalciteDialogElement);
    constructor(properties: SurveySearchDialogProperties);
    postInitialize(): Promise<void>;
    readonly surveys: esri.GeoJSONLayer;
    private _abortController;
    private _input;
    private _results;
    private _select;
    private _types;
    private _abort;
    private _close;
    private _search;
    render(): tsx.JSX.Element;
    private _inputAfterCreate;
    private _selectAfterCreate;
}
