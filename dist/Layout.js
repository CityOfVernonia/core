import { __awaiter, __decorate } from "tslib";
// common modules
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Loader from './widgets/Loader';
import Disclaimer from './widgets/Disclaimer';
import ViewControl from './widgets/ViewControl';
// styles
const CSS = {
    // application
    base: 'cov-layout',
    view: 'cov-layout--view',
    menu: 'cov-layout--menu',
    menuOpen: 'cov-layout--menu-open',
    menuBackground: 'cov-layout--menu-background',
    // map heading
    mapHeading: 'cov-layout--map-heading',
    mapHeadingTitle: 'cov-layout--map-heading-title',
    mapHeadingLogo: 'cov-layout--map-heading-logo',
    mapHeadingSearch: 'cov-layout--map-heading-search',
    mapHeadingSearchPadding: 'cov-layout--map-heading-search-padding',
    // ui widget selector
    uiSelectorPanels: 'cov-layout--ui-selector-panels',
    uiSelectorRight: 'cov-layout--ui-selector-right',
    uiSelectorLeft: 'cov-layout--ui-selector-left',
    // user control
    userControl: 'cov-layout--user-control',
    userAvatar: 'cov-layout--user-control-avatar',
    userPopup: 'cov-layout--user-control-popup',
    userInfo: 'cov-layout--user-control-info',
    userLinks: 'cov-layout--user-control-links',
};
// uniqueness
let KEY = 0;
/**
 * Layout for City of Vernonia web maps.
 */
