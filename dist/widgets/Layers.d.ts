import esri = __esri;
interface AddLayerInfo {
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
/**
 * Info to add layer via a portal item id.
 */
export interface AddPortalLayerInfo extends AddLayerInfo {
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
/**
 * Info to add layer via a server url.
 */
export interface AddServerLayerInfo extends AddLayerInfo {
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
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Layers extends Widget {
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
         * Include `Add Web Layers` fab.
         */
        addWebLayers?: boolean;
    });
    postInitialize(): void;
    view: esri.MapView;
    addLayerInfos: (AddPortalLayerInfo | AddServerLayerInfo)[];
    addWebLayers: boolean;
    protected state: 'layers' | 'legend' | 'add';
    onHide(): void;
    private _addLayerItems;
    private _addLayerInfo;
    private _addLayerFromPortalLayerInfo;
    private _addLayerFromServerLayerInfo;
    private _addWebLayersModal;
    private _showAddWebLayers;
    render(): tsx.JSX.Element;
    private _createLayerList;
    private _createLegend;
}
export {};
