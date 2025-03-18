import esri = __esri;
export interface TaxLotBufferProperties extends esri.WidgetProperties {
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class TaxLotBuffer extends Widget {
    constructor(properties: TaxLotBufferProperties);
    postInitialize(): void;
    taxLots: esri.FeatureLayer;
    view: esri.MapView;
    private _distance;
    private _graphics;
    private _popupVisible;
    private _results;
    private _selectedFeature;
    private _symbols;
    private _taxLotId;
    private _viewState;
    private _buffer;
    private _clear;
    private _download;
    private _loadLayer;
    private _setState;
    private _taxLotSelected;
    render(): tsx.JSX.Element;
    private _inputAfterCreate;
}
