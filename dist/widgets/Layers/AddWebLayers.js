import { __awaiter, __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layer from '@arcgis/core/layers/Layer';
let AddWebLayers = class AddWebLayers extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        document.body.append(this.container);
    }
    _add(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            const { container, view, view: { map }, } = this;
            const urlCheck = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/);
            const form = event.target;
            const typeSelect = form.querySelector('calcite-select');
            const type = typeSelect.selectedOption.value;
            const urlInput = form.querySelector('calcite-input');
            const url = urlInput.value;
            const errorMessage = form.querySelector('calcite-input-message');
            const button = container.querySelector('calcite-button[type="submit"]');
            const loading = () => {
                typeSelect.disabled = true;
                urlInput.disabled = true;
                button.disabled = true;
            };
            const loaded = (layer) => __awaiter(this, void 0, void 0, function* () {
                map.add(layer);
                container.open = false;
                yield layer.when();
                view.goTo(layer.fullExtent);
                typeSelect.disabled = false;
                urlInput.disabled = false;
                button.disabled = false;
                urlInput.value = '';
                urlInput.status = 'valid';
                errorMessage.hidden = true;
            });
            const error = (message) => {
                typeSelect.disabled = false;
                urlInput.disabled = false;
                button.disabled = false;
                urlInput.status = 'invalid';
                urlInput.setFocus();
                errorMessage.innerHTML = message;
                errorMessage.hidden = false;
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
            switch (type) {
                case 'arcgis':
                    Layer.fromArcGISServerUrl({
                        url,
                    })
                        .then((layer) => {
                        loaded(layer);
                        if (layer.type === 'feature') {
                            layer.popupEnabled = true;
                        }
                        if (layer.type === 'map-image') {
                            layer.sublayers.forEach((sublayer) => {
                                sublayer.popupEnabled = true;
                            });
                        }
                    })
                        .catch((_error) => {
                        console.log(_error);
                        error('Invalid service URL');
                    });
                    break;
                case 'geojson': {
                    const layer = new (yield import('@arcgis/core/layers/GeoJSONLayer')).default({
                        url,
                    });
                    layer
                        .load()
                        .then(() => {
                        loaded(layer);
                        layer.popupEnabled = true;
                    })
                        .catch((_error) => {
                        console.log(_error);
                        error('Invalid GeoJSON URL');
                    });
                    break;
                }
                case 'kml': {
                    const layer = new (yield import('@arcgis/core/layers/KMLLayer')).default({
                        url,
                    });
                    layer
                        .load()
                        .then(() => {
                        loaded(layer);
                    })
                        .catch((_error) => {
                        console.log(_error);
                        error('Invalid KML URL');
                    });
                    break;
                }
            }
        });
    }
    render() {
        const { id } = this;
        const form = `add_web_layers_${id}`;
        return (tsx("calcite-modal", { width: "s" },
            tsx("div", { slot: "header" }, "Add web layers"),
            tsx("div", { slot: "content" },
                tsx("form", { id: form, onsubmit: this._add.bind(this) },
                    tsx("calcite-label", null,
                        "Type",
                        tsx("calcite-select", null,
                            tsx("calcite-option", { label: "ArcGIS web service", value: "arcgis" }),
                            tsx("calcite-option", { label: "GeoJSON", value: "geojson" }),
                            tsx("calcite-option", { label: "KML", value: "kml" }))),
                    tsx("calcite-label", null,
                        "URL",
                        tsx("calcite-input", { type: "text", placeholder: "https://<web service url>" }),
                        tsx("calcite-input-message", { hidden: true, icon: "", status: "invalid" })))),
            tsx("calcite-button", { form: form, slot: "primary", type: "submit", width: "full", onclick: () => {
                    // not sure why `form={form}` isn't working in tsx
                    this.container.querySelector(`#${form}`).dispatchEvent(new Event('submit'));
                } }, "Add Layer"),
            tsx("calcite-button", { appearance: "outline", slot: "secondary", width: "full", onclick: () => {
                    this.container.open = false;
                } }, "Close")));
    }
};
AddWebLayers = __decorate([
    subclass('cov.widgets.Layers.AddWebLayers')
], AddWebLayers);
export default AddWebLayers;
