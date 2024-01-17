import esri = __esri;
import type { ConfirmModalOptions } from './modal';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal widget for confirming.
 */
export default class ConfirmModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties & ConfirmModalOptions);
    content: string;
    header: string;
    kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
    primaryButtonText: string;
    secondaryButtonText: string;
    showConfirm(options?: ConfirmModalOptions): void;
    render(): tsx.JSX.Element;
}
