import esri = __esri;
/**
 * MapApplication constructor properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
    /**
     * Disclaimer options.
     */
    disclaimerOptions?: DisclaimerModalOptions;
    /**
     * Component with an action at the end (bottom) of the action bar.
     *
     * Great place for an `About` modal...just saying.
     */
    endShellPanelComponent?: ShellPanelComponentInfo;
    /**
     * Custom header component.
     *
     * Must return a `div` VNode, and component `container` must not be set.
     *
     * Set to `false` for no header.
     */
    header?: esri.Widget | false;
    /**
     * Display compact header with full width search and no title for mobile apps.
     * @default false
     */
    headerCompact?: boolean;
    /**
     * Custom footer component.
     *
     * Must return a `shell-panel` VNode, and component `container` must not be set.
     *
     * All appropriate `shell-panel` properties are set by default. Only `collapsed` should be optionally set on the VNode.
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
     * Custom shell panel component.
     *
     * Must return a `calcite-shell-panel` VNode, with no attributes, and component `container` must not be set.
     *
     * Supersedes `shellPanelComponentInfos`.
     */
    shellPanel?: esri.Widget;
    /**
     * Components to add to the shell panel with an action bar action.
     */
    shellPanelComponentInfos?: ShellPanelComponentInfo[] | esri.Collection<ShellPanelComponentInfo>;
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
}
/**
 * Options to configure an action bar action and associated component.
 */
export interface ShellPanelComponentInfo {
    component: esri.Widget;
    icon: string;
    groupEnd?: boolean;
    text: string;
    type: 'flow' | 'modal' | 'panel';
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
import type OAuth from './../support/OAuth';
import type { LoaderOptions } from './support/Loader';
import type { DisclaimerModalOptions } from './../components/modals/DisclaimerModal';
import type { ViewControlOptions } from './support/ViewControl2D';
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
declare class MapApplication extends Widget {
    container: HTMLCalciteShellElement;
    constructor(properties: MapApplicationProperties);
    postInitialize(): Promise<void>;
    disclaimerOptions: DisclaimerModalOptions;
    endShellPanelComponent?: ShellPanelComponentInfo;
    header?: esri.Widget | false;
    headerCompact: boolean;
    footer?: esri.Widget;
    includeDisclaimer: boolean;
    loaderOptions: LoaderOptions;
    nextBasemap?: esri.Basemap;
    oAuth?: OAuth;
    searchViewModel?: esri.SearchViewModel;
    shellPanel?: esri.Widget;
    shellPanelComponentInfos?: esri.Collection<ShellPanelComponentInfo>;
    title: string;
    view: esri.MapView;
    viewControlOptions: ViewControlOptions;
    protected loaded: boolean;
    private _alerts;
    private _shellPanelActionGroups;
    private _shellPanelComponents;
    private _visibleShellPanelComponent;
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
     * Add widgets to shell panel and action bar.
     * @param widgetInfos WidgetInfo
     * @param endAction boolean
     */
    private _addShellPanelComponents;
    /**
     * Show alert in the application.
     * @param optionsAlertOptions
     */
    private _alertEvent;
    /**
     * Wire widget events.
     * @param widget esri.Widget
     */
    private _shellPanelComponentEvents;
    render(): tsx.JSX.Element;
    /**
     * Wire view padding for action bar expand/collapse.
     * @param actionBar HTMLCalciteActionBarElement
     */
    private _actionBarAfterCreate;
    /**
     * Default application header.
     * @returns tsx.JSX.Element
     */
    private _defaultHeader;
    /**
     * Add header widget.
     * @param container HTMLDivElement
     */
    private _headerAfterCreate;
    /**
     * Add footer widget.
     * @param container HTMLCalciteShellPanelElement
     */
    private _footerAfterCreate;
    /**
     * Add shell panel.
     * @param container HTMLCalciteShellPanelElement
     */
    private _shellPanelAfterCreate;
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
export default MapApplication;
