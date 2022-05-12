/// <reference types="@esri/calcite-components" />
import esri = __esri;
import type { LoaderOptions } from './widgets/Loader';
import type { DisclaimerOptions } from './widgets/Disclaimer';
import type { ViewControlOptions } from './widgets/ViewControl';
/**
 * Extended widget with on show/hide methods called on show/hide.
 */
interface _Widget extends esri.Widget {
    /**
     * Function called when widget container panel is shown.
     */
    onShow?: () => void | undefined;
    /**
     * Function called when widget container panel is hidden.
     */
    onHide?: () => void | undefined;
}
/**
 * Internal widget info.
 */
interface _WidgetInfo extends WidgetInfo {
    _action: tsx.JSX.Element;
}
/**
 * Widget info properties for primary, contextual and ui widget placement.
 */
interface WidgetInfo extends Object {
    /**
     * Calcite action text.
     */
    text: string;
    /**
     * Calcite action icon.
     */
    icon: string;
    /**
     * The widget of your choosing.
     * NOTE: do not set `container` property.
     * NOTE: the `widget` must return `calcite-panel` root VNode element.
     * See `div` property.
     */
    widget: _Widget;
    /**
     * Initialize the widget with a `div` element instead of `calcite-panel`.
     * NOTE: only applied to UI widgets.
     * NOTE: width and height must be controlled by widget's own CSS.
     */
    div?: boolean;
    /**
     * Widget container as calcite modal with action click activating the modal.
     * NOTE: the `widget` must return `calcite-modal` root VNode element.
     */
    modal?: boolean;
    /**
     * Groups all actions above up to another WidgetInfo `groupEnd` into a group.
     */
    groupEnd?: boolean;
    /**
     * Groups all actions into bottom actions slot.
     * `groupEnd` has no effect on bottom slotted actions.
     * `bottomAction` WidgetInfos provided to `uiWidgets` grouped in last group.
     */
    bottomAction?: boolean;
    /**
     * Set this widget active.
     * Only sets first widget in collection of `WidgetInfos` as active.
     */
    active?: boolean;
}
/**
 * Application layout constructor properties.
 */
interface LayoutProperties extends esri.WidgetProperties {
    /**
     * The map view.
     */
    view: esri.MapView;
    /**
     * Application title.
     * @default 'Web Map'
     */
    title?: string;
    /**
     * Options for configuring loader.
     */
    loaderOptions?: LoaderOptions;
    /**
     * Include disclaimer.
     * @default false
     */
    includeDisclaimer?: boolean;
    /**
     * Options for configuring disclaimer.
     */
    disclaimerOptions?: DisclaimerOptions;
    /**
     * Include map heading.
     * @default true
     */
    includeMapHeading?: boolean;
    /**
     * Options for configuring map heading.
     */
    mapHeadingOptions?: MapHeadingOptions;
    /**
     * Options for configuring view control.
     */
    viewControlOptions?: ViewControlOptions;
    /**
     * Include basemap toggle.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Header widget (slot="header").
     */
    header?: esri.Widget;
    /**
     * Footer widget (slot="footer").
     */
    footer?: esri.Widget;
    /**
     * Menu widget.
     */
    menu?: esri.Widget;
    /**
     * Widgets to add to the primary shell panel.
     */
    primaryWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];
    /**
     * Widgets to add to the contextual shell panel.
     */
    contextualWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];
    /**
     * Widgets to add to ui widget selector.
     */
    uiWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];
    /**
     * Widget to add to as primary panel.
     * NOTE: do not set `container` property.
     * NOTE: the `widget` must return `calcite-shell-panel` root VNode element.
     */
    primaryShellPanel?: esri.Widget;
    /**
     * Widget to add to as contextual panel.
     * NOTE: do not set `container` property.
     * NOTE: the `widget` must return `calcite-shell-panel` root VNode element.
     */
    contextualShellPanel?: esri.Widget;
}
/**
 * Options for configuring map heading.
 */
interface MapHeadingOptions extends Object {
    title?: string;
    logoUrl?: string;
    searchViewModel?: esri.SearchViewModel;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Layout for City of Vernonia web maps.
 */
export default class Layout extends Widget {
    constructor(properties: LayoutProperties);
    postInitialize(): Promise<void>;
    container: HTMLCalciteShellElement;
    view: esri.MapView;
    title: string;
    includeDisclaimer: boolean;
    includeMapHeading: boolean;
    mapHeadingOptions: MapHeadingOptions;
    viewControlOptions: ViewControlOptions;
    nextBasemap?: esri.Basemap;
    header?: esri.Widget;
    footer?: esri.Widget;
    menu?: esri.Widget;
    primaryWidgets?: esri.Collection<_WidgetInfo>;
    contextualWidgets?: esri.Collection<_WidgetInfo>;
    uiWidgets?: esri.Collection<_WidgetInfo>;
    primaryShellPanel?: esri.Widget;
    contextualShellPanel?: esri.Widget;
    private _primaryActionGroups;
    private _primaryPanels;
    private _primaryActiveId;
    private _primaryCollapsed;
    private _primaryHidden;
    /**
     * Contextual panel variables.
     */
    private _contextualActionGroups;
    private _contextualPanels;
    private _contextualActiveId;
    private _contextualCollapsed;
    /**
     * UI panel variables.
     */
    private _uiActionGroups;
    private _uiPanels;
    private _uiActiveId;
    /**
     * Menu widgets variables.
     */
    private _menuOpen;
    /**
     * Initialize widget infos.
     * @param placement
     * @param widgetInfos
     */
    private _widgetInfos;
    /**
     * Initialize action and panel or widget.
     * @param placement
     * @param widgetInfo
     */
    private _initializeWidget;
    /**
     * Action logic and events.
     * @param placement
     * @param widget
     * @param modal
     * @param action
     */
    private _actionAfterCreate;
    /**
     * Panel logic and events.
     * @param placement
     * @param widget
     * @param modal
     * @param element
     */
    private _panelAfterCreate;
    /**
     * Creates array of `calcite-action-group` VNodes based on WidgetInfo groups and bottom group.
     * @param widgetInfos
     * @returns esri.widget.tsx.JSX.(Element as HTMLCalcitePanelElement)[]
     */
    private _createActionGroups;
    render(): tsx.JSX.Element;
}
export {};
