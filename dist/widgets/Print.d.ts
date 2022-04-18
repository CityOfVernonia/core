import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Print extends Widget {
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
        title?: string;
        /**
         * Key/value of layouts to include.
         * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
         */
        layouts?: {
            [key: string]: string;
        };
    });
    printer: esri.PrintViewModel;
    view: esri.MapView;
    printServiceUrl: string;
    title: string;
    layouts: {
        [key: string]: string;
    };
    private _print;
    render(): tsx.JSX.Element;
    private _printResults;
    private _title;
    private _layout;
    private _renderLayoutSelects;
}
