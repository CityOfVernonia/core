import { __awaiter, __decorate } from "tslib";
//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
    content: 'cov-widgets--survey-search_content',
    contentSearching: 'cov-widgets--survey-search_content-searching',
    table: 'esri-widget__table',
};
let KEY = 0;
/**
 * Search surveys related to a tax lot.
 */
let SurveySearch = class SurveySearch extends Widget {
    //////////////////////////////////////
    // Lifecycle
    //////////////////////////////////////
    constructor(properties) {
        super(properties);
        this._graphics = new GraphicsLayer({ listMode: 'hide' });
        this._results = new Collection();
        this._selectedFeatureSymbol = new SimpleFillSymbol({
            color: [20, 158, 206, 0.5],
            outline: {
                color: [20, 158, 206],
                width: 2,
            },
        });
        this._selectedResult = null;
        this._selectedSymbol = new SimpleFillSymbol({
            color: [255, 222, 62, 0.3],
            outline: {
                color: [255, 222, 62],
                width: 2,
            },
        });
        this._resultSymbol = new SimpleFillSymbol({
            color: [237, 81, 81, 0.05],
            outline: {
                color: [237, 81, 81],
                width: 1,
            },
        });
        this._viewState = 'ready';
    }
    postInitialize() {
        const { view: { map }, _graphics, } = this;
        // add graphics layer
        map.add(_graphics);
        // enable search when tax lot is selected feature of popup
        this.addHandles(this.watch(['_viewState', '_visible', '_selectedFeature'], () => {
            const { taxLots, _viewState, _visible, _selectedFeature } = this;
            if (_viewState === 'results' || _viewState === 'searching' || _viewState === 'info' || _viewState === 'error')
                return;
            this._viewState = _visible && _selectedFeature && _selectedFeature.layer === taxLots ? 'selected' : 'ready';
        }));
    }
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    onHide() {
        this._clear();
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    _clear() {
        const { _results, _graphics } = this;
        _results.removeAll();
        _graphics.removeAll();
        this._selectedResult = null;
        this._viewState = 'ready';
    }
    _search() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, view: { spatialReference }, taxLots, taxLots: { objectIdField }, surveys, _selectedFeature, _selectedFeatureSymbol, _resultSymbol, _results, _graphics, _graphics: { graphics }, } = this;
            _results.removeAll();
            _graphics.removeAll();
            this._viewState = 'searching';
            const featureQuery = yield taxLots.queryFeatures({
                where: `${objectIdField} = ${_selectedFeature.attributes[objectIdField]}`,
                returnGeometry: true,
                outSpatialReference: spatialReference,
            });
            const feature = featureQuery.features[0];
            feature.symbol = _selectedFeatureSymbol.clone();
            graphics.add(feature);
            if (!feature) {
                this._viewState = 'error';
                return;
            }
            // query surveys
            const featuresQuery = yield surveys.queryFeatures({
                geometry: geodesicBuffer(feature.geometry, 10, 'feet'),
                outFields: ['*'],
                returnGeometry: true,
                outSpatialReference: spatialReference,
            });
            // features
            const features = featuresQuery.features;
            // handle error
            if (!features) {
                this._viewState = 'error';
                return;
            }
            view.closePopup();
            // sort by date
            features.sort((a, b) => (a.attributes.Timestamp > b.attributes.Timestamp ? -1 : 1));
            features.forEach((feature) => {
                const { attributes: { Subdivision, SurveyId, SurveyDate, SurveyType, SurveyUrl }, } = feature;
                const title = Subdivision ? Subdivision : SurveyId;
                // set symbol
                feature.symbol = _resultSymbol.clone();
                // add to graphics layer
                _graphics.add(feature);
                // add result item
                _results.add(tsx("calcite-list-item", { key: KEY++, label: title, description: `${SurveyType} - ${SurveyDate}`, afterCreate: (listItem) => {
                        listItem.addEventListener('calciteListItemSelect', this._setSelectedResult.bind(this, feature));
                    } },
                    tsx("calcite-action", { icon: "information", slot: "actions-end", text: "View info", afterCreate: (action) => {
                            action.addEventListener('click', () => {
                                this._infoFeature = feature;
                                this._viewState = 'info';
                            });
                        } },
                        tsx("calcite-tooltip", { "close-on-click": "", placement: "leading", slot: "tooltip" }, "Info")),
                    tsx("calcite-action", { slot: "actions-end", icon: "file-pdf", text: "View PDF", afterCreate: (action) => {
                            action.addEventListener('click', () => {
                                window.open(SurveyUrl, '_blank');
                            });
                        } },
                        tsx("calcite-tooltip", { "close-on-click": "", placement: "leading", slot: "tooltip" }, "View PDF"))));
            });
            // zoom to features
            view.goTo(_graphics.graphics);
            // set state
            setTimeout(() => {
                this._viewState = 'results';
            }, 1000);
        });
    }
    _setSelectedResult(feature) {
        const { _selectedResult, _selectedSymbol, _resultSymbol, _graphics: { graphics }, } = this;
        if (_selectedResult)
            _selectedResult.symbol = _resultSymbol.clone();
        this._selectedResult = feature;
        feature.symbol = _selectedSymbol.clone();
        graphics.reorder(feature, graphics.length - 1);
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { _infoFeature, _viewState, _selectedFeature, _results } = this;
        return (tsx("calcite-panel", { heading: "Survey Search" },
            tsx("div", { class: CSS.content, hidden: _viewState !== 'ready' },
                tsx("calcite-notice", { icon: "cursor-click", open: "" },
                    tsx("div", { slot: "message" }, "Select a tax lot in the map to search for related surveys and plats."))),
            tsx("div", { class: CSS.content, hidden: _viewState !== 'selected' }, _selectedFeature ? (tsx("calcite-notice", { icon: "search", open: "" },
                tsx("div", { slot: "message" },
                    _selectedFeature.attributes.TAXLOT_ID,
                    tsx("br", null),
                    _selectedFeature.attributes.OWNER))) : null),
            tsx("calcite-button", { hidden: _viewState !== 'selected', slot: _viewState === 'selected' ? 'footer' : null, width: "full", onclick: this._search.bind(this) }, "Search Surveys"),
            tsx("div", { class: CSS.contentSearching, hidden: _viewState !== 'searching' },
                tsx("calcite-progress", { text: "Searching related surveys", type: "indeterminate" })),
            tsx("div", { hidden: _viewState !== 'results' },
                tsx("calcite-list", null, _results.toArray())),
            tsx("calcite-button", { appearance: "outline", hidden: _viewState !== 'results', slot: _viewState === 'results' ? 'footer' : null, width: "full", onclick: this._clear.bind(this) }, "Clear"),
            this._renderInfo(),
            tsx("calcite-button", { appearance: "outline", hidden: _viewState !== 'info', slot: _viewState === 'info' ? 'footer' : null, width: "full", onclick: () => {
                    this._viewState = 'results';
                } }, "Back"),
            tsx("calcite-button", { hidden: _viewState !== 'info', slot: _viewState === 'info' ? 'footer' : null, width: "full", onclick: () => {
                    if (_infoFeature)
                        window.open(_infoFeature.attributes.SurveyUrl, '_blank');
                } }, "View PDF"),
            tsx("div", { class: CSS.content, hidden: _viewState !== 'error' },
                tsx("calcite-notice", { icon: "exclamation-mark-circle", kind: "danger", open: "" },
                    tsx("div", { slot: "message" }, "An error occurred searching surveys."),
                    tsx("calcite-link", { onclick: this._clear.bind(this), slot: "link" }, "Try again")))));
    }
    _renderInfo() {
        const { _infoFeature, _viewState } = this;
        if (!_infoFeature || _viewState !== 'info')
            return null;
        const { SurveyType, SurveyId, SurveyDate, FileDate, Comments, Sheets, Subdivision, Client, Firm } = _infoFeature.attributes;
        this._setSelectedResult(_infoFeature);
        return (tsx("table", { key: KEY++, class: CSS.table },
            tsx("tr", null,
                tsx("th", null, "Id"),
                tsx("td", null, SurveyId)),
            tsx("tr", null,
                tsx("th", null, "Type"),
                tsx("td", null, SurveyType)),
            Subdivision ? (tsx("tr", null,
                tsx("th", null, "Name"),
                tsx("td", null, Subdivision))) : null,
            tsx("tr", null,
                tsx("th", null, "Client"),
                tsx("td", null, Client)),
            tsx("tr", null,
                tsx("th", null, "Firm"),
                tsx("td", null, Firm)),
            tsx("tr", null,
                tsx("th", null, "Date"),
                tsx("td", null, SurveyDate)),
            tsx("tr", null,
                tsx("th", null, "Filed"),
                tsx("td", null, FileDate)),
            tsx("tr", null,
                tsx("th", null, "Comments"),
                tsx("td", null, Comments)),
            tsx("tr", null,
                tsx("th", null, "Pages"),
                tsx("td", null, Sheets))));
    }
};
__decorate([
    property({ aliasOf: 'view.popup.selectedFeature' })
], SurveySearch.prototype, "_selectedFeature", void 0);
__decorate([
    property()
], SurveySearch.prototype, "_selectedResult", void 0);
__decorate([
    property()
], SurveySearch.prototype, "_viewState", void 0);
__decorate([
    property({ aliasOf: 'view.popup.visible' })
], SurveySearch.prototype, "_visible", void 0);
SurveySearch = __decorate([
    subclass('cov.widgets.SurveySearch')
], SurveySearch);
export default SurveySearch;
