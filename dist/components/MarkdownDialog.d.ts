import esri = __esri;
/**
 * MarkdownDialog properties.
 */
export interface MarkdownDialogProperties extends esri.WidgetProperties {
    cssClass?: string;
    closeText?: string;
    heading: string;
    url: string;
    width?: 's' | 'm' | 'l';
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Information dialog for that parses markdown for content.
 */
export default class MarkdownDialog extends Widget {
    private _container;
    get container(): HTMLCalciteDialogElement;
    set container(value: HTMLCalciteDialogElement);
    constructor(properties: MarkdownDialogProperties);
    postInitialize(): Promise<void>;
    readonly cssClass = "cov--markdown-dialog";
    readonly closeText = "Close";
    readonly heading: string;
    readonly url: string;
    readonly width: 's' | 'm' | 'l';
    render(): tsx.JSX.Element;
}
