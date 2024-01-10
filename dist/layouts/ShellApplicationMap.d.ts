import esri = __esri;
/**
 * Module types.
 */
interface I {
    /**
     * Info to create action groups.
     */
    actionInfo: {
        action: tsx.JSX.Element;
        actionEnd?: boolean;
        groupEnd?: boolean;
    };
    /**
     * Header options.
     */
    headerOptions: {
        /**
         * Header logo URL.
         * Set to `false` for no logo.
         * Defaults to `Vernonia 3 Trees` logo.
         */
        logoUrl?: string | false;
        /**
         * Header title.
         * @default 'Vernonia'
         */
        title?: string;
        /**
         * Search view model for header search.
         */
        searchViewModel?: esri.SearchViewModel;
        /**
         * OAuth instance for header user control.
         */
        oAuth?: OAuth;
    };
    /**
     * Shell panel and view control (opposite) position.
     */
    panelPosition: 'start' | 'end';
    /**
     * Widgets to add to action bar.
     */
    panelWidgets?: PanelWidget[] | esri.Collection<PanelWidget>;
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
}
/**
 * Properties to initialize a widget in the shell panel with an action in the action bar.
 * Must return a `calcite-panel`, `calcite-flow`, `calcite-modal`, or `div` VNode; widget `container` property must not be set; and corresponding VNode `type` must be provided.
 */
export interface PanelWidget {
    /**
     * Group action in `actions-end` slot.
     * `groupEnd` has no effect on bottom slotted actions.
     */
    actionEnd?: boolean;
    /**
     * Groups all actions above up to another ActionWidgets `groupEnd` into a group.
     */
    groupEnd?: boolean;
    /**
     * Action icon (required).
     */
    icon: string;
    /**
     * Widget is `open` on load.
     * Only opens first widget with `open` property.
     */
    open?: boolean;
    /**
     * Action text (required).
     */
    text: string;
    /**
     * Type of element to create for widget (required).
     */
    type: 'calcite-flow' | 'calcite-modal' | 'calcite-panel' | 'div';
    /**
     * The widget instance (required).
     */
    widget: esri.Widget & {
        /**
         * Function called when widget container panel is closed.
         */
        onHide?: () => void | undefined;
        /**
         * Function called when widget container panel is opened.
         */
        onShow?: () => void | undefined;
    };
}
/**
 * ShellApplicationMap widget constructor properties.
 */
export interface ShellApplicationMapProperties extends esri.WidgetProperties {
    /**
     * Floating panels.
     * @default true
     */
    contentBehind?: boolean;
    /**
     * Disclaimer options.
     */
    disclaimerOptions?: DisclaimerOptions;
    /**
     * Custom footer widget.
     * Must return a `div` VNode, and widget `container` must not be set.
     */
    footer?: esri.Widget;
    /**
     * Custom header widget.
     * Must return a `div` VNode, and widget `container` must not be set.
     */
    header?: esri.Widget;
    /**
     * Header options for default header.
     */
    headerOptions?: I['headerOptions'];
    /**
     * Include disclaimer.
     * @default true
     */
    includeDisclaimer?: boolean;
    /**
     * Include header.
     * @default true
     */
    includeHeader?: boolean;
    /**
     * Loader options.
     */
    loaderOptions?: LoaderOptions;
    /**
     * Next basemap for basemap toggle.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Position of the shell panel (action bar and widgets) and places view control opposite.
     * @default 'start'
     */
    panelPosition?: I['panelPosition'];
    /**
     * Widgets to add to action bar.
     */
    panelWidgets?: PanelWidget[] | esri.Collection<PanelWidget>;
    /**
     * Shell panel widget. Supersedes `panelWidgets`.
     * Must return a `calcite-shell-panel` VNode, and widget `container` must not be set.
     */
    shellPanel?: esri.Widget;
    /**
     * Application title.
     * Convenience property to set loader and header titles without needing to pass loader or header options.
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
import type OAuth from '../support/OAuth';
import type { LoaderOptions } from '../widgets/Loader';
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl2D';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Shell application map layout.
 */
export default class ShellApplicationMap extends Widget {
    container: HTMLCalciteShellElement;
    constructor(properties: ShellApplicationMapProperties);
    postInitialize(): Promise<void>;
    contentBehind: boolean;
    disclaimerOptions: DisclaimerOptions;
    footer: esri.Widget;
    header: esri.Widget;
    headerOptions: I['headerOptions'];
    includeDisclaimer: boolean;
    includeHeader: boolean;
    loaderOptions: LoaderOptions;
    nextBasemap: esri.Basemap;
    panelPosition: I['panelPosition'];
    shellPanel: esri.Widget;
    title: string;
    panelWidgets?: esri.Collection<PanelWidget>;
    view: esri.MapView | esri.SceneView;
    viewControlOptions: ViewControlOptions;
    private _actionGroups;
    private _alerts;
    private _panelWidgets;
    private _visiblePanelWidget;
    /**
     * Show alert.
     * @param options
     */
    showAlert(options: AlertOptions): void;
    /**
     * Show (or hide) panel widget by id.
     * @param id
     */
    showWidget(id: string | null): void;
    /**
     * Wire action events.
     * @param modal
     * @param widgetId
     * @param action
     */
    private _actionAfterCreate;
    /**
     * Create alert.
     * @param options
     */
    private _alertEvent;
    /**
     * Create action groups.
     * @param actionInfos
     */
    private _createActionGroups;
    /**
     * Create actions and panels/modals.
     * @param panelWidgets
     */
    private _createShellPanelWidgets;
    /**
     * Set widget `container` and wire events.
     * @param widget
     * @param container
     */
    private _widgetAfterCreate;
    render(): tsx.JSX.Element;
    /**
     * Create default header.
     */
    private _renderHeader;
}
export {};
