////////////////////////////////////////////
// types
////////////////////////////////////////////
import { __decorate } from "tslib";
////////////////////////////////////////////
// modules
////////////////////////////////////////////
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Loader from '../widgets/Loader';
import Disclaimer from '../widgets/Disclaimer';
import ViewControl from '../widgets/ViewControl';
////////////////////////////////////////////
// classes for all layouts
////////////////////////////////////////////
export const CSS = {
    view: 'cov-layout--view',
    actionBar: 'cov-layout--action-bar',
    // heading
    heading: 'cov-layout--heading',
    headingMenuIcon: 'cov-layout--heading-menu-icon',
    headingIcon: 'cov-layout--heading-icon',
    headingTitle: 'cov-layout--heading-title',
    headingSearch: 'cov-layout--heading-search',
    // menu
    menu: 'cov-layout--heading-menu',
    menuOpen: 'cov-layout--heading-menu-open',
    menuBackground: 'cov-layout--menu-background',
    // action pad panels
    actionPadPanels: 'cov-layout--action-pad-panels',
};
/**
 * A base shell layout class for all layouts.
 * Note: this is just the base layout class. Do not use as a layout widget.
 */
let Layout = class Layout extends Widget {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        ////////////////////////////////////////////
        // properties
        ////////////////////////////////////////////
        this.container = document.createElement('calcite-shell');
        // append container
        document.body.append(this.container);
        const { view, loaderOptions, includeDisclaimer, disclaimerOptions, includeHeading, headingOptions, viewControlOptions, nextBasemap, } = properties;
        // initialize loader
        const loader = new Loader(loaderOptions || {});
        // end and destroy loader when view loaded
        view.when(() => {
            loader.end();
        });
        // initialize disclaimer
        if (includeDisclaimer && !Disclaimer.isAccepted()) {
            new Disclaimer(Object.assign({}, (disclaimerOptions || {})));
        }
        // initialize heading
        if (includeHeading) {
            new Heading(Object.assign(Object.assign({}, (headingOptions ? headingOptions : {})), (headingOptions && headingOptions.searchViewModel ? { view } : {})));
        }
        // clear default zoom
        view.ui.empty('top-left');
        // add view control
        view.ui.add(new ViewControl(Object.assign(Object.assign({}, (viewControlOptions || {})), { 
            // TODO: update ViewControl to handle 3d
            // @ts-ignore
            view, fullscreenElement: document.body })), 'bottom-right');
        // add basemap toggle
        if (nextBasemap) {
            import('@arcgis/core/widgets/BasemapToggle').then((module) => {
                view.ui.add(new module.default({
                    view,
                    nextBasemap,
                }), 'bottom-right');
            });
        }
    }
};
Layout = __decorate([
    subclass('cov.layouts.Layout')
], Layout);
export default Layout;
/**
 * Vernonia style heading widget.
 */
let Heading = class Heading extends Widget {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        ////////////////////////////////////////////
        // properties
        ////////////////////////////////////////////
        this.container = document.createElement('div');
        // append container
        document.body.append(this.container);
        const { title, menuWidget } = properties;
        // initailize menu
        if (menuWidget) {
            this.menu = new Menu({
                title: title || this.title,
                widget: menuWidget,
            });
        }
    }
    ////////////////////////////////////////////
    // private methods
    ////////////////////////////////////////////
    /**
     * Create search widget.
     * @param container
     */
    _createSeach(container) {
        const { searchViewModel, view } = this;
        if (!searchViewModel.view)
            searchViewModel.view = view;
        import('@arcgis/core/widgets/Search').then((module) => {
            new module.default({
                viewModel: searchViewModel,
                container,
            });
        });
    }
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { id, logoUrl, title, searchViewModel, menu } = this;
        const tooltip = `tooltip_${id}`;
        return (tsx("div", { class: CSS.heading },
            menu ? (tsx("calcite-icon", { class: CSS.headingMenuIcon, id: tooltip, icon: "hamburger", afterCreate: (icon) => {
                    icon.addEventListener('click', () => {
                        this.menu.open = true;
                    });
                } })) : null,
            menu ? (tsx("calcite-tooltip", { "reference-element": tooltip, placement: "bottom", "close-on-click": "" }, "Menu")) : null,
            logoUrl ? tsx("img", { class: CSS.headingIcon, src: logoUrl }) : null,
            title ? tsx("div", { class: CSS.headingTitle }, title) : null,
            searchViewModel ? tsx("div", { class: CSS.headingSearch, afterCreate: this._createSeach.bind(this) }) : null));
    }
};
Heading = __decorate([
    subclass('Heading')
], Heading);
/**
 * Menu widget.
 */
let Menu = class Menu extends Widget {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        ////////////////////////////////////////////
        // properties
        ////////////////////////////////////////////
        this.container = document.createElement('div');
        this.title = 'Menu';
        this.open = false;
        // append container
        document.body.append(this.container);
        // close menu on escape keydown
        document.addEventListener('keydown', (event) => {
            if (this.open && event.key === 'Escape')
                this.open = false;
        });
    }
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { id, title, widget, open } = this;
        const tooltip = `tooltip_${id}`;
        return (tsx("div", { class: CSS.menu, hidden: !open },
            tsx("calcite-panel", { class: open ? CSS.menuOpen : '', heading: title },
                tsx("calcite-action", { id: tooltip, slot: "header-actions-end", icon: "x", afterCreate: (action) => {
                        action.addEventListener('click', () => {
                            this.open = false;
                        });
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltip, placement: "bottom", "close-on-click": "" }, "Close"),
                tsx("div", { afterCreate: (container) => {
                        widget.container = container;
                    } })),
            tsx("div", { class: CSS.menuBackground, afterCreate: (div) => {
                    div.addEventListener('click', () => {
                        this.open = false;
                    });
                } })));
    }
};
__decorate([
    property()
], Menu.prototype, "open", void 0);
Menu = __decorate([
    subclass('Menu')
], Menu);
