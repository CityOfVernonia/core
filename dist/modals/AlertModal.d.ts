import esri = __esri;
import type { AlertModalOptions } from './modal';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal widget for altering.
 */
export default class AlertModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties & AlertModalOptions);
    content: string;
    header: string;
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    primaryButtonText: string;
    showAlert(options?: AlertModalOptions): void;
    render(): tsx.JSX.Element;
}
