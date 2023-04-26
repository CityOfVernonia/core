import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
let ConfirmLoadModal = class ConfirmLoadModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        document.body.append(this.container);
    }
    render() {
        return (tsx("calcite-modal", { "close-button-disabled": "", "escape-disabled": "", "outside-close-disabled": "", style: "--calcite-modal-width: 340px;" },
            tsx("div", { slot: "header" }, "Load markup"),
            tsx("div", { slot: "content" }, "All current markup graphics will be deleted."),
            tsx("calcite-button", { slot: "secondary", width: "full", appearance: "outline", onclick: () => {
                    this.emit('confirmed', false);
                    this.container.open = false;
                } }, "Cancel"),
            tsx("calcite-button", { slot: "primary", width: "full", onclick: () => {
                    this.emit('confirmed', true);
                    this.container.open = false;
                } }, "Ok")));
    }
};
ConfirmLoadModal = __decorate([
    subclass('cov.widgets.Markup.ConfirmLoadModal')
], ConfirmLoadModal);
export default ConfirmLoadModal;
