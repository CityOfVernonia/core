import esri = __esri;
/**
 * Options for configuring ViewControl2D widget.
 */
export interface ViewControlOptions {
    /**
     * Include locate button.
     * @default false
     */
    includeLocate?: boolean;
    /**
     * Locate properties.
     */
    locateProperties?: esri.LocateProperties;
    /**
     * Include fullscreen toggle button.
     * @default false
     */
    includeFullscreen?: boolean;
    /**
     * Include magnifier toggle button.
     * @default false
     */
    includeMagnifier?: boolean;
    /**
     * Magnifier properties.
     */
    magnifierProperties?: esri.MagnifierProperties;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * View control widget for map view.
 */
export default class ViewControl2D extends Widget {
    constructor(properties: esri.WidgetProperties & ViewControlOptions & {
        /**
         * View to control.
         */
        view: esri.MapView;
    });
    postInitialize(): void;
    includeFullscreen: boolean;
    includeLocate: boolean;
    includeMagnifier: boolean;
    locateProperties: esri.LocateProperties;
    magnifierProperties: esri.MagnifierProperties;
    view: esri.MapView;
    private _home;
    private _magnifierHandle;
    private _zoom;
    private _compassRotation;
    private _initializeFullscreen;
    private _initializeLocate;
    private _toggleMagnifier;
    render(): tsx.JSX.Element;
}
