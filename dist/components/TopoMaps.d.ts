import esri = __esri;
export interface TopoMapsProperties extends esri.WidgetProperties {
    historicalTopo: esri.MapImageLayer;
    usgsTopo: esri.MapImageLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class TopoMaps extends Widget {
    constructor(properties: TopoMapsProperties);
    postInitialize(): void;
    historicalTopo: esri.MapImageLayer;
    usgsTopo: esri.MapImageLayer;
    private _layer;
    private _visible;
    private _setLayer;
    render(): tsx.JSX.Element;
    private _selectAfterCreate;
    private _sliderAfterCreate;
    private _switchAfterCreate;
}
