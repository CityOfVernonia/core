////////////////////////////////////////////
// types
////////////////////////////////////////////
import { __decorate } from "tslib";
////////////////////////////////////////////
// modules
////////////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/reactiveUtils';
import Layout, { CSS } from './Layout';
let KEY = 0;
/**
 * Application layout with action bar and floating widgets.
 */
let ActionBarLayout = class ActionBarLayout extends Layout {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
    }
    postInitialize() {
        const { view: { ui }, widgetInfos, } = this;
        ui.add(new ActionPadPanels({ widgetInfos }), 'top-right');
    }
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { view, header, footer } = this;
        return (tsx("calcite-shell", { "content-behind": "" },
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
__decorate([
    property({ type: Collection })
], ActionBarLayout.prototype, "widgetInfos", void 0);
ActionBarLayout = __decorate([
    subclass('cov.layouts.ActionBarLayout')
], ActionBarLayout);
export default ActionBarLayout;
/**
 * Action pad with panels.
 */
let ActionPadPanels = class ActionPadPanels extends Widget {
    ////////////////////////////////////////////
    // lifecycle
    ////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        ////////////////////////////////////////////
        // variables
        ////////////////////////////////////////////
        this._tooltips = new Collection();
        this._actionGroups = new Collection();
        this._panels = new Collection();
        this._activeId = null;
    }
    postInitialize() {
        const { widgetInfos } = this;
        // set first widget info with active property
        const active = widgetInfos.find((widgetInfo) => {
            return widgetInfo.active === true;
        });
        // set active widget
        if (active && !active.modal) {
            this._activeId = active.widget.id;
        }
        // create actions, action tooltips and panels/modals
        this._createActionsPanels();
        // create action groups
        this._createActionGroups();
    }
    ////////////////////////////////////////////
    // private methods
    ////////////////////////////////////////////
    /**
     * create actions, action tooltips and panels/modals
     */
    _createActionsPanels() {
        const { id, widgetInfos, _activeId, _tooltips, _panels } = this;
        // for each widget info
        widgetInfos.forEach((widgetInfo) => {
            const { icon, text, widget, modal: isModal } = widgetInfo;
            // create modal element if widget is modal
            const modal = isModal === true ? document.createElement('calcite-modal') : null;
            // id for action and tooltip reference
            const actionId = `action_${id}_${KEY++}`;
            // create action
            const action = (tsx("calcite-action", { key: KEY++, id: actionId, icon: icon, text: text, scale: "s", active: widget.id === _activeId, afterCreate: this._actionAfterCreate.bind(this, widget, modal) }));
            // set _action property
            widgetInfo._action = action;
            // create tooltip
            _tooltips.add(tsx("calcite-tooltip", { key: KEY++, "reference-element": actionId, "close-on-click": "" }, text));
            // create modal or panel
            if (modal) {
                // append element
                document.body.append(modal);
                // set container
                widget.container = modal;
                // wire on show/hide events
                modal.addEventListener('calciteModalOpen', () => {
                    if (widget.onShow && typeof widget.onShow === 'function')
                        widget.onShow();
                });
                modal.addEventListener('calciteModalClose', () => {
                    if (widget.onHide && typeof widget.onHide === 'function')
                        widget.onHide();
                });
            }
            else {
                _panels.add(tsx("calcite-panel", { key: KEY++, "width-scale": "m", hidden: widget.id !== _activeId, afterCreate: this._panelAfterCreate.bind(this, widget) }));
            }
        });
    }
    /**
     * create action groups
     */
    _createActionGroups() {
        const { widgetInfos, _actionGroups } = this;
        let actions = [];
        widgetInfos.forEach((widgetInfo, index) => {
            const { _action, groupEnd } = widgetInfo;
            actions.push(_action);
            if (groupEnd === true || index + 1 === widgetInfos.length) {
                _actionGroups.add(tsx("calcite-action-group", { key: KEY++ }, actions));
                actions = [];
            }
        });
    }
    /**
     * wire action click event and set active
     * @param widget
     * @param modal
     * @param action
     */
    _actionAfterCreate(widget, modal, action) {
        // open modal or set active panel id
        action.addEventListener('click', () => {
            if (modal) {
                modal.open = true;
            }
            else {
                this._activeId = this._activeId === widget.id ? null : widget.id;
            }
        });
        // set active
        this.own(watch(() => this._activeId, (id) => {
            action.active = id === widget.id;
        }));
    }
    /**
     * set widget container, hide/unhide and call on hide/show
     * @param widget
     * @param element
     */
    _panelAfterCreate(widget, element) {
        // set element
        widget.container = element;
        this.own(watch(() => this._activeId, (id, oldId) => {
            // hide/unhide
            element.hidden = id !== widget.id;
            // wire on show/hide events
            if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
                widget.onShow();
            }
            if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
                widget.onHide();
            }
        }));
    }
    ////////////////////////////////////////////
    // render and rendering specific methods
    ////////////////////////////////////////////
    render() {
        const { _actionGroups, _tooltips, _panels } = this;
        return (tsx("div", null,
            tsx("calcite-action-pad", { "expand-disabled": "" },
                _actionGroups.toArray(),
                _tooltips.toArray()),
            tsx("div", { class: CSS.actionPadPanels }, _panels.toArray())));
    }
};
__decorate([
    property({ type: Collection })
], ActionPadPanels.prototype, "widgetInfos", void 0);
__decorate([
    property()
], ActionPadPanels.prototype, "_activeId", void 0);
ActionPadPanels = __decorate([
    subclass('ActionPadPanels')
], ActionPadPanels);
