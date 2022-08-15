import { __decorate } from "tslib";
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
const CSS = {
    base: 'cov--view-control',
    pads: 'cov--view-control--pads',
};
/**
 * View control widget.
 */
let ViewControl = class ViewControl extends Widget {
    constructor(properties) {
        super(properties);
        this.includeLocate = false;
        this.includeFullscreen = false;
    }
    postInitialize() {
        const { view } = this;
        this.zoom = new ZoomViewModel({ view });
        this.home = new HomeViewModel({ view });
    }
    render() {
        const { view, zoom, home, includeLocate, includeFullscreen } = this;
        return (tsx("div", { class: CSS.base },
            tsx("div", { class: CSS.pads },
                includeFullscreen ? (tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Enter Fullscreen", title: "Enter Fullscreen", disabled: "", scale: "s", icon: "extent", afterCreate: this._initializeFullscreen.bind(this) })))) : null,
                tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Default Extent", title: "Default Extent", icon: "home", scale: "s", onclick: home.go.bind(home) }),
                        includeLocate ? (tsx("calcite-action", { text: "Zoom To Location", title: "Zoom To Location", icon: "gps-on", scale: "s", disabled: "", afterCreate: this._initializeLocate.bind(this) })) : null,
                        view.constraints.rotationEnabled ? (tsx("calcite-action", { text: "Reset Orientation", title: "Reset Orientation", icon: "compass-needle", scale: "s", afterCreate: this._compassRotation.bind(this), onclick: () => (view.rotation = 0) })) : null)),
                tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Zoom In", title: "Zoom In", icon: "plus", scale: "s", disabled: !zoom.canZoomIn, onclick: zoom.zoomIn.bind(zoom) }),
                        tsx("calcite-action", { text: "Zoom Out", title: "Zoom Out", icon: "minus", scale: "s", disabled: !zoom.canZoomOut, onclick: zoom.zoomOut.bind(zoom) }))))));
    }
    // very hacky
    // continue to look a better solution
    _compassRotation(action) {
        const { view } = this;
        let icon;
        if (action.shadowRoot) {
            icon = action.shadowRoot.querySelector('.icon-container');
            if (icon) {
                this.watch('view.rotation', () => {
                    icon.style.transform = `rotate(${view.rotation}deg)`;
                });
            }
            else {
                setTimeout(() => {
                    this._compassRotation(action);
                }, 100);
            }
        }
        else {
            setTimeout(() => {
                this._compassRotation(action);
            }, 100);
        }
    }
    _initializeFullscreen(calciteAction) {
        const { view, fullscreenElement } = this;
        import('@arcgis/core/widgets/Fullscreen/FullscreenViewModel').then((module) => {
            const fullscreen = new module.default({
                view,
                element: fullscreenElement,
            });
            calciteAction.addEventListener('click', fullscreen.toggle.bind(fullscreen));
            calciteAction.disabled = fullscreen.state === 'disabled' || fullscreen.state === 'feature-unsupported';
            this.own(watch(() => fullscreen.state, (state) => {
                calciteAction.disabled = state === 'disabled' || state === 'feature-unsupported';
                if (state === 'ready') {
                    calciteAction.icon = 'extent';
                    calciteAction.title = 'Enter Fullscreen';
                    calciteAction.text = 'Enter Fullscreen';
                }
                if (state === 'active') {
                    calciteAction.icon = 'full-screen-exit';
                    calciteAction.title = 'Exit Fullscreen';
                    calciteAction.text = 'Exit Fullscreen';
                }
            }));
        });
    }
    _initializeLocate(calciteAction) {
        const { view } = this;
        import('@arcgis/core/widgets/Locate/LocateViewModel').then((module) => {
            const locate = new module.default({
                view,
            });
            calciteAction.addEventListener('click', locate.locate.bind(locate));
            calciteAction.disabled = locate.state === 'disabled';
            this.own(watch(() => locate.state, (state) => {
                calciteAction.disabled = state === 'disabled';
                calciteAction.icon =
                    locate.state === 'ready'
                        ? 'gps-on'
                        : locate.state === 'locating'
                            ? 'gps-on-f'
                            : locate.state === 'disabled'
                                ? 'gps-off'
                                : '';
            }));
        });
    }
};
ViewControl = __decorate([
    subclass('cov.widgets.ViewControl')
], ViewControl);
export default ViewControl;
