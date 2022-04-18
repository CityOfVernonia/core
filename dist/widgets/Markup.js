import { __awaiter, __decorate } from "tslib";
import { whenOnce } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import { Point } from '@arcgis/core/geometry';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import Color from '@arcgis/core/Color';
import { geodesicBuffer, offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';
import ConfirmationModal from './ConfirmationModal';
import MessageModal from './MessageModal';
const CSS = {
    // markup
    base: 'cov-markup',
    content: 'cov-markup--content',
    flexRow: 'cov-markup--flex-row',
    popover: 'cov-markup--popover',
    // symbol editor
    symbolEditor: 'cov-markup--symbol-editor',
    editorRow: 'cov-markup--symbol-editor--row',
    sliderLabels: 'cov-markup--symbol-editor--slider-labels',
    // color picker
    colorPicker: 'cov-markup--color-picker',
    colorPickerColor: 'cov-markup--color-picker--color',
    colorPickerColorSelected: 'cov-markup--color-picker--color--selected',
};
let KEY = 0;
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
const SAVES_DB_NAME = 'markup_widget_saves';
let Markup = class Markup extends Widget {
    constructor(properties) {
        super(properties);
        this.lengthUnit = 'feet';
        this.lengthUnits = {
            meters: 'Meters',
            feet: 'Feet',
            kilometers: 'Kilometers',
            miles: 'Miles',
        };
        this.length = 250;
        this.offset = 30;
        this.offsetDirection = 'both';
        this.offsetProjectionWkid = 102970;
        this.pouchdbVersion = '7.2.1';
        ////////////////////////////////////////////////////////////////
        // Internal properties
        ///////////////////////////////////////////////////////////////
        /**
         * Sketch VM for draw operations.
         */
        this.sketch = new SketchViewModel({
            layer: new GraphicsLayer({
                id: 'markup_sketch_layer',
                listMode: 'hide',
            }),
            snappingOptions: {
                enabled: true,
                featureEnabled: true,
                selfEnabled: true,
            },
            updateOnGraphicClick: false,
        });
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
        this.point = new GraphicsLayer({
            id: 'markup_point_layer',
            title: 'markup_point_layer',
            listMode: 'hide',
        });
        this.polyline = new GraphicsLayer({
            id: 'markup_polyline_layer',
            title: 'markup_polyline_layer',
            listMode: 'hide',
        });
        this.polygon = new GraphicsLayer({
            id: 'markup_polygon_layer',
            title: 'markup_polygon_layer',
            listMode: 'hide',
        });
        this.text = new GraphicsLayer({
            id: 'markup_text_layer',
            title: 'markup_text_layer',
            listMode: 'hide',
        });
        this.layers = new GroupLayer({
            id: 'markup_layers',
            title: 'Markup',
            listMode: 'hide',
        });
        this.state = 'ready';
        this.viewState = 'markup';
        this.saveViewState = 'default';
        this._selectedFeature = null;
        this._selectedMarkup = null;
        this._savesLoadCount = 0;
        this._saves = new Collection();
        this._confirmationModal = new ConfirmationModal({
            container: document.createElement('calcite-modal'),
        });
        this._messageModal = new MessageModal({
            container: document.createElement('calcite-modal'),
        });
        // load pouchdb
        const script = document.createElement('script');
        script.src = `https://cdn.jsdelivr.net/npm/pouchdb@${this.pouchdbVersion}/dist/pouchdb.min.js`;
        document.body.append(script);
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { map }, sketch, pointSymbol, point, polyline, polygon, text, layers, _confirmationModal, _messageModal, } = this;
            // serviceable view
            yield view.when();
            // initialize sketch
            sketch.view = view;
            // enable layer snapping
            view.map.layers.forEach(this._addSnappingLayer.bind(this));
            // enable layer snapping when new layers are added
            const addLayerSnapping = view.map.layers.on('after-add', (event) => {
                this._addSnappingLayer(event.item);
            });
            // enable snapping for markup layers
            [point, polyline, polygon, text].forEach((markupLayer) => {
                sketch.snappingOptions.featureSources.add(new FeatureSnappingLayerSource({
                    //@ts-ignore
                    layer: markupLayer,
                }));
            });
            // set sketch symbols
            // @ts-ignore
            sketch.activeLineSymbol = new CIMSymbol({
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
            // @ts-ignore
            sketch.activeVertexSymbol = new SimpleMarkerSymbol({
                style: 'circle',
                size: 6,
                color: COLORS.yellow,
                outline: {
                    color: COLORS.red,
                    width: 1,
                },
            });
            // @ts-ignore
            sketch.vertexSymbol = new SimpleMarkerSymbol({
                style: 'circle',
                size: 6,
                color: COLORS.white,
                outline: {
                    color: COLORS.red,
                    width: 1,
                },
            });
            sketch.activeFillSymbol = new SimpleFillSymbol({
                color: [...COLORS.yellow, 0.125],
                outline: {
                    color: COLORS.red,
                    width: 2,
                },
            });
            // add layers
            layers.addMany([polygon, polyline, point, text, sketch.layer]);
            map.add(layers);
            // load projection
            projection.load();
            // add modals
            document.body.append(_confirmationModal.container);
            document.body.append(_messageModal.container);
            // set selected markup and feature
            const setSelected = this.watch(['view.popup.visible', 'view.popup.selectedFeature'], () => {
                const { popup: { visible, selectedFeature }, } = view;
                this._selectedFeature = null;
                this._selectedMarkup = null;
                if (!visible || !selectedFeature)
                    return;
                const { layer } = selectedFeature;
                const isMarkup = layer === text || layer === point || layer === polyline || layer === polygon ? true : false;
                this._selectedFeature = visible && !isMarkup ? selectedFeature : null;
                this._selectedMarkup = visible && isMarkup ? selectedFeature : null;
            });
            const watchSelected = this.watch(['_selectedFeature', '_selectedMarkup'], () => {
                if (!this._selectedFeature &&
                    !this._selectedMarkup &&
                    (this.viewState === 'buffer' || this.viewState === 'offset'))
                    this.viewState = 'markup';
            });
            // create event
            const createEvent = sketch.on('create', this._createEvent.bind(this));
            // update event
            const updateEvent = sketch.on('update', this._updateEvent.bind(this));
            // set point symbol between marker and text
            const _pointSymbol = pointSymbol.clone();
            const textSymbol = this.watch('state', (state) => {
                if (state === 'text') {
                    this.pointSymbol = this.textSymbol.clone();
                }
                else {
                    this.pointSymbol = _pointSymbol.clone();
                }
            });
            // load projects
            const savesDb = whenOnce(this, '_savesDb', this._initSaves.bind(this));
            this._initSavesDB();
            // own handles
            this.own([addLayerSnapping, setSelected, watchSelected, createEvent, updateEvent, textSymbol, savesDb]);
        });
    }
    /**
     * Convenience method for widget control widgets.
     */
    onHide() {
        this._reset();
    }
    /**
     * Add layer as snapping source.
     * @param layer
     */
    _addSnappingLayer(layer) {
        const { sketch: { snappingOptions }, } = this;
        if (layer.type === 'group') {
            layer.layers.forEach((_layer) => {
                this._addSnappingLayer(_layer);
            });
            return;
        }
        if (layer.listMode === 'hide' || layer.title === undefined || layer.title === null)
            return;
        // @ts-ignore
        if (layer.internal === true)
            return;
        snappingOptions.featureSources.add(new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: layer,
        }));
    }
    _markupEvent(type, action) {
        action.addEventListener('click', this._markup.bind(this, type));
    }
    _reset() {
        const { view: { popup }, sketch, } = this;
        // clear popup
        popup.close();
        popup.clear();
        // cancel sketch
        sketch.cancel();
        // set state
        this.state = 'ready';
        this.viewState = 'markup';
    }
    _markup(type) {
        const { sketch } = this;
        // reset to clear
        this._reset();
        // set state
        this.state = type;
        // start create
        sketch.create(type === 'text' ? 'point' : type);
    }
    _createEvent(event) {
        const { state: sketchState, graphic } = event;
        // reset on cancel
        if (sketchState === 'cancel') {
            this._reset();
            return;
        }
        // handle completed create
        if (sketchState === 'complete') {
            this._addMarkup(graphic.geometry);
        }
    }
    _addMarkup(geometry) {
        const { state, sketch: { layer }, textSymbol, text, } = this;
        const type = geometry.type;
        // create graphic
        const _graphic = new Graphic({
            geometry,
            symbol: state === 'text' ? textSymbol.clone() : this[`${type}Symbol`].clone(),
            popupTemplate: new PopupTemplate({
                title: `Markup ${(state === 'text') === true ? 'text' : type}`,
                returnGeometry: true,
                content: [
                    new CustomContent({
                        creator: () => {
                            const symbolEditor = new SymbolEditor({
                                graphic: _graphic,
                            });
                            this.own(symbolEditor.on('set-symbol-property', this._updateSave.bind(this)));
                            return symbolEditor;
                        },
                    }),
                ],
            }),
        });
        // add to layer based on type
        (state === 'text') === true ? text.add(_graphic) : this[type].add(_graphic);
        // remove sketch graphic
        layer.removeAll();
        // set state
        this.state = 'ready';
        this._updateSave();
    }
    _edit() {
        const { view: { popup }, sketch, sketch: { layer }, _selectedMarkup: graphic, } = this;
        // ensure graphic
        if (!graphic)
            return;
        // clear popup and delete graphic
        popup.close();
        popup.clear();
        graphic.layer.remove(graphic);
        layer.add(graphic);
        sketch.update(graphic);
    }
    _updateEvent(event) {
        // console.log(event);
        const { sketch: { layer }, text, } = this;
        const { state, graphics } = event;
        if (state !== 'complete')
            return;
        const graphic = graphics[0];
        const geometryType = graphic.geometry.type;
        const symbolType = graphic.symbol.type;
        layer.removeAll();
        symbolType === 'text' ? text.add(graphic) : this[geometryType].add(graphic);
        this._updateSave();
    }
    _delete() {
        const { view: { popup }, _selectedMarkup: graphic, } = this;
        // ensure graphic
        if (!graphic)
            return;
        // clear popup and delete graphic
        popup.close();
        popup.clear();
        graphic.layer.remove(graphic);
    }
    _move(move) {
        const { _selectedMarkup: graphic } = this;
        // ensure graphic
        if (!graphic)
            return;
        // get graphics and index
        const graphics = graphic.get('layer.graphics');
        const idx = graphics.indexOf(graphic);
        // move up or down
        if (move === 'up') {
            if (idx < graphics.length - 1) {
                graphics.reorder(graphic, idx + 1);
            }
        }
        else {
            if (idx > 0) {
                graphics.reorder(graphic, idx - 1);
            }
        }
        this._updateSave();
    }
    _addFeature() {
        return __awaiter(this, void 0, void 0, function* () {
            const { _selectedFeature: graphic } = this;
            if (!graphic)
                return;
            const { layer } = graphic;
            let geometry = graphic.geometry;
            if (!geometry && layer.type === 'feature')
                geometry = yield this._queryFeatureGeometry(layer, graphic);
            if (!geometry)
                return;
            this._addMarkup(geometry);
        });
    }
    _addVertices() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, _selectedMarkup, _selectedFeature, } = this;
            const graphic = _selectedMarkup || _selectedFeature;
            if (!graphic)
                return;
            const { layer } = graphic;
            let geometry = graphic.geometry;
            if (!geometry && layer.type === 'feature')
                geometry = yield this._queryFeatureGeometry(layer, graphic);
            if (!geometry)
                return;
            const { type, spatialReference: { wkid }, } = geometry;
            if ((type !== 'polyline' && type !== 'polygon') || spatialReference.wkid !== wkid)
                return;
            if (geometry.type === 'polyline') {
                geometry.paths.forEach((path) => {
                    path.forEach((vertex) => {
                        this._addMarkup(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
                    });
                });
            }
            if (geometry.type === 'polygon') {
                geometry.rings.forEach((ring) => {
                    ring.forEach((vertex, index) => {
                        if (index + 1 < ring.length) {
                            this._addMarkup(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
                        }
                    });
                });
            }
        });
    }
    _buffer() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, lengthUnit, length, _selectedMarkup, _selectedFeature, } = this;
            const graphic = _selectedMarkup || _selectedFeature;
            if (!graphic)
                return;
            const { layer } = graphic;
            let geometry = graphic.geometry;
            if (!geometry && layer.type === 'feature')
                geometry = yield this._queryFeatureGeometry(layer, graphic);
            if (!geometry)
                return;
            const { spatialReference: { wkid }, } = geometry;
            if (spatialReference.wkid !== wkid)
                return;
            this._addMarkup(geodesicBuffer(geometry, length, lengthUnit));
            this.viewState = 'markup';
        });
    }
    _offset() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view: { spatialReference }, lengthUnit, offset: _offset, offsetDirection, offsetProjectionWkid, _selectedMarkup, _selectedFeature, } = this;
            const graphic = _selectedMarkup || _selectedFeature;
            if (!graphic)
                return;
            const { layer } = graphic;
            let geometry = graphic.geometry;
            if (!geometry && layer.type === 'feature')
                geometry = yield this._queryFeatureGeometry(layer, graphic);
            if (!geometry)
                return;
            const { type, spatialReference: { wkid }, } = geometry;
            if (type !== 'polyline' || spatialReference.wkid !== wkid)
                return;
            geometry = projection.project(geometry, { wkid: offsetProjectionWkid });
            if (offsetDirection === 'both' || offsetDirection === 'left') {
                this._addMarkup(projection.project(offset(geometry, _offset, lengthUnit), spatialReference));
            }
            if (offsetDirection === 'both' || offsetDirection === 'right') {
                this._addMarkup(projection.project(offset(geometry, _offset * -1, lengthUnit), spatialReference));
            }
            this.viewState = 'markup';
        });
    }
    _queryFeatureGeometry(layer, graphic) {
        const { view: { spatialReference }, } = this;
        const { objectIdField } = layer;
        return new Promise((resolve, reject) => {
            layer
                .queryFeatures({
                where: `${objectIdField} = ${graphic.attributes[objectIdField]}`,
                returnGeometry: true,
                outSpatialReference: spatialReference,
            })
                .then((results) => {
                resolve(results.features[0].geometry);
            });
        });
    }
    _initSavesDB() {
        const { _savesDb, _savesLoadCount } = this;
        if (_savesDb || _savesLoadCount > 10)
            return;
        if (window.PouchDB) {
            this._savesDb = new window.PouchDB(SAVES_DB_NAME);
        }
        else {
            this._savesLoadCount++;
            setTimeout(this._initSavesDB.bind(this), 100);
        }
    }
    _initSaves() {
        const { _savesDb, _saves } = this;
        _savesDb
            .allDocs({
            include_docs: true,
        })
            .then((result) => {
            const saves = result.rows.map((row) => {
                return row.doc;
            });
            _saves.addMany(saves);
            _saves.sort((a, b) => {
                return a.updated > b.updated ? -1 : 1;
            });
            // console.log(this._saves);
        });
    }
    _createSave(event) {
        event.preventDefault();
        const { _savesDb, _saves, _messageModal } = this;
        if (this._getGraphicCount() === 0) {
            _messageModal.show({
                title: 'Markup',
                message: 'No markup graphics to save.',
            });
            return;
        }
        const form = event.target;
        const titleInput = form.querySelector('[name="TITLE"]');
        const descriptionInput = form.querySelector('[name="DESCRIPTION"]');
        if (!titleInput.value) {
            titleInput.setFocus();
            return;
        }
        const time = new Date().getTime();
        const save = Object.assign({ _id: time.toString(), updated: time, title: titleInput.value, description: descriptionInput.value || '' }, this._getGraphics());
        _savesDb.put(save).then((result) => {
            if (!result.ok)
                return;
            _savesDb.get(result.id).then((doc) => {
                // console.log(doc);
                save._rev = doc._rev;
                this._save = save;
                _saves.add(save);
                this.viewState = 'markup';
                this.saveViewState = 'default';
            });
        });
    }
    _confirmLoadSave(save) {
        const { _save, _confirmationModal } = this;
        if (!_save && this._getGraphicCount() > 0) {
            _confirmationModal.show({
                title: 'Load markup?',
                message: 'Existing markup will be deleted. Load markup anyway?',
                confirm: this._loadSave.bind(this, save),
            });
        }
        else {
            this._loadSave(save);
        }
    }
    _loadSave(save) {
        const { view, view: { popup }, } = this;
        popup.clear();
        popup.close();
        this._save = save;
        this.viewState = 'markup';
        const graphics = [];
        // @ts-ignore
        // array of strings doesn't self type itself?!?!
        ['polygon', 'polyline', 'point', 'text'].forEach((type) => {
            const layer = this[type];
            layer.removeAll();
            save[type].forEach((properties) => {
                const graphic = Graphic.fromJSON(properties);
                graphic.popupTemplate = new PopupTemplate({
                    title: `Markup ${type}`,
                    returnGeometry: true,
                    content: [
                        new CustomContent({
                            creator: () => {
                                const symbolEditor = new SymbolEditor({
                                    graphic,
                                });
                                this.own(symbolEditor.on('set-symbol-property', this._updateSave.bind(this)));
                                return symbolEditor;
                            },
                        }),
                    ],
                });
                graphics.push(graphic);
                layer.add(graphic);
            });
        });
        view.goTo(graphics);
    }
    _updateSave() {
        const { _savesDb, _saves, _save } = this;
        if (!_save)
            return;
        const index = _saves.findIndex((save) => {
            return _save._id === save._id;
        });
        const save = Object.assign(Object.assign(Object.assign({}, _save), { updated: new Date().getTime() }), this._getGraphics());
        _savesDb.put(save).then((result) => {
            if (!result.ok)
                return;
            _savesDb.get(result.id).then((doc) => {
                this._save = doc;
                _saves.splice(index, 1, doc);
            });
        });
    }
    _confirmDeleteSave(save) {
        const { _confirmationModal } = this;
        _confirmationModal.show({
            title: 'Delete markup?',
            message: 'Deleted saved markup?',
            confirm: this._deleteSave.bind(this, save),
        });
    }
    _deleteSave(save) {
        const { _savesDb, _saves } = this;
        _savesDb.remove(save).then((result) => {
            if (!result.ok)
                return;
            _saves.remove(save);
        });
    }
    _closeSave() {
        this._save = null;
        // @ts-ignore
        // array of strings doesn't self type itself?!?!
        ['polygon', 'polyline', 'point', 'text'].forEach((type) => {
            this[type].removeAll();
        });
    }
    /**
     * Get all markup graphics by type.
     * @returns
     */
    _getGraphics() {
        const { text, point, polyline, polygon } = this;
        return {
            text: text.graphics.toArray().map((graphic) => {
                return graphic.toJSON();
            }),
            point: point.graphics.toArray().map((graphic) => {
                return graphic.toJSON();
            }),
            polyline: polyline.graphics.toArray().map((graphic) => {
                return graphic.toJSON();
            }),
            polygon: polygon.graphics.toArray().map((graphic) => {
                return graphic.toJSON();
            }),
        };
    }
    _getGraphicCount() {
        const { text, point, polyline, polygon } = this;
        return text.graphics.length + point.graphics.length + polyline.graphics.length + polygon.graphics.length;
    }
    render() {
        var _a, _b;
        const { id, state, viewState, saveViewState, _selectedMarkup, _selectedFeature, _saves } = this;
        // const isPoint =
        //   _selectedMarkup?.geometry?.type === 'point' ||
        //   (_selectedFeature?.layer &&
        //     _selectedFeature.layer.type === 'feature' &&
        //     (_selectedFeature.layer as esri.FeatureLayer).geometryType === 'point');
        const isPolyline = ((_a = _selectedMarkup === null || _selectedMarkup === void 0 ? void 0 : _selectedMarkup.geometry) === null || _a === void 0 ? void 0 : _a.type) === 'polyline' ||
            ((_selectedFeature === null || _selectedFeature === void 0 ? void 0 : _selectedFeature.layer) &&
                _selectedFeature.layer.type === 'feature' &&
                _selectedFeature.layer.geometryType === 'polyline');
        const isPolygon = ((_b = _selectedMarkup === null || _selectedMarkup === void 0 ? void 0 : _selectedMarkup.geometry) === null || _b === void 0 ? void 0 : _b.type) === 'polygon' ||
            ((_selectedFeature === null || _selectedFeature === void 0 ? void 0 : _selectedFeature.layer) &&
                _selectedFeature.layer.type === 'feature' &&
                _selectedFeature.layer.geometryType === 'polygon');
        // const isText = _selectedMarkup?.symbol?.type === 'text';
        const tooltips = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((num) => {
            return `tooltip_${id}_${num}_${KEY++}`;
        });
        return (tsx("calcite-panel", { class: CSS.base, heading: "Markup" },
            tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[15], active: viewState === 'save', icon: "save", onclick: () => {
                        if (viewState === 'save')
                            return;
                        this.viewState = 'save';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[15], "overlay-positioning": "fixed", placement: "bottom" }, "Save")),
            tsx("div", { class: CSS.content, hidden: viewState !== 'markup' },
                tsx("div", { class: CSS.flexRow },
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[1], scale: "s", appearance: "clear", active: state === 'point', icon: "point", afterCreate: this._markupEvent.bind(this, 'point') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[1], "overlay-positioning": "fixed", placement: "bottom" }, "Draw point")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[2], scale: "s", appearance: "clear", active: state === 'polyline', icon: "line", afterCreate: this._markupEvent.bind(this, 'polyline') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[2], "overlay-positioning": "fixed", placement: "bottom" }, "Draw polyline")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[3], scale: "s", appearance: "clear", active: state === 'polygon', icon: "polygon-vertices", afterCreate: this._markupEvent.bind(this, 'polygon') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[3], "overlay-positioning": "fixed", placement: "bottom" }, "Draw polygon")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[4], scale: "s", appearance: "clear", active: state === 'rectangle', icon: "rectangle", afterCreate: this._markupEvent.bind(this, 'rectangle') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[4], "overlay-positioning": "fixed", placement: "bottom" }, "Draw rectangle")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[5], scale: "s", appearance: "clear", active: state === 'circle', icon: "circle", afterCreate: this._markupEvent.bind(this, 'circle') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[5], "overlay-positioning": "fixed", placement: "bottom" }, "Draw circle")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[6], scale: "s", appearance: "clear", active: state === 'text', icon: "text-large", afterCreate: this._markupEvent.bind(this, 'text') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[6], "overlay-positioning": "fixed", placement: "bottom" }, "Add text"))),
                tsx("div", { class: CSS.flexRow },
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[7], scale: "s", appearance: "clear", disabled: !_selectedMarkup, icon: "pencil", onclick: this._edit.bind(this) }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[7], "overlay-positioning": "fixed", placement: "bottom" }, "Edit geometry")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[8], scale: "s", appearance: "clear", disabled: !_selectedMarkup, icon: "trash", onclick: this._delete.bind(this) }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[8], "overlay-positioning": "fixed", placement: "bottom" }, "Delete markup")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[9], scale: "s", appearance: "clear", disabled: !_selectedMarkup, icon: "chevron-up", onclick: this._move.bind(this, 'up') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[9], "overlay-positioning": "fixed", placement: "bottom" }, "Move up")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[10], scale: "s", appearance: "clear", disabled: !_selectedMarkup, icon: "chevron-down", onclick: this._move.bind(this, 'down') }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[10], "overlay-positioning": "fixed", placement: "bottom" }, "Move down")),
                    tsx("calcite-popover-manager", { "auto-close": "" },
                        tsx("calcite-popover", { "reference-element": `settings-popover-${id}`, "overlay-positioning": "fixed" },
                            tsx("div", { class: CSS.popover },
                                tsx("calcite-label", { alignment: "start", layout: "inline" },
                                    tsx("calcite-switch", { afterCreate: (_switch) => {
                                            const { sketch: { snappingOptions }, } = this;
                                            _switch.checked = snappingOptions.featureEnabled;
                                            _switch.addEventListener('calciteSwitchChange', () => {
                                                snappingOptions.featureEnabled = _switch.checked;
                                            });
                                        } }),
                                    "Feature snapping"),
                                tsx("calcite-label", { alignment: "start", layout: "inline" },
                                    tsx("calcite-switch", { afterCreate: (_switch) => {
                                            const { sketch: { snappingOptions }, } = this;
                                            _switch.checked = snappingOptions.selfEnabled;
                                            _switch.addEventListener('calciteSwitchChange', () => {
                                                snappingOptions.selfEnabled = _switch.checked;
                                            });
                                        } }),
                                    "Sketch guides"))),
                        tsx("calcite-action", { id: `settings-popover-${id}`, scale: "s", appearance: "clear", icon: "gear" }))),
                tsx("div", { class: CSS.flexRow },
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[11], scale: "s", appearance: "clear", disabled: !_selectedFeature, icon: "add-layer", onclick: this._addFeature.bind(this) }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[11], "overlay-positioning": "fixed", placement: "bottom" }, "Add feature")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[12], scale: "s", appearance: "clear", disabled: !(isPolyline || isPolygon), icon: "vertex-plus", onclick: this._addVertices.bind(this) }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[12], "overlay-positioning": "fixed", placement: "bottom" }, "Add vertices points")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { id: tooltips[13], scale: "s", appearance: "clear", disabled: !_selectedMarkup && !_selectedFeature, icon: "rings", onclick: () => {
                                this.viewState = 'buffer';
                            } }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[13], "overlay-positioning": "fixed", placement: "bottom" }, "Buffer")),
                    tsx("calcite-tooltip-manager", null,
                        tsx("calcite-action", { style: "transform: rotate(90deg);", id: tooltips[16], scale: "s", appearance: "clear", disabled: !isPolyline, icon: "hamburger", onclick: () => {
                                this.viewState = 'offset';
                            } }),
                        tsx("calcite-tooltip", { "reference-element": tooltips[16], "overlay-positioning": "fixed", placement: "bottom" }, "Offset")))),
            tsx("div", { class: CSS.content, hidden: viewState !== 'buffer' },
                tsx("calcite-label", null,
                    "Distance",
                    tsx("calcite-input", { type: "number", afterCreate: (input) => {
                            input.value = `${this.length}`;
                            input.addEventListener('calciteInputInput', () => {
                                this.length = parseFloat(input.value);
                            });
                        } })),
                tsx("calcite-label", null,
                    "Unit",
                    tsx("calcite-select", { afterCreate: (select) => {
                            select.addEventListener('calciteSelectChange', () => {
                                this.lengthUnit = select.selectedOption.value;
                            });
                        } }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit))),
                tsx("div", null,
                    tsx("calcite-button", { width: "half", onclick: this._buffer.bind(this) }, "Buffer"),
                    tsx("calcite-button", { width: "half", appearance: "outline", onclick: () => {
                            this.viewState = 'markup';
                        } }, "Cancel"))),
            tsx("div", { class: CSS.content, hidden: viewState !== 'offset' },
                tsx("calcite-label", null,
                    "Distance",
                    tsx("calcite-input", { type: "number", afterCreate: (input) => {
                            input.value = `${this.offset}`;
                            input.addEventListener('calciteInputInput', () => {
                                this.offset = parseFloat(input.value);
                            });
                        } })),
                tsx("calcite-label", null,
                    "Unit",
                    tsx("calcite-select", { afterCreate: (select) => {
                            select.addEventListener('calciteSelectChange', () => {
                                this.lengthUnit = select.selectedOption.value;
                            });
                        } }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit))),
                tsx("calcite-label", null,
                    "Direction",
                    tsx("calcite-radio-button-group", { name: "" },
                        tsx("calcite-label", { layout: "inline", onclick: () => {
                                this.offsetDirection = 'both';
                            } },
                            tsx("calcite-radio-button", { checked: "" }),
                            "Both"),
                        tsx("calcite-label", { layout: "inline", onclick: () => {
                                this.offsetDirection = 'left';
                            } },
                            tsx("calcite-radio-button", null),
                            "Left"),
                        tsx("calcite-label", { layout: "inline", onclick: () => {
                                this.offsetDirection = 'right';
                            } },
                            tsx("calcite-radio-button", null),
                            "Right"))),
                tsx("div", null,
                    tsx("calcite-button", { width: "half", onclick: this._offset.bind(this) }, "Offset"),
                    tsx("calcite-button", { width: "half", appearance: "outline", onclick: () => {
                            this.viewState = 'markup';
                        } }, "Cancel"))),
            tsx("div", { class: CSS.content, hidden: viewState !== 'save' },
                tsx("div", { hidden: saveViewState !== 'default' },
                    tsx("calcite-button", { width: "half", onclick: () => {
                            this.saveViewState = 'new';
                        } }, "New"),
                    tsx("calcite-button", { width: "half", appearance: "outline", onclick: () => {
                            this.viewState = 'markup';
                        } }, "Done")),
                tsx("calcite-list", { hidden: _saves.length === 0 || saveViewState === 'new' }, this._renderSaves()),
                tsx("form", { hidden: saveViewState !== 'new', afterCreate: (form) => {
                        form.addEventListener('submit', this._createSave.bind(this));
                    } },
                    tsx("calcite-label", null,
                        "Title",
                        tsx("calcite-input", { type: "text", name: "TITLE", required: "", value: "My markup" })),
                    tsx("calcite-label", null,
                        "Description",
                        tsx("calcite-input", { type: "text", name: "DESCRIPTION" })),
                    tsx("calcite-button", { width: "half", type: "submit" }, "Save"),
                    tsx("calcite-button", { width: "half", appearance: "outline", type: "button", onclick: () => {
                            this.saveViewState = 'default';
                        } }, "Cancel")))));
    }
    ////////////////////////////////////////////////////////////////
    // Rendering methods
    ///////////////////////////////////////////////////////////////
    /**
     * Render unit select options.
     * @param units
     * @param defaultUnit
     * @returns
     */
    _renderUnitOptions(units, defaultUnit) {
        const options = [];
        for (const unit in units) {
            options.push(tsx("calcite-option", { key: KEY++, label: units[unit], value: unit, selected: unit === defaultUnit }));
        }
        return options;
    }
    _renderSaves() {
        const { _saves, _save } = this;
        const items = [];
        _saves.forEach((save) => {
            (_save && _save._id !== save._id) || !_save
                ? items.push(tsx("calcite-list-item", { key: KEY++, label: save.title, description: save.description, "non-interactive": "" },
                    tsx("calcite-action", { slot: "actions-end", scale: "s", icon: "folder-open", afterCreate: (action) => {
                            action.addEventListener('click', this._confirmLoadSave.bind(this, save));
                        } }),
                    tsx("calcite-action", { slot: "actions-end", scale: "s", icon: "trash", afterCreate: (action) => {
                            action.addEventListener('click', this._confirmDeleteSave.bind(this, save));
                        } })))
                : items.push(tsx("calcite-list-item", { key: KEY++, label: save.title, description: save.description, "non-interactive": "" },
                    tsx("calcite-action", { slot: "actions-end", scale: "s", icon: "x", onclick: this._closeSave.bind(this) })));
        });
        return items;
    }
};
__decorate([
    property()
], Markup.prototype, "lengthUnit", void 0);
__decorate([
    property({ aliasOf: 'sketch.pointSymbol' })
], Markup.prototype, "pointSymbol", void 0);
__decorate([
    property({ aliasOf: 'sketch.polylineSymbol' })
], Markup.prototype, "polylineSymbol", void 0);
__decorate([
    property({ aliasOf: 'sketch.polygonSymbol' })
], Markup.prototype, "polygonSymbol", void 0);
__decorate([
    property()
], Markup.prototype, "state", void 0);
__decorate([
    property()
], Markup.prototype, "viewState", void 0);
__decorate([
    property()
], Markup.prototype, "saveViewState", void 0);
__decorate([
    property()
], Markup.prototype, "_selectedFeature", void 0);
__decorate([
    property()
], Markup.prototype, "_selectedMarkup", void 0);
__decorate([
    property()
], Markup.prototype, "_savesDb", void 0);
__decorate([
    property()
], Markup.prototype, "_saves", void 0);
__decorate([
    property()
], Markup.prototype, "_save", void 0);
Markup = __decorate([
    subclass('cov.widgets.Markup')
], Markup);
export default Markup;
/**
 * Edit simple symbols editor widget.
 */
