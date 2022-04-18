import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Print and snapshot widgets in single UI widget.
 * NOTE: must include snapshot CSS.
 */
export default class PrintSnapshot extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view to print.
         */
        view: esri.MapView;
        /**
         * URL of print service.
         */
        printServiceUrl: string;
        /**
         * Default map title.
         */
        printTitle?: string;
        /**
         * Key/value of layouts to include.
         * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
         */
        layouts?: {
            [key: string]: string;
        };
        /**
         * Default snapshot title.
         */
        snapshotTitle?: string;
    });
    view: esri.MapView;
    printServiceUrl: string;
    printTitle: string;
    snapshotTitle: string;
    layouts: {
        [key: string]: string;
    };
    protected state: 'print' | 'snapshot';
    render(): tsx.JSX.Element;
    /**
     * Create Print widget.
     * @param container
     */
    private _createPrint;
    /**
     * Create Snapshot widget.
     * @param container
     */
    private _createSnapshot;
}
