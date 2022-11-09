/// <reference types="@esri/calcite-components" />
import esri = __esri;
/**
 * Internal types.
 */
interface I {
    format: 'jpg' | 'png';
    mode: 'default' | 'print' | 'snapshot';
    result: {
        element: tsx.JSX.Element;
    };
    state: 'print' | 'snapshot';
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Print (via print service) and map view snapshot widget.
 */
export default class PrintSnapshot extends Widget {
    container: HTMLCalcitePanelElement;
    constructor(properties: esri.WidgetProperties & {
        /**
         * Key/value of layouts to include.
         * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
         */
        layouts?: {
            [key: string]: string;
        };
        /**
         * Widget mode for just print or snapshot functionality.
         * @default 'default'
         */
        mode?: I['mode'];
        /**
         * URL of print service.
         */
        printServiceUrl?: string;
        /**
         * Map view to print and snapshot.
         */
        view: esri.MapView;
    });
    postInitialize(): Promise<void>;
    layouts: {
        [key: string]: string;
    };
    mode: I['mode'];
    printServiceUrl: string;
    view: esri.MapView;
    private _state;
    private _setState;
    private _printer;
    private _PrintTemplate;
    private _printResults;
    /**
     * Create a print.
     */
    private _print;
    private _snapshotResults;
    private _photoModal;
    /**
     * Create a snapshot.
     */
    private _snapshot;
    /**
     * Add title to image and return data url.
     * @param data Image data to be returned as data url string
     * @param title Title of the image
     * @param format Format of the image
     * @returns Data url string
     */
    private _dataUrl;
    render(): tsx.JSX.Element;
    /**
     * Create options for print layout select.
     * @returns Array of tsx elements
     */
    private _renderLayoutOptions;
}
export {};
