import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { taxMapUrl } from './../support/AssessorURLs';
import PopupTemplate from '@arcgis/core/PopupTemplate';
/**
 * View and download tax maps.
 */
let TaxMaps = class TaxMaps extends Widget {
    constructor(properties) {
        super(properties);
        this.state = 'ready';
        this._select = null;
        this._items = {};
        this._id = 9999;
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, layer, imagery, _items } = this;
            layer.popupTemplate = new PopupTemplate({
                title: '{alias}',
                outFields: ['*'],
                content: (event) => {
                    const popup = new TaxMapsPopup({
                        graphic: event.graphic,
                    });
                    this.own(popup.on('action', (event) => {
                        const { _items } = this;
                        const { taxmap, action } = event;
                        if (action === 'show') {
                            for (const item in _items) {
                                if (_items[item].taxmap === taxmap) {
                                    this._id = parseInt(item);
                                    break;
                                }
                            }
                        }
                        else if (action === 'hide') {
                            this._id = 9999;
                        }
                    }));
                    return popup.container;
                },
            });
            layer.popupEnabled = true;
            yield view.when();
            yield layer.when();
            yield imagery.load();
            // this.sublayers = imagery.sublayers.getItemAt(0).sublayers;
            this.sublayers = imagery.sublayers;
            const result = (yield layer.queryFeatures({
                where: '1 = 1',
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: view.spatialReference,
            }));
            if (!result.features) {
                this.state = 'error';
                return;
            }
            const features = result.features;
            const options = [
                tsx("calcite-option", { label: "None", value: "9999", selected: true, afterCreate: this._optionSelected.bind(this) }),
            ];
            features.forEach((graphic) => {
                const { geometry, attributes: { name, taxmap }, } = graphic;
                const sublayer = this.sublayers.find((sublayer) => {
                    return sublayer.title === taxmap;
                });
                options.push(tsx("calcite-option", { label: name, value: `${sublayer.id}`, afterCreate: this._optionSelected.bind(this) }));
                _items[sublayer.id] = {
                    taxmap,
                    sublayer,
                    geometry,
                };
            });
            this._select = (tsx("calcite-select", { afterCreate: (select) => {
                    select.addEventListener('calciteSelectChange', () => {
                        this._id = parseInt(select.selectedOption.value);
                    });
                } }, options));
            const idChange = this.watch('_id', (id) => {
                const { view, sublayers, _items } = this;
                sublayers.forEach((sublayer) => {
                    sublayer.visible = id === sublayer.id;
                });
                if (id === 9999) {
                    this.state = 'ready';
                }
                else {
                    this.state = 'selected';
                    view.goTo(_items[id].geometry);
                }
            });
            this.own(idChange);
        });
    }
    _optionSelected(option) {
        this.own(this.watch('_id', (id) => {
            if (id === parseInt(option.value))
                option.selected = true;
        }));
    }
    _viewTaxMap() {
        const { _items, _id } = this;
        window.open(taxMapUrl(_items[_id].taxmap), '_blank');
    }
    render() {
        const { layer, imagery, state, _select } = this;
        return (tsx("calcite-panel", { heading: "Tax Maps" },
            tsx("div", { style: "margin: 0.75rem;" },
                tsx("div", { hidden: state === 'error' },
                    tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                        "Tax map boundaries",
                        tsx("calcite-switch", { afterCreate: (_switch) => {
                                _switch.checked = layer.visible;
                                _switch.addEventListener('calciteSwitchChange', () => {
                                    layer.visible = _switch.checked;
                                });
                                this.own(this.watch('layer.visible', (visible) => {
                                    _switch.checked = visible;
                                }));
                            } })),
                    tsx("calcite-label", null,
                        "Select tax map",
                        _select)),
                tsx("div", { hidden: state !== 'selected' },
                    tsx("calcite-label", null,
                        "Layer transparency",
                        tsx("calcite-slider", { max: "1", min: "0.2", step: "0.05", afterCreate: (slider) => {
                                slider.value = imagery.opacity;
                                slider.addEventListener('calciteSliderInput', () => {
                                    imagery.opacity = slider.value;
                                });
                            } })),
                    tsx("calcite-button", { appearance: "outline", width: "full", "icon-start": "file-pdf", afterCreate: (button) => {
                            button.addEventListener('click', this._viewTaxMap.bind(this));
                        } }, "View Tax Map")),
                tsx("div", { hidden: state !== 'error' }, "An error ocurred loading tax maps."))));
    }
};
__decorate([
    property()
], TaxMaps.prototype, "state", void 0);
__decorate([
    property()
], TaxMaps.prototype, "_select", void 0);
__decorate([
    property()
], TaxMaps.prototype, "_id", void 0);
TaxMaps = __decorate([
    subclass('cov.widgets.TaxMaps')
], TaxMaps);
export default TaxMaps;
let TaxMapsPopup = class TaxMapsPopup extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('div');
    }
    render() {
        const { graphic: { attributes: { taxmap }, }, } = this;
        return (tsx("div", { style: "display: flex; flex-flow: row; flex-wrap: wrap; gap: 0.75rem;" },
            tsx("calcite-link", { onclick: () => {
                    this.emit('action', {
                        taxmap,
                        action: 'show',
                    });
                } }, "Show Tax Map"),
            tsx("calcite-link", { href: taxMapUrl(taxmap), target: "_blank" }, "View Tax Map"),
            tsx("calcite-link", { onclick: () => {
                    this.emit('action', {
                        taxmap,
                        action: 'hide',
                    });
                } }, "Hide Tax Maps")));
    }
};
TaxMapsPopup = __decorate([
    subclass('cov.widgets.TaxMaps.TaxMapsPopup')
], TaxMapsPopup);
