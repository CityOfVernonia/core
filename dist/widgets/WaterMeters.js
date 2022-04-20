import { __decorate } from "tslib";
import { whenOnce } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
// popup
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
// search and print
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
const CSS = {
    base: 'cov-water-meters',
    content: 'cov-water-meters--content',
    // popup
    table: 'esri-widget__table',
    th: 'esri-feature__field-header',
    td: 'esri-feature__field-data',
};
let KEY = 0;
let PRINT_COUNT = 1;
/**
 * Popup widget.
 */
let WaterMeterPopup = class WaterMeterPopup extends Widget {
    constructor(properties) {
        super(properties);
        whenOnce(this, 'layer.loaded', () => {
            this.accountDomain = this.layer.getFieldDomain('ACCT_TYPE');
        });
    }
    render() {
        const { graphic, accountDomain } = this;
        const { attributes: { WSC_TYPE, ACCT_TYPE, METER_SIZE_T, METER_SN, METER_REG_SN, METER_AGE }, } = graphic;
        const acctType = accountDomain.codedValues.filter((codedValue) => {
            return codedValue.code === ACCT_TYPE;
        })[0].name;
        return (tsx("table", { class: CSS.table },
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Service Type"),
                tsx("td", { class: CSS.td }, WSC_TYPE)),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Account Type"),
                tsx("td", { class: CSS.td }, acctType)),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Meter Size"),
                tsx("td", { class: CSS.td },
                    METER_SIZE_T,
                    "\"")),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Serial No."),
                tsx("td", { class: CSS.td }, METER_SN)),
            METER_REG_SN ? (tsx("tr", null,
                tsx("th", { class: CSS.th }, "Register No."),
                tsx("td", { class: CSS.td }, METER_REG_SN))) : null,
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Meter Age"),
                tsx("td", { class: CSS.td },
                    METER_AGE,
                    " years"))));
    }
};
__decorate([
    property()
], WaterMeterPopup.prototype, "graphic", void 0);
__decorate([
    property({
        aliasOf: 'graphic.layer',
    })
], WaterMeterPopup.prototype, "layer", void 0);
__decorate([
    property()
], WaterMeterPopup.prototype, "accountDomain", void 0);
WaterMeterPopup = __decorate([
    subclass('WaterMeterPopup')
], WaterMeterPopup);
/**
 * Vernonia water meters widget.
 */
