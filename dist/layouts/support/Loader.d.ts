import esri = __esri;
/**
 * Options for configuring Loader.
 */
export interface LoaderOptions {
    /**
     * Application title.
     * @default 'Vernonia'
     */
    title?: string;
    /**
     * Copyright text.
     * @default 'City of Vernonia'
     */
    copyright?: string;
    /**
     * Logo base64 encoded svg.
     * Set `false` for no logo.
     * @default 'Vernonia 3 Trees'
     */
    logo?: string | false;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Application loader widget.
 */
export default class Loader extends Widget {
    container: HTMLDivElement;
    constructor(properties?: esri.WidgetProperties & LoaderOptions);
    title: string;
    copyright: string;
    logo: string | false;
    /**
     * End and destroy loader.
     */
    end(): void;
    render(): tsx.JSX.Element;
}
