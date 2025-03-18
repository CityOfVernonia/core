import esri = __esri;
/**
 * PrintSnapshot properties.
 */
export interface PrintSnapshotProperties extends esri.WidgetProperties {
    /**
     * Key/value of layouts to include.
     * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
     */
    layouts?: {
        [key: string]: string;
    };
    /**
     * URL of print service.
     */
    printServiceUrl?: string;
    /**
     * Map view to print and snapshot.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Print PDFs and snapshot a map.
 */
export default class PrintSnapshot extends Widget {
    private _container;
    get container(): HTMLCalcitePanelElement;
    set container(value: HTMLCalcitePanelElement);
    constructor(properties: PrintSnapshotProperties);
    postInitialize(): Promise<void>;
    layouts: {
        [key: string]: string;
    };
    printServiceUrl: string;
    view: esri.MapView;
    private _photoDialog;
    private _printer;
    private _printResults;
    private _snapshotResults;
    private _viewState;
    /**
     * Add title to image and return data url.
     * @param data ImageData to be returned as data url string
     * @param title Title of the image
     * @param format Format of the image
     * @returns Data url string
     */
    private _dataUrl;
    private _print;
    private _snapshot;
    render(): tsx.JSX.Element;
    private _renderLayoutOptions;
}
