import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Buffer a tax lot.
 */
export default class TaxLotBuffer extends Widget {
    constructor(properties: esri.WidgetProperties & {
        view: esri.MapView;
        layer: esri.FeatureLayer;
    });
    postInitialize(): Promise<void>;
    view: esri.MapView;
    layer: esri.FeatureLayer;
    protected state: 'ready' | 'selected' | 'buffering' | 'buffered' | 'error';
    private _visible;
    private _selectedFeature;
    private _graphics;
    private _bufferSymbol;
    private _featureSymbol;
    private _resultSymbol;
    private _distance;
    private _id;
    private _results;
    onHide(): void;
    private _clear;
    private _buffer;
    private _download;
    render(): tsx.JSX.Element;
}
