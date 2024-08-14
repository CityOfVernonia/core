import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Print extends Widget {
    container: HTMLCalciteActionElement;
    constructor(properties: esri.WidgetProperties & {
        /**
         * Print file name.
         * @default 'map_print'
         */
        printFileName?: string;
        /**
         * Print file format.
         * @default 'pdf'
         */
        printFormat?: 'png8' | 'png32' | 'jpg' | 'pdf' | 'gif' | 'svg' | 'svgz' | 'eps';
        /**
         * Print layout.
         * @default 'letter-ansi-a-landscape'
         */
        printLayout?: 'letter-ansi-a-landscape' | 'map-only' | 'a3-landscape' | 'a3-portrait' | 'a4-landscape' | 'a4-portrait' | 'letter-ansi-a-portrait' | 'tabloid-ansi-b-landscape' | 'tabloid-ansi-b-portrait';
        /**
         * URL of print service.
         */
        printServiceUrl: string;
        /**
         * Print title.
         * @default 'Map Print'
         */
        printTitle?: string;
        /**
         * Map view to print.
         */
        view: esri.MapView;
    });
    postInitialize(): void;
    printFileName: string;
    printFormat: 'png8' | 'png32' | 'jpg' | 'pdf' | 'gif' | 'svg' | 'svgz' | 'eps';
    printLayout: 'letter-ansi-a-landscape' | 'map-only' | 'a3-landscape' | 'a3-portrait' | 'a4-landscape' | 'a4-portrait' | 'letter-ansi-a-portrait' | 'tabloid-ansi-b-landscape' | 'tabloid-ansi-b-portrait';
    printServiceUrl: string;
    printTitle: string;
    view: esri.MapView;
    private _printViewModel;
    private _printing;
    private _reader;
    private _error;
    private _print;
    private _readerOnload;
    render(): tsx.JSX.Element;
}
