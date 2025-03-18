import esri = __esri;
export interface BasemapImageryProperties extends esri.WidgetProperties {
    layerInfos?: esri.Collection<LayerInfo> | LayerInfo[];
}
export interface LayerInfo {
    description: string;
    url: string;
}
interface _LayerInfo extends LayerInfo {
    layer?: esri.Layer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export declare const DEFAULT_LAYER_INFOS: LayerInfo[];
export default class BasemapImagery extends Widget {
    constructor(properties?: BasemapImageryProperties);
    postInitialize(): void;
    readonly layerInfos: esri.Collection<_LayerInfo>;
    private _listItems;
    render(): tsx.JSX.Element;
    private _listAfterCreate;
}
export {};
