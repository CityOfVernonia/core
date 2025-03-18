import esri = __esri;
export interface TaxMapProperties extends esri.WidgetProperties {
    layer: esri.GeoJSONLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class TaxMaps extends Widget {
    constructor(properties: TaxMapProperties);
    postInitialize(): Promise<void>;
    layer: esri.GeoJSONLayer;
    view: esri.MapView;
    private _infos;
    private _layer;
    private _opacity;
    private _options;
    private _visibleLayer;
    private _showLayer;
    private _showPdf;
    render(): tsx.JSX.Element;
    private _selectAfterCreate;
    private _sliderAfterCreate;
}
