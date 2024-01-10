import esri = __esri;
/**
 * Shared add layer info properties.
 */
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
/**
 * Add layers modal widget properties.
 */
export interface AddLayersModalProperties extends esri.WidgetProperties {
    /**
     * Layers available to add.
     */
    addLayerInfos?: (AddPortalLayerInfo | AddServerLayerInfo)[];
    /**
     * Map or scene view to add layers.
     */
    view: esri.MapView | esri.SceneView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Modal widget for adding layers from web resources.
 */
export default class AddLayersModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties: AddLayersModalProperties);
    postInitialize(): void;
    addLayerInfos: (AddPortalLayerInfo | AddServerLayerInfo)[];
    view: esri.MapView | esri.SceneView;
    private _addLayerItems;
    private _add;
    private _addLayerInfo;
    render(): tsx.JSX.Element;
}
export {};
