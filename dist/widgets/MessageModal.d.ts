import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Message modal to inform the user user.
 */
export default class MessageModal extends Widget {
    protected active: boolean;
    protected width: 's' | 'm' | 'l' | number;
    protected title: string;
    protected message: string;
    show(params: {
        width?: 's' | 'm' | 'l' | number;
        title?: string;
        message?: string;
    }): void;
    render(): tsx.JSX.Element;
}
