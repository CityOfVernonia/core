import esri = __esri;
import type { LayoutProperties } from './Layout';
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
     * NOTE: the `widget` must return `calcite-panel` root VNode element unless modal.
     */
    widget: esri.Widget & {
        /**
         * Function called when widget container panel is shown.
         */
        onShow?: () => void | undefined;
        /**
         * Function called when widget container panel is hidden.
         */
        onHide?: () => void | undefined;
    };
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
     * Set this widget active.
     * Only sets first widget in collection of `WidgetInfos` with `active` property as active.
     */
    active?: boolean;
}
/**
 * Internal widget info.
 */
interface _WidgetInfo extends WidgetInfo {
    _action: tsx.JSX.Element;
}
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Layout from './Layout';
/**
 * Application layout with action bar and floating widgets.
 */
export default class ActionBarLayout extends Layout {
    constructor(properties: esri.WidgetProperties & LayoutProperties & {
        /**
         * Widget infos to add to action pad.
         */
        widgetInfos: Collection<WidgetInfo> | WidgetInfo[];
    });
    postInitialize(): void;
    widgetInfos: Collection<_WidgetInfo>;
    render(): tsx.JSX.Element;
}
export {};
