import esri = __esri;
/**
 * MarkdownDialog properties.
 */
export interface MarkdownDialogProperties extends esri.WidgetProperties {
    cssClass?: string;
    closeText?: string;
    heading: string;
    url: string;
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
    readonly cssClass?: string;
    readonly closeText = "Close";
    readonly heading: string;
    readonly url: string;
    render(): tsx.JSX.Element;
}
