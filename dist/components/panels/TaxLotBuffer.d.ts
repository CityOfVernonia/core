import esri = __esri;
export interface TaxLotBufferConstructorProperties extends esri.WidgetProperties {
    /**
     * Tax lot layer.
     */
    layer: esri.FeatureLayer;
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget for buffering a tax lot and downloading results.
 */
declare class TaxLotBuffer extends Widget {
    constructor(properties: TaxLotBufferConstructorProperties);
    postInitialize(): Promise<void>;
    layer: esri.FeatureLayer;
    view: esri.MapView;
    private _bufferSymbol;
    private _distance;
    private _featureSymbol;
    private _graphics;
    private _id;
    private _results;
    private _resultSymbol;
    private _selectedFeature;
    protected _viewState: 'ready' | 'selected' | 'buffering' | 'buffered' | 'error';
    private _visible;
    private _clear;
    private _buffer;
    private _download;
    render(): tsx.JSX.Element;
}
export default TaxLotBuffer;
