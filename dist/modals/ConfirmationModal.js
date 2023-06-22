import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Confirmation modal for confirming actions by the user.
 */
let ConfirmationModal = class ConfirmationModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        this.width = 's';
        this.kind = '';
        this.title = 'Confirm';
        this.message = 'Are you awesome?';
        document.body.append(this.container);
    }
    show() {
        const { container } = this;
        container.open = true;
    }
    _confirmed(confirmed) {
        const { container } = this;
        this.emit('confirmed', confirmed);
        container.open = false;
    }
    render() {
        const { width, kind, title, message } = this;
        return (tsx("calcite-modal", { "disable-close-button": "", "disable-escape": "", "disable-outside-close": "", kind: kind, width: width },
            tsx("div", { slot: "header" }, title),
            tsx("div", { slot: "content" }, message),
            tsx("calcite-button", { slot: "primary", onclick: this._confirmed.bind(this, true) }, "Ok"),
            tsx("calcite-button", { slot: "secondary", appearance: "outline", onclick: this._confirmed.bind(this, false) }, "Cancel")));
    }
};
__decorate([
    property()
], ConfirmationModal.prototype, "width", void 0);
__decorate([
    property()
], ConfirmationModal.prototype, "kind", void 0);
__decorate([
    property()
], ConfirmationModal.prototype, "title", void 0);
__decorate([
    property()
], ConfirmationModal.prototype, "message", void 0);
ConfirmationModal = __decorate([
    subclass('cov.modals.ConfirmationModal')
], ConfirmationModal);
export default ConfirmationModal;
