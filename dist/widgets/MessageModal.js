import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const DEFAULTS = {
    width: 300,
    title: 'Message',
    message: 'Are you awesome!',
};
/**
 * Message modal to inform the user user.
 */
let MessageModal = class MessageModal extends Widget {
    constructor() {
        super(...arguments);
        this.active = false;
        this.width = DEFAULTS.width;
        this.title = DEFAULTS.title;
        this.message = DEFAULTS.message;
    }
    show(params) {
        // set properties
        const { width, title, message } = params;
        this.width = width || this.width;
        this.title = title || this.title;
        this.message = message || this.message;
        // open modal
        this.active = true;
    }
    render() {
        const { active, width, title, message } = this;
        return (tsx("calcite-modal", { active: active, width: width, "disable-close-button": "", "disable-escape": "", "disable-outside-close": "" },
            tsx("div", { slot: "header" }, title),
            tsx("div", { slot: "content" }, message),
            tsx("calcite-button", { slot: "primary", onclick: () => {
                    this.active = false;
                } }, "OK")));
    }
};
__decorate([
    property()
], MessageModal.prototype, "active", void 0);
MessageModal = __decorate([
    subclass('cov.widgets.MessageModal')
], MessageModal);
export default MessageModal;
