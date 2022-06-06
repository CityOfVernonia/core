import { __decorate } from "tslib";
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const CSS = {
    base: 'cov-editor__settings',
};
let KEY = 0;
let Settings = class Settings extends Widget {
    constructor(properties) {
        super(properties);
        this._layers = new Collection();
    }
    postInitialize() {
        const { snappingOptions: { featureSources }, } = this;
        featureSources.forEach(this._addFeatureSource.bind(this));
        this.own(featureSources.on('after-add', (event) => {
            this._addFeatureSource(event.item);
        }));
    }
    _addFeatureSource(featureSource) {
        const { _layers } = this;
        const { layer: { title }, enabled, } = featureSource;
        _layers.add(tsx("calcite-label", { key: KEY++, alignment: "end", layout: "inline" },
            tsx("calcite-checkbox", { checked: enabled, afterCreate: (calciteCheckbox) => {
                    calciteCheckbox.addEventListener('calciteCheckboxChange', () => {
                        featureSource.enabled = calciteCheckbox.checked;
                    });
                } }),
            title));
    }
    createSnappingOptionsBlock() {
        return (tsx("calcite-block", { heading: "Snapping options", collapsible: "" },
            tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                "Enabled",
                tsx("calcite-switch", { afterCreate: (calciteSwitch) => {
                        const { enabled } = this;
                        calciteSwitch.checked = enabled;
                        calciteSwitch.addEventListener('calciteSwitchChange', () => {
                            this.enabled = calciteSwitch.checked;
                        });
                    } })),
            tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                "Features",
                tsx("calcite-switch", { afterCreate: (calciteSwitch) => {
                        const { featureEnabled } = this;
                        calciteSwitch.checked = featureEnabled;
                        calciteSwitch.addEventListener('calciteSwitchChange', () => {
                            this.featureEnabled = calciteSwitch.checked;
                        });
                    } })),
            tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                "Guides",
                tsx("calcite-switch", { afterCreate: (calciteSwitch) => {
                        const { selfEnabled } = this;
                        calciteSwitch.checked = selfEnabled;
                        calciteSwitch.addEventListener('calciteSwitchChange', () => {
                            this.selfEnabled = calciteSwitch.checked;
                        });
                    } }))));
    }
    render() {
        const { _layers } = this;
        return (tsx("div", { class: CSS.base },
            this.createSnappingOptionsBlock(),
            tsx("calcite-block", { heading: "Snapping layers", collapsible: "" }, _layers.toArray())));
    }
};
__decorate([
    property()
], Settings.prototype, "snappingOptions", void 0);
__decorate([
    property({
        aliasOf: 'snappingOptions.enabled',
    })
], Settings.prototype, "enabled", void 0);
__decorate([
    property({
        aliasOf: 'snappingOptions.featureEnabled',
    })
], Settings.prototype, "featureEnabled", void 0);
__decorate([
    property({
        aliasOf: 'snappingOptions.selfEnabled',
    })
], Settings.prototype, "selfEnabled", void 0);
Settings = __decorate([
    subclass('Editor.Settings')
], Settings);
export default Settings;
