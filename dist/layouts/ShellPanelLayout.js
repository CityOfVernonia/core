////////////////////////////////////////////
// types
////////////////////////////////////////////
import { __decorate } from "tslib";
////////////////////////////////////////////
// modules
////////////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layout, { CSS } from './Layout';
/**
 * Application layout with shell panel.
 */
let ShellPanelLayout = class ShellPanelLayout extends Layout {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
    }
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { view, header, footer, shellPanel, position } = this;
        return (tsx("calcite-shell", null,
            header ? (tsx("div", { slot: "header", afterCreate: (container) => {
                    header.container = container;
                } })) : null,
            tsx("calcite-shell-panel", { slot: "primary-panel", afterCreate: (container) => {
                    if (!container.position) {
                        container.position = position || 'start';
                    }
                    shellPanel.container = container;
                } }),
            tsx("div", { class: CSS.view, afterCreate: (container) => {
                    view.container = container;
                } }),
            footer ? (tsx("div", { slot: "footer", afterCreate: (container) => {
                    footer.container = container;
                } })) : null));
    }
};
ShellPanelLayout = __decorate([
    subclass('cov.layouts.ShellPanelLayout')
], ShellPanelLayout);
export default ShellPanelLayout;
