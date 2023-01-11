import { __decorate } from "tslib";
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
const CSS = {
    base: 'cov-editor__attribute-editor',
};
let AttributeEditor = class AttributeEditor extends Widget {
    constructor(properties) {
        super(properties);
    }
    postInitialize() {
        watch(this, 'feature', this._feature.bind(this));
    }
    _feature(feature) {
        if (!feature)
            return;
        const { layer, fields, form } = this;
        const { attributes } = feature;
        if (layer !== feature.layer)
            return;
        this.feature = feature;
        for (const attribute in attributes) {
            const field = fields.find((field) => {
                return field.name === attribute;
            });
            const value = attributes[attribute];
            const control = form.querySelector(`[data-attribute-name="${attribute}"`);
            if (control) {
                // ensure select sets selected value
                if ((field.type === 'small-integer' || field.type === 'integer') &&
                    field.domain &&
                    field.domain.type === 'coded-value') {
                    // must set value before setting selected option
                    control.value = value;
                    const options = control.querySelectorAll('calcite-option');
                    options.forEach((option) => {
                        option.selected = option.value === value;
                    });
                }
                else {
                    control.value = value;
                }
            }
        }
    }
    _updateFeatureAttributes(event) {
        event.preventDefault();
        const { layer, feature, feature: { attributes }, form, notice, } = this;
        if (!feature)
            return;
        this.emit('updating');
        notice.hidden = false;
        this._toggleUpdating(true);
        for (const attribute in attributes) {
            const control = form.querySelector(`[data-attribute-name="${attribute}"`);
            if (control) {
                feature.attributes[attribute] = control.value;
            }
        }
        layer
            .applyEdits({
            updateFeatures: [feature],
        })
            .then((editResults) => {
            const updateResult = editResults.updateFeatureResults[0];
            if (updateResult.error) {
                console.log(updateResult.error);
                notice.hidden = true;
                this.emit('update-error', updateResult.error);
            }
            this.emit('updated');
            this._toggleUpdating(false);
        })
            .catch((error) => {
            console.log(error);
            notice.hidden = true;
            this.emit('update-error', error);
            this._toggleUpdating(false);
        });
    }
    _toggleUpdating(updating) {
        const { form } = this;
        const button = form.querySelector('calcite-button');
        const labels = form.querySelectorAll('calcite-label');
        button.loading = updating;
        labels.forEach((calciteLabel) => {
            // @ts-ignore
            calciteLabel.disabled = updating;
        });
    }
    _createIntegerControl(field) {
        const { name, alias, domain, editable, nullable } = field;
        let input;
        if (domain && domain.type === 'range') {
            input = (tsx("calcite-input", { "data-attribute-name": name, disabled: !editable, required: !nullable, type: "number", step: "1", min: domain.minValue, max: domain.maxValue }));
        }
        else if (domain && domain.type === 'coded-value') {
            input = (tsx("calcite-select", { "data-attribute-name": name, disabled: !editable }, domain.codedValues.map((codedValue) => {
                return tsx("calcite-option", { value: codedValue.code }, codedValue.name);
            })));
        }
        else {
            input = (tsx("calcite-input", { "data-attribute-name": name, disabled: !editable, required: !nullable, type: "number", step: "1" }));
        }
        return (tsx("calcite-label", null,
            alias || name,
            input));
    }
    _createStringControl(field) {
        const { name, alias, domain, editable, length, nullable } = field;
        let input;
        if (domain && domain.type === 'coded-value') {
            input = (tsx("calcite-select", { "data-attribute-name": name, disabled: !editable }, domain.codedValues.map((codedValue) => {
                return tsx("calcite-option", { value: codedValue.code }, codedValue.name);
            })));
        }
        else {
            input = (tsx("calcite-input", { "data-attribute-name": name, disabled: !editable, required: !nullable, type: "text", "max-length": length }));
        }
        return (tsx("calcite-label", null,
            alias || name,
            input));
    }
    _createDateControl(field) {
        const { name, alias, editable, nullable } = field;
        return (tsx("calcite-label", null,
            alias || name,
            tsx("calcite-input", { "data-attribute-name": name, disabled: !editable, required: !nullable, type: "date" })));
    }
    render() {
        const { fields } = this;
        const controls = fields.map((field) => {
            const { type } = field;
            switch (type) {
                case 'integer':
                case 'small-integer':
                    return this._createIntegerControl(field);
                case 'string':
                    return this._createStringControl(field);
                case 'date':
                    return this._createDateControl(field);
                default:
                    return null;
            }
        });
        return (tsx("div", { class: CSS.base },
            tsx("calcite-notice", { color: "red", dismissible: "", scale: "s", afterCreate: storeNode.bind(this), "data-node-ref": "notice" },
                tsx("div", { slot: "message" }, "An error occurred updating the feature.")),
            tsx("form", { afterCreate: (form) => {
                    this.form = form;
                    form.addEventListener('submit', this._updateFeatureAttributes.bind(this));
                } },
                controls,
                tsx("calcite-button", { type: "submit", appearance: "outline" }, "Update"))));
    }
};
__decorate([
    property({
        aliasOf: 'layer.fields',
    })
], AttributeEditor.prototype, "fields", void 0);
__decorate([
    property()
], AttributeEditor.prototype, "feature", void 0);
AttributeEditor = __decorate([
    subclass('Editor.AttributeEditor')
], AttributeEditor);
export default AttributeEditor;
