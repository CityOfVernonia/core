import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import SymbolEditor from './Markup/SymbolEditor';
import { queryFeatureGeometry, polylineVertices, polygonVertices, buffer, offset } from './Markup/geometry';
const CSS = {
    base: 'cov-markup',
    content: 'cov-markup--content',
    rowHeading: 'cov-markup--row-heading',
    buttonRow: 'cov-markup--button-row',
    offsetButton: 'cov-markup--offset-button',
    selectionNotice: 'cov-markup--selection-notice',
};
let KEY = 0;
let TT_ID = '';
let TT_KEY = 0;
// arcgis `Candy Shop` plus black, white and grey
const COLORS = {
    white: [255, 255, 255],
    black: [0, 0, 0],
    grey: [128, 128, 128],
    red: [237, 81, 81],
    blue: [20, 158, 206],
    green: [167, 198, 54],
    purple: [158, 85, 156],
    orange: [252, 146, 31],
    yellow: [255, 222, 62],
};
const HANDLES = {
    SELECTED: 'selected-highlights',
};
let Markup = class Markup extends Widget {
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Lifecycle
    /////////////////////////////////////////////////////////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        this.lengthUnit = 'feet';
        this.lengthUnits = {
            meters: 'Meters',
            feet: 'Feet',
            kilometers: 'Kilometers',
            miles: 'Miles',
        };
        this.bufferDistance = 250;
        this.offsetDistance = 30;
        this.offsetDirection = 'both';
        /////////////////////////////////////////////////////////////////////////////////////////////////
        // Sketch view model, symbols and methods
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this._sketch = new SketchViewModel({
            layer: new GraphicsLayer(),
            snappingOptions: {
                enabled: true,
                featureEnabled: true,
                selfEnabled: true,
            },
            updateOnGraphicClick: false,
        });
        // markup symbols
        this.pointSymbol = new SimpleMarkerSymbol({
            style: 'circle',
            size: 8,
            color: COLORS.yellow,
            outline: {
                width: 1,
                color: COLORS.red,
            },
        });
        this.polylineSymbol = new SimpleLineSymbol({
            color: COLORS.red,
            width: 2,
        });
        this.polygonSymbol = new SimpleFillSymbol({
            color: [...COLORS.yellow, 0.125],
            outline: {
                color: COLORS.red,
                width: 2,
            },
        });
        this.textSymbol = new TextSymbol({
            text: 'New text',
            color: COLORS.red,
            haloColor: COLORS.white,
            haloSize: 1,
            horizontalAlignment: 'center',
            verticalAlignment: 'middle',
            font: {
                size: 12,
            },
        });
        // sketch symbols
        this._activeLineSymbol = new CIMSymbol({
            data: {
                type: 'CIMSymbolReference',
                symbol: {
                    type: 'CIMLineSymbol',
                    symbolLayers: [
                        {
                            type: 'CIMSolidStroke',
                            effects: [
                                {
                                    type: 'CIMGeometricEffectDashes',
                                    dashTemplate: [4.75, 4.75],
                                    lineDashEnding: 'HalfPattern',
                                    // controlPointEnding: 'NoConstraint',
                                    offsetAlongLine: 0, // test this
                                },
                            ],
                            enable: true,
                            capStyle: 'Butt',
                            joinStyle: 'Round',
                            // miterLimit: 10,
                            width: 2,
                            color: [...COLORS.white, 255],
                        },
                        {
                            type: 'CIMSolidStroke',
                            enable: true,
                            capStyle: 'Butt',
                            joinStyle: 'Round',
                            // miterLimit: 10,
                            width: 2,
                            color: [...COLORS.red, 255],
                        },
                    ],
                },
            },
        });
        this._activeVertexSymbol = new SimpleMarkerSymbol({
            style: 'circle',
            size: 6,
            color: COLORS.yellow,
            outline: {
                color: COLORS.red,
                width: 1,
            },
        });
        this._vertexSymbol = new SimpleMarkerSymbol({
            style: 'circle',
            size: 6,
            color: COLORS.white,
            outline: {
                color: COLORS.red,
                width: 1,
            },
        });
        this._activeFillSymbol = new SimpleFillSymbol({
            color: [...COLORS.yellow, 0.125],
            outline: {
                color: COLORS.red,
                width: 2,
            },
        });
        /////////////////////////////////////////////////////////////////////////////////////////////////
        // Layers and layer views
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.point = new GraphicsLayer({ title: 'point' });
        this.polyline = new GraphicsLayer({ title: 'polyline' });
        this.polygon = new GraphicsLayer({ title: 'polygon' });
        this.text = new GraphicsLayer({ title: 'text' });
        this.layers = new GroupLayer({ listMode: 'hide' });
        /////////////////////////////////////////////////////////////////////////////////////////////////
        // Draw variables and methods
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this._drawState = 'ready';
        /**
         * Select variables and methods
         */
        this._selectState = false;
        this._selectHandle = null;
        this._selectedGraphic = null;
        this._selectedGraphicsItems = new Collection();
        this._highlightedGraphic = null;
        /////////////////////////////////////////////////////////////////////////////////////////////////
        // Selected popup features in map variables and methods
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this._selectedPopupFeature = null;
        /////////////////////////////////////////////////////////////////////////////////////////////////
        // View state variables and methods for rendering
        /////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Number of markup graphics
         */
        this._graphicsCount = 0;
        /**
         * Can sketch view model undo
         */
        this._canUndo = false;
        /**
         * Can sketch view model redo
         */
        this._canRedo = false;
        /**
         * For displaying content and buttons; and otherwise controlling various UI components
         */
        this._viewState = 'markup';
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { map }, _sketch, pointSymbol, point, polyline, polygon, text, layers, } = this;
            // set first tooltip id
            this._ttr();
            // initialize sketch
            _sketch.view = view;
            // add layers
            layers.addMany([polygon, polyline, point, text, _sketch.layer]);
            map.add(layers);
            // graphics count
            [polygon, polyline, point, text].forEach((layer) => {
                this.addHandles(layer.watch('graphics.length', this._countGraphics.bind(this)));
            });
            // set displayed point symbol between point and text
            const _pointSymbol = pointSymbol.clone();
            this.addHandles(this.watch('_drawState', (_drawState) => {
                if (_drawState === 'text') {
                    this.pointSymbol = this.textSymbol.clone();
                }
                else {
                    this.pointSymbol = _pointSymbol.clone();
                }
            }));
            // create event
            this.addHandles(_sketch.on('create', this._createEvent.bind(this)));
            // update event
            this.addHandles(_sketch.on('update', this._updateEvent.bind(this)));
            // undo/redo events
            this.addHandles([_sketch.on('create', this._undoRedo.bind(this)), _sketch.on('update', this._undoRedo.bind(this))]);
            // selected popup feature
            this.addHandles(this.watch(['view.popup.visible', 'view.popup.selectedFeature'], () => {
                const { popup: { visible, selectedFeature }, } = view;
                this._selectedPopupFeature = !visible || !selectedFeature ? null : selectedFeature;
                if (!this._selectedPopupFeature)
                    this._viewState = 'markup';
            }));
            /**
             * All async last.
             */
            // create layer views
            this._pointView = yield view.whenLayerView(point);
            this._polylineView = yield view.whenLayerView(polyline);
            this._polygonView = yield view.whenLayerView(polygon);
            this._textView = yield view.whenLayerView(text);
            const sketchLayerView = yield view.whenLayerView(_sketch.layer);
            // set highlight
            [this._pointView, this._polylineView, this._polygonView, this._textView, sketchLayerView].forEach((layerView) => __awaiter(this, void 0, void 0, function* () {
                yield layerView.when();
                layerView.highlightOptions = {
                    color: new Color('yellow'),
                    haloOpacity: 0.75,
                    fillOpacity: 0.1,
                };
            }));
            // everything which needs assured a view
            yield view.when();
            // add snapping layers
            map.layers.forEach(this._addSnappingLayer.bind(this));
            this.addHandles(map.layers.on('after-add', (event) => {
                this._addSnappingLayer(event.item);
            }));
            // keep markup group layer on top
            // bad bad things can happen with this if initializing before view is loaded
            this.addHandles(this.watch('view.map.layers.length', () => {
                map.layers.reorder(layers, map.layers.length - 1);
            }));
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Public methods
    /////////////////////////////////////////////////////////////////////////////////////////////////
    onHide() {
        this._reset();
        this._viewState = 'markup';
        this._selectedGraphicsItems = new Collection();
    }
    /**
     * Add layer as snapping source.
     * @param layer
     */
    _addSnappingLayer(layer) {
        const { _sketch: { snappingOptions }, } = this;
        if (layer.type === 'group') {
            layer.layers.forEach((_layer) => {
                this._addSnappingLayer(_layer);
            });
            return;
        }
        // @ts-ignore
        if (layer.listMode === 'hide' || layer.title === undefined || layer.title === null || layer.internal === true)
            return;
        snappingOptions.featureSources.add(new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: layer,
        }));
    }
    _reset() {
        const { view: { popup }, _sketch, } = this;
        popup.close();
        popup.clear();
        _sketch.cancel();
        this._drawState = 'ready';
        this._selectReset();
    }
    _draw(tool) {
        const { _sketch } = this;
        this._reset();
        this._drawState = tool;
        _sketch.create(tool === 'text' ? 'point' : tool);
    }
    _createEvent(event) {
        const { _drawState, _sketch: { layer }, text, _newTextInput, } = this;
        const { state: sketchState, graphic } = event;
        if (sketchState === 'cancel') {
            this._reset();
            return;
        }
        if (sketchState !== 'complete')
            return;
        const type = graphic.geometry.type;
        layer.remove(graphic);
        (_drawState === 'text') === true ? text.add(graphic) : this[type].add(graphic);
        if (_drawState === 'text') {
            this._viewState = 'text';
            setTimeout(() => {
                _newTextInput.selectText();
            }, 100);
            this._newTextGraphic = graphic;
        }
        this._drawState = 'ready';
    }
    _newText(event) {
        event.preventDefault();
        this._viewState = 'markup';
        this._newTextInput.value = 'New text';
    }
    _addGeometry(geometry) {
        const type = geometry.type;
        this[type].add(new Graphic({
            geometry,
            symbol: this[`${type}Symbol`],
        }));
    }
    _editGeometry(graphic) {
        const { _sketch, _sketch: { layer }, } = this;
        graphic.layer.remove(graphic);
        layer.add(graphic);
        _sketch.update(graphic);
    }
    _updateEvent(event) {
        const { _sketch: { layer }, text, } = this;
        const { state, graphics } = event;
        if (state !== 'complete')
            return;
        const graphic = graphics[0];
        const geometryType = graphic.geometry.type;
        const symbolType = graphic.symbol.type;
        layer.removeAll();
        symbolType === 'text' ? text.add(graphic) : this[geometryType].add(graphic);
        this._selectReset();
        this._viewState = 'markup';
    }
    _delete() {
        const { _sketch, _selectedGraphic } = this;
        if (!_selectedGraphic)
            return;
        _sketch.complete();
        _selectedGraphic.layer.remove(_selectedGraphic);
        this._viewState = 'markup';
        this._selectReset();
    }
    _selectReset() {
        const { _selectHandle } = this;
        if (_selectHandle) {
            _selectHandle.remove();
            this._selectHandle = null;
        }
        this._textClearSelection();
        this._selectedGraphic = null;
        this._selectState = false;
        if (this.hasHandles(HANDLES.SELECTED))
            this.removeHandles(HANDLES.SELECTED);
    }
    _clearSelection() {
        this._textClearSelection();
        this._reset();
        this._viewState = 'markup';
    }
    _textClearSelection() {
        const { _selectedGraphic } = this;
        if (_selectedGraphic &&
            _selectedGraphic.symbol.type === 'text' &&
            !_selectedGraphic.symbol.text) {
            const symbol = _selectedGraphic.symbol.clone();
            symbol.text = 'New Text';
            _selectedGraphic.symbol = symbol;
        }
    }
    _select() {
        const { view, view: { popup }, point, polyline, polygon, text, _selectState, } = this;
        this._selectState = !_selectState;
        if (!this._selectState) {
            this._reset();
            return;
        }
        popup.close();
        popup.clear();
        this._selectHandle = view.on('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.stopPropagation();
            if (this.hasHandles(HANDLES.SELECTED))
                this.removeHandles(HANDLES.SELECTED);
            const results = (yield view.hitTest(event, { include: [point, polyline, polygon, text] }))
                .results;
            if (!results.length) {
                this._viewState = 'markup';
                this._selectedGraphicsItems = new Collection();
                return;
            }
            if (results.length === 1) {
                this._selectGraphic(results[0].graphic);
            }
            else {
                this._selectedGraphicsItems = new Collection(results.map((graphicHit) => {
                    const { graphic, graphic: { geometry: { type: geometryType }, symbol: { type: symbolType }, }, layer: { title }, } = graphicHit;
                    this.addHandles(this[`_${title}View`].highlight(graphic), HANDLES.SELECTED);
                    const icon = symbolType === 'text'
                        ? 'text-large'
                        : geometryType === 'point'
                            ? 'point'
                            : geometryType === 'polyline'
                                ? 'line'
                                : 'polygon-vertices';
                    return (tsx("calcite-list-item", { key: KEY++, label: title.charAt(0).toUpperCase() + title.slice(1), onclick: this._selectGraphic.bind(this, graphic), onmouseenter: this._highlightSelected.bind(this, graphic), onmouseleave: this._unhighlightSelected.bind(this, graphic) },
                        tsx("calcite-icon", { icon: icon, scale: "s", slot: "content-end" })));
                }));
                this._viewState = 'features';
                this.scheduleRender();
            }
        }));
    }
    _selectGraphic(graphic) {
        const { _symbolEditorContainer, _symbolEditor } = this;
        if (this.hasHandles(HANDLES.SELECTED))
            this.removeHandles(HANDLES.SELECTED);
        this._selectedGraphic = graphic;
        this._editGeometry(graphic);
        if (_symbolEditor)
            this._symbolEditor.destroy();
        this._symbolEditor = new SymbolEditor({
            graphic,
            container: document.createElement('div'),
        });
        _symbolEditorContainer.append(this._symbolEditor.container);
        this._viewState = 'feature';
        this._selectState = false;
    }
    _highlightSelected(graphic) {
        const { _sketch: { layer }, } = this;
        const { geometry, symbol } = graphic;
        const color = new Color([0, 255, 0]);
        const fill = new Color([0, 255, 0, 0.75]);
        const _symbol = symbol.clone();
        switch (_symbol.type) {
            case 'simple-marker':
                Object.assign(_symbol, {
                    color: fill,
                    outline: {
                        color,
                    },
                });
                break;
            case 'simple-line':
                Object.assign(_symbol, {
                    color: fill,
                });
                break;
            case 'simple-fill':
                Object.assign(_symbol, {
                    color: fill,
                    outline: {
                        color,
                    },
                });
                break;
            case 'text':
                Object.assign(_symbol, {
                    color,
                });
                break;
        }
        this._highlightedGraphic = new Graphic({
            geometry,
            symbol: _symbol,
        });
        layer.add(this._highlightedGraphic);
    }
    _unhighlightSelected() {
        const { _sketch: { layer }, _highlightedGraphic, } = this;
        if (!_highlightedGraphic)
            return;
        layer.remove(_highlightedGraphic);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Buffer and offset methods
    /////////////////////////////////////////////////////////////////////////////////////////////////
    _buffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, bufferDistance, lengthUnit, _selectedGraphic, _selectedPopupFeature, } = this;
            const graphic = _selectedGraphic || _selectedPopupFeature;
            if (!graphic)
                return;
            // @ts-ignore
            const layer = (graphic.layer || graphic.sourceLayer);
            let geometry = graphic.geometry;
            if (geometry && geometry.type === 'point') {
                this._addGeometry(buffer(geometry, bufferDistance, lengthUnit));
                this._cancelBufferOffset();
                return;
            }
            if (!layer)
                return; // fail safe
            if (layer.type !== 'graphics')
                geometry = yield queryFeatureGeometry({
                    layer,
                    graphic,
                    outSpatialReference: spatialReference,
                });
            this._addGeometry(buffer(geometry, bufferDistance, lengthUnit));
            this._cancelBufferOffset();
        });
    }
    _cancelBufferOffset() {
        const { _selectedGraphic } = this;
        this._viewState = _selectedGraphic ? 'feature' : 'markup';
    }
    _offset() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, offsetDistance, offsetDirection, offsetProjectionWkid, lengthUnit, _selectedGraphic, _selectedPopupFeature, } = this;
            const graphic = _selectedGraphic || _selectedPopupFeature;
            if (!graphic)
                return;
            // @ts-ignore
            const layer = (graphic.layer || graphic.sourceLayer);
            let geometry = graphic.geometry;
            if (!layer || geometry.type !== 'polyline')
                return;
            if (layer.type !== 'graphics')
                geometry = yield queryFeatureGeometry({
                    layer,
                    graphic,
                    outSpatialReference: spatialReference,
                });
            const results = yield offset(geometry, offsetDistance, lengthUnit, offsetDirection, offsetProjectionWkid, spatialReference);
            results.forEach(this._addGeometry.bind(this));
            this._cancelBufferOffset();
        });
    }
    _addSelectedPopupFeature() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { popup, spatialReference }, } = this;
            if (!popup.selectedFeature)
                return; // fail safe
            const graphic = popup.selectedFeature;
            // @ts-ignore
            const layer = (graphic.layer || graphic.sourceLayer);
            let geometry = graphic.geometry;
            if (geometry && geometry.type === 'point') {
                this._addGeometry(geometry);
                return;
            }
            if (!layer)
                return; // fail safe
            geometry = yield queryFeatureGeometry({
                layer,
                graphic,
                outSpatialReference: spatialReference,
            });
            this._addGeometry(geometry);
        });
    }
    _addVertices() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, _selectedGraphic, _selectedPopupFeature, } = this;
            const graphic = _selectedGraphic || _selectedPopupFeature;
            if (!graphic)
                return;
            // @ts-ignore
            const layer = (graphic.layer || graphic.sourceLayer);
            if (!layer)
                return; // fail safe
            let geometry = graphic.geometry;
            if (!geometry || geometry.type === 'point')
                return;
            if (layer.type !== 'graphics')
                geometry = yield queryFeatureGeometry({
                    layer,
                    graphic,
                    outSpatialReference: spatialReference,
                });
            if (geometry.type === 'polyline')
                polylineVertices(geometry, spatialReference).forEach((point) => {
                    this._addGeometry(point);
                });
            if (geometry.type === 'polygon')
                polygonVertices(geometry, spatialReference).forEach((point) => {
                    this._addGeometry(point);
                });
        });
    }
    /**
     * Set `_graphicsCount` property
     */
    _countGraphics() {
        const { text, point, polyline, polygon } = this;
        this._graphicsCount =
            text.graphics.length + point.graphics.length + polyline.graphics.length + polygon.graphics.length;
    }
    /**
     * Set `_canUndo` and `_canRedo` properties
     */
    _undoRedo() {
        const { _sketch } = this;
        this._canUndo = _sketch.canUndo();
        this._canRedo = _sketch.canRedo();
    }
    render() {
        const { id, _sketch, _graphicsCount, _canUndo, _canRedo, _drawState, _selectState, _selectedGraphic, _selectedPopupFeature, _selectedGraphicsItems, _viewState, } = this;
        const newTextId = `new_text_${id}`;
        return (tsx("calcite-panel", { heading: "Markup" },
            tsx("div", { hidden: _viewState !== 'markup', class: CSS.content },
                tsx("div", { class: CSS.buttonRow },
                    tsx("calcite-button", { id: this._tt(), appearance: _selectState ? '' : 'transparent', disabled: _graphicsCount === 0, "icon-start": "cursor", onclick: this._select.bind(this) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Select markup"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'point' ? '' : 'transparent', "icon-start": "point", onclick: this._draw.bind(this, 'point') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw point"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'polyline' ? '' : 'transparent', "icon-start": "line", onclick: this._draw.bind(this, 'polyline') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw polyline"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'polygon' ? '' : 'transparent', "icon-start": "polygon-vertices", onclick: this._draw.bind(this, 'polygon') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw polygon"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'rectangle' ? '' : 'transparent', "icon-start": "rectangle", onclick: this._draw.bind(this, 'rectangle') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw rectangle"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'circle' ? '' : 'transparent', "icon-start": "circle", onclick: this._draw.bind(this, 'circle') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw circle"),
                    tsx("calcite-button", { id: this._tt(), appearance: _drawState === 'text' ? '' : 'transparent', "icon-start": "text-large", onclick: this._draw.bind(this, 'text') }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Draw text")),
                tsx("div", { hidden: !_selectedPopupFeature, class: CSS.rowHeading }, "Selected feature options"),
                tsx("div", { hidden: !_selectedPopupFeature, class: CSS.buttonRow },
                    tsx("calcite-button", { id: this._tt(), appearance: "transparent", "icon-start": "add-layer", onclick: this._addSelectedPopupFeature.bind(this) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Add feature"),
                    tsx("calcite-button", { id: this._tt(), hidden: (_selectedPopupFeature === null || _selectedPopupFeature === void 0 ? void 0 : _selectedPopupFeature.geometry.type) === 'point', appearance: "transparent", "icon-start": "vertex-plus", onclick: this._addVertices.bind(this) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Add vertices"),
                    tsx("calcite-button", { id: this._tt(), appearance: "transparent", "icon-start": "rings", onclick: () => {
                            this._viewState = 'buffer';
                        } }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Buffer"),
                    tsx("calcite-button", { class: CSS.offsetButton, id: this._tt(), hidden: (_selectedPopupFeature === null || _selectedPopupFeature === void 0 ? void 0 : _selectedPopupFeature.geometry.type) !== 'polyline', appearance: "transparent", "icon-start": "hamburger", onclick: () => {
                            this._viewState = 'offset';
                        } }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Offset"))),
            tsx("div", { hidden: _viewState !== 'text', class: CSS.content },
                tsx("form", { id: newTextId, onsubmit: this._newText.bind(this) },
                    tsx("calcite-label", null,
                        "Add text",
                        tsx("calcite-input", { type: "text", value: "New text", afterCreate: this._newTextAfterCreate.bind(this) })))),
            tsx("calcite-button", { form: newTextId, hidden: _viewState !== 'text', slot: _viewState === 'text' ? 'footer-actions' : null, type: "submit", width: "full" }, "Done"),
            tsx("div", { hidden: _viewState !== 'features' },
                tsx("calcite-notice", { class: CSS.selectionNotice, open: "", scale: "s" },
                    tsx("div", { slot: "message" },
                        _selectedGraphicsItems.length,
                        " markup selected"),
                    tsx("calcite-link", { slot: "link", onclick: this._clearSelection.bind(this) }, "Clear selection")),
                tsx("calcite-list", null, _selectedGraphicsItems.toArray())),
            tsx("div", { hidden: _viewState !== 'feature', class: CSS.content },
                tsx("div", { class: CSS.buttonRow },
                    tsx("calcite-button", { id: this._tt(), disabled: !_canUndo, appearance: "transparent", "icon-start": "undo", onclick: _sketch.undo.bind(_sketch) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Undo"),
                    tsx("calcite-button", { id: this._tt(), disabled: !_canRedo, appearance: "transparent", "icon-start": "redo", onclick: _sketch.redo.bind(_sketch) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Redo"),
                    tsx("calcite-button", { id: this._tt(), appearance: "transparent", "icon-start": "trash", onclick: this._delete.bind(this) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Delete"),
                    tsx("calcite-button", { id: this._tt(), hidden: (_selectedGraphic === null || _selectedGraphic === void 0 ? void 0 : _selectedGraphic.geometry.type) === 'point', appearance: "transparent", "icon-start": "vertex-plus", onclick: this._addVertices.bind(this) }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Add vertices"),
                    tsx("calcite-button", { id: this._tt(), appearance: "transparent", "icon-start": "rings", onclick: () => {
                            this._viewState = 'buffer';
                        } }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Buffer"),
                    tsx("calcite-button", { class: CSS.offsetButton, id: this._tt(), hidden: (_selectedGraphic === null || _selectedGraphic === void 0 ? void 0 : _selectedGraphic.geometry.type) !== 'polyline', appearance: "transparent", "icon-start": "hamburger", onclick: () => {
                            this._viewState = 'offset';
                        } }),
                    tsx("calcite-tooltip", { "close-on-click": "", placement: "bottom", "reference-element": this._ttr() }, "Offset")),
                tsx("div", { afterCreate: (div) => {
                        this._symbolEditorContainer = div;
                    } })),
            tsx("calcite-button", { hidden: _viewState !== 'feature', slot: _viewState === 'feature' ? 'footer-actions' : null, width: "full", onclick: this._clearSelection.bind(this) }, "Done"),
            tsx("div", { hidden: _viewState !== 'buffer', class: CSS.content },
                tsx("calcite-label", null,
                    "Distance",
                    tsx("calcite-input", { type: "number", afterCreate: this._bufferDistanceAfterCreate.bind(this) })),
                tsx("calcite-label", null,
                    "Unit",
                    tsx("calcite-select", { afterCreate: this._unitSelectAfterCreate.bind(this) }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit)))),
            tsx("calcite-button", { hidden: _viewState !== 'buffer', slot: _viewState === 'buffer' ? 'footer-actions' : null, width: "full", onclick: this._buffer.bind(this) }, "Buffer"),
            tsx("calcite-button", { appearance: "outline", hidden: _viewState !== 'buffer', slot: _viewState === 'buffer' ? 'footer-actions' : null, width: "full", onclick: this._cancelBufferOffset.bind(this) }, "Cancel"),
            tsx("div", { hidden: _viewState !== 'offset', class: CSS.content },
                tsx("calcite-label", null,
                    "Distance",
                    tsx("calcite-input", { type: "number", afterCreate: this._offsetDistanceAfterCreate.bind(this) })),
                tsx("calcite-label", null,
                    "Unit",
                    tsx("calcite-select", { afterCreate: this._unitSelectAfterCreate.bind(this) }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit))),
                tsx("calcite-label", null,
                    "Direction",
                    tsx("calcite-segmented-control", { afterCreate: this._offsetDirectionAfterCreate.bind(this) },
                        tsx("calcite-segmented-control-item", { value: "both" }, "Both"),
                        tsx("calcite-segmented-control-item", { value: "left" }, "Left"),
                        tsx("calcite-segmented-control-item", { value: "right" }, "Right")))),
            tsx("calcite-button", { hidden: _viewState !== 'offset', slot: _viewState === 'offset' ? 'footer-actions' : null, width: "full", onclick: this._offset.bind(this) }, "Offset"),
            tsx("calcite-button", { appearance: "outline", hidden: _viewState !== 'offset', slot: _viewState === 'offset' ? 'footer-actions' : null, width: "full", onclick: this._cancelBufferOffset.bind(this) }, "Cancel")));
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Render support methods
    /////////////////////////////////////////////////////////////////////////////////////////////////
    _newTextAfterCreate(input) {
        this._newTextInput = input;
        input.addEventListener('calciteInputInput', () => {
            const { _newTextGraphic } = this;
            if (!_newTextGraphic)
                return;
            const symbol = _newTextGraphic.symbol.clone();
            symbol.text = input.value;
            _newTextGraphic.symbol = symbol;
        });
        this.addHandles(this.watch('_viewState', (value, oldValue) => {
            const { _newTextGraphic } = this;
            if (!_newTextGraphic)
                return;
            const symbol = _newTextGraphic.symbol.clone();
            if (oldValue === 'text' && !symbol.text) {
                symbol.text = 'New Text';
                _newTextGraphic.symbol = symbol;
            }
        }));
    }
    _bufferDistanceAfterCreate(input) {
        input.value = this.bufferDistance.toString();
        input.addEventListener('calciteInputInput', () => {
            this.bufferDistance = parseFloat(input.value);
        });
    }
    _offsetDistanceAfterCreate(input) {
        input.value = this.offsetDistance.toString();
        input.addEventListener('calciteInputInput', () => {
            this.offsetDistance = parseFloat(input.value);
        });
    }
    _offsetDirectionAfterCreate(segmentedControl) {
        // segmentedControl.value = this.offsetDirection;
        segmentedControl
            .querySelectorAll('calcite-segmented-control-item')
            .forEach((segmentedControlItem) => {
            if (segmentedControlItem.value === this.offsetDirection)
                segmentedControlItem.checked = true;
        });
        segmentedControl.addEventListener('calciteSegmentedControlChange', () => {
            this.offsetDirection = segmentedControl.selectedItem.value;
        });
    }
    _unitSelectAfterCreate(select) {
        select.addEventListener('calciteSelectChange', () => {
            this.lengthUnit = select.selectedOption.value;
        });
    }
    _renderUnitOptions(units, defaultUnit) {
        const options = [];
        for (const unit in units) {
            options.push(tsx("calcite-option", { key: KEY++, label: units[unit], value: unit, selected: unit === defaultUnit }));
        }
        return options;
    }
    /**
     * Return tooltip target id
     */
    _tt() {
        const _id = TT_ID;
        return _id;
    }
    /**
     * Return tooltip reference id
     */
    _ttr() {
        const { id } = this;
        const _id = TT_ID;
        TT_ID = `tt_${id}_${TT_KEY++}`;
        return _id;
    }
};
__decorate([
    property({ aliasOf: '_sketch.pointSymbol' })
], Markup.prototype, "pointSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.polylineSymbol' })
], Markup.prototype, "polylineSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.polygonSymbol' })
], Markup.prototype, "polygonSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.activeLineSymbol' })
], Markup.prototype, "_activeLineSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.activeVertexSymbol' })
], Markup.prototype, "_activeVertexSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.vertexSymbol' })
], Markup.prototype, "_vertexSymbol", void 0);
__decorate([
    property({ aliasOf: '_sketch.activeFillSymbol' })
], Markup.prototype, "_activeFillSymbol", void 0);
__decorate([
    property()
], Markup.prototype, "_drawState", void 0);
__decorate([
    property()
], Markup.prototype, "_selectState", void 0);
__decorate([
    property()
], Markup.prototype, "_selectedGraphic", void 0);
__decorate([
    property()
], Markup.prototype, "_selectedPopupFeature", void 0);
__decorate([
    property()
], Markup.prototype, "_graphicsCount", void 0);
__decorate([
    property()
], Markup.prototype, "_canUndo", void 0);
__decorate([
    property()
], Markup.prototype, "_canRedo", void 0);
__decorate([
    property()
], Markup.prototype, "_viewState", void 0);
Markup = __decorate([
    subclass('cov.widgets.Markup')
], Markup);
export default Markup;
