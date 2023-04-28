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
    content: 'cov-survey-search--content',
    contentSearching: 'cov-survey-search--content-searching',
    table: 'esri-widget__table',
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
        this.baseUrl = 'https://cityofvernonia.github.io/vernonia-surveys/surveys/';
        this.state = 'ready';
        this._results = new Collection();
        this._graphics = new GraphicsLayer({ listMode: 'hide' });
    }
    postInitialize() {
        const { view: { map }, _graphics, } = this;
        // add graphics layer
        map.add(_graphics);
        // enable search when tax lot is selected feature of popup
        this.addHandles(this.watch(['state', '_visible', '_selectedFeature'], () => {
            const { taxLots, state, _visible, _selectedFeature } = this;
            if (state === 'results' || state === 'searching' || state === 'error')
                return;
            this.state = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
        }));
    }
    onHide() {
        this._clear();
    }
    _clear() {
        const { _results, _graphics } = this;
        _results.removeAll();
        _graphics.removeAll();
        this.state = 'ready';
    }
    _search() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { popup, spatialReference }, taxLots, taxLots: { objectIdField }, surveys, baseUrl, _selectedFeature, _results, _graphics, } = this;
            _results.removeAll();
            _graphics.removeAll();
            this.state = 'searching';
            const featureQuery = yield taxLots.queryFeatures({
                where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
                returnGeometry: true,
                outSpatialReference: spatialReference,
            });
            const feature = featureQuery.features[0];
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
            // handle results
            features.forEach((feature) => {
                const { attributes: { SurveyType, SURVEYID, SurveyDate, Subdivisio, SVY_IMAGE }, } = feature;
                // format attributes
                const type = SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase();
                const date = SurveyDate
                    ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT)
                    : 'Unknown date';
                const title = SurveyType === 'Subdivision' ? Subdivisio : SURVEYID;
                const url = `${baseUrl}${SVY_IMAGE.replace('.tif', '.pdf')
                    .replace('.tiff', '.pdf')
                    .replace('.jpg', '.pdf')
                    .replace('.jpeg', '.pdf')}`;
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
                            baseUrl,
                            container: document.createElement('table'),
                        });
                        return popup.container;
                    },
                });
                // add to graphics layer
                _graphics.add(feature);
                // add result item
                _results.add(tsx("calcite-list-item", { key: KEY++, label: title, description: `${type} - ${date}`, afterCreate: (listItem) => {
                        listItem.addEventListener('calciteListItemSelect', () => {
                            popup.clear();
                            popup.close();
                            popup.open({
                                features: [feature],
                            });
                            view.goTo(feature);
                        });
                    } },
                    tsx("calcite-action", { slot: "actions-end", icon: "file-pdf", text: "View PDF", afterCreate: (action) => {
                            action.addEventListener('click', () => {
                                window.open(url, '_blank');
                            });
                        } },
                        tsx("calcite-tooltip", { slot: "tooltip" }, "View PDF"))));
            });
            // zoom to features
            view.goTo(_graphics.graphics);
            // set state
            setTimeout(() => {
                this.state = 'results';
            }, 1000);
        });
    }
    render() {
        const { state, _selectedFeature, _results } = this;
        return (tsx("calcite-panel", { heading: "Survey Search" },
            tsx("div", { class: CSS.content, hidden: state !== 'ready' },
                tsx("calcite-notice", { icon: "information", open: "" },
                    tsx("div", { slot: "message" }, "Select a tax lot in the map to search for related surveys and plats."))),
            tsx("div", { class: CSS.content, hidden: state !== 'selected' }, _selectedFeature ? (tsx("calcite-notice", { icon: "search", open: "" },
                tsx("div", { slot: "message" }, _selectedFeature.attributes.TAXLOT_ID),
                tsx("calcite-link", { onclick: this._search.bind(this), slot: "link" }, "Search surveys"))) : null),
            tsx("div", { class: CSS.contentSearching, hidden: state !== 'searching' },
                tsx("calcite-progress", { text: "Searching related surveys", type: "indeterminate" })),
            tsx("div", { hidden: state !== 'results' },
                tsx("calcite-list", null, _results.toArray())),
            tsx("div", { class: CSS.content, hidden: state !== 'error' },
                tsx("calcite-notice", { icon: "exclamation-mark-circle", kind: "danger", open: "" },
                    tsx("div", { slot: "message" }, "An error occurred searching surveys."),
                    tsx("calcite-link", { onclick: this._clear.bind(this), slot: "link" }, "Try again"))),
            tsx("calcite-fab", { hidden: state !== 'results', icon: "x", slot: state === 'results' ? 'fab' : null, text: "Clear", "text-enabled": "", onclick: this._clear.bind(this) })));
    }
};
__decorate([
    property()
], SurveySearch.prototype, "state", void 0);
__decorate([
    property({ aliasOf: 'view.popup.visible' })
], SurveySearch.prototype, "_visible", void 0);
__decorate([
    property({ aliasOf: 'view.popup.selectedFeature' })
], SurveySearch.prototype, "_selectedFeature", void 0);
SurveySearch = __decorate([
    subclass('cov.widgets.SurveySearch')
], SurveySearch);
export default SurveySearch;
let PopupContent = class PopupContent extends Widget {
    constructor(properties) {
        super(properties);
    }
    render() {
        const { graphic: { attributes: { SurveyType, Client, Firm, SurveyDate, SVY_IMAGE }, }, baseUrl, } = this;
        return (tsx("table", { class: CSS.table },
            tsx("tr", null,
                tsx("th", null, "Type"),
                tsx("td", null, SurveyType[0].toUpperCase() + SurveyType.slice(1).toLowerCase())),
            tsx("tr", null,
                tsx("th", null, "Date"),
                tsx("td", null, SurveyDate ? DateTime.fromMillis(SurveyDate).toUTC().toLocaleString(DateTime.DATE_SHORT) : 'Unknown date')),
            tsx("tr", null,
                tsx("th", null, "Client"),
                tsx("td", null, Client)),
            tsx("tr", null,
                tsx("th", null, "Surveyor"),
                tsx("td", null, Firm)),
            tsx("tr", null,
                tsx("th", null, "\u00A0"),
                tsx("td", null,
                    tsx("calcite-link", { href: `${baseUrl}${SVY_IMAGE}`, target: "_blank" }, "View PDF")))));
    }
};
PopupContent = __decorate([
    subclass('PopupContent')
], PopupContent);
