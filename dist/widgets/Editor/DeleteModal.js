import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
let DeleteModal = class DeleteModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        document.body.append(this.container);
    }
    show(onDelete) {
        const { _modal } = this;
        this._delete = onDelete;
        _modal.active = true;
    }
    render() {
        return (tsx("calcite-modal", { width: "350", afterCreate: storeNode.bind(this), "data-node-ref": "_modal" },
            tsx("div", { slot: "header" }, "Delete"),
            tsx("div", { slot: "content" }, "Are you sure you want to delete this item?"),
            tsx("calcite-button", { slot: "primary", afterCreate: (calciteButton) => {
                    calciteButton.addEventListener('click', () => {
                        this._delete();
                        this._modal.active = false;
                    });
                } }, "Yes"),
            tsx("calcite-button", { slot: "secondary", appearance: "outline", afterCreate: (calciteButton) => {
                    calciteButton.addEventListener('click', () => {
                        this._modal.active = false;
                    });
                } }, "No")));
    }
};
__decorate([
    property()
], DeleteModal.prototype, "_delete", void 0);
DeleteModal = __decorate([
    subclass('Editor.DeleteModal')
], DeleteModal);
export default DeleteModal;
