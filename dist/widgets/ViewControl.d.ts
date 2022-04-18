import esri = __esri;
/**
 * Options for configuring view control.
 */
export interface ViewControlOptions extends Object {
    /**
     * Include locate button.
     * @default false
     */
    includeLocate?: boolean;
    /**
     * Include fullscreen toggle button.
     * @default false
     */
    includeFullscreen?: boolean;
}
export interface ViewControlProperties extends esri.WidgetProperties {
    view: esri.MapView;
    /**
     * Include locate button.
     * @default false
     */
    includeLocate?: boolean;
    /**
     * Include fullscreen toggle button.
     * @default false
     */
    includeFullscreen?: boolean;
    fullscreenElement?: HTMLElement;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * View control widget.
 */
export default class ViewControl extends Widget {
    constructor(properties: ViewControlProperties);
    postInitialize(): void;
    view: esri.MapView;
    includeLocate: boolean;
    includeFullscreen: boolean;
    fullscreenElement: HTMLElement;
    zoom: esri.ZoomViewModel;
    home: esri.HomeViewModel;
    render(): tsx.JSX.Element;
    private _compassRotation;
    private _initializeFullscreen;
    private _initializeLocate;
}
