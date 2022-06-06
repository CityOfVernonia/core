import { __decorate } from "tslib";
// import { watch } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
// import hljs from 'highlight.js';
const CSS = {
    base: 'cov-editor__geometry-editor',
    buttons: 'cov-editor__geometry-editor--buttons',
};
let GeometryEditor = class GeometryEditor extends Widget {
    constructor(properties) {
        super(properties);
        this.feature = null;
    }
    // private _jsonModal!: HTMLCalciteModalElement;
    // private _jsonContent!: HTMLDivElement;
    render() {
        const { feature } = this;
        if (!feature) {
            return tsx("div", { class: CSS.base }, "No feature.");
        }
        const type = feature.geometry.type;
        return (tsx("div", { class: CSS.base },
            tsx("div", { class: CSS.buttons },
                tsx("calcite-button", { title: "Zoom to", appearance: "transparent", "icon-start": "zoom-to-object", afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'go-to');
                        });
                    } }),
                tsx("calcite-button", { title: "Move", appearance: "transparent", "icon-start": "move", afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'move');
                        });
                    } }),
                tsx("calcite-button", { title: "Edit vertices", appearance: "transparent", "icon-start": "vertex-edit", disabled: type === 'point', afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'reshape');
                        });
                    } }),
                tsx("calcite-button", { title: "Rotate", appearance: "transparent", "icon-start": "rotate", disabled: type === 'point', afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'rotate');
                        });
                    } }),
                tsx("calcite-button", { title: "Scale", appearance: "transparent", "icon-start": "arrow-double-diagonal-1", disabled: type === 'point', afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'scale');
                        });
                    } }),
                tsx("calcite-button", { title: "Delete", appearance: "transparent", color: "red", "icon-start": "trash", afterCreate: (calciteButton) => {
                        calciteButton.addEventListener('click', () => {
                            this.emit('action', 'delete');
                        });
                    } }))));
    }
};
__decorate([
    property()
], GeometryEditor.prototype, "feature", void 0);
GeometryEditor = __decorate([
    subclass('Editor.GeometryEditor')
], GeometryEditor);
export default GeometryEditor;
