import esri = __esri;
/**
 * PrintSnapshot constructor properties.
 */
export interface PrintSnapshotConstructorProperties extends esri.WidgetProperties {
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
 * Panel component for printing with a print service and taking view snapshot images.
 */
declare class PrintSnapshot extends Widget {
    container: HTMLCalcitePanelElement;
    constructor(properties: PrintSnapshotConstructorProperties);
    postInitialize(): Promise<void>;
    layouts: {
        [key: string]: string;
    };
    printServiceUrl: string;
    view: esri.MapView;
    private _viewState;
    private _printer;
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
export default PrintSnapshot;
