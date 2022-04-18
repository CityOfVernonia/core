import esri = __esri;
/**
 * Options for configuring loader.
 */
export interface LoaderOptions extends Object {
    /**
     * Application title.
     * @default 'Web Map'
     */
    title?: string;
    /**
     * Copyright by who.
     * @default 'City of Vernonia'
     */
    copyright?: string;
    /**
     * Where made with love and coffee.
     * @default 'Vernonia Oregon'
     */
    where?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Loader widget.
 */
export default class Loader extends Widget {
    constructor(properties: esri.WidgetProperties & LoaderOptions);
    container: HTMLDivElement;
    title: string;
    copyright: string;
    where: string;
    private _heart;
    private _coffee;
    end(): void;
    render(): tsx.JSX.Element;
}
