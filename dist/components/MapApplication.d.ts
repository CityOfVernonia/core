import esri = __esri;
import type { BasemapOptions } from './Basemap';
import type { DisclaimerOptions } from './DisclaimerDialog';
import type { ApplicationHeaderOptions } from './ApplicationHeader';
import type { ViewControlOptions } from './ViewControl2D';
import type Loading from './Loading';
/**
 * Options for shell panel component and action bar action.
 */
export interface Component {
    component: esri.Widget;
    icon: string;
    groupEnd?: boolean;
    text: string;
    type: 'calcite-dialog' | 'calcite-flow' | 'calcite-panel';
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
/**
 * MapApplication component properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
    basemapOptions?: BasemapOptions;
    components?: Component[] | esri.Collection<Component>;
    disclaimerOptions?: DisclaimerOptions;
    endComponent?: Component;
    float?: boolean;
    header?: boolean;
    headerOptions?: ApplicationHeaderOptions;
    loading?: Loading;
    position?: 'end' | 'start';
    shellPanel?: esri.Widget;
    title: string;
    view: esri.MapView;
    viewControlOptions?: ViewControlOptions;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export declare const SHOW_ALERT_TOPIC = "map-application-show-alert";
/**
 * Map application component.
 */
export default class MapApplication extends Widget {
    private _container;
    get container(): HTMLCalciteShellElement;
    set container(value: HTMLCalciteShellElement);
    constructor(properties: MapApplicationProperties);
    postInitialize(): Promise<void>;
    readonly basemapOptions?: BasemapOptions;
    readonly components?: esri.Collection<Component>;
    readonly disclaimerOptions: DisclaimerOptions;
    readonly endComponent?: Component;
    readonly float = true;
    readonly header = true;
    readonly headerOptions: ApplicationHeaderOptions;
    loading?: Loading;
    readonly position: 'end' | 'start';
    readonly shellPanel?: esri.Widget;
    readonly title: string;
    readonly view: esri.MapView;
    readonly viewControlOptions?: ViewControlOptions;
    private _actionGroups;
    private _alerts;
    private _components;
    private _visibleComponent;
    private _addComponents;
    private _shellPanelActionBarViewPadding;
    private _showAlert;
    render(): tsx.JSX.Element;
    private _actionBarAfterCreate;
    private _shellPanelAfterCreate;
    private _viewAfterCreate;
}
