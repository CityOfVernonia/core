import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Snapshot extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view to print.
         */
        view: esri.MapView;
        /**
         * Default map title.
         * @default 'Map Snapshot'
         */
        title?: string;
    });
    view: esri.MapView;
    title: string;
    private _photoModal;
    private _snapshot;
    private _download;
    render(): tsx.JSX.Element;
    private _snapshotResults;
    private _title;
    private _format;
}
