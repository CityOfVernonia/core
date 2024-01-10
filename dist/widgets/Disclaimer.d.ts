import esri = __esri;
/**
 * Options for configuring Disclaimer widget.
 */
export interface DisclaimerOptions {
    /**
     * Disclaimer modal text.
     * @default 'The purpose of this application...'
     */
    disclaimer?: string;
    /**
     * Disclaimer modal title.
     * @default 'Disclaimer'
     */
    title?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Disclaimer modal widget.
 */
export default class Disclaimer extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties & DisclaimerOptions);
    /**
     * Return default disclaimer text.
     * @returns string
     */
    static getDisclaimer(): string;
    /**
     * Check if disclaimer had been previously accepted.
     * @returns boolean
     */
    static isAccepted(): boolean;
    disclaimer: string;
    title: string;
    /**
     * Handle accept click and set cookie.
     */
    private _accept;
    render(): tsx.JSX.Element;
}
