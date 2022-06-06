import { __awaiter, __decorate } from "tslib";
import Collection from '@arcgis/core/core/Collection';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { renderPreviewHTML } from '@arcgis/core/symbols/support/symbolUtils';
const CSS = {
    base: 'cov-editor__create-feature-selector',
    item: 'cov-editor__create-feature-selector--item',
    symbol: 'cov-editor__create-feature-selector--symbol',
    html: 'cov-editor__create-feature-selector--html',
};
let CreateFeatureSelector = class CreateFeatureSelector extends Widget {
    constructor(properties) {
        super(properties);
        this.title = 'Layer';
        this.selectors = new Collection();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { layer } = this;
            yield layer.when();
            const renderer = layer.renderer;
            switch (renderer.type) {
                case 'simple':
                    this.simpleRenderer(renderer);
                    break;
                case 'unique-value':
                    this.uniqueValueRenderer(renderer);
                    break;
                default:
                    break;
            }
        });
    }
    simpleRenderer(renderer) {
        return __awaiter(this, void 0, void 0, function* () {
            const { layer, selectors } = this;
            const html = yield renderPreviewHTML(renderer.symbol);
            html.classList.add(CSS.html);
            selectors.add(tsx("div", { class: CSS.item, afterCreate: (div) => {
                    div.addEventListener('click', () => {
                        this.emit('create', {
                            layer,
                            template: layer.templates[0],
                        });
                    });
                } },
                tsx("div", { class: CSS.symbol, afterCreate: (div) => {
                        div.append(html);
                    } }),
                tsx("div", null, layer.title)));
        });
    }
    uniqueValueRenderer(renderer) {
        return __awaiter(this, void 0, void 0, function* () {
            const { layer, layer: { types }, selectors, } = this;
            const { uniqueValueInfos } = renderer;
            const _selectors = uniqueValueInfos.map((uniqueValueInfo) => {
                var _a;
                const { label, symbol } = uniqueValueInfo;
                const template = (_a = types.find((featureType) => {
                    return featureType.name === label;
                })) === null || _a === void 0 ? void 0 : _a.templates[0];
                return (tsx("div", { class: CSS.item, afterCreate: (div) => {
                        div.addEventListener('click', () => {
                            this.emit('create', {
                                layer,
                                template,
                            });
                        });
                    } },
                    tsx("div", { class: CSS.symbol, afterCreate: (div) => __awaiter(this, void 0, void 0, function* () {
                            const html = yield renderPreviewHTML(symbol);
                            html.classList.add(CSS.html);
                            div.append(html);
                        }) }),
                    tsx("div", null, label)));
            });
            selectors.add(tsx("div", null, _selectors));
        });
    }
    render() {
        const { title, selectors } = this;
        return (tsx("calcite-block", { heading: title || '', collapsible: "" }, selectors.toArray()));
    }
};
__decorate([
    property({
        aliasOf: 'layer.title',
    })
], CreateFeatureSelector.prototype, "title", void 0);
__decorate([
    property()
], CreateFeatureSelector.prototype, "selectors", void 0);
CreateFeatureSelector = __decorate([
    subclass('Editor.CreateFeatureSelector')
], CreateFeatureSelector);
export default CreateFeatureSelector;
