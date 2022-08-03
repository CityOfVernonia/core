/// <reference types="@esri/calcite-components" />
import esri = __esri;
import type { LoaderOptions } from '../widgets/Loader';
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl';
/**
 * Options for configuring heading.
 */
interface HeadingOptions extends Object {
    /**
     * URL to image or svg to display in heading.
     * Height set to 24px.
     */
    iconUrl?: string;
    /**
     * Heading title.
     */
    title?: string;
    /**
     * Saerch configuration for heading search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * Menu widget to be added to menu panel.
     * Note: Must return `div` root node and `container` property must not be set.
     */
    menuWidget?: esri.Widget;
    /**
     *
     */
    menuHeading?: string;
}
/**
 * Base properties for all layouts.
 */
export interface LayoutProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
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
     * Include heading.
     * @default false
     */
    includeHeading?: boolean;
    /**
     * Options for configuring heading.
     */
    headingOptions?: HeadingOptions;
    /**
     * Options for configuring view control.
     */
    viewControlOptions?: ViewControlOptions;
    /**
     * `nextBasemap` for BasemapToggle.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Shell header widget.
     * Note: Must return `div` root node and `container` property must not be set.
     */
    header?: esri.Widget;
    /**
     * Shell footer widget.
     * Note: Must return `div` root node and `container` property must not be set.
     */
    footer?: esri.Widget;
}
import Widget from '@arcgis/core/widgets/Widget';
export declare const CSS: {
    view: string;
    actionBar: string;
    heading: string;
    headingMenuIcon: string;
    headingIcon: string;
    headingTitle: string;
    headingSearch: string;
    menu: string;
    menuOpen: string;
    menuBackground: string;
    actionPadPanels: string;
};
/**
 * A base shell layout class for all layouts.
 * Note: this is just the base layout class. Do not use as a layout widget.
 */
export default class Layout extends Widget {
    constructor(properties: esri.WidgetProperties & LayoutProperties);
    container: HTMLCalciteShellElement;
    view: esri.MapView;
    header: esri.Widget;
    footer: esri.Widget;
}
export {};
