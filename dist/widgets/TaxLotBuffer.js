import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Graphic from '@arcgis/core/Graphic';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import { unparse } from 'papaparse';
import { propertyInfoUrl } from './../support/AssessorURLs';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
const CSS = {
    base: 'cov-tax-lot-buffer',
    content: 'cov-tax-lot-buffer--content',
    innerContent: 'cov-tax-lot-buffer--inner-content',
};
/**
 * Buffer a tax lot.
 */
let TaxLotBuffer = class TaxLotBuffer extends Widget {
    constructor(properties) {
        super(properties);
        this.state = 'ready';
        this._graphics = new GraphicsLayer({
            listMode: 'hide',
        });
        this._bufferSymbol = new SimpleFillSymbol({
            color: [0, 0, 0, 0],
            outline: {
                color: [255, 222, 62],
                width: 2,
                style: 'short-dash',
            },
        });
        this._featureSymbol = new SimpleFillSymbol({
            color: [20, 158, 206, 0.1],
            outline: {
                color: [20, 158, 206],
                width: 1.5,
            },
        });
        this._resultSymbol = new SimpleFillSymbol({
            color: [237, 81, 81, 0.1],
            outline: {
                color: [237, 81, 81],
                width: 1.5,
            },
        });
        this._distance = 0;
        this._id = '';
        this._results = [];
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { map }, _graphics, printServiceUrl, } = this;
            map.add(_graphics);
            const state = this.watch(['state', '_visible', '_selectedFeature'], () => {
                const { state, _visible, _selectedFeature } = this;
                if (state === 'buffered')
                    return;
                this.state = _visible && _selectedFeature ? 'selected' : 'ready';
            });
            this.own(state);
            if (printServiceUrl) {
                this._printer = new PrintViewModel({
                    view,
                    printServiceUrl,
                });
            }
        });
    }
    onHide() {
        this._clear();
    }
    _clear() {
        const { view: { popup }, _graphics, } = this;
        popup.clear();
        popup.close();
        this.state = 'ready';
        _graphics.removeAll();
    }
    _buffer(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { spatialReference }, layer, layer: { objectIdField }, _selectedFeature, _graphics, _bufferSymbol, _featureSymbol, _resultSymbol, } = this;
            event.preventDefault();
            this.state = 'buffering';
            const result = (yield layer.queryFeatures({
                objectIds: [_selectedFeature.attributes[objectIdField]],
                outFields: [objectIdField, 'TAXLOT_ID'],
                returnGeometry: true,
                outSpatialReference: spatialReference,
            }));
            // handle error
            if (!result.features && !result.features[0]) {
                this.state = 'error';
                return;
            }
            const { geometry, attributes } = result.features[0];
            this._distance = parseInt(((_a = event.target.querySelector('calcite-input')) === null || _a === void 0 ? void 0 : _a.value) || '10');
            this._id = attributes.TAXLOT_ID;
            const buffer = geodesicBuffer(geometry, this._distance, 'feet');
            const bufferResults = (yield layer.queryFeatures({
                where: `${objectIdField} <> ${attributes[objectIdField]}`,
                geometry: buffer,
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: spatialReference,
            }));
            // handle error
            if (!bufferResults.features) {
                this.state = 'error';
                return;
            }
            this._results = bufferResults.features;
            bufferResults.features.forEach((graphic) => {
                graphic.symbol = _resultSymbol;
                _graphics.add(graphic);
            });
            _graphics.add(new Graphic({
                geometry,
                symbol: _featureSymbol,
            }));
            _graphics.add(new Graphic({
                geometry: buffer,
                symbol: _bufferSymbol,
            }));
            view.goTo(this._results);
            this.state = 'buffered';
        });
    }
    _download() {
        const { _id, _distance, _results } = this;
        if (!_results.length)
            return;
        const json = _results.map((feature) => {
            const { attributes } = feature;
            // just need one account link in download
            const accounts = attributes.ACCOUNT_IDS.split(',').map((account) => {
                return propertyInfoUrl(account, 2022);
            });
            const result = {
                'Tax Lot': attributes.TAXLOT_ID,
                Owner: attributes.OWNER,
                Address: attributes.ADDRESS,
                Account: accounts[0] || ' ',
            };
            return result;
        });
        const a = document.createElement('a');
        a.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(unparse(json))}`);
        a.setAttribute('download', `${_id}_${_distance}_buffer_results.csv`);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    _print(event) {
        const { _printer, _id, _distance } = this;
        const button = event.target;
        button.loading = true;
        _printer
            .print(new PrintTemplate({
            format: 'pdf',
            layout: 'letter-ansi-a-landscape',
            layoutOptions: {
                titleText: `${_id} ${_distance}' Buffer`,
            },
        }))
            .then((result) => {
            window.open(result.url, '_blank');
            button.loading = false;
        })
            .catch((error) => {
            console.log(error);
            window.alert('A print error occurred.');
            button.loading = false;
        });
    }
    render() {
        const { printServiceUrl, state, _distance, _id, _results } = this;
        return (tsx("calcite-panel", { class: CSS.base, "width-scale": "m", "height-scale": "l", heading: "Tax Lot Buffer" },
            tsx("div", { class: CSS.content },
                tsx("div", { hidden: state !== 'ready' }, "Select a tax lot in the map."),
                tsx("form", { hidden: state !== 'selected', afterCreate: (form) => {
                        form.addEventListener('submit', this._buffer.bind(this));
                    } },
                    tsx("calcite-label", null,
                        "Buffer distance (feet)",
                        tsx("calcite-input", { type: "number", min: "10", max: "5000", step: "10", value: "250", bind: this })),
                    tsx("calcite-button", { type: "submit" }, "Buffer")),
                tsx("div", { class: CSS.innerContent, hidden: state !== 'buffering' },
                    tsx("span", null, "Buffering..."),
                    tsx("calcite-progress", { type: "indeterminate" })),
                tsx("div", { class: CSS.innerContent, hidden: state !== 'buffered' },
                    tsx("span", null,
                        _results.length,
                        " tax lots within ",
                        _distance,
                        " feet of tax lot ",
                        _id,
                        "."),
                    tsx("calcite-button", { width: "full", "icon-start": "file-csv", onclick: this._download.bind(this) }, "Download CSV"),
                    printServiceUrl ? (tsx("calcite-button", { width: "full", "icon-start": "print", onclick: this._print.bind(this) }, "Print Map")) : null,
                    tsx("calcite-button", { appearance: "outline", width: "full", onclick: this._clear.bind(this) }, "Clear")),
                tsx("div", { class: CSS.innerContent, hidden: state !== 'error' },
                    tsx("span", null, "Something went wrong."),
                    tsx("calcite-button", { appearance: "outline", width: "full", onclick: this._clear.bind(this) }, "Try again")))));
    }
};
__decorate([
    property()
], TaxLotBuffer.prototype, "state", void 0);
__decorate([
    property({
        aliasOf: 'view.popup.visible',
    })
], TaxLotBuffer.prototype, "_visible", void 0);
__decorate([
    property({
        aliasOf: 'view.popup.selectedFeature',
    })
], TaxLotBuffer.prototype, "_selectedFeature", void 0);
TaxLotBuffer = __decorate([
    subclass('TaxLotBuffer')
], TaxLotBuffer);
export default TaxLotBuffer;
