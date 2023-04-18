import { __awaiter, __decorate } from "tslib";
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Collection from '@arcgis/core/core/Collection';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';
const CSS = {
    base: 'cov-layers',
    notice: 'cov-layers--notice',
};
let KEY = 0;
let Layers = class Layers extends Widget {
    constructor(properties) {
        super(properties);
        this.state = 'layers';
        this._addLayerItems = new Collection();
    }
    postInitialize() {
        const { addLayerInfos } = this;
        if (!addLayerInfos)
            return;
        addLayerInfos.forEach(this._addLayerInfo.bind(this));
    }
    onHide() {
        this.state = 'layers';
    }
    _addLayerInfo(addLayerInfo, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _addLayerItems } = this;
            // @ts-ignore
            const { id, url, title, snippet } = addLayerInfo;
            let item = tsx("calcite-list-item", { key: KEY++ });
            _addLayerItems.add(item, index);
            const tooltip = (tsx("calcite-tooltip", { "close-on-click": "", label: "Add layer", slot: "tooltip" }, "Add layer"));
            if (id) {
                const portalItem = new PortalItem({
                    id,
                });
                yield portalItem.load();
                item = (tsx("calcite-list-item", { key: KEY++, label: title || portalItem.title, description: snippet || portalItem.snippet },
                    tsx("calcite-action", { slot: "actions-end", icon: "add-layer", scale: "s", text: "Add layer", afterCreate: (action) => {
                            action.addEventListener('click', this._addLayerFromPortalLayerInfo.bind(this, portalItem, action, addLayerInfo, item));
                        } }, tooltip)));
            }
            else if (url) {
                item = (tsx("calcite-list-item", { key: KEY++, label: title, description: snippet },
                    tsx("calcite-action", { slot: "actions-end", icon: "add-layer", scale: "s", text: "Add layer", afterCreate: (action) => {
                            action.addEventListener('click', this._addLayerFromServerLayerInfo.bind(this, url, action, addLayerInfo, item));
                        } }, tooltip)));
            }
            _addLayerItems.splice(index, 1, item);
        });
    }
    _addLayerFromPortalLayerInfo(portalItem, action, addLayerInfo, item) {
        const { view: { map }, _addLayerItems, } = this;
        const { index, layerProperties, add } = addLayerInfo;
        action.loading = true;
        action.disabled = true;
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
            _addLayerItems.remove(item);
        });
    }
    _addLayerFromServerLayerInfo(url, action, addLayerInfo, item) {
        const { view: { map }, _addLayerItems, } = this;
        const { index, layerProperties, add } = addLayerInfo;
        action.loading = true;
        action.disabled = true;
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
            _addLayerItems.remove(item);
        });
    }
    render() {
        const { state, addLayerInfos, _addLayerItems } = this;
        const heading = state === 'layers' ? 'Layers' : state === 'legend' ? 'Legend' : 'Add Layers';
        return (tsx("calcite-panel", { class: CSS.base, heading: heading },
            tsx("calcite-action", { active: state === 'layers', icon: "layers", slot: "header-actions-end", text: "Layers", onclick: () => {
                    this.state = 'layers';
                } },
                tsx("calcite-tooltip", { "close-on-click": "", label: "Layers", placement: "bottom", slot: "tooltip" }, "Layers")),
            tsx("calcite-action", { active: state === 'legend', icon: "legend", slot: "header-actions-end", text: "Legend", onclick: () => {
                    this.state = 'legend';
                } },
                tsx("calcite-tooltip", { "close-on-click": "", label: "Legend", placement: "bottom", slot: "tooltip" }, "Legend")),
            addLayerInfos ? (tsx("calcite-action", { active: state === 'add', icon: "add-layer", slot: "header-actions-end", text: "Add layers", onclick: () => {
                    this.state = 'add';
                } },
                tsx("calcite-tooltip", { "close-on-click": "", label: "Add layers", placement: "bottom", slot: "tooltip" }, "Add layers"))) : null,
            tsx("div", { hidden: state !== 'layers', afterCreate: this._createLayerList.bind(this) }),
            tsx("div", { hidden: state !== 'legend', afterCreate: this._createLegend.bind(this) }),
            addLayerInfos ? (tsx("div", { hidden: state !== 'add' }, _addLayerItems.length ? (tsx("calcite-list", null, _addLayerItems.toArray())) : (tsx("calcite-notice", { class: CSS.notice, icon: "information", open: "" },
                tsx("div", { slot: "message" }, "No layers to add"))))) : null));
    }
    _createLayerList(container) {
        new LayerList({
            view: this.view,
            container,
        });
    }
    _createLegend(container) {
        new Legend({
            view: this.view,
            container,
        });
    }
};
__decorate([
    property()
], Layers.prototype, "state", void 0);
Layers = __decorate([
    subclass('cov.widgets.Layers')
], Layers);
export default Layers;