let SymbolEditor = class SymbolEditor extends Widget {
    constructor(properties) {
        super(properties);
    }
    /**
     * Set symbol property with dot notation and value.
     * @param property
     * @param value
     */
    _setProperty(property, value) {
        const { graphic, symbol: originalSymbol } = this;
        // clones symbol
        const symbol = originalSymbol.clone();
        // set the property
        symbol.set({
            [property]: value,
        });
        // set the symbol
        graphic.set({
            symbol: symbol,
        });
        this.emit('set-symbol-property', {
            originalSymbol,
            symbol,
            graphic,
        });
    }
    /**
     * Render widget.
     */
    render() {
        const { symbol } = this;
        // select editor by symbol type
        switch (symbol.type) {
            case 'simple-marker':
                return this._simpleMarkerSymbol(symbol);
            case 'simple-line':
                return this._simpleLineSymbol(symbol);
            case 'simple-fill':
                return this._simpleFillSymbol(symbol);
            case 'text':
                return this._textSymbol(symbol);
            default:
                return tsx("div", null);
        }
    }
    /**
     * Create and wire color picker.
     * @param symbol
     * @param property
     * @param container
     */
    _colorPicker(symbol, property, container) {
        // create color picker
        const colorPicker = new ColorPicker({
            color: symbol.get(property),
            container,
        });
        // set property
        this.own(colorPicker.watch('color', (color) => {
            this._setProperty(property, color);
        }));
    }
    /**
     * Simple marker symbol editor.
     * @param symbol
     */
    _simpleMarkerSymbol(symbol) {
        const { style, size, outline: { width }, } = symbol;
        return (tsx("div", { class: CSS.symbolEditor },
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Color",
                    tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'color') })),
                tsx("calcite-label", null,
                    "Style",
                    tsx("calcite-select", { afterCreate: (calciteSelect) => {
                            calciteSelect.addEventListener('calciteSelectChange', () => {
                                this._setProperty('style', calciteSelect.selectedOption.value);
                            });
                        } },
                        tsx("calcite-option", { selected: style === 'circle', value: "circle" }, "Circle"),
                        tsx("calcite-option", { selected: style === 'square', value: "square" }, "Square"),
                        tsx("calcite-option", { selected: style === 'diamond', value: "diamond" }, "Diamond")))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Size",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('size', calciteSlider.value);
                            });
                        }, min: "6", max: "18", value: size, step: "1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "Small"),
                        tsx("span", null, "Large"))),
                tsx("calcite-label", null,
                    "Outline color",
                    tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'outline.color') }))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Outline width",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('outline.width', calciteSlider.value);
                            });
                        }, min: "1", max: "4", value: width, step: "1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "Thin"),
                        tsx("span", null, "Thick"))),
                tsx("calcite-label", null))));
    }
    /**
     * Simple line symbol editor.
     * @param symbol
     */
    _simpleLineSymbol(symbol) {
        const { style, width } = symbol;
        return (tsx("div", { class: CSS.symbolEditor },
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Color",
                    tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'color') })),
                tsx("calcite-label", null,
                    "Style",
                    tsx("calcite-select", { afterCreate: (calciteSelect) => {
                            calciteSelect.addEventListener('calciteSelectChange', () => {
                                this._setProperty('style', calciteSelect.selectedOption.value);
                            });
                        } },
                        tsx("calcite-option", { selected: style === 'solid', value: "solid" }, "Solid"),
                        tsx("calcite-option", { selected: style === 'dash', value: "dash" }, "Dash"),
                        tsx("calcite-option", { selected: style === 'dot', value: "dot" }, "Dot"),
                        tsx("calcite-option", { selected: style === 'dash-dot', value: "dash-dot" }, "Dash Dot")))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Width",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('width', calciteSlider.value);
                            });
                        }, min: "1", max: "6", value: width, step: "1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "Thin"),
                        tsx("span", null, "Thick"))),
                tsx("calcite-label", null))));
    }
    /**
     * Simple fill symbol editor.
     * @param symbol
     */
    _simpleFillSymbol(symbol) {
        const { outline: { style, width }, color: { a }, } = symbol;
        return (tsx("div", { class: CSS.symbolEditor },
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Line color",
                    tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'outline.color') })),
                tsx("calcite-label", null,
                    "Line style",
                    tsx("calcite-select", { afterCreate: (calciteSelect) => {
                            calciteSelect.addEventListener('calciteSelectChange', () => {
                                this._setProperty('outline.style', calciteSelect.selectedOption.value);
                            });
                        } },
                        tsx("calcite-option", { selected: style === 'solid', value: "solid" }, "Solid"),
                        tsx("calcite-option", { selected: style === 'dash', value: "dash" }, "Dash"),
                        tsx("calcite-option", { selected: style === 'dot', value: "dot" }, "Dot"),
                        tsx("calcite-option", { selected: style === 'dash-dot', value: "dash-dot" }, "Dash Dot")))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Line width",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('outline.width', calciteSlider.value);
                            });
                        }, min: "1", max: "6", value: width, step: "1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "Thin"),
                        tsx("span", null, "Thick"))),
                tsx("calcite-label", null,
                    "Fill color",
                    tsx("div", { afterCreate: (div) => {
                            // custom color picker for fill
                            const colorPicker = new ColorPicker({
                                color: symbol.color,
                                container: div,
                            });
                            colorPicker.watch('color', (color) => {
                                this._setProperty('color.r', color.r);
                                this._setProperty('color.b', color.b);
                                this._setProperty('color.g', color.g);
                            });
                        } }))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Fill opacity",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('color.a', calciteSlider.value);
                            });
                        }, min: "0", max: "1", value: a, step: "0.1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "0%"),
                        tsx("span", null, "50%"),
                        tsx("span", null, "100%"))),
                tsx("calcite-label", null))));
    }
    /**
     * Text symbol editor.
     * @param symbol
     */
    _textSymbol(symbol) {
        return (tsx("div", { class: CSS.symbolEditor },
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Text",
                    tsx("calcite-input", { type: "text", value: symbol.text, afterCreate: (calciteInput) => {
                            calciteInput.addEventListener('calciteInputInput', () => {
                                this._setProperty('text', calciteInput.value || 'New Text');
                            });
                        } })),
                tsx("calcite-label", null,
                    "Size",
                    tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                            calciteSlider.addEventListener('calciteSliderInput', () => {
                                this._setProperty('font.size', calciteSlider.value);
                            });
                        }, min: "10", max: "18", value: symbol.font.size, step: "1", snap: "" }),
                    tsx("div", { class: CSS.sliderLabels },
                        tsx("span", null, "Small"),
                        tsx("span", null, "Large")))),
            tsx("div", { class: CSS.editorRow },
                tsx("calcite-label", null,
                    "Color",
                    tsx("div", { afterCreate: (div) => {
                            const colorPicker = new ColorPicker({
                                color: symbol.color,
                                container: div,
                            });
                            colorPicker.watch('color', (color) => {
                                this._setProperty('color', color);
                            });
                        } })),
                tsx("calcite-label", null,
                    "Halo color",
                    tsx("div", { afterCreate: (div) => {
                            const colorPicker = new ColorPicker({
                                color: symbol.haloColor,
                                container: div,
                            });
                            colorPicker.watch('color', (color) => {
                                this._setProperty('haloColor', color);
                            });
                        } })))));
    }
};
__decorate([
    property({ aliasOf: 'graphic.symbol' })
], SymbolEditor.prototype, "symbol", void 0);
SymbolEditor = __decorate([
    subclass('SymbolEditor')
], SymbolEditor);
let ColorPicker = class ColorPicker extends Widget {
    constructor(properties) {
        super(properties);
        /**
         * Available colors.
         * arcgis `Candy Shop` plus black, white and grey
         */
        this.colors = {
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
    }
    render() {
        return tsx("div", { class: CSS.colorPicker }, this._renderColorTiles());
    }
    _renderColorTiles() {
        const { colors } = this;
        const tiles = [];
        for (const color in colors) {
            const [r, g, b] = colors[color];
            const selected = this.color && r === this.r && g === this.g && b === this.b;
            tiles.push(tsx("div", { class: this.classes(CSS.colorPickerColor, selected ? CSS.colorPickerColorSelected : ''), style: `background-color: rgba(${r}, ${g}, ${b}, 1);`, afterCreate: (div) => {
                    div.addEventListener('click', () => {
                        this.color = new Color({ r, g, b });
                    });
                } }));
        }
        return tiles;
    }
};
__decorate([
    property()
], ColorPicker.prototype, "color", void 0);
__decorate([
    property({ aliasOf: 'color.r' })
], ColorPicker.prototype, "r", void 0);
__decorate([
    property({ aliasOf: 'color.g' })
], ColorPicker.prototype, "g", void 0);
__decorate([
    property({ aliasOf: 'color.b' })
], ColorPicker.prototype, "b", void 0);
__decorate([
    property({ aliasOf: 'color.a' })
], ColorPicker.prototype, "a", void 0);
ColorPicker = __decorate([
    subclass('ColorPicker')
], ColorPicker);
