import esri = __esri;
export interface StreetsProperties extends esri.WidgetProperties {
    centerlines: esri.FeatureLayer;
    streets: esri.GroupLayer;
    streetsInfo: esri.MapImageLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Streets extends Widget {
    constructor(properties: StreetsProperties);
    postInitialize(): Promise<void>;
    readonly centerlines: esri.FeatureLayer;
    readonly streets: esri.GroupLayer;
    readonly streetsInfo: esri.MapImageLayer;
    readonly view: esri.MapView;
    private _centerlinesView;
    private _featureInfo;
    private _graphics;
    private _ground;
    private _legendIndex;
    private _viewState;
    private _viewClick;
    private _reset;
    render(): tsx.JSX.Element;
    private _dataDisplaySelectAfterCreate;
    private _directionalArrowsSwitchAfterCreate;
    private _renderFeature;
    private _renderLegend;
    private _stationingSwitchAfterCreate;
}
