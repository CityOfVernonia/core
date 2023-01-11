import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget for displaying tax map image media layers.
 */
export default class TaxMaps extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
        /**
         * Tax map boundaries GeoJSON layer.
         */
        layer: esri.GeoJSONLayer;
        /**
         * Display boundaries layer visibility switch.
         * @default true
         */
        showSwitch?: boolean;
    });
    postInitialize(): Promise<void>;
    view: esri.MapView;
    layer: esri.GeoJSONLayer;
    showSwitch: boolean;
    private _imageLayerInfos;
    private _imageLayerInfo;
    private _opacity;
    private _options;
    _loading: boolean;
    /**
     * Show selected tax map image media layer.
     * @param value
     */
    private _show;
    /**
     * On demand load image media layer.
     * @param imageLayerInfo
     */
    private _load;
    /**
     * Wire select events.
     * @param select
     */
    private _selectAfterCreate;
    render(): tsx.JSX.Element;
}
