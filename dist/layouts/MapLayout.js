////////////////////////////////////////////
// modules
////////////////////////////////////////////
import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layout, { CSS } from './Layout';
/**
 * Application layout with just a map.
 */
let MapLayout = class MapLayout extends Layout {
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { view, header, footer } = this;
        return (tsx("calcite-shell", null,
            header ? (tsx("div", { slot: "header", afterCreate: (container) => {
                    header.container = container;
                } })) : null,
            tsx("div", { class: CSS.view, afterCreate: (container) => {
                    view.container = container;
                } }),
            footer ? (tsx("div", { slot: "footer", afterCreate: (container) => {
                    footer.container = container;
                } })) : null));
    }
};
MapLayout = __decorate([
    subclass('cov.layouts.MapLayout')
], MapLayout);
export default MapLayout;
