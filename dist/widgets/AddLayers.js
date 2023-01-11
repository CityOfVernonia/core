import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';
const CSS = {
    base: 'cov-add-layers-widget',
    content: 'cov-add-layers-widget--content',
    message: 'cov-add-layers-widget--message',
};
let KEY = 0;
let AddLayers = class AddLayers extends Widget {
    constructor(properties) {
        super(properties);
        this.state = 'add';
        this._controller = null;
    }
    postInitialize() {
        const { addLayerInfos, portal } = this;
        if (addLayerInfos) {
            this._addLayersItems = new Collection();
            addLayerInfos.forEach(this._addLayerInfo.bind(this));
        }
        if (portal)
            this._addQueriedLayersItems = new Collection();
        if (portal && !portal.loaded)
            portal.load();
        if (!addLayerInfos && !portal)
            this.state = 'web';
        if (!addLayerInfos && portal)
            this.state = 'search';
    }
    _addLayerInfo(addLayerInfo, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _addLayersItems } = this;
            // @ts-ignore
            const { id, url, title, snippet } = addLayerInfo;
            let item = tsx("calcite-list-item", { key: KEY++ });
            _addLayersItems.add(item, index);
            if (id) {
                const portalItem = new PortalItem({
                    id,
                });
                yield portalItem.load();
                item = (tsx("calcite-list-item", { key: KEY++, label: title || portalItem.title, description: snippet || portalItem.snippet, "non-interactive": "" },
                    tsx("calcite-action", { slot: "actions-end", icon: "add-layer", scale: "s", afterCreate: (action) => {
                            action.addEventListener('click', this._addLayerFromPortalLayerInfo.bind(this, portalItem, action, addLayerInfo, item));
                        } })));
            }
            else if (url) {
                item = (tsx("calcite-list-item", { key: KEY++, label: title, description: snippet, "non-interactive": "" },
                    tsx("calcite-action", { slot: "actions-end", icon: "add-layer", scale: "s", afterCreate: (action) => {
                            action.addEventListener('click', this._addLayerFromServerLayerInfo.bind(this, url, action, addLayerInfo, item));
                        } })));
            }
            _addLayersItems.splice(index, 1, item);
        });
    }
    _addLayerFromPortalLayerInfo(portalItem, action, addLayerInfo, item) {
        const { view: { map }, _addLayersItems, } = this;
        const { index, layerProperties, add } = addLayerInfo;
        action.loading = true;
        Layer.fromPortalItem({
            portalItem,
        }).then((layer) => {
            for (const layerProperty in layerProperties) {
                //@ts-ignore
                layer[layerProperty] = layerProperties[layerProperty];
            }
            map.add(layer, index);
            if (add && typeof add === 'function') {
                add(layer);
            }
            _addLayersItems.remove(item);
        });
    }
    _addLayerFromServerLayerInfo(url, action, addLayerInfo, item) {
        const { view: { map }, _addLayersItems, } = this;
        const { index, layerProperties, add } = addLayerInfo;
        action.loading = true;
        Layer.fromArcGISServerUrl({
            url,
        }).then((layer) => {
            for (const layerProperty in layerProperties) {
                //@ts-ignore
                layer[layerProperty] = layerProperties[layerProperty];
            }
            map.add(layer, index);
            if (add && typeof add === 'function') {
                add(layer);
            }
            _addLayersItems.remove(item);
        });
    }
    _abort() {
        const { _controller } = this;
        if (_controller) {
            _controller.abort();
            this._controller = null;
        }
    }
    _queryLayers(value) {
        const { view: { map: { layers }, }, portal, _addQueriedLayersItems, } = this;
        if (!portal || !_addQueriedLayersItems)
            return;
        const { id } = portal;
        this._abort();
        if (!value) {
            _addQueriedLayersItems.removeAll();
            return;
        }
        const controller = new AbortController();
        const { signal } = controller;
        this._controller = controller;
        const allLayers = `(type:("Feature Collection" OR "Feature Service" OR "Stream Service" OR "WFS" OR "Map Service" OR "WMS" OR "Image Service") -typekeywords:("Table" OR "Hosted" OR "Tiled") -type:("Web Map" OR "Web Mapping Application" OR "Shapefile")) -type:("Code Attachment" OR "Featured Items") -typekeywords:("MapAreaPackage") -type:("Map Area")`;
        const query = `${value} orgid:${id} ${allLayers}`;
        portal
            .queryItems({
            query,
            num: 6,
        }, { signal })
            .then((result) => {
            if (this._controller !== controller)
                return;
            this._controller = null;
            // result collection
            const results = new Collection(result.results);
            // remove any existing items which are not in the results
            _addQueriedLayersItems.forEach((item) => {
                const exists = results.findIndex((portalItem) => {
                    return portalItem.id === item.id;
                });
                if (exists === -1) {
                    _addQueriedLayersItems.remove(item);
                }
            });
            // handle results
            results.forEach((portalItem) => __awaiter(this, void 0, void 0, function* () {
                // serviceable portal item
                yield portalItem.when();
                const { id, title, snippet, url } = portalItem;
                // index
                const exists = _addQueriedLayersItems.findIndex((item) => {
                    return portalItem.id === item.id;
                });
                // check if layer is map by portal id and url
                // maybe redundant...check by url only?
                const inMapPortalId = layers.find((portalLayer) => {
                    if (!portalLayer.portalItem)
                        return false;
                    return portalLayer.portalItem.id === id;
                });
                const inMapUrl = layers.find((portalLayer) => {
                    if (!portalLayer.url)
                        return false;
                    return portalLayer.url === url;
                });
                // add item if it doesn't exist
                if (exists === -1 && !inMapPortalId && !inMapUrl) {
                    const item = {
                        id,
                        element: (tsx("calcite-list-item", { key: KEY++, label: title, description: snippet, "non-interactive": "" },
                            tsx("calcite-action", { slot: "actions-end", icon: "add-layer", scale: "s", afterCreate: (action) => {
                                    action.addEventListener('click', this._addLayerFromPortal.bind(this, portalItem, action, item));
                                } }))),
                    };
                    _addQueriedLayersItems.add(item);
                }
            }));
        })
            .catch((error) => {
            if (this._controller !== controller)
                return;
            this._controller = null;
            console.log(error);
        });
    }
    _addLayerFromPortal(portalItem, action, item) {
        const { view: { map }, _addQueriedLayersItems, } = this;
        action.loading = true;
        Layer.fromPortalItem({
            portalItem,
        }).then((layer) => {
            map.add(layer);
            _addQueriedLayersItems.remove(item);
        });
    }
    _addLayerFromWeb(event) {
        event.preventDefault();
        const { view: { map }, } = this;
        const urlCheck = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);
        const form = event.target;
        const typeSelect = form.querySelector('calcite-select');
        const type = typeSelect.selectedOption.value;
        const urlInput = form.querySelector('calcite-input');
        const url = urlInput.value;
        const errorMessage = form.querySelector('calcite-input-message');
        const button = form.querySelector('calcite-button');
        const loading = () => {
            typeSelect.disabled = true;
            urlInput.disabled = true;
            button.loading = true;
        };
        const loaded = () => {
            typeSelect.disabled = false;
            urlInput.disabled = false;
            button.loading = false;
            urlInput.value = '';
            urlInput.status = 'valid';
            errorMessage.hidden = false;
        };
        const error = (message) => {
            typeSelect.disabled = false;
            urlInput.disabled = false;
            button.loading = false;
            urlInput.status = 'invalid';
            urlInput.setFocus();
            errorMessage.innerHTML = message;
            errorMessage.hidden = true;
        };
        const addKML = (layer) => {
            layer
                .load()
                .then(() => {
                map.add(layer);
                loaded();
            })
                .catch((_error) => {
                console.log(_error);
                error('Invalid KML URL');
            });
        };
        if (!url) {
            error('URL required');
            return;
        }
        if (!url.match(urlCheck)) {
            error('Invalid URL');
            return;
        }
        loading();
        if (type === 'arcgis') {
            Layer.fromArcGISServerUrl({
                url,
            })
                .then((layer) => {
                map.add(layer);
                loaded();
            })
                .catch((_error) => {
                console.log(_error);
                error('Invalid service URL');
            });
        }
        if (type === 'kml') {
            if (!this._kmlLayer) {
                import('@arcgis/core/layers/KMLLayer').then((module) => {
                    this._kmlLayer = module.default;
                    const layer = new this._kmlLayer({
                        url,
                    });
                    addKML(layer);
                });
            }
            else {
                const layer = new this._kmlLayer({
                    url,
                });
                addKML(layer);
            }
        }
    }
    render() {
        const { id, addLayerInfos, portal, state, _addLayersItems, _addQueriedLayersItems } = this;
        const tooltips = [0, 1, 2].map((num) => {
            return `tooltip_${id}_${num}_${KEY++}`;
        });
        return (tsx("calcite-panel", { class: CSS.base, heading: "Add Layers" },
            addLayerInfos ? (tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[0], active: state === 'add', icon: "add-layer", onclick: () => {
                        this.state = 'add';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[0], "overlay-positioning": "fixed", placement: "bottom" }, "Add layers"))) : null,
            portal ? (tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[1], active: state === 'search', icon: "search", onclick: () => {
                        this.state = 'search';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[1], "overlay-positioning": "fixed", placement: "bottom" }, "Search layers"))) : null,
            addLayerInfos || portal ? (tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[2], active: state === 'web', icon: "layer-service", onclick: () => {
                        this.state = 'web';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[2], "overlay-positioning": "fixed", placement: "bottom" }, "Web layers"))) : null,
            addLayerInfos ? (tsx("div", { hidden: state !== 'add' }, _addLayersItems.length ? (tsx("calcite-list", null, _addLayersItems.toArray())) : (tsx("p", { class: CSS.message }, "No layers to add.")))) : null,
            portal ? (tsx("div", { hidden: state !== 'search' },
                tsx("div", { class: CSS.content },
                    tsx("calcite-input", { type: "text", clearable: "", placeholder: "Search by name or keyword", afterCreate: (input) => {
                            input.addEventListener('calciteInputInput', () => {
                                this._queryLayers(input.value);
                            });
                        } })),
                tsx("calcite-list", null, _addQueriedLayersItems
                    .map((item) => {
                    return item.element;
                })
                    .toArray()))) : null,
            tsx("div", { class: CSS.content, hidden: state !== 'web' },
                tsx("form", { afterCreate: (form) => {
                        form.addEventListener('submit', this._addLayerFromWeb.bind(this));
                    } },
                    tsx("calcite-label", null,
                        "Type",
                        tsx("calcite-select", null,
                            tsx("calcite-option", { label: "ArcGIS web service", value: "arcgis" }),
                            tsx("calcite-option", { label: "KML", value: "kml" }))),
                    tsx("calcite-label", null,
                        "URL",
                        tsx("calcite-input", { type: "text", placeholder: "https://<web service url>" }),
                        tsx("calcite-input-message", { icon: "", status: "invalid" })),
                    tsx("calcite-button", { type: "submit" }, "Add")))));
    }
};
__decorate([
    property()
], AddLayers.prototype, "state", void 0);
__decorate([
    property()
], AddLayers.prototype, "_addLayersItems", void 0);
__decorate([
    property()
], AddLayers.prototype, "_addQueriedLayersItems", void 0);
AddLayers = __decorate([
    subclass('cov.widgets.AddLayers')
], AddLayers);
export default AddLayers;
