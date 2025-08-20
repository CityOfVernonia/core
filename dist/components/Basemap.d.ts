import esri = __esri;
/**
 * Hillshade and imagery basemap layers.
 * Exported as a convenience for use will application components.
 */
export interface BasemapOptions {
    /**
     * Hillshade basemap.
     */
    hillshade: esri.Basemap;
    /**
     * Imagery basemap.
     */
    imagery: esri.Basemap;
}
/**
 * Basemap constructor properties.
 */
export interface BasemapProperties extends esri.WidgetProperties, BasemapOptions {
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Pub/Sub topic to change basemap imagery layer.
 */
export declare const IMAGERY_LAYER_TOPIC = "basemap-imagery-layer-topic";
/**
 * Pub/Sub topic to toggle imagery reference layer visibility.
 */
export declare const IMAGERY_REFERENCE_LAYER_TOPIC = "basemap-imagery-reference-layer-topic";
/**
 * Pub/Sub topic to toggle road layers visibility.
 */
export declare const ROAD_LAYER_TOPIC = "basemap-road-layer-topic";
/**
 * Basemap toggle component to switch between hillshade and imagery, as well as manipulate basemap properties.
 */
export default class Basemap extends Widget {
    private _container;
    get container(): HTMLDivElement;
    set container(value: HTMLDivElement);
    constructor(properties: BasemapProperties);
    postInitialize(): Promise<void>;
    readonly hillshade: esri.Basemap;
    readonly imagery: esri.Basemap;
    readonly view: esri.MapView;
    /**
     * Set the imagery layer.
     * @param layer esri.Layer
     */
    imageryLayer(layer: esri.Layer): void;
    imageryReferenceVisibility(visible: boolean): void;
    roadLayerVisibility(visible: boolean): Promise<void>;
    private _basemap;
    private _default;
    private _hillshadeThumbnail;
    private _imageryThumbnail;
    private _info;
    private _toggle;
    private _tooltip;
    render(): tsx.JSX.Element;
}
