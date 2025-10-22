import esri = __esri;
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
export declare const COLORS: {
    [key: string]: number[];
};
export declare const POINT_SYMBOL: esri.SimpleMarkerSymbol;
export declare const TEXT_SYMBOL: esri.TextSymbol;
/**
 * Extended sketch view model for sketch.
 */
export default class Sketch extends SketchViewModel {
    constructor(properties?: esri.SketchViewModelProperties);
    protected graphicsCount: number;
    layer: esri.GraphicsLayer;
    layers: esri.GroupLayer;
    point: esri.GraphicsLayer;
    pointView: esri.GraphicsLayerView;
    polygon: esri.GraphicsLayer;
    polygonView: esri.GraphicsLayerView;
    polyline: esri.GraphicsLayer;
    polylineView: esri.GraphicsLayerView;
    text: esri.GraphicsLayer;
    textView: esri.GraphicsLayerView;
    private _textSymbol;
    get textSymbol(): esri.TextSymbol;
    set textSymbol(textSymbol: esri.TextSymbol);
    updateOnGraphicClick: boolean;
    addGeometry(geometry: esri.Geometry): esri.Graphic | nullish;
    addJSON(featureJSON: object): esri.Graphic | nullish;
    deleteAll(): void;
    featureJSON(): {
        features: object[];
    };
    private _addSnappingLayer;
}
