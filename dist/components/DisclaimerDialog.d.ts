import esri = __esri;
/**
 * Options for configuring Disclaimer dialog component.
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
 * Disclaimer dialog component.
 */
export default class DisclaimerDialog extends Widget {
    private _container;
    get container(): HTMLCalciteDialogElement;
    set container(value: HTMLCalciteDialogElement);
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
