import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
const CSS = {
    base: 'water-meters',
    content: 'water-meters_content',
    searchInput: 'water-meters_search-input',
    table: 'esri-widget__table',
};
let KEY = 0;
let PRINT_COUNT = 0;
let WaterMeters = class WaterMeters extends Widget {
    constructor(properties) {
        super(properties);
        this._printViewModel = new PrintViewModel();
        this.state = 'search';
        this._searchViewModel = new SearchViewModel({
            includeDefaultSources: false,
        });
        this._searchAbortController = null;
        this._searchResults = new Collection();
        this._printResults = new Collection();
    }
    postInitialize() {
        const { layer, _searchViewModel } = this;
        _searchViewModel.sources.add(new LayerSearchSource({
            layer,
            searchFields: ['wsc_id', 'address'],
            outFields: ['*'],
            maxSuggestions: 6,
            suggestionTemplate: '{wsc_id} - {address}',
        }));
    }
    _createSearch(input) {
        input.addEventListener('calciteInputInput', this._search.bind(this));
    }
    _abortSearch() {
        const { _searchAbortController } = this;
        if (_searchAbortController) {
            _searchAbortController.abort();
            this._searchAbortController = null;
        }
    }
    _search(event) {
        const { _searchViewModel, _searchResults } = this;
        const value = event.target.value;
        this._abortSearch();
        _searchResults.removeAll();
        if (!value)
            return;
        const controller = new AbortController();
        const { signal } = controller;
        this._searchAbortController = controller;
        _searchViewModel
            // @ts-ignore
            .suggest(value, null, { signal })
            .then((response) => {
            if (this._searchAbortController !== controller)
                return;
            this._searchAbortController = null;
            if (!response.numResults)
                return;
            response.results[response.activeSourceIndex].results.forEach((result) => {
                _searchResults.add(tsx("calcite-list-item", { key: KEY++, label: result.text, onclick: this._selectFeature.bind(this, result) }));
            });
        })
            .catch(() => {
            if (this._searchAbortController !== controller)
                return;
            this._searchAbortController = null;
        });
    }
    _selectFeature(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { popup }, _searchViewModel, } = this;
            const feature = (yield _searchViewModel.search(result)).results[0].results[0].feature;
            popup.open({
                features: [feature],
            });
            view.goTo(feature.geometry);
            view.scale = 1200;
        });
    }
    _print() {
        const { _printViewModel, _printResults } = this;
        const index = PRINT_COUNT;
        const label = `Water Meters (${PRINT_COUNT + 1})`;
        _printResults.add(tsx("calcite-value-list-item", { key: KEY++, label: label, description: "Printing..." },
            tsx("calcite-action", { slot: "actions-end", loading: "" })));
        PRINT_COUNT = PRINT_COUNT + 1;
        _printViewModel
            .print(new PrintTemplate({
            format: 'pdf',
            layout: 'letter-ansi-a-landscape',
            layoutOptions: {
                titleText: 'Water Meters',
            },
        }))
            .then((response) => {
            _printResults.splice(index, 1, [
                tsx("calcite-value-list-item", { key: KEY++, label: label },
                    tsx("calcite-action", { slot: "actions-end", icon: "download", onclick: () => {
                            window.open(response.url, '_blank');
                        } })),
            ]);
        })
            .catch((error) => {
            console.log(error);
            _printResults.splice(index, 1, [
                tsx("calcite-value-list-item", { key: KEY++, label: label, description: "Print error" },
                    tsx("calcite-action", { disabled: "", slot: "actions-end", icon: "exclamation-mark-triangle" })),
            ]);
        });
    }
    _labeling(control) {
        const { layer } = this;
        control.addEventListener('calciteSegmentedControlChange', () => {
            const value = control.value;
            const labelClass = layer.labelingInfo[0];
            layer.labelsVisible = value ? true : false;
            if (!value)
                return;
            labelClass.labelExpressionInfo.expression = `$feature.${value}`;
        });
    }
    render() {
        const { state, _searchResults, _printResults } = this;
        return (tsx("calcite-shell-panel", { class: CSS.base, "display-mode": "float" },
            tsx("calcite-panel", { heading: "Water Meters", "width-scale": "m" },
                tsx("calcite-action", { active: state === 'print', icon: "print", slot: "header-actions-end", text: "Print", onclick: () => {
                        this.state = 'print';
                    } },
                    tsx("calcite-tooltip", { label: "Print", placement: "bottom", slot: "tooltip" }, "Print")),
                tsx("calcite-action", { active: state === 'labels', icon: "label", slot: "header-actions-end", text: "Labels", onclick: () => {
                        this.state = 'labels';
                    } },
                    tsx("calcite-tooltip", { label: "Labels", placement: "bottom", slot: "tooltip" }, "Labels")),
                tsx("div", { hidden: state !== 'search' },
                    tsx("calcite-input", { class: CSS.searchInput, placeholder: "Search service id or address", clearable: "", afterCreate: this._createSearch.bind(this) }),
                    tsx("calcite-list", null, _searchResults.toArray())),
                tsx("div", { hidden: state !== 'print' },
                    tsx("div", { class: CSS.content },
                        tsx("span", null,
                            "Position the map to the area you wish to print and click the ",
                            tsx("i", null, "Print Map"),
                            " button to generate a PDF."),
                        tsx("calcite-button", { onclick: this._print.bind(this) }, "Print Map")),
                    tsx("calcite-list", null, _printResults.toArray())),
                tsx("div", { hidden: state !== 'labels' },
                    tsx("div", { class: CSS.content },
                        tsx("calcite-label", null,
                            "Water meter labels",
                            tsx("calcite-segmented-control", { afterCreate: this._labeling.bind(this) },
                                tsx("calcite-segmented-control-item", { value: "" }, "None"),
                                tsx("calcite-segmented-control-item", { checked: "", value: "wsc_id" }, "Service id"),
                                tsx("calcite-segmented-control-item", { value: "address" }, "Address"))))),
                tsx("calcite-button", { hidden: state === 'search', appearance: "outline", slot: state === 'search' ? '' : 'footer-actions', width: "full", onclick: () => {
                        this.state = 'search';
                    } }, "Back"))));
    }
};
__decorate([
    property({ aliasOf: '_printViewModel.view' })
], WaterMeters.prototype, "view", void 0);
__decorate([
    property({ aliasOf: '_printViewModel.printServiceUrl' })
], WaterMeters.prototype, "printServiceUrl", void 0);
__decorate([
    property()
], WaterMeters.prototype, "state", void 0);
WaterMeters = __decorate([
    subclass('WaterMeters')
], WaterMeters);
export default WaterMeters;
export let WaterMeterPopup = class WaterMeterPopup extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('table');
        this._rows = new Collection();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { graphic, layer, objectIdField, _rows } = this;
            const objectId = graphic.attributes[objectIdField];
            const notes = graphic.attributes.Notes;
            const query = yield layer.queryRelatedFeatures({
                relationshipId: 0,
                outFields: ['*'],
                objectIds: [objectId],
            });
            const { WSC_TYPE, ACCT_TYPE, METER_SIZE_T, METER_SN, METER_REG_SN, METER_AGE, LINE_IN_MATERIAL, LINE_IN_SIZE, LINE_OUT_MATERIAL, LINE_OUT_SIZE, } = query[objectId].features[0].attributes;
            _rows.addMany([
                tsx("tr", null,
                    tsx("th", null, "Service type"),
                    tsx("td", null, WSC_TYPE)),
                tsx("tr", null,
                    tsx("th", null, "Account type"),
                    tsx("td", null, ACCT_TYPE)),
                tsx("tr", null,
                    tsx("th", null, "Meter size"),
                    tsx("td", null,
                        METER_SIZE_T,
                        "\"")),
                tsx("tr", null,
                    tsx("th", null, "Serial no."),
                    tsx("td", null, METER_SN)),
                tsx("tr", null,
                    tsx("th", null, "Register no."),
                    tsx("td", null, METER_REG_SN)),
                tsx("tr", null,
                    tsx("th", null, "Meter age"),
                    tsx("td", null,
                        METER_AGE,
                        " years")),
                tsx("tr", null,
                    tsx("th", null, "Size in"),
                    tsx("td", null,
                        LINE_IN_SIZE,
                        "\"")),
                tsx("tr", null,
                    tsx("th", null, "Material in"),
                    tsx("td", null, LINE_IN_MATERIAL)),
                tsx("tr", null,
                    tsx("th", null, "Size out"),
                    tsx("td", null,
                        LINE_OUT_SIZE,
                        "\"")),
                tsx("tr", null,
                    tsx("th", null, "Material out"),
                    tsx("td", null, LINE_OUT_MATERIAL)),
            ]);
            if (notes) {
                _rows.add(tsx("tr", null,
                    tsx("th", null, "Notes"),
                    tsx("td", null, notes)));
            }
        });
    }
    render() {
        const { _rows } = this;
        return tsx("table", { class: CSS.table }, _rows.toArray());
    }
};
__decorate([
    property({ aliasOf: 'graphic.layer' })
], WaterMeterPopup.prototype, "layer", void 0);
__decorate([
    property({ aliasOf: 'graphic.layer.objectIdField' })
], WaterMeterPopup.prototype, "objectIdField", void 0);
WaterMeterPopup = __decorate([
    subclass('WaterMeterPopup')
], WaterMeterPopup);
