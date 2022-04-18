import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Color from '@arcgis/core/Color';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { DateTime } from 'luxon';
const CSS = {
    base: 'cov-survey-search',
    content: 'cov-survey-search--content',
    table: 'esri-widget__table',
    th: 'esri-feature__field-header',
    td: 'esri-feature__field-data',
};
// colors for results `Candy Shop`
const COLORS = ['#ed5151', '#149ece', '#a7c636', '#9e559c', '#fc921f', '#ffde3e'];
let KEY = 0;
/**
 * Search surveys related to a tax lot.
 */
let SurveySearch = class SurveySearch extends Widget {
    constructor(properties) {
        super(properties);
        /**
         * View state of widget.
         */
        this.state = 'ready';
        /**
         * Result list items.
         */
        this._results = new Collection();
        /**
         * Graphics layer for result geometry.
         */
        this._graphics = new GraphicsLayer({
            listMode: 'hide',
        });
    }
    postInitialize() {
        const { view: { map }, _graphics, } = this;
        // add graphics layer
        map.add(_graphics);
        // enable search when tax lot is selected feature of popup
        this.own(this.watch(['state', '_visible', '_selectedFeature'], () => {
            const { taxLots, state, _visible, _selectedFeature } = this;
            if (state === 'results' || state === 'searching' || state === 'error')
                return;
            this.state = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
        }));
    }
    /**
     * Convenience on hide method.
     */
    onHide() {
        this._clear();
    }
    /**
     * Clear/reset.
     */
    _clear() {
        const { _results, _graphics } = this;
        _results.removeAll();
        _graphics.removeAll();
        this.state = 'ready';
    }
    /**
     * Search surveys.
     */
    _search() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { spatialReference }, taxLots, taxLots: { objectIdField }, surveys, _selectedFeature, _results, _graphics, } = this;
            // clear
            _results.removeAll();
            _graphics.removeAll();
            this.state = 'searching';
            // query feature
            const featureQuery = yield taxLots.queryFeatures({
                where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
                returnGeometry: true,
                outSpatialReference: spatialReference,
            });
            // feature
            const feature = featureQuery.features[0];
            // handle error
            if (!feature) {
                this.state = 'error';
                return;
            }
            // query surveys
            const featuresQuery = yield surveys.queryFeatures({
                geometry: geodesicBuffer(feature.geometry, 10, 'feet'),
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: spatialReference,
                orderByFields: ['SurveyDate DESC'],
            });
            // features
            const features = featuresQuery.features;
            // handle error
            if (!features) {
                this.state = 'error';
                return;
            }
            // sort by date
            features.sort((a, b) => (a.attributes.SurveyDate > b.attributes.SurveyDate ? -1 : 1));
            // add clear
            _results.add(tsx("calcite-list-item", { key: KEY++, "non-interactive": "" },
                tsx("calcite-action", { slot: "actions-start", scale: "s", text: "Clear", "text-enabled": "", icon: "x", onclick: this._clear.bind(this) })));
            // handle results
            features.forEach((feature) => {
                const { attributes: { SurveyType, SURVEYID, SurveyDate, Subdivisio, SVY_IMAGE }, } = feature;
                // format attributes
                const type = SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase();
                const date = SurveyDate
                    ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT)
                    : 'Unknown date';
                const title = SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;
                const url = `https://gis.columbiacountymaps.com/Surveys/${SVY_IMAGE}`;
                // colors
                const color = new Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
                const fillColor = color.clone();
                fillColor.a = 0;
                // set symbol
                feature.symbol = new SimpleFillSymbol({
                    color: fillColor,
                    outline: {
                        color,
                        style: 'short-dash-dot',
                        width: 2,
                    },
                });
                // set popup template
                feature.popupTemplate = new PopupTemplate({
                    outFields: ['*'],
                    title: (event) => {
                        const { graphic: { attributes: { SurveyType, SURVEYID, Subdivisio }, }, } = event;
                        return SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;
                    },
                    content: (event) => {
                        const popup = new PopupContent({
                            graphic: event.graphic,
                            container: document.createElement('table'),
                        });
                        return popup.container;
                    },
                });
                // add to graphics layer
                _graphics.add(feature);
                // add result item
                _results.add(tsx("calcite-list-item", { key: KEY++, label: title, description: `${type} - ${date}`, "non-interactive": "" },
                    tsx("calcite-action", { slot: "actions-end", icon: "flash", scale: "s", afterCreate: (action) => {
                            action.addEventListener('click', this._flash.bind(this, feature));
                        } }),
                    tsx("calcite-action", { slot: "actions-end", icon: "download", scale: "s", afterCreate: (action) => {
                            action.addEventListener('click', () => {
                                window.open(url, '_blank');
                            });
                        } })));
            });
            // add clear
            _results.add(tsx("calcite-list-item", { key: KEY++, "non-interactive": "" },
                tsx("calcite-action", { slot: "actions-start", scale: "s", text: "Clear", "text-enabled": "", icon: "x", onclick: this._clear.bind(this) })));
            // zoom to features
            view.goTo(_graphics.graphics);
            // set state
            setTimeout(() => {
                this.state = 'results';
            }, 1000);
        });
    }
    /**
     * Flash feature.
     * @param feature
     */
    _flash(feature) {
        const { view } = this;
        // symbols
        const symbol = feature.symbol.clone();
        const flashSymbol = symbol.clone();
        flashSymbol.color.a = 0.25;
        // set flash symbol
        feature.symbol = flashSymbol;
        // zoom to feature
        view.goTo(feature.geometry.extent.expand(1.5));
        // revert to original symbol
        setTimeout(() => {
            feature.symbol = symbol;
        }, 1250);
    }
    /**
     * Render the widget.
     * @returns
     */
    render() {
        const { state, _results } = this;
        return (tsx("calcite-panel", { class: CSS.base, heading: "Survey Search" },
            tsx("div", { class: CSS.content, hidden: state !== 'ready' }, "Select a tax lot in the map to search for related surveys and plats."),
            tsx("div", { class: CSS.content, hidden: state !== 'selected' },
                tsx("calcite-button", { width: "full", onclick: this._search.bind(this) }, "Search")),
            tsx("div", { class: CSS.content, hidden: state !== 'searching' },
                tsx("calcite-progress", { text: "Searching related surveys", type: "indeterminate" })),
            tsx("div", { hidden: state !== 'results' },
                tsx("calcite-list", null, _results.toArray())),
            tsx("div", { class: CSS.content, hidden: state !== 'error' },
                tsx("p", null, "An error occurred searching surveys."),
                tsx("calcite-button", { width: "full", onclick: this._clear.bind(this) }, "Reset"))));
    }
};
__decorate([
    property()
], SurveySearch.prototype, "state", void 0);
__decorate([
    property({
        aliasOf: 'view.popup.visible',
    })
], SurveySearch.prototype, "_visible", void 0);
__decorate([
    property({
        aliasOf: 'view.popup.selectedFeature',
    })
], SurveySearch.prototype, "_selectedFeature", void 0);
SurveySearch = __decorate([
    subclass('cov.widgets.SurveySearch')
], SurveySearch);
export default SurveySearch;
/**
 * Survey popup content.
 */
let PopupContent = class PopupContent extends Widget {
    constructor(properties) {
        super(properties);
    }
    /**
     * Render the widget.
     * @returns
     */
    render() {
        const { graphic: { attributes: { SurveyType, Client, Firm, SurveyDate, SVY_IMAGE }, }, } = this;
        return (tsx("table", { class: CSS.table },
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Type"),
                tsx("td", { class: CSS.td }, SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase())),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Date"),
                tsx("td", { class: CSS.td }, SurveyDate ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT) : 'Unknown date')),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Client"),
                tsx("td", { class: CSS.td }, Client)),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "Surveyor"),
                tsx("td", { class: CSS.td }, Firm)),
            tsx("tr", null,
                tsx("th", { class: CSS.th }, "\u00A0"),
                tsx("td", { class: CSS.td },
                    tsx("calcite-link", { href: `https://gis.columbiacountymaps.com/Surveys/${SVY_IMAGE}`, target: "_blank" }, "Download Survey")))));
    }
};
PopupContent = __decorate([
    subclass('cov.widgets.SurveySearch.PopupContent')
], PopupContent);
