import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { imageMediaLayer } from '@vernonia/georeferenced-media/dist/GeoreferencedMedia';
//////////////////////////////////////
// Constants
//////////////////////////////////////
// Styles
const CSS = {
    content: 'padding: 0.75rem;',
    sliderLabels: 'display: flex; flex-flow: row; justify-content: space-between; margin: -1rem 0.35rem 0; font-size: var(--calcite-font-size--2);',
    popup: 'display: flex; flex-flow: row; gap: 0.75rem; width: 100%; padding: 0.75rem;',
};
// Uniqueness
let KEY = 0;
/**
 * A widget for displaying tax map image media layers.
 */
let TaxMaps = class TaxMaps extends Widget {
    //////////////////////////////////////
    // Lifecycle
    //////////////////////////////////////
    constructor(properties) {
        super(properties);
        this.showSwitch = true;
        //////////////////////////////////////
        // Variables
        //////////////////////////////////////
        this._imageLayerInfos = [];
        this._imageLayerInfo = null;
        this._opacity = 0.4;
        this._options = [
            tsx("calcite-option", { key: KEY++, value: "none", selected: "" }, "None"),
        ];
        this._loading = false;
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { popup }, layer, titleAttributeField, fileAttributeField, urlAttributeField, _imageLayerInfos, _options, } = this;
            layer.popupTemplate = new PopupTemplate({
                outFields: ['*'],
                title: `{${titleAttributeField}}`,
                content: (event) => {
                    const container = document.createElement('div');
                    const taxMapPopup = new TaxMapPopup({
                        graphic: event.graphic,
                        container,
                        fileAttributeField,
                        titleAttributeField,
                        urlAttributeField,
                    });
                    taxMapPopup.on('show', (fileName) => {
                        this._show(fileName);
                        popup.close();
                        popup.clear();
                    });
                    return container;
                },
            });
            yield layer.when();
            const query = yield layer.queryFeatures({
                where: '1 = 1',
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: view.spatialReference,
            });
            query.features.sort((a, b) => (a.attributes.name < b.attributes.name ? -1 : 1));
            query.features.forEach((feature) => {
                const { titleAttributeField, fileAttributeField } = this;
                const { attributes } = feature;
                _imageLayerInfos.push({
                    feature,
                    fileName: attributes[fileAttributeField],
                });
                _options.push(tsx("calcite-option", { key: KEY++, value: attributes[fileAttributeField] }, attributes[titleAttributeField]));
            });
            this.scheduleRender();
            this.own(this.watch('_opacity', (opacity) => {
                _imageLayerInfos.forEach((imageLayerInfo) => {
                    const { layer } = imageLayerInfo;
                    if (layer)
                        layer.opacity = opacity;
                });
            }));
        });
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    /**
     * Show selected tax map image media layer.
     * @param value
     */
    _show(value) {
        const { view, _imageLayerInfos } = this;
        this._imageLayerInfo = null;
        _imageLayerInfos.forEach((imageLayerInfo) => {
            const { layer, fileName, feature } = imageLayerInfo;
            if (layer && fileName === value) {
                this._imageLayerInfo = imageLayerInfo;
                layer.visible = true;
                view.goTo(feature);
            }
            else if (!layer && fileName === value) {
                this._loading = true;
                this._load(imageLayerInfo);
            }
            else {
                if (layer)
                    layer.visible = false;
            }
        });
    }
    /**
     * On demand load image media layer.
     * @param imageLayerInfo
     */
    _load(imageLayerInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, imageUrlTemplate, fileAttributeField, titleAttributeField, _opacity } = this;
            const { feature, feature: { attributes }, } = imageLayerInfo;
            const layer = yield imageMediaLayer(imageUrlTemplate.replace(`{${fileAttributeField}}`, attributes[fileAttributeField]), {
                opacity: _opacity,
                title: `Tax Map ${attributes[titleAttributeField]}`,
            });
            imageLayerInfo.layer = layer;
            this._imageLayerInfo = imageLayerInfo;
            view.map.add(layer, 0);
            view.goTo(feature);
            this._loading = false;
        });
    }
    /**
     * Wire select events.
     * @param select
     */
    _selectAfterCreate(select) {
        select.addEventListener('calciteSelectChange', () => {
            this._show(select.selectedOption.value);
        });
        this.own(this.watch('_imageLayerInfo', (_imageLayerInfo) => {
            console.log(_imageLayerInfo, select);
            select.value = !_imageLayerInfo ? 'none' : _imageLayerInfo.fileName;
        }));
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { layer, titleAttributeField, urlAttributeField, showSwitch, _imageLayerInfo, _opacity, _options, _loading } = this;
        return (tsx("calcite-panel", { heading: "Tax Maps" },
            _imageLayerInfo ? (tsx("calcite-button", { appearance: "outline", href: _imageLayerInfo.feature.attributes[urlAttributeField], "icon-start": "file-pdf", slot: "footer-actions", target: "_blank", width: "full" }, `View ${_imageLayerInfo.feature.attributes[titleAttributeField]}`)) : null,
            tsx("div", { style: CSS.content },
                showSwitch ? (tsx("calcite-label", { layout: "inline" },
                    tsx("calcite-switch", { checked: layer.visible, afterCreate: (_switch) => {
                            _switch.addEventListener('calciteSwitchChange', () => {
                                layer.visible = _switch.checked;
                            });
                        } }),
                    "Tax map boundaries")) : null,
                tsx("calcite-label", { style: _imageLayerInfo ? '' : '--calcite-label-margin-bottom: 0;' },
                    "Select tax map",
                    tsx("calcite-select", { disabled: _loading, afterCreate: this._selectAfterCreate.bind(this) }, _options)),
                tsx("calcite-label", { hidden: !_imageLayerInfo, style: "--calcite-label-margin-bottom: 0;" },
                    "Layer opacity",
                    tsx("calcite-slider", { min: "0.2", max: "1", snap: "", step: "0.1", value: _opacity, afterCreate: (slider) => {
                            slider.addEventListener('calciteSliderInput', () => {
                                this._opacity = slider.value;
                            });
                        } }),
                    tsx("div", { style: CSS.sliderLabels },
                        tsx("span", null, "min"),
                        tsx("span", null, "max"))))));
    }
};
__decorate([
    property()
], TaxMaps.prototype, "_imageLayerInfo", void 0);
__decorate([
    property()
], TaxMaps.prototype, "_opacity", void 0);
__decorate([
    property()
], TaxMaps.prototype, "_loading", void 0);
TaxMaps = __decorate([
    subclass('cov.widgets.TaxMaps')
], TaxMaps);
export default TaxMaps;
/**
 * Popup widget for tax map boundaries.
 */
let TaxMapPopup = class TaxMapPopup extends Widget {
    constructor(properties) {
        super(properties);
    }
    render() {
        const { graphic: { attributes }, fileAttributeField, titleAttributeField, urlAttributeField, } = this;
        return (tsx("div", { style: CSS.popup },
            tsx("calcite-button", { "icon-start": "image", width: "full", onclick: () => {
                    this.emit('show', attributes[fileAttributeField]);
                } }, `Show ${attributes[titleAttributeField]}`),
            tsx("calcite-button", { appearance: "outline", href: attributes[urlAttributeField], "icon-start": "file-pdf", target: "_blank", width: "full" }, `View ${attributes[titleAttributeField]}`)));
    }
};
TaxMapPopup = __decorate([
    subclass('TaxMapPopup')
], TaxMapPopup);
