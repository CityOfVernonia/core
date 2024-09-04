import esri = __esri;
export interface AlertOptions {
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
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal dialog for altering.
 */
export default class Alert extends Widget {
    container: HTMLCalciteDialogElement;
    constructor(properties?: esri.WidgetProperties & AlertOptions);
    content: string;
    heading: string;
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    okText: string;
    showAlert(options?: AlertOptions): void;
    render(): tsx.JSX.Element;
}
