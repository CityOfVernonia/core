/// <reference types="@esri/calcite-components" />
import esri = __esri;
/**
 * Options for configuring disclaimer.
 */
export interface DisclaimerOptions extends Object {
    /**
     * Modal title.
     * @default 'Disclaimer'
     */
    title?: string;
    /**
     * Disclaimer text or HTML.
     * @default 'The purpose of this application is to support...'
     */
    text?: string;
    /**
     * Enable `Don't show me this again` checkbox.
     * @default true
     */
    enableDontShow?: boolean;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Disclaimer widget.
 */
export default class Disclaimer extends Widget {
    constructor(properties?: esri.WidgetProperties & DisclaimerOptions);
    container: HTMLCalciteModalElement;
    title: string;
    text: string;
    enableDontShow: boolean;
    private _active;
    private _checkbox;
    /**
     * Check if disclaimer had been previously accepted.
     * @returns boolean
     */
    static isAccepted(): boolean;
    /**
     * Get default disclaimer text.
     * @returns string
     */
    static getDefaultDisclaimer(): string;
    render(): tsx.JSX.Element;
    private _accept;
}
