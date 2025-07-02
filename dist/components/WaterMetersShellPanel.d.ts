import esri = __esri;
export interface WaterMetersShellPanelProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class WaterMetersShellPanel extends Widget {
    constructor(properties: WaterMetersShellPanelProperties);
    postInitialize(): Promise<void>;
    readonly layer: esri.FeatureLayer;
    readonly view: esri.MapView;
    private _controller;
    private _data;
    private _dialog;
    private _feature;
    private _layerView;
    private _results;
    private _svm;
    private _state;
    private _abort;
    private _clear;
    private _click;
    private _info;
    private _search;
    private _select;
    private _suggest;
    render(): tsx.JSX.Element;
    private _buttonAfterCreate;
    private _inputAfterCreate;
}