let Layout = class Layout extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-shell');
        this.title = 'Web Map';
        this.includeDisclaimer = false;
        this.includeMapHeading = true;
        this.mapHeadingOptions = {};
        // requires decoration
        this._primaryActiveId = null;
        // requires decoration
        this._primaryCollapsed = true;
        // requires decoration
        this._primaryHidden = false;
        // requires decoration
        this._contextualActiveId = null;
        // requires decoration
        this._contextualCollapsed = true;
        // requires decoration
        this._uiActiveId = null;
        /**
         * Menu widgets variables.
         */
        // requires decoration
        this._menuOpen = false;
        document.body.append(this.container);
        const loader = new Loader(properties.loaderOptions || {});
        properties.view.when(() => {
            loader.end();
        });
        if (properties.includeDisclaimer && !Disclaimer.isAccepted()) {
            new Disclaimer(Object.assign({}, (properties.disclaimerOptions || {})));
        }
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, header, includeMapHeading, mapHeadingOptions, viewControlOptions, nextBasemap, primaryShellPanel, primaryWidgets, contextualShellPanel, contextualWidgets, uiWidgets, menuWidgets, } = this;
            // clear default zoom
            view.ui.empty('top-left');
            // menu mode?
            const menuControl = menuWidgets ? true : false;
            //////////////
            // map heading
            //////////////
            if (includeMapHeading) {
                // create map heading
                const mapHeading = new MapHeading(Object.assign(Object.assign({ menuControl }, mapHeadingOptions), { container: document.createElement('div') }));
                // set search view model view
                if (mapHeadingOptions.searchViewModel && !mapHeadingOptions.searchViewModel.view) {
                    mapHeadingOptions.searchViewModel.view = view;
                }
                if (menuControl) {
                    this.own(mapHeading.on('menu', () => {
                        this._menuOpen = true;
                    }));
                    document.addEventListener('keydown', (event) => {
                        if (this._menuOpen && event.key === 'Escape')
                            this._menuOpen = false;
                    });
                }
                view.ui.add(mapHeading, 'top-left');
            }
            if (header && header.on && typeof header.on === 'function') {
                this.own(header.on('menu', () => {
                    this._menuOpen = true;
                }));
            }
            ///////////////////
            // add view control
            ///////////////////
            view.ui.add(new ViewControl(Object.assign(Object.assign({}, (viewControlOptions || {})), { view, fullscreenElement: document.body })), 'bottom-right');
            /////////////////////
            // add basemap toggle
            ////////////////////
            if (nextBasemap) {
                import('@arcgis/core/widgets/BasemapToggle').then((module) => {
                    const basemapToggle = new module.default({
                        view,
                        nextBasemap,
                    });
                    view.ui.add(basemapToggle, 'bottom-right');
                });
            }
            /////////////////////////////
            // initialize primary widgets
            /////////////////////////////
            if (primaryWidgets && !primaryShellPanel) {
                this._widgetInfos('primary', primaryWidgets);
                // get first widget info with active property
                const primaryActiveId = primaryWidgets.find((widgetInfo) => {
                    return widgetInfo.active === true;
                });
                // set active widget and shell panel not collapsed
                if (primaryActiveId) {
                    this._primaryActiveId = primaryActiveId.widget.id;
                    this._primaryCollapsed = false;
                }
            }
            ////////////////////////////////
            // initialize contextual widgets
            ////////////////////////////////
            if (contextualWidgets && !contextualShellPanel) {
                this._widgetInfos('contextual', contextualWidgets);
                // get first widget info with active property
                const contextualActiveId = contextualWidgets.find((widgetInfo) => {
                    return widgetInfo.active === true;
                });
                // set active widget and shell panel not collapsed
                if (contextualActiveId) {
                    this._contextualActiveId = contextualActiveId.widget.id;
                    this._contextualCollapsed = false;
                }
            }
            ////////////////////////
            // initialize ui widgets
            ////////////////////////
            if (uiWidgets) {
                this._widgetInfos('ui', uiWidgets);
                // add ui selector
                view.ui.add(new UISelector({
                    actionGroups: this._uiActionGroups,
                    panels: this._uiPanels,
                }), 'top-right');
                // get first widget info with active property
                const activeWidgetInfo = uiWidgets.find((widgetInfo) => {
                    return widgetInfo.active === true;
                });
                // set active widget and shell panel not collapsed
                if (activeWidgetInfo) {
                    this._uiActiveId = activeWidgetInfo.widget.id;
                }
            }
            if (menuWidgets) {
                this._menuAccordionItems = new Collection();
                menuWidgets.forEach(this._menuWidgetInfo.bind(this));
            }
            ////////////////////////////////////////
            // assure no view or dom race conditions
            ////////////////////////////////////////
            yield setTimeout(() => {
                return 0;
            }, 0);
            /////////////////////
            // set view container
            /////////////////////
            view.container = document.querySelector('div[data-layout-view-container]');
            ////////////////////////////
            // wait for serviceable view
            ////////////////////////////
            // await view.when(); // nothing to do here...yet
        });
    }
    /**
     * Initialize widget infos.
     * @param placement
     * @param widgetInfos
     */
    _widgetInfos(placement, widgetInfos) {
        // create collections
        this[`_${placement}ActionGroups`] = new Collection();
        this[`_${placement}Panels`] = new Collection();
        // create actions, panel, modals
        widgetInfos.forEach(this._initializeWidget.bind(this, placement));
        // create action groups
        this[`_${placement}ActionGroups`].addMany(this._createActionGroups(widgetInfos, placement === 'ui'));
    }
    /**
     * Initialize action and panel or widget.
     * @param placement
     * @param widgetInfo
     */
    _initializeWidget(placement, widgetInfo) {
        const { icon, text, widget, div, modal: isModal } = widgetInfo;
        const modal = isModal === true ? document.createElement('calcite-modal') : null;
        const id = `action_${this.id}_${KEY++}`;
        widgetInfo._action =
            placement === 'ui' ? (tsx("calcite-tooltip-manager", null,
                tsx("calcite-action", { key: KEY++, id: id, icon: icon, text: text, afterCreate: this._actionAfterCreate.bind(this, placement, widget, modal) }),
                tsx("calcite-tooltip", { "reference-element": id, "overlay-positioning": "fixed" }, text))) : (tsx("calcite-action", { key: KEY++, icon: icon, text: text, afterCreate: this._actionAfterCreate.bind(this, placement, widget, modal) }));
        if (modal) {
            document.body.append(modal);
            widget.container = modal;
            if (widget.onShow && typeof widget.onShow === 'function') {
                modal.addEventListener('calciteModalOpen', () => {
                    if (widget.onShow && typeof widget.onShow === 'function')
                        widget.onShow();
                });
            }
            if (widget.onHide && typeof widget.onHide === 'function') {
                modal.addEventListener('calciteModalClose', () => {
                    if (widget.onHide && typeof widget.onHide === 'function')
                        widget.onHide();
                });
            }
        }
        else {
            div && placement === 'ui'
                ? this[`_${placement}Panels`].add(tsx("div", { key: KEY++, hidden: "", afterCreate: this._panelAfterCreate.bind(this, placement, widget, modal) }))
                : this[`_${placement}Panels`].add(tsx("calcite-panel", { key: KEY++, hidden: "", afterCreate: this._panelAfterCreate.bind(this, placement, widget, modal) }));
        }
    }
    /**
     * Action logic and events.
     * @param placement
     * @param widget
     * @param modal
     * @param action
     */
    _actionAfterCreate(placement, widget, modal, action) {
        if ((placement === 'primary' && this._primaryActiveId === widget.id && !modal) ||
            (placement === 'contextual' && this._contextualActiveId === widget.id && !modal))
            action.active = true;
        if (placement === 'ui') {
            action.scale = 's';
            if (this._uiActiveId === widget.id && !modal)
                action.active = true;
        }
        action.addEventListener('click', () => {
            if (modal) {
                modal.setAttribute('active', '');
            }
            else {
                if (placement !== 'ui')
                    this[`_${placement}Collapsed`] = this[`_${placement}ActiveId`] === widget.id;
                this[`_${placement}ActiveId`] = this[`_${placement}ActiveId`] === widget.id ? null : widget.id;
            }
        });
        this.own(watch(this, `_${placement}ActiveId`, (id) => {
            action.active = id === widget.id;
        }));
    }
    /**
     * Panel logic and events.
     * @param placement
     * @param widget
     * @param modal
     * @param element
     */
    _panelAfterCreate(placement, widget, modal, element) {
        const type = element.tagName === 'DIV' ? 'div' : 'panel';
        if ((placement === 'primary' && this._primaryActiveId === widget.id && !modal) ||
            (placement === 'contextual' && this._contextualActiveId === widget.id && !modal))
            element.hidden = false;
        if (placement === 'ui' && type === 'panel') {
            element.widthScale = 'm';
            element.heightScale = 'l';
        }
        if (placement === 'ui' && this._uiActiveId === widget.id)
            element.hidden = false;
        widget.container = element;
        this.own(watch(this, `_${placement}ActiveId`, (id, oldId) => {
            element.hidden = id !== widget.id;
            // call `onShow` or `onHide`
            if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
                widget.onShow();
            }
            if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
                widget.onHide();
            }
        }));
    }
    /**
     * Creates array of `calcite-action-group` VNodes based on WidgetInfo groups and bottom group.
     * @param widgetInfos
     * @returns esri.widget.tsx.JSX.(Element as HTMLCalcitePanelElement)[]
     */
    _createActionGroups(widgetInfos, uiWidgets) {
        const groups = [];
        let actions = [];
        const bottomActions = [];
        const groupWidgetInfos = widgetInfos.filter((widgetInfo) => {
            return widgetInfo.bottomAction !== true;
        });
        groupWidgetInfos.forEach((widgetInfo, index) => {
            const { _action, groupEnd } = widgetInfo;
            actions.push(_action);
            if (groupEnd === true || index + 1 === groupWidgetInfos.length) {
                groups.push(tsx("calcite-action-group", { key: KEY++ }, actions));
                actions = [];
            }
        });
        widgetInfos
            .filter((widgetInfo) => {
            return widgetInfo.bottomAction === true;
        })
            .forEach((widgetInfo) => {
            const { _action } = widgetInfo;
            bottomActions.push(_action);
        });
        if (bottomActions.length)
            groups.push(tsx("calcite-action-group", { key: KEY++, slot: uiWidgets ? null : 'bottom-actions' }, bottomActions));
        return groups;
    }
    /**
     * Initialize menu widgets.
     * @param menuWidgetInfo
     * @param index
     */
    _menuWidgetInfo(menuWidgetInfo, index) {
        const { _menuAccordionItems } = this;
        const { title, icon, widget } = menuWidgetInfo;
        _menuAccordionItems.add(tsx("calcite-accordion-item", { icon: icon, "item-title": title, active: index === 0 },
            tsx("div", { afterCreate: (div) => {
                    widget.container = div;
                } })));
    }
    render() {
        const { title, header, footer, _primaryActionGroups, _primaryPanels, _primaryCollapsed, _primaryHidden, primaryShellPanel, _contextualActionGroups, _contextualPanels, _contextualCollapsed, contextualShellPanel, _menuOpen, _menuAccordionItems, } = this;
        return (tsx("calcite-shell", { class: CSS.base },
            tsx("calcite-panel", { class: this.classes(CSS.menu, _menuOpen ? CSS.menuOpen : ''), heading: title },
                tsx("calcite-action", { slot: "header-actions-end", icon: "chevron-left", onclick: () => {
                        this._menuOpen = false;
                    } }),
                tsx("calcite-accordion", { appearance: "transparent", "selection-mode": "single-persist" }, _menuAccordionItems ? _menuAccordionItems.toArray() : null)),
            tsx("div", { class: _menuOpen ? CSS.menuBackground : '', onclick: () => {
                    this._menuOpen = false;
                } }),
            header ? (tsx("div", { slot: "header", afterCreate: (div) => {
                    header.container = div;
                } })) : null,
            _primaryActionGroups && _primaryActionGroups.length ? (tsx("calcite-shell-panel", { slot: "primary-panel", position: "start", collapsed: _primaryCollapsed },
                tsx("calcite-action-bar", { slot: "action-bar" }, _primaryActionGroups.toArray()),
                _primaryPanels.toArray())) : null,
            primaryShellPanel ? (tsx("calcite-shell-panel", { slot: "primary-panel", position: "start", hidden: _primaryHidden, afterCreate: (calciteShellPanel) => {
                    primaryShellPanel.container = calciteShellPanel;
                } })) : null,
            tsx("div", { class: CSS.view, "data-layout-view-container": "" }),
            _contextualActionGroups && _contextualActionGroups.length ? (tsx("calcite-shell-panel", { slot: "contextual-panel", position: "end", collapsed: _contextualCollapsed },
                tsx("calcite-action-bar", { slot: "action-bar" }, _contextualActionGroups.toArray()),
                _contextualPanels.toArray())) : null,
            contextualShellPanel ? (tsx("calcite-shell-panel", { slot: "contextual-panel", position: "end", afterCreate: (calciteShellPanel) => {
                    contextualShellPanel.container = calciteShellPanel;
                } })) : null,
            footer ? (tsx("div", { slot: "footer", afterCreate: (div) => {
                    footer.container = div;
                } })) : null));
    }
};
__decorate([
    property({ type: Collection })
], Layout.prototype, "primaryWidgets", void 0);
__decorate([
    property({ type: Collection })
], Layout.prototype, "contextualWidgets", void 0);
__decorate([
    property({ type: Collection })
], Layout.prototype, "uiWidgets", void 0);
__decorate([
    property({ type: Collection })
], Layout.prototype, "menuWidgets", void 0);
__decorate([
    property()
], Layout.prototype, "_primaryActiveId", void 0);
__decorate([
    property()
], Layout.prototype, "_primaryCollapsed", void 0);
__decorate([
    property()
], Layout.prototype, "_primaryHidden", void 0);
__decorate([
    property()
], Layout.prototype, "_contextualActiveId", void 0);
__decorate([
    property()
], Layout.prototype, "_contextualCollapsed", void 0);
__decorate([
    property()
], Layout.prototype, "_uiActiveId", void 0);
__decorate([
    property()
], Layout.prototype, "_menuOpen", void 0);
Layout = __decorate([
    subclass('cov.Layout')
], Layout);
export default Layout;
/**
 * Internal ui widget selector widget.
 */
