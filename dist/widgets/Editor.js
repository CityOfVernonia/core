import { __awaiter, __decorate } from "tslib";
import { whenDefinedOnce, whenFalseOnce } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import Graphic from '@arcgis/core/Graphic';
import { getDisplayedSymbol } from '@arcgis/core/symbols/support/symbolUtils';
import { SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol } from '@arcgis/core/symbols';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Settings from './Editor/Settings';
import LayerInfo from './Editor/LayerInfo';
import CreateFeatureSelector from './Editor/CreateFeatureSelector';
import FeatureEditor from './Editor/FeatureEditor';
import DeleteModal from './Editor/DeleteModal';
const CSS = {
    base: 'cov-editor',
    content: 'cov-editor--content',
    contentDefault: 'cov-editor--content--default',
    contentButton: 'cov-editor--content--button',
};
let KEY = 0;
let Editor = class Editor extends Widget {
    //-----------------------------
    //  Lifecycle
    //-----------------------------
    constructor(properties) {
        super(properties);
        this.shellPanel = false;
        this.defaultHeading = 'Editor';
        this.pointFlashSymbol = new SimpleMarkerSymbol({
            color: 'green',
            style: 'circle',
            size: 12,
        });
        this.polylineFlashSymbol = new SimpleLineSymbol({
            color: 'green',
            width: 3,
        });
        this.polygonFlashSymbol = new SimpleFillSymbol({
            color: [0, 255, 0, 0.25],
            outline: {
                color: 'green',
                width: 3,
            },
        });
        //-----------------------------
        //  Properties
        //-----------------------------
        this.state = 'default';
        this.feature = null;
        this.activeLayer = null;
        this.activeTemplate = null;
        this._sketch = new SketchViewModel({
            layer: new GraphicsLayer({
                listMode: 'hide',
            }),
        });
        this._deleteModal = new DeleteModal();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, layerInfos, snappingFeatureSources, _sketch } = this;
            // initialize each layer info
            layerInfos.forEach(this._initializeLayerInfo.bind(this));
            // handle adding/removing layer info
            this.own([
                layerInfos.on('after-add', (response) => __awaiter(this, void 0, void 0, function* () {
                    yield this._initializeLayerInfo(response.item);
                    this._reset();
                })),
                layerInfos.on('after-remove', this._reset.bind(this)),
            ]);
            // initialize click event
            this.createClickEventHandle();
            // init sketch
            _sketch.view = view;
            view.map.add(_sketch.layer);
            _sketch.snappingOptions.enabled = true;
            _sketch.snappingOptions.featureSources.addMany(snappingFeatureSources);
            this.own([
                _sketch.on('create', this.createEventHandler.bind(this)),
                _sketch.on('update', this.updateEventHandler.bind(this)),
            ]);
            // init settings
            this._settings = new Settings({
                snappingOptions: _sketch.snappingOptions,
                container: document.createElement('div'),
            });
        });
    }
    /**
     * Setup layer for editing.
     * @param layerInfo
     */
    _initializeLayerInfo(layerInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, layerInfos, _sketch: { snappingOptions: { featureSources }, }, } = this;
            // replace LayerInfoProperties with LayerInfo instance
            if (!layerInfo.declaredClass) {
                const index = layerInfos.indexOf(layerInfo);
                layerInfo = new LayerInfo(layerInfo);
                layerInfos.splice(index, 1, layerInfo);
            }
            const { layer } = layerInfo;
            yield layer.when();
            // layer view
            view.whenLayerView(layer).then((layerView) => {
                layerInfo.view = layerView;
            });
            const createFeatureSelector = (layerInfo.createFeatureSelector = new CreateFeatureSelector({
                layer,
                container: document.createElement('calcite-block'),
            }));
            this.own(createFeatureSelector.on('create', (createEvent) => {
                this.createFeature(createEvent.layer, createEvent.template);
            }));
            const featureEditor = (layerInfo.featureEditor = new FeatureEditor({
                layer,
                container: document.createElement('div'),
            }));
            whenDefinedOnce(featureEditor, 'geometryEditor', (geometryEditor) => {
                this.own(geometryEditor.on('action', this._geometryEditorEvents.bind(this)));
            });
            // snapping
            featureSources.add(new FeatureSnappingLayerSource({
                // @ts-ignore
                layer,
            }));
            this.scheduleRender();
        });
    }
    /**
     * Reset widget to starting state when `LayerInfo` removed.
     */
    _reset() {
        const { _sketch } = this;
        _sketch.cancel();
        this.state = 'default';
        this.feature = null;
        this.activeLayer = null;
        this.activeTemplate = null;
        this.removeClickEventHandle();
        this.createClickEventHandle();
        this.scheduleRender();
    }
    createClickEventHandle() {
        const { view, layerInfos } = this;
        this._clickEventHandle = view.on('click', (point) => {
            view
                .hitTest(point, {
                include: layerInfos
                    .map((layerInfo) => {
                    return layerInfo.layer;
                })
                    .toArray(),
            })
                .then(this.hitTestHandler.bind(this));
        });
    }
    removeClickEventHandle() {
        const { _clickEventHandle } = this;
        _clickEventHandle.remove();
    }
    hitTestHandler(hitTestResult) {
        const { layerInfos } = this;
        const { results } = hitTestResult;
        this.feature = null;
        layerInfos.forEach((layerInfo) => {
            const { highlight } = layerInfo;
            layerInfo.features = null;
            if (highlight)
                highlight.remove();
        });
        if (!results.length) {
            this.state = 'default';
            return;
        }
        layerInfos.forEach((layerInfo) => {
            const { layer, view } = layerInfo;
            layerInfo.features =
                results
                    .filter((value) => {
                    return value.layer === layer;
                })
                    .map((value) => {
                    return value.graphic;
                }) || null;
            layerInfo.highlight = view.highlight(layerInfo.features);
        });
        if (results.length === 1) {
            this.feature = results[0].graphic;
            this.state = 'feature';
        }
        else if (results.length > 1) {
            this.state = 'features';
            this.scheduleRender();
        }
    }
    /**
     * Handle geometry editor events.
     * @param action
     */
    _geometryEditorEvents(action) {
        const { feature, _deleteModal } = this;
        if (!feature)
            return;
        const type = feature.geometry.type;
        switch (action) {
            case 'move':
                this.updateFeature(type === 'point'
                    ? undefined
                    : {
                        tool: 'move',
                        toggleToolOnClick: false,
                    });
                break;
            case 'reshape':
                this.updateFeature({
                    tool: 'reshape',
                    enableRotation: false,
                    enableScaling: false,
                    toggleToolOnClick: false,
                });
                break;
            case 'rotate':
                this.updateFeature({
                    tool: 'transform',
                    enableScaling: false,
                    toggleToolOnClick: false,
                });
                break;
            case 'scale':
                this.updateFeature({
                    tool: 'transform',
                    enableRotation: false,
                    toggleToolOnClick: false,
                });
                break;
            case 'delete':
                _deleteModal.show(this.deleteFeature.bind(this));
                break;
            case 'go-to':
                this.goTo(feature);
                break;
            default:
                break;
        }
    }
    setFeature(feature) {
        const { layerInfos } = this;
        this.feature = feature;
        this.state = 'feature';
        layerInfos.forEach((layerInfo) => {
            const { layer, view, highlight } = layerInfo;
            if (highlight)
                highlight.remove();
            if (feature.layer === layer)
                layerInfo.highlight = view.highlight(feature);
            layerInfo.features = null;
        });
    }
    createEventHandler(createEvent) {
        const { layerInfos, _sketch, activeLayer, activeTemplate } = this;
        const { graphic, state } = createEvent;
        const layerInfo = layerInfos.find((layerInfo) => {
            return layerInfo.layer === activeLayer;
        });
        const { layer, view, highlight } = layerInfo;
        if (state === 'cancel')
            this.state = 'default';
        // `complete()` called without geometry (point) or polyline/polygon with only one vertex
        if ((state === 'complete' && !graphic) ||
            (state === 'complete' &&
                graphic &&
                graphic.geometry.type === 'polyline' &&
                graphic.geometry.paths[0].length === 1) ||
            (state === 'complete' &&
                graphic &&
                graphic.geometry.type === 'polygon' &&
                graphic.geometry.rings[0].length === 1)) {
            this.state = 'default';
            return;
        }
        if (state === 'complete') {
            this.state = 'creating';
            _sketch.layer.removeAll();
            layer
                .applyEdits({
                addFeatures: [
                    new Graphic(Object.assign({ geometry: graphic.geometry }, activeTemplate === null || activeTemplate === void 0 ? void 0 : activeTemplate.prototype)),
                ],
            })
                .then((results) => __awaiter(this, void 0, void 0, function* () {
                const result = results.addFeatureResults[0];
                if (result.error) {
                    // TODO: error handling
                    this.state = 'default';
                }
                else {
                    yield whenFalseOnce(view, 'updating');
                    if (highlight)
                        highlight.remove();
                    view
                        .queryFeatures({
                        where: `${layer.objectIdField} = ${result.objectId}`,
                        returnGeometry: true,
                    })
                        .then((featureSet) => {
                        this.feature = featureSet.features[0];
                        layerInfo.highlight = view.highlight(this.feature);
                        this.state = 'feature';
                    });
                    this.activeLayer = null;
                }
            }))
                .catch((error) => {
                console.log(error);
                this.state = 'default';
                this.activeLayer = null;
            });
        }
    }
    updateEventHandler(updateEvent) {
        const { feature, layerInfos, _sketch, activeLayer } = this;
        const { graphics, state, aborted } = updateEvent;
        const updateGraphic = graphics[0];
        if (state !== 'active' && state !== 'start')
            this.createClickEventHandle();
        if (!feature || state !== 'complete')
            return;
        const layerInfo = layerInfos.find((layerInfo) => {
            return layerInfo.layer === activeLayer;
        });
        const { layer, view, highlight } = layerInfo;
        const reset = () => {
            layer.refresh();
            view.filter = new FeatureFilter();
            this.state = 'feature';
        };
        this.state = 'updating';
        _sketch.layer.remove(updateGraphic);
        if (aborted) {
            reset();
            return;
        }
        feature.geometry = updateGraphic.geometry;
        layer
            .applyEdits({
            updateFeatures: [feature],
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            reset();
            yield whenFalseOnce(view, 'updating');
            if (highlight)
                highlight.remove();
            view
                .queryFeatures({
                where: `${layer.objectIdField} = ${feature.attributes[layer.objectIdField]}`,
                outFields: ['*'],
                returnGeometry: true,
            })
                .then((featureSet) => __awaiter(this, void 0, void 0, function* () {
                this.state = 'feature';
                this.feature = featureSet.features[0];
                layerInfo.highlight = view.highlight(this.feature);
                layer.refresh();
            }));
        }))
            .catch((error) => {
            console.log(error);
            reset();
        });
    }
    createFeature(layer, template) {
        const { _sketch } = this;
        this.activeLayer = layer;
        this.activeTemplate = template;
        this.state = 'create';
        let tool = this.activeTemplate.drawingTool;
        if (tool === 'line')
            tool = 'polyline';
        _sketch.create(tool);
    }
    updateFeature(updateOptions) {
        const { feature, layerInfos, _sketch } = this;
        if (!feature)
            return;
        this.removeClickEventHandle();
        this.state = 'update';
        const { view, layer, layer: { objectIdField }, } = layerInfos.find((layerInfo) => {
            return layerInfo.layer === feature.layer;
        });
        this.activeLayer = layer;
        view.filter = new FeatureFilter({
            where: `${objectIdField} <> ${feature.attributes[objectIdField]}`,
        });
        getDisplayedSymbol(feature).then((symbol) => {
            const updateGraphic = feature.clone();
            updateGraphic.symbol = symbol;
            _sketch.layer.add(updateGraphic);
            _sketch.update(updateGraphic, updateOptions || {});
        });
    }
    deleteFeature() {
        const { feature, layerInfos } = this;
        if (!feature)
            return;
        const { layer } = layerInfos.find((layerInfo) => {
            return layerInfo.layer === feature.layer;
        });
        this.state = 'deleting';
        layer
            .applyEdits({
            deleteFeatures: [feature],
        })
            .then(() => {
            this.feature = null;
            this.state = 'default';
        })
            .catch((error) => {
            console.log(error);
            this.state = 'feature';
        });
    }
    goTo(target) {
        const { view } = this;
        view.goTo(target);
    }
    flashFeature(feature) {
        const { view: { graphics }, } = this;
        const graphic = new Graphic({
            geometry: feature.geometry,
            symbol: this[`${feature.layer.geometryType}FlashSymbol`],
        });
        graphics.add(graphic);
        setTimeout(() => {
            graphics.remove(graphic);
        }, 1000);
    }
    render() {
        const { shellPanel, defaultHeading, feature, state } = this;
        const heading = state === 'default'
            ? defaultHeading
            : state === 'settings'
                ? 'Settings'
                : state === 'create' || state === 'creating'
                    ? 'New Feature'
                    : state === 'update' || state === 'updating'
                        ? 'Update Feature'
                        : state === 'deleting'
                            ? 'Delete Feature'
                            : state === 'features'
                                ? 'Features'
                                : state === 'feature' && feature
                                    ? `${feature.layer.title} Feature`
                                    : '';
        const panel = (tsx("calcite-panel", { heading: heading, "width-scale": shellPanel !== true ? 'm' : '', "height-scale": shellPanel !== true ? 'l' : '' }, state === 'default'
            ? this.renderDefault()
            : state === 'settings'
                ? this.renderSettings()
                : state === 'create'
                    ? this.renderCreateUpdate()
                    : state === 'creating'
                        ? this.renderProgress('Creating feature.')
                        : state === 'update'
                            ? this.renderCreateUpdate()
                            : state === 'updating'
                                ? this.renderProgress('Updating feature.')
                                : state === 'deleting'
                                    ? this.renderProgress('Deleting feature.')
                                    : state === 'features'
                                        ? this.renderFeatures()
                                        : state === 'feature' && feature
                                            ? this.renderFeature()
                                            : null));
        return shellPanel === true ? (tsx("calcite-shell-panel", { class: CSS.base, "width-scale": "m" }, panel)) : (panel);
    }
    renderDefault() {
        const { layerInfos } = this;
        return (tsx("div", { key: KEY++ },
            tsx("div", { class: CSS.contentDefault },
                tsx("div", null, "Select a feature in the map, or create a new feature by selecting a feature type below."),
                tsx("calcite-button", { title: "Settings", appearance: "transparent", "icon-start": "gear", onclick: () => {
                        this.state = 'settings';
                    } })),
            tsx("div", { afterCreate: (div) => {
                    layerInfos.forEach((layerInfo) => {
                        const { createFeatureSelector } = layerInfo;
                        const parent = createFeatureSelector && createFeatureSelector.container
                            ? createFeatureSelector.container.parentElement
                            : null;
                        if (parent)
                            parent.removeChild(createFeatureSelector.container);
                        if (createFeatureSelector)
                            div.append(createFeatureSelector.container);
                    });
                } })));
    }
    renderSettings() {
        const { _settings } = this;
        return (tsx("div", { key: KEY++ },
            tsx("div", { class: CSS.contentButton },
                tsx("calcite-button", { appearance: "transparent", "icon-start": "chevron-left", onclick: () => {
                        this.state = 'default';
                    } }, "Back")),
            tsx("div", { afterCreate: (div) => {
                    div.append(_settings.container);
                } })));
    }
    renderCreateUpdate() {
        const { _settings } = this;
        return (tsx("div", { key: KEY++ },
            tsx("div", { class: CSS.contentButton },
                tsx("calcite-button", { width: "half", appearance: "outline", onclick: () => {
                        this._sketch.cancel();
                    } }, "Cancel"),
                tsx("calcite-button", { width: "half", appearance: "solid", onclick: () => {
                        this._sketch.complete();
                    } }, "Done")),
            _settings.createSnappingOptionsBlock()));
    }
    renderFeatures() {
        const { layerInfos } = this;
        const items = [];
        layerInfos.forEach((layerInfo) => {
            const { layer: { title, objectIdField }, features, } = layerInfo;
            if (!features)
                return;
            features.forEach((feature) => {
                items.push(tsx("calcite-list-item", { "non-interactive": "", label: `${title} (${feature.attributes[objectIdField]})` },
                    tsx("calcite-action", { slot: "actions-end", icon: "cursor-plus", title: "Select feature", afterCreate: (calciteAction) => {
                            calciteAction.addEventListener('click', this.setFeature.bind(this, feature));
                        } }),
                    tsx("calcite-action", { slot: "actions-end", icon: "flash", title: "Flash feature", afterCreate: (calciteAction) => {
                            calciteAction.addEventListener('click', this.flashFeature.bind(this, feature));
                        } })));
            });
        });
        return (tsx("div", { key: KEY++, class: CSS.content },
            tsx("p", null, "Select a feature."),
            items));
    }
    renderFeature() {
        const { feature, layerInfos } = this;
        if (!feature)
            return null;
        const layer = feature.layer;
        return (tsx("div", { key: KEY++, afterCreate: (div) => {
                const featureEditor = layerInfos.find((layerInfo) => {
                    return layerInfo.layer === layer;
                }).featureEditor;
                featureEditor.feature = feature;
                const parent = featureEditor.container.parentElement;
                if (parent)
                    parent.removeChild(featureEditor.container);
                div.append(featureEditor.container);
            } }));
    }
    renderProgress(message) {
        return (tsx("div", { key: KEY++, class: CSS.content },
            tsx("p", null, message),
            tsx("calcite-progress", { type: "indeterminate" })));
    }
};
__decorate([
    property({
        type: Collection,
    })
], Editor.prototype, "layerInfos", void 0);
__decorate([
    property({
        type: Collection,
    })
], Editor.prototype, "snappingFeatureSources", void 0);
__decorate([
    property()
], Editor.prototype, "state", void 0);
__decorate([
    property()
], Editor.prototype, "feature", void 0);
Editor = __decorate([
    subclass('Editor')
], Editor);
export default Editor;
