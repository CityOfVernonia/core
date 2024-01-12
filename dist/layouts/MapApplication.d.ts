import esri = __esri;
/**
 * MapApplication constructor properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
    /**
     * Disclaimer options.
     */
    disclaimerOptions?: DisclaimerOptions;
    /**
     * Widget with an action at the end (bottom) of the action bar.
     *
     * Great place for an `About` modal widget...just saying.
     */
    endWidgetInfo?: WidgetInfo;
    /**
     * Custom footer widget.
     * Must return a `div` VNode, and widget `container` must not be set.
     */
    footer?: esri.Widget;
    /**
     * Include disclaimer.
     * @default true
     */
    includeDisclaimer?: boolean;
    /**
     * Next basemap for basemap toggle.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Loader options.
     */
    loaderOptions?: LoaderOptions;
    /**
     * OAuth instance for header user control.
     */
    oAuth?: OAuth;
    /**
     * SearchViewModel for header search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * Title of the application.
     * @default Vernonia
     */
    title?: string;
    /**
     * Map or scene to display.
     */
    view: esri.MapView | esri.SceneView;
    /**
     * View control options.
     */
    viewControlOptions?: ViewControlOptions;
    /**
     * Widgets to add to the shell panel with an action bar action.
     */
    widgetInfos: WidgetInfo[] | esri.Collection<WidgetInfo>;
}
/**
 * Options to configure an action bar action and associated widget.
 */
export interface WidgetInfo {
    icon: string;
    groupEnd?: boolean;
    text: string;
    type: 'flow' | 'modal' | 'panel';
    widget: esri.Widget;
}
/**
 * Options to show alert.
 */
export interface AlertOptions {
    /**
     * Alert auto close duration.
     * Also sets `auto-close` property.
     */
    duration?: 'fast' | 'medium' | 'slow';
    /**
     * Alert icon.
     */
    icon?: string;
    /**
     * Alert kind.
     * @default 'brand'
     */
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    /**
     * Alert accessible label (required).
     */
    label: string;
    /**
     * Alert link options.
     */
    link?: {
        /**
         * Link text.
         */
        text: string;
        /**
         * Link href.
         * Also sets `target="_blank"`.
         */
        href?: string;
        /**
         * Link click event.
         */
        click?: () => void;
    };
    /**
     * Alert message (required).
     */
    message: string;
    /**
     * Alert title.
     */
    title?: string;
    /**
     * Width of alert in pixels.
     */
    width?: number;
}
import type OAuth from '../support/OAuth';
import type { LoaderOptions } from '../widgets/Loader';
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl2D';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Return show alert topic.
 * @returns string
 */
export declare const showAlertTopic: () => string;
/**
 * Vernonia map application layout.
 */
export default class MapApplication extends Widget {
    container: HTMLCalciteShellElement;
    constructor(properties: MapApplicationProperties);
    postInitialize(): Promise<void>;
    disclaimerOptions: DisclaimerOptions;
    endWidgetInfo?: WidgetInfo;
    footer?: esri.Widget;
    includeDisclaimer: boolean;
    loaderOptions: LoaderOptions;
    nextBasemap?: esri.Basemap;
    oAuth?: OAuth;
    searchViewModel?: esri.SearchViewModel;
    title: string;
    view: esri.MapView;
    viewControlOptions: ViewControlOptions;
    widgetInfos: WidgetInfo[] | esri.Collection<WidgetInfo>;
    protected loaded: boolean;
    private _alerts;
    private _actionBarActionGroups;
    private _visibleWidget;
    private _shellPanelWidgets;
    /**
     * Show alert.
     * @param options
     */
    showAlert(options: AlertOptions): void;
    /**
     * Show (or hide) panel/flow widget by id.
     * @param id
     */
    showWidget(id: string | null): void;
    /**
     * Show alert in the application.
     * @param optionsAlertOptions
     */
    private _alertEvent;
    /**
     * Add widgets to shell panel and action bar.
     * @param widgetInfos WidgetInfo
     * @param endAction boolean
     */
    private _widgets;
    /**
     * Wire widget events.
     * @param widget esri.Widget
     */
    private _widgetEvents;
    render(): tsx.JSX.Element;
    /**
     * Wire view padding for action bar expand/collapse.
     * @param actionBar HTMLCalciteActionBarElement
     */
    private _actionBarAfterCreate;
    /**
     * Add footer widget.
     * @param container HTMLDivElement
     */
    private _footerAfterCreate;
    /**
     * Create and add UserControl widget to header.
     * @param container HTMLDivElement
     */
    private _userControlAfterCreate;
    /**
     * Create and add Search widget to header.
     * @param container HTMLDivElement
     */
    private _searchAfterCreate;
    /**
     * Set view container.
     * @param container HTMLDivElement
     */
    private _viewAfterCreate;
}
