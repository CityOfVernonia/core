import esri = __esri;
/**
 * Application load error widget properties.
 */
interface ApplicationLoadErrorProperties extends esri.WidgetProperties {
    /**
     * Error notice link options.
     */
    link?: {
        /**
         * Link URL.
         */
        href: string;
        /**
         * Link text.
         */
        text?: string;
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
 * Application load error widget.
 */
export default class ApplicationLoadError extends Widget {
    container: HTMLDivElement;
    constructor(properties?: ApplicationLoadErrorProperties);
    link: ApplicationLoadErrorProperties['link'];
    message: string;
    title: string;
    render(): tsx.JSX.Element;
}
export {};
