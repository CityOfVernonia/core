import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
/**
 * View and download tax maps.
 */
export default class TaxMaps extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Tax maps boundary layer.
         */
        layer: esri.FeatureLayer;
        /**
         * Tax maps imagery layer.
         */
        imagery: esri.MapImageLayer;
    });
    postInitialize(): Promise<void>;
    view: esri.MapView;
    layer: esri.FeatureLayer;
    imagery: esri.MapImageLayer;
    protected sublayers: Collection<esri.Sublayer>;
    protected state: 'ready' | 'selected' | 'error';
    private _select;
    private _items;
    private _id;
    private _optionSelected;
    private _viewTaxMap;
    render(): tsx.JSX.Element;
}
