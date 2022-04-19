import esri = __esri;
export interface ImageryInfo extends Object {
    title: string;
    layer: esri.Layer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Collection from '@arcgis/core/core/Collection';
export default class Layers extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Basemap to switch imagery.
         */
        basemap?: esri.Basemap;
        /**
         * Imagery layers to select from;
         */
        imageryInfos?: ImageryInfo[] | Collection<ImageryInfo>;
    });
    postInitialize(): void;
    view: esri.MapView;
    protected basemap: esri.Basemap;
    protected imageryInfos: Collection<ImageryInfo>;
    protected state: 'layers' | 'legend' | 'imagery';
    protected layers: LayerList;
    protected legend: Legend;
    private _radioButtonGroup;
    private _addImageryChangeEvent;
    onHide(): void;
    render(): tsx.JSX.Element;
}
