import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
let ConfirmVerticesModal = class ConfirmVerticesModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        document.body.append(this.container);
    }
    render() {
        return (tsx("calcite-modal", { "close-button-disabled": "", "escape-disabled": "", "focus-trap-disabled": "", "outside-close-disabled": "", width: "s" },
            tsx("div", { slot: "header" }, "Warning"),
            tsx("div", { slot: "content" }, "The selected geometry has a large number of vertices. Adding the vertices may result in the application becoming unstable or crashing. Continue with adding vertices?"),
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
ConfirmVerticesModal = __decorate([
    subclass('cov.widgets.Markup.ConfirmVerticesModal')
], ConfirmVerticesModal);
export default ConfirmVerticesModal;
