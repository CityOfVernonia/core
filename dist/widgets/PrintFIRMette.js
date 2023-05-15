import { __decorate } from "tslib";
import esriRequest from '@arcgis/core/request';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
const CSS = {
    content: 'cov-printfirmette-content',
    switch: 'cov-printfirmette-switch',
    error: 'cov-printfirmette-error',
};
let KEY = 0;
let COUNT = 1;
let PrintFIRMette = class PrintFIRMette extends Widget {
    constructor(properties) {
        super(properties);
        this._printing = false;
        this._listItems = new Collection();
    }
    onShow() {
        const { view } = this;
        this._clickHandle = view.on('click', this._viewClick.bind(this));
    }
    onHide() {
        const { _clickHandle } = this;
        if (_clickHandle)
            _clickHandle.remove();
    }
    _viewClick(event) {
        const { _printing } = this;
        event.stopPropagation();
        if (_printing)
            return;
        this._printing = true;
        this._print(event.mapPoint);
    }
    _print(point) {
        const { _listItems } = this;
        const item = {
            count: COUNT,
            point,
            element: (tsx("calcite-list-item", { key: KEY++, label: `Printing FIRMette`, description: `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}` },
                tsx("calcite-action", { loading: "", slot: "actions-end", icon: "file-pdf", text: "Download" }))),
        };
        _listItems.add(item);
        COUNT = COUNT + 1;
        esriRequest('https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/submitJob', {
            responseType: 'json',
            query: {
                f: 'json',
                FC: JSON.stringify({
                    geometryType: 'esriGeometryPoint',
                    features: [{ geometry: { x: point.x, y: point.y, spatialReference: { wkid: 102100 } } }],
                    sr: { wkid: 102100 },
                }),
                Print_Type: 'FIRMETTE',
                graphic: 'PDF',
                input_lat: 29.877,
                input_lon: -81.2837,
            },
        })
            .then(this._printCheck.bind(this, item))
            .catch((error) => {
            console.log('submit job error', error);
            this._printError(item);
        });
    }
    _printCheck(item, response) {
        const data = response.data;
        if (data.jobStatus === 'esriJobSubmitted' || data.jobStatus === 'esriJobExecuting') {
            esriRequest(`https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${data.jobId}`, {
                responseType: 'json',
                query: {
                    f: 'json',
                },
            })
                .then((response) => {
                setTimeout(this._printCheck.bind(this, item, response), 1000);
            })
                .catch((error) => {
                console.log('check job error', error);
                this._printError(item);
            });
        }
        else if (data.jobStatus === 'esriJobSucceeded') {
            this._printComplete(item, response);
        }
        else {
            console.log('server job error', response);
            this._printError(item);
        }
    }
    _printComplete(item, response) {
        const { _listItems } = this;
        const data = response.data;
        esriRequest(`https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${data.jobId}/${data.results.OutputFile.paramUrl}`, {
            responseType: 'json',
            query: {
                f: 'json',
            },
        })
            .then((response) => {
            _listItems.splice(_listItems.indexOf(item), 1, {
                count: item.count,
                point: item.point,
                element: (tsx("calcite-list-item", { key: KEY++, label: `FIRMette ${item.count}`, description: `${item.point.latitude.toFixed(4)}, ${item.point.longitude.toFixed(4)}` },
                    tsx("calcite-action", { slot: "actions-end", icon: "file-pdf", text: "Download", onclick: () => {
                            window.open(response.data.value.url.replace('http://', 'https://'), '_blank');
                        } },
                        tsx("calcite-tooltip", { "close-on-click": "", slot: "tooltip" }, "Download FIRMette")))),
            });
            this._printing = false;
        })
            .catch((error) => {
            console.log('get job error', error);
            this._printError(item);
        });
    }
    _printError(item) {
        const { _listItems } = this;
        _listItems.splice(_listItems.indexOf(item), 1, {
            count: item.count,
            point: item.point,
            element: (tsx("calcite-list-item", { key: KEY++, label: `FIRMette ${item.count}`, description: "Print error" },
                tsx("calcite-icon", { class: CSS.error, icon: "exclamation-mark-circle", slot: "actions-end" }))),
        });
        this._printing = false;
    }
    render() {
        const { _layerVisible, _listItems } = this;
        return (tsx("calcite-panel", { heading: "Print FIRMette" },
            tsx("div", { class: CSS.content },
                tsx("calcite-notice", { icon: "cursor-click", open: "" },
                    tsx("div", { slot: "message" }, "Click on the map at the location to generate a FIRMette."),
                    tsx("calcite-label", { class: CSS.switch, layout: "inline", slot: "link" },
                        tsx("calcite-switch", { checked: _layerVisible, afterCreate: this._switchAfterCreate.bind(this) }),
                        "Flood hazard layer"))),
            _listItems.length ? (tsx("calcite-list", null, _listItems.toArray().map((item) => {
                return item.element;
            }))) : null));
    }
    _switchAfterCreate(_switch) {
        const { layer } = this;
        _switch.addEventListener('calciteSwitchChange', () => {
            layer.visible = _switch.checked;
        });
    }
};
__decorate([
    property({ aliasOf: 'layer.visible' })
], PrintFIRMette.prototype, "_layerVisible", void 0);
__decorate([
    property()
], PrintFIRMette.prototype, "_printing", void 0);
PrintFIRMette = __decorate([
    subclass('cov.widgets.PrintFIRMette')
], PrintFIRMette);
export default PrintFIRMette;
