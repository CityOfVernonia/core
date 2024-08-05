import esri = __esri;
/**
 * BasemapImagery widget properties.
 */
export interface BasemapImageryProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Basemap to change imagery layer (assumes imagery layer is index = 0);
     */
    basemap: esri.Basemap;
    /**
     * Imagery infos for additional imagery layers.
     */
    imageryInfos: ImageryInfo[] | esri.Collection<ImageryInfo>;
    /**
     * Layer select control type. Use `select` for more than 4 layers.
     * @default 'radio'
     */
    control?: 'radio' | 'select';
    /**
     * Default layer description.
     * @default 'Default imagery provided by Microsoft Bing Maps.'
     */
    description?: string;
    /**
     * Default layer link URL.
     * @default 'https://www.bing.com/map'
     */
    link?: string;
    /**
     * Default layer title.
     * @default 'Default Imagery'
     */
    title?: string;
    /**
     * Find BasemapToggle widget and toggle basemap if hybrid basemap is not active basemap.
     * @default true
     */
    toggleBasemap?: boolean;
}
/**
 * Basemap imagery info.
 */
export interface ImageryInfo {
    /**
     * Layer description;
     */
    description: string;
    /**
     * Optional `More info` URL. Defaults to service URL if not provided.
     */
    link?: string;
    /**
     * Layer properties.
     */
    properties?: object;
    /**
     * Title of the imagery layer.
     */
    title: string;
    /**
     * Service URL of the imagery layer.
     */
    url: string;
}
/**
 * Internal imagery info.
 */
interface _ImageryInfo extends ImageryInfo {
    layer?: esri.Layer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget for changing the imagery of a hybrid basemap.
 */
declare class BasemapImagery extends Widget {
    constructor(properties: BasemapImageryProperties);
    postInitialize(): Promise<void>;
    basemap: esri.Basemap;
    control: 'radio' | 'select';
    protected description: string;
    imageryInfos: esri.Collection<_ImageryInfo>;
    protected title: string;
    toggleBasemap: boolean;
    protected link: string;
    view: esri.MapView;
    private _controls;
    /**
     * Set basemap imagery layer.
     * @param event
     */
    private _setBasemapImagery;
    render(): tsx.JSX.Element;
}
export default BasemapImagery;
