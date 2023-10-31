import esri = __esri;
interface I {
    layers: 'point' | 'polyline' | 'polygon' | 'text';
    tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text';
    offset: 'both' | 'left' | 'right';
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
export default class Markup extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view to mark up.
         */
        view: esri.MapView;
        /**
         * Default length unit.
         * Should probably be a `lengthUnits` key.
         */
        lengthUnit?: string;
        /**
         * Available length units.
         * Should probably be `esri.LinearUnits`.
         */
        lengthUnits?: {
            [key: string]: string;
        };
        /**
         * Default buffer distance.
         */
        bufferDistance?: number;
        /**
         * Default offset distance.
         */
        offsetDistance?: number;
        /**
         * Default offset direction.
         */
        offsetDirection?: I['offset'];
        /**
         * Projection to use for offset.
         */
        offsetProjectionWkid: number;
    });
    postInitialize(): Promise<void>;
    view: esri.MapView;
    lengthUnit: string;
    lengthUnits: {
        meters: string;
        feet: string;
        kilometers: string;
        miles: string;
    };
    bufferDistance: number;
    offsetDistance: number;
    offsetDirection: I['offset'];
    offsetProjectionWkid: number;
    onHide(): void;
    private _sketch;
    protected pointSymbol: SimpleMarkerSymbol | TextSymbol;
    protected polylineSymbol: esri.SimpleLineSymbol;
    protected polygonSymbol: esri.SimpleFillSymbol;
    protected textSymbol: esri.TextSymbol;
    private _activeLineSymbol;
    private _activeVertexSymbol;
    private _vertexSymbol;
    private _activeFillSymbol;
    private _featureSnapping;
    private _drawingGuides;
    /**
     * Add layer as snapping source.
     * @param layer
     */
    private _addSnappingLayer;
    protected point: esri.GraphicsLayer;
    protected polyline: esri.GraphicsLayer;
    protected polygon: esri.GraphicsLayer;
    protected text: esri.GraphicsLayer;
    protected layers: esri.GroupLayer;
    private _pointView;
    private _polylineView;
    private _polygonView;
    private _textView;
    private _drawState;
    private _newTextInput;
    private _newTextGraphic;
    private _reset;
    private _draw;
    private _createEvent;
    private _newText;
    private _addGeometry;
    private _editGeometry;
    private _updateEvent;
    private _delete;
    private _symbolEditorContainer;
    private _symbolEditor;
    private _selectState;
    private _selectHandle;
    private _selectedGraphic;
    private _selectedGraphicsItems;
    private _selectReset;
    private _clearSelection;
    private _textClearSelection;
    private _select;
    private _selectGraphic;
    private _highlightedGraphic;
    private _highlightSelected;
    private _unhighlightSelected;
    private _buffer;
    private _cancelBufferOffset;
    private _offset;
    private _selectedPopupFeature;
    private _confirmVerticesModal;
    private _confirmVerticesModalHandle;
    private _addSelectedPopupFeature;
    private _addVertices;
    private __addVertices;
    private _confirmLoadModal;
    private _confirmLoadModalHandle;
    private _save;
    private _allGraphicsJson;
    private _layerGraphicsJson;
    private _load;
    private _loadGraphics;
    /**
     * Number of markup graphics
     */
    private _graphicsCount;
    /**
     * Set `_graphicsCount` property
     */
    private _countGraphics;
    /**
     * Can sketch view model undo
     */
    _canUndo: boolean;
    /**
     * Can sketch view model redo
     */
    _canRedo: boolean;
    /**
     * Set `_canUndo` and `_canRedo` properties
     */
    private _undoRedo;
    /**
     * For displaying content and buttons; and otherwise controlling various UI components
     */
    private _viewState;
    render(): tsx.JSX.Element;
    private _newTextAfterCreate;
    private _featureSnappingAfterCreate;
    private _drawingGuidesAfterCreate;
    private _bufferDistanceAfterCreate;
    private _offsetDistanceAfterCreate;
    private _offsetDirectionAfterCreate;
    private _unitSelectAfterCreate;
    private _renderUnitOptions;
    /**
     * Return tooltip target id
     */
    private _tt;
    /**
     * Return tooltip reference id
     */
    private _ttr;
}
export {};
