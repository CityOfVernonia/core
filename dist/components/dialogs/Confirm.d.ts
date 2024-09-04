import esri = __esri;
export interface ConfirmOptions {
    /**
     * Modal content.
     */
    content?: string;
    /**
     * Modal header.
     */
    heading?: string;
    /**
     * Modal kind.
     */
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    /**
     * Ok button text.
     * @default 'Ok'
     */
    okText?: string;
    /**
     * Cancel button text.
     * @default 'Cancel'
     */
    cancelText?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A confirm modal for confirming.
 */
export default class Confirm extends Widget {
    container: HTMLCalciteDialogElement;
    constructor(properties?: esri.WidgetProperties & ConfirmOptions);
    content: string;
    heading: string;
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    okText: string;
    cancelText: string;
    showConfirm(options?: ConfirmOptions): void;
    render(): tsx.JSX.Element;
}
