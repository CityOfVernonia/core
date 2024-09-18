import esri = __esri;
export interface SketchConstructorProperties extends esri.WidgetProperties {
    /**
     * View to sketch on.
     */
    view: esri.MapView;
    /**
     * Projection to use for offset.
     */
    offsetProjectionWkid: number;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
export default class Sketch extends Widget {
    container: HTMLCalcitePanelElement;
    constructor(properties: SketchConstructorProperties);
    postInitialize(): Promise<void>;
    view: esri.MapView;
    offsetProjectionWkid: number;
    private _sketch;
    protected pointSymbol: SimpleMarkerSymbol | TextSymbol;
    protected polylineSymbol: esri.SimpleLineSymbol;
    protected polygonSymbol: esri.SimpleFillSymbol;
    protected textSymbol: esri.TextSymbol;
    private _activeLineSymbol;
    private _activeVertexSymbol;
    private _vertexSymbol;
    private _activeFillSymbol;
    protected point: esri.GraphicsLayer;
    protected polyline: esri.GraphicsLayer;
    protected polygon: esri.GraphicsLayer;
    protected text: esri.GraphicsLayer;
    protected layers: esri.GroupLayer;
    private _pointView;
    private _polylineView;
    private _polygonView;
    private _textView;
    _canUndo: boolean;
    _canRedo: boolean;
    private _drawState;
    private _hasGraphics;
    private _snapping;
    private _guides;
    private _viewState;
    private _setViewState;
    private _addGeometry;
    private _delete;
    private _reset;
    private _create;
    private _createEvent;
    private _update;
    private _updateEvent;
    private _newTextInput;
    private _newTextGraphic;
    private _newTextInputAfterCreate;
    private _newTextSubmitEvent;
    private _symbolEditorContainer;
    private _symbolEditor;
    private _selectState;
    private _selectHandle;
    private _selectedGraphic;
    private _highlightedSelectedGraphic;
    private _selectedGraphicsItems;
    private _selectReset;
    private _clearSelection;
    private _textClearSelection;
    private _select;
    private _selectGraphic;
    private _highlightSelected;
    private _unhighlightSelected;
    private _popupFeature?;
    private _addPopupFeature;
    private _addVertices;
    private _bufferInput;
    private _buffer;
    private _bufferCancel;
    private _bufferInputAfterCreate;
    private _offsetInput;
    private _offsetSegmentedControl;
    private _offset;
    private _offsetCancel;
    private _offsetInputAfterCreate;
    private _offsetSegmentedControlAfterCreate;
    private _saveInput;
    private _save;
    private _saveInputAfterCreate;
    private _saveShow;
    private _loadInput;
    private _reader?;
    private _load;
    private _loadInputAfterCreate;
    private _loadShow;
    private _readerError;
    private _readerLoad;
    render(): tsx.JSX.Element;
}
