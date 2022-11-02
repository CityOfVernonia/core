import { __decorate } from "tslib";
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Collection from '@arcgis/core/core/Collection';
const CSS = {
    base: 'cov-layers',
    content: 'cov-layers--content',
};
let KEY = 0;
let Layers = class Layers extends Widget {
    constructor(properties) {
        super(properties);
        this.state = 'layers';
        this._radioButtonGroup = null;
    }
    postInitialize() {
        const { id, basemap, imageryInfos } = this;
        if (!basemap || !imageryInfos)
            return;
        const currentLayer = basemap.baseLayers.getItemAt(0);
        const radioButtons = imageryInfos
            .map((imageryInfo) => {
            const { title, layer } = imageryInfo;
            const checked = currentLayer === layer;
            const _id = `button_${id}_${KEY++}`;
            return (tsx("calcite-label", { for: _id, layout: "inline", afterCreate: this._addImageryChangeEvent.bind(this, layer) },
                tsx("calcite-radio-button", { id: _id, checked: checked }),
                title));
        })
            .toArray();
        this._radioButtonGroup = tsx("calcite-radio-button-group", { layout: "vertical" }, radioButtons);
    }
    _addImageryChangeEvent(layer, label) {
        const { basemap } = this;
        label.addEventListener('click', () => {
            basemap.baseLayers.removeAt(0);
            basemap.baseLayers.add(layer, 0);
        });
    }
    onHide() {
        this.state = 'layers';
    }
    render() {
        const { state, _radioButtonGroup } = this;
        const heading = state === 'layers' ? 'Layers' : state === 'legend' ? 'Legend' : 'Imagery';
        return (tsx("calcite-panel", { class: CSS.base, heading: heading },
            tsx("calcite-action", { active: state === 'layers', icon: "layers", slot: "header-actions-end", text: "Layers", onclick: () => {
                    this.state = 'layers';
                } },
                tsx("calcite-tooltip", { placement: "bottom", slot: "tooltip" }, "Layers")),
            tsx("calcite-action", { active: state === 'legend', icon: "legend", slot: "header-actions-end", text: "Legend", onclick: () => {
                    this.state = 'legend';
                } },
                tsx("calcite-tooltip", { placement: "bottom", slot: "tooltip" }, "Legend")),
            _radioButtonGroup ? (tsx("calcite-action", { active: state === 'imagery', icon: "layer-basemap", slot: "header-actions-end", text: "Imagery", onclick: () => {
                    this.state = 'imagery';
                } },
                tsx("calcite-tooltip", { placement: "bottom", slot: "tooltip" }, "Imagery"))) : null,
            tsx("div", { hidden: state !== 'layers', afterCreate: (container) => {
                    const { view } = this;
                    this.layers = new LayerList({
                        view,
                        container,
                    });
                } }),
            tsx("div", { hidden: state !== 'legend', afterCreate: (container) => {
                    const { view } = this;
                    this.legend = new Legend({
                        view,
                        container,
                    });
                } }),
            _radioButtonGroup ? (tsx("div", { hidden: state !== 'imagery', class: CSS.content },
                tsx("p", null, "Select basemap imagery."),
                _radioButtonGroup)) : null));
    }
};
__decorate([
    property({
        type: Collection,
    })
], Layers.prototype, "imageryInfos", void 0);
__decorate([
    property()
], Layers.prototype, "state", void 0);
__decorate([
    property()
], Layers.prototype, "_radioButtonGroup", void 0);
Layers = __decorate([
    subclass('cov.widgets.Layers')
], Layers);
export default Layers;
