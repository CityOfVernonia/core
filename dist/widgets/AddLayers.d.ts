import esri = __esri;
interface AddLayerInfo extends Object {
    /**
     * Layer index.
     */
    index?: number;
    /**
     * Additional layer properties.
     */
    layerProperties?: esri.LayerProperties | any;
    /**
     * Called when layer added.
     */
    add?: (layer: esri.Layer) => void;
}
interface AddPortalLayerInfo extends AddLayerInfo {
    /**
     * Portal item id.
     * NOTE: loaded from default portal.
     */
    id: string;
    /**
     * Override portal item title.
     */
    title?: string;
    /**
     * Override portal item snippet.
     */
    snippet?: string;
}
interface AddServerLayerInfo extends AddLayerInfo {
    /**
     * Service url.
     */
    url: string;
    /**
     * Item title.
     */
    title: string;
    /**
     * Item snippet.
     */
    snippet: string;
}
export type AddLayerInfos = (AddPortalLayerInfo | AddServerLayerInfo)[];
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class AddLayers extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Layers available to add.
         */
        addLayerInfos?: (AddPortalLayerInfo | AddServerLayerInfo)[];
        /**
         * Portal to search for layers to add.
         */
        portal?: esri.Portal;
    });
    postInitialize(): void;
    view: esri.MapView;
    addLayerInfos: AddLayerInfos;
    portal?: esri.Portal;
    protected state: 'add' | 'search' | 'web';
    private _kmlLayer;
    private _addLayerInfo;
    private _addLayerFromPortalLayerInfo;
    private _addLayerFromServerLayerInfo;
    private _controller;
    private _abort;
    private _queryLayers;
    private _addLayerFromPortal;
    private _addLayerFromWeb;
    render(): tsx.JSX.Element;
    private _addLayersItems;
    private _addQueriedLayersItems;
}
export {};
