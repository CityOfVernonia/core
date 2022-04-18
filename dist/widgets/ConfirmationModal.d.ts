import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Confirmation modal for confirming actions by the user.
 */
export default class ConfirmationModal extends Widget {
    protected active: boolean;
    protected width: 's' | 'm' | 'l' | number;
    protected title: string;
    protected message: string;
    protected confirm: () => void;
    show(params: {
        width?: 's' | 'm' | 'l' | number;
        title?: string;
        message?: string;
        confirm?: () => void;
    }): void;
    private _confirm;
    render(): tsx.JSX.Element;
}
