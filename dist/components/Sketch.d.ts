import esri = __esri;
/**
 * Sketch properties.
 */
export interface SketchProperties extends esri.WidgetProperties {
    view: esri.MapView;
    offsetProjectionWkid?: number;
}
import { tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
/**
 * Sketch graphics on a map.
 */
export default class Sketch extends Widget {
    constructor(properties: SketchProperties);
    postInitialize(): Promise<void>;
    readonly offsetProjectionWkid = 102970;
    readonly view: esri.MapView;
    private _bufferInput;
    private _canRedo;
    private _canUndo;
    private _createText;
    private _graphicsCount;
    private _newTextInput;
    private _newTextGraphic;
    private _offsetInput;
    private _offsetSelect;
    private _popupVisible;
    private _selectState;
    private _selectedFeature;
    private _selectedGraphic;
    private _selectedGraphics;
    private _selectedGraphicsListItems;
    private _sketch;
    private _sketchSaveLoad;
    private _toolState;
    private _viewState;
    private _addSelectedFeature;
    private _addVertices;
    private _buffer;
    private _cancel;
    private _create;
    private _createEvent;
    private _highlight;
    private _highlightGraphic;
    private _highlightSelectedGraphics;
    private _newText;
    private _offset;
    private _reset;
    private _select;
    private _selectGraphic;
    private _selectReset;
    private _setSymbolProperty;
    private _update;
    private _updateEvent;
    render(): tsx.JSX.Element;
    private _renderBuffer;
    private _renderDeleteAll;
    private _renderEdit;
    private _renderNewText;
    private _renderOffset;
    private _renderSelected;
    private _renderSimpleFillSymbolEditor;
    private _renderSimpleLineSymbolEditor;
    private _renderSimpleMarkerSymbolEditor;
    private _renderSketch;
    private _renderTextSymbolEditor;
}