let UISelector = class UISelector extends Widget {
    constructor(properties) {
        super(properties);
    }
    render() {
        const { actionGroups, panels } = this;
        return (tsx("div", null,
            tsx("calcite-action-pad", { "expand-disabled": "" }, actionGroups.toArray()),
            tsx("div", { class: CSS.uiSelectorPanels }, panels.toArray())));
    }
};
UISelector = __decorate([
    subclass('UISelector')
], UISelector);
/**
 * Internal map heading widget to display app title and optional menu toggle and search.
 */
let MapHeading = class MapHeading extends Widget {
    constructor(properties) {
        super(properties);
    }
    render() {
        const { id, title, logoUrl, searchViewModel, menuControl } = this;
        const tooltip = `tooltip_${id}`;
        return (tsx("div", { class: this.classes(CSS.mapHeading, searchViewModel ? CSS.mapHeadingSearchPadding : '') },
            menuControl ? (tsx("calcite-tooltip-manager", null,
                tsx("calcite-icon", { id: tooltip, scale: "m", icon: "hamburger", afterCreate: (icon) => {
                        icon.addEventListener('click', () => {
                            this.emit('menu');
                        });
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltip, "overlay-positioning": "fixed", placement: "bottom-trailing" }, "Menu"))) : null,
            logoUrl ? tsx("img", { class: CSS.mapHeadingLogo, src: logoUrl }) : null,
            title ? tsx("div", { class: CSS.mapHeadingTitle }, title) : null,
            searchViewModel ? tsx("div", { class: CSS.mapHeadingSearch, afterCreate: this._renderSearch.bind(this) }) : null));
    }
    _renderSearch(container) {
        const { searchViewModel } = this;
        import('@arcgis/core/widgets/Search').then((module) => {
            new module.default({
                viewModel: searchViewModel,
                container,
            });
        });
    }
};
MapHeading = __decorate([
    subclass('MapHeading')
], MapHeading);
