import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const DEFAULTS = {
    width: 300,
    title: 'Confirm',
    message: 'Are you awesome?',
    confirm: () => {
        alert('You are awesome!');
    },
};
/**
 * Confirmation modal for confirming actions by the user.
 */
let ConfirmationModal = class ConfirmationModal extends Widget {
    constructor() {
        super(...arguments);
        this.active = false;
        this.width = DEFAULTS.width;
        this.title = DEFAULTS.title;
        this.message = DEFAULTS.message;
        this.confirm = DEFAULTS.confirm;
    }
    show(params) {
        // set properties
        const { width, title, message, confirm } = params;
        this.width = width || this.width;
        this.title = title || this.title;
        this.message = message || this.message;
        this.confirm = confirm || this.confirm;
        // open modal
        this.active = true;
    }
    _confirm() {
        // call confirm function
        this.confirm();
        // close modal
        this.active = false;
        // reset properties
        const { width, title, message, confirm } = DEFAULTS;
        this.width = width;
        this.title = title;
        this.message = message;
        this.confirm = confirm;
    }
    render() {
        const { active, width, title, message } = this;
        return (tsx("calcite-modal", { active: active, width: width, "disable-close-button": "", "disable-escape": "", "disable-outside-close": "" },
            tsx("div", { slot: "header" }, title),
            tsx("div", { slot: "content" }, message),
            tsx("calcite-button", { slot: "primary", onclick: this._confirm.bind(this) }, "Confirm"),
            tsx("calcite-button", { slot: "secondary", appearance: "outline", onclick: () => {
                    this.active = false;
                } }, "Cancel")));
    }
};
__decorate([
    property()
], ConfirmationModal.prototype, "active", void 0);
ConfirmationModal = __decorate([
    subclass('cov.widgets.ConfirmationModal')
], ConfirmationModal);
export default ConfirmationModal;
