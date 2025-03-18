import esri = __esri;
/**
 * ApplicationLoadError constructor properties.
 */
export interface ApplicationLoadErrorProperties extends esri.WidgetProperties {
    /**
     * Error notice link.
     */
    link?: {
        /**
         * Link URL.
         */
        href: string;
        /**
         * Link text.
         */
        text: string;
    };
    /**
     * Error notice message.
     * @default 'Application was unable to load. Try refreshing the page.'
     */
    message?: string;
    /**
     * Error notice title.
     * @default 'Oh snap!'
     */
    title?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Component to display error when an application has a loading error.
 */
export default class ApplicationLoadError extends Widget {
    private _container;
    get container(): HTMLDivElement;
    set container(value: HTMLDivElement);
    constructor(properties?: ApplicationLoadErrorProperties);
    link?: ApplicationLoadErrorProperties['link'];
    message: string;
    title: string;
    render(): tsx.JSX.Element;
}
