/// <reference types="@esri/calcite-components" />
import esri = __esri;
interface ConfirmationModalProperties {
    /**
     * Modal width.
     * @default 's'
     */
    width?: 's' | 'm';
    /**
     * Modal kind.
     * @default ''
     */
    kind?: '' | 'danger' | 'warning';
    /**
     * Modal title.
     * @default 'Confirm'
     */
    title?: string;
    /**
     * Modal message.
     */
    message?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Confirmation modal for confirming actions by the user.
 */
export default class ConfirmationModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties & ConfirmationModalProperties);
    width: ConfirmationModalProperties['width'];
    kind: ConfirmationModalProperties['kind'];
    title: string;
    message: string;
    show(): void;
    private _confirmed;
    render(): tsx.JSX.Element;
}
export {};
