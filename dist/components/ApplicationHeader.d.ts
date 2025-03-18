import esri = __esri;
import type OAuth from './../support/OAuth';
/**
 * Options for configuring ApplicationHeader search bar and user control.
 */
export interface ApplicationHeaderOptions {
    /**
     * OAuth instance for header user control.
     */
    oAuth?: OAuth;
    /**
     * Search view model instance for header search bar.
     * `view` property must be set to interact with the map view.
     */
    search?: esri.SearchViewModel;
}
/**
 * ApplicationHeader constructor properties.
 */
export interface ApplicationHeaderProperties extends esri.WidgetProperties, ApplicationHeaderOptions {
    /**
     * Application title.
     */
    title: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Header component for applications with search bar and user control.
 */
export default class ApplicationHeader extends Widget {
    constructor(properties: ApplicationHeaderProperties);
    readonly oAuth?: OAuth;
    readonly search?: esri.SearchViewModel;
    readonly title: string;
    render(): tsx.JSX.Element;
}
