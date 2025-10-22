import esri = __esri;
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
/**
 * Extended sketch view model for measure.
 */
export default class Sketch extends SketchViewModel {
    constructor(properties?: esri.SketchViewModelProperties);
    labels: esri.GraphicsLayer;
    layer: esri.GraphicsLayer;
    layers: esri.GroupLayer;
    private _textSymbol;
    get textSymbol(): esri.TextSymbol;
    set textSymbol(textSymbol: esri.TextSymbol);
    updateOnGraphicClick: boolean;
    private _initialized;
    clearGraphics(type: 'all' | 'labels' | 'geometry'): void;
    private _addSnappingLayer;
    private _addVertices;
}