let WaterMeters = class WaterMeters extends Widget {
    constructor(properties) {
        super(properties);
        this.search = new SearchViewModel({
            includeDefaultSources: false,
        });
        this.print = new PrintViewModel();
        this.state = 'search';
        this._controller = null;
        this._searchResults = new Collection();
        this._printResults = new Collection();
        whenOnce(this, 'layer.loaded', () => {
            const { layer, search } = this;
            layer.outFields = ['*'];
            layer.popupEnabled = true;
            layer.popupTemplate = new PopupTemplate({
                outFields: ['*'],
                title: '{WSC_ID} - {ADDRESS}',
                content: [
                    new CustomContent({
                        outFields: ['*'],
                        creator: (evt) => {
                            return new WaterMeterPopup({
                                graphic: evt.graphic,
                            });
                        },
                    }),
                ],
            });
            search.sources.add(new LayerSearchSource({
                layer,
                searchFields: ['WSC_ID', 'ADDRESS'],
                outFields: ['*'],
                maxSuggestions: 6,
                suggestionTemplate: '{WSC_ID} - {ADDRESS}',
            }));
        });
    }
    /**
     * Initialize when layer loaded.
     */
    _init() {
        const { view, layer, search } = this;
        // guarantee outFields
        layer.outFields = ['*'];
        // set extent to layer
        layer
            .queryExtent({
            where: ' 1 = 1',
            outSpatialReference: view.spatialReference,
        })
            .then((extent) => {
            view.goTo(extent).then(() => {
                if (view.scale > 20000)
                    view.scale = 20000;
            });
        });
        // guarantee popup
        layer.popupEnabled = true;
        layer.popupTemplate = new PopupTemplate({
            outFields: ['*'],
            title: '{WSC_ID} - {ADDRESS}',
            content: [
                new CustomContent({
                    outFields: ['*'],
                    creator: (evt) => {
                        return new WaterMeterPopup({
                            graphic: evt.graphic,
                        });
                    },
                }),
            ],
        });
        search.sources.add(new LayerSearchSource({
            layer,
            searchFields: ['WSC_ID', 'ADDRESS'],
            outFields: ['*'],
            maxSuggestions: 6,
            suggestionTemplate: '{WSC_ID} - {ADDRESS}',
        }));
    }
    /**
     * Controller abort;
     */
    _abortSearch() {
        const { _controller } = this;
        if (_controller) {
            _controller.abort();
            this._controller = null;
        }
    }
    /**
     * Search for features.
     * @param evt
     */
    _search(evt) {
        const { search, _searchResults } = this;
        const value = evt.target.value;
        this._abortSearch();
        _searchResults.removeAll();
        if (!value)
            return;
        const controller = new AbortController();
        const { signal } = controller;
        this._controller = controller;
        search
            // @ts-ignore
            .suggest(value, null, { signal })
            .then((response) => {
            if (this._controller !== controller)
                return;
            this._controller = null;
            if (!response.numResults)
                return;
            response.results[response.activeSourceIndex].results.forEach((result) => {
                _searchResults.add(tsx("calcite-list-item", { key: KEY++, label: result.text, onclick: this._selectFeature.bind(this, result) }));
            });
        })
            .catch(() => {
            if (this._controller !== controller)
                return;
            this._controller = null;
        });
    }
    /**
     * Select a feature, set as popup feature and zoom to.
     * @param result
     */
    _selectFeature(result) {
        const { view, view: { popup }, search, } = this;
        search.search(result).then((response) => {
            const feature = response.results[0].results[0].feature;
            popup.open({
                features: [feature],
            });
            view.goTo(feature.geometry);
            view.scale = 1200;
        });
    }
    /**
     * Set labeling to selected attribute.
     * @param evt
     */
    _setLabeling(evt) {
        const { layer } = this;
        const value = evt.target.selectedOption.value;
        const labelClass = layer.labelingInfo[0].clone();
        labelClass.labelExpressionInfo.expression = `if ("${value}" == "METER_REG_SN" && $feature.${value} == null) { return "Non-radio" } else { return $feature.${value} }`;
        layer.labelingInfo = [labelClass];
        if (!layer.labelsVisible)
            layer.labelsVisible = true;
    }
    /**
     * Toggle labels on and off.
     * @param evt
     */
    _toggleLabels(evt) {
        const { layer } = this;
        layer.labelsVisible = evt.target.checked;
    }
    /**
     * Print the map.
     */
    _print() {
        const { print, _printResults } = this;
        const label = `Water Meters (${PRINT_COUNT})`;
        const result = {
            item: (tsx("calcite-value-list-item", { key: KEY++, label: "Printing...", "non-interactive": "" },
                tsx("calcite-action", { slot: "actions-end", icon: "download", disabled: "" }))),
        };
        PRINT_COUNT = PRINT_COUNT + 1;
        _printResults.add(result);
        print
            .print(new PrintTemplate({
            format: 'pdf',
            layout: 'letter-ansi-a-landscape',
            layoutOptions: {
                titleText: 'Water Meters',
            },
        }))
            .then((response) => {
            result.item = (tsx("calcite-value-list-item", { key: KEY++, label: label, "non-interactive": "" },
                tsx("calcite-action", { slot: "actions-end", icon: "download", onclick: () => {
                        window.open(response.url, '_blank');
                    } })));
            this.scheduleRender();
        })
            .catch((error) => {
            console.log(error);
            result.item = (tsx("calcite-value-list-item", { key: KEY++, label: label, description: "Print error", "non-interactive": "" },
                tsx("calcite-action", { slot: "actions-end", icon: "exclamation-mark-triangle", disabled: "" })));
            this.scheduleRender();
        });
    }
    render() {
        const { id, state, layer, _searchResults, _printResults } = this;
        const ids = [0, 1, 2].map((_id) => {
            return `tt_${id}_${_id}`;
        });
        return (tsx("calcite-panel", { class: CSS.base, heading: "Water Meters", "width-scale": "m" },
            tsx("calcite-tooltip-manager", { slot: "header-actions-end", hidden: state === 'search' },
                tsx("calcite-action", { id: ids[0], "text-enabled": "", text: "Back", icon: "chevron-left", onclick: () => {
                        this.state = 'search';
                    } })),
            tsx("calcite-tooltip", { "reference-element": ids[0], placement: "bottom" }, "Back"),
            tsx("calcite-tooltip-manager", { slot: "header-actions-end", hidden: state !== 'search' },
                tsx("calcite-action", { id: ids[1], icon: "print", onclick: () => {
                        this.state = 'print';
                    } })),
            tsx("calcite-tooltip", { "reference-element": ids[1], placement: "bottom" }, "Print"),
            tsx("calcite-tooltip-manager", { slot: "header-actions-end", hidden: state !== 'search' },
                tsx("calcite-action", { id: ids[2], icon: "label", onclick: () => {
                        this.state = 'labels';
                    } })),
            tsx("calcite-tooltip", { "reference-element": ids[2], placement: "bottom" }, "Labels"),
            tsx("div", { hidden: state !== 'search' },
                tsx("div", { class: CSS.content },
                    tsx("calcite-label", null,
                        "Water meter search",
                        tsx("calcite-input", { type: "text", clearable: "", placeholder: "service id or address", afterCreate: (input) => {
                                input.addEventListener('calciteInputInput', this._search.bind(this));
                            } }))),
                tsx("calcite-list", { "selection-follows-focus": "" }, _searchResults.toArray())),
            tsx("div", { hidden: state !== 'print' },
                tsx("div", { class: CSS.content },
                    tsx("p", null,
                        "Position the map to the area you wish to print and click the ",
                        tsx("i", null, "Print Map"),
                        " button to generate a PDF."),
                    tsx("calcite-button", { onclick: this._print.bind(this) }, "Print Map")),
                tsx("calcite-value-list", { "selection-follows-focus": "" }, _printResults.toArray().map((printResult) => {
                    return printResult.item;
                }))),
            tsx("div", { hidden: state !== 'labels' },
                tsx("div", { class: CSS.content },
                    tsx("calcite-label", { layout: "inline" },
                        tsx("calcite-switch", { switched: layer.labelsVisible, afterCreate: (_switch) => {
                                _switch.addEventListener('calciteSwitchChange', this._toggleLabels.bind(this));
                            } }),
                        "Labeling"),
                    tsx("calcite-label", null,
                        "Label field",
                        tsx("calcite-select", { afterCreate: (select) => {
                                select.addEventListener('calciteSelectChange', this._setLabeling.bind(this));
                            } },
                            tsx("calcite-option", { value: "WSC_ID" }, "Service Id"),
                            tsx("calcite-option", { value: "ADDRESS" }, "Address"),
                            tsx("calcite-option", { value: "METER_SN" }, "Serial No."),
                            tsx("calcite-option", { value: "METER_REG_SN" }, "Register No."),
                            tsx("calcite-option", { value: "METER_SIZE_T" }, "Meter Size")))))));
    }
};
__decorate([
    property({
        aliasOf: 'print.view',
    })
], WaterMeters.prototype, "view", void 0);
__decorate([
    property()
], WaterMeters.prototype, "layer", void 0);
__decorate([
    property({
        aliasOf: 'print.printServiceUrl',
    })
], WaterMeters.prototype, "printServiceUrl", void 0);
WaterMeters = __decorate([
    subclass('cov.widgets.WaterMeters')
], WaterMeters);
export default WaterMeters;
