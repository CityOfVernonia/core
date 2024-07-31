//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Options for configuring ViewControl2D widget.
 */
export interface ViewControlOptions {
  /**
   * Include locate button.
   * @default false
   */
  includeLocate?: boolean;
  /**
   * Locate properties.
   */
  locateProperties?: esri.LocateProperties;
  /**
   * Include fullscreen toggle button.
   * @default false
   */
  includeFullscreen?: boolean;
  /**
   * Include magnifier toggle button.
   * @default false
   */
  includeMagnifier?: boolean;
  /**
   * Magnifier properties.
   */
  magnifierProperties?: esri.MagnifierProperties;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  base: 'cov-layouts-support--view-control-2d',
  pads: 'cov-layouts-support--view-control-2d_pads',
};

/**
 * View control widget for map view.
 */
@subclass('cov.layouts.support.ViewControl2D')
export default class ViewControl2D extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties &
      ViewControlOptions & {
        /**
         * View to control.
         */
        view: esri.MapView;
      },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const {
      magnifierProperties,
      view,
      view: { magnifier },
    } = this;
    this._home = new HomeViewModel({ view });
    this._zoom = new ZoomViewModel({ view });
    magnifier.visible = false;
    if (magnifierProperties) Object.assign(magnifier, magnifierProperties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  includeFullscreen = false;

  includeLocate = false;

  includeMagnifier = false;

  locateProperties!: esri.LocateProperties;

  magnifierProperties!: esri.MagnifierProperties;

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _home!: esri.HomeViewModel;

  private _magnifierHandle!: IHandle;

  private _zoom!: esri.ZoomViewModel;

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  // very hacky - better solution?
  private _compassRotation(action: HTMLCalciteActionElement) {
    const { view } = this;
    let icon: HTMLDivElement;
    if (action.shadowRoot) {
      icon = action.shadowRoot.querySelector('.icon-container') as HTMLDivElement;
      if (icon) {
        icon.style.transform = `rotate(${view.rotation}deg)`;
        this.watch('view.rotation', (): void => {
          icon.style.transform = `rotate(${view.rotation}deg)`;
        });
      } else {
        setTimeout(() => {
          this._compassRotation(action);
        }, 100);
      }
    } else {
      setTimeout(() => {
        this._compassRotation(action);
      }, 100);
    }
  }

  private _initializeFullscreen(action: HTMLCalciteActionElement): void {
    const { view } = this;

    import('@arcgis/core/widgets/Fullscreen/FullscreenViewModel').then((module): void => {
      const fullscreen = new (module.default as typeof esri.FullscreenViewModel)({
        view,
        element: document.body,
      });

      action.addEventListener('click', fullscreen.toggle.bind(fullscreen));
      action.disabled = fullscreen.state === 'disabled' || fullscreen.state === 'feature-unsupported';

      this.addHandles(
        watch(
          (): esri.FullscreenViewModel['state'] => fullscreen.state,
          (state?: esri.FullscreenViewModel['state']): void => {
            action.disabled = state === 'disabled' || state === 'feature-unsupported';

            const tooltip = action.querySelector('calcite-tooltip') as HTMLCalciteTooltipElement;

            if (state === 'ready') {
              action.icon = 'extent';
              action.text = 'Enter fullscreen';
              tooltip.innerText = 'Enter fullscreen';
            }
            if (state === 'active') {
              action.icon = 'full-screen-exit';
              action.text = 'Exit fullscreen';
              tooltip.innerText = 'Exit fullscreen';
            }
          },
        ),
      );
    });
  }

  private _initializeLocate(action: HTMLCalciteActionElement): void {
    const { view, locateProperties } = this;

    import('@arcgis/core/widgets/Locate/LocateViewModel').then((module): void => {
      const locate = new (module.default as typeof esri.LocateViewModel)({
        view,
        ...locateProperties,
      });

      action.addEventListener('click', locate.locate.bind(locate));
      action.disabled = locate.state === 'disabled';

      this.addHandles(
        watch(
          (): esri.LocateViewModel['state'] => locate.state,
          (state?: esri.LocateViewModel['state']): void => {
            action.disabled = state === 'disabled';

            action.icon =
              locate.state === 'ready'
                ? 'gps-on'
                : locate.state === 'locating'
                  ? 'gps-on-f'
                  : locate.state === 'disabled'
                    ? 'gps-off'
                    : '';
          },
        ),
      );
    });
  }

  private _toggleMagnifier(): void {
    const {
      view,
      view: { magnifier },
      _magnifierHandle,
    } = this;
    if (magnifier.visible) {
      magnifier.visible = false;
      if (_magnifierHandle) _magnifierHandle.remove();
    } else {
      magnifier.visible = true;
      this._magnifierHandle = view.on('pointer-move', (event: esri.ViewPointerMoveEvent): void => {
        magnifier.position = { x: event.x, y: event.y };
      });
    }
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { view, _zoom, _home, includeLocate, includeFullscreen, includeMagnifier } = this;
    const magnifier = view.magnifier.visible;
    return (
      <div class={CSS.base}>
        <div class={CSS.pads}>
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action
                text="Zoom in"
                icon="plus"
                scale="s"
                disabled={!_zoom.canZoomIn}
                onclick={_zoom.zoomIn.bind(_zoom)}
              >
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Zoom in
                </calcite-tooltip>
              </calcite-action>
              <calcite-action
                text="Zoom out"
                icon="minus"
                scale="s"
                disabled={!_zoom.canZoomOut}
                onclick={_zoom.zoomOut.bind(_zoom)}
              >
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Zoom out
                </calcite-tooltip>
              </calcite-action>
            </calcite-action-group>
          </calcite-action-pad>
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action text="Default extent" icon="home" scale="s" onclick={_home.go.bind(_home)}>
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Default extent
                </calcite-tooltip>
              </calcite-action>
              {includeLocate ? (
                <calcite-action
                  text="Zoom to location"
                  icon="gps-on"
                  scale="s"
                  disabled=""
                  afterCreate={this._initializeLocate.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Zoom to location
                  </calcite-tooltip>
                </calcite-action>
              ) : null}
              {view.constraints.rotationEnabled ? (
                <calcite-action
                  text="Reset orientation"
                  icon="compass-needle"
                  scale="s"
                  afterCreate={this._compassRotation.bind(this)}
                  onclick={() => ((view as esri.MapView).rotation = 0)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Reset orientation
                  </calcite-tooltip>
                </calcite-action>
              ) : null}
            </calcite-action-group>
          </calcite-action-pad>
          {includeFullscreen ? (
            <calcite-action-pad expand-disabled="">
              <calcite-action-group>
                <calcite-action
                  text="Enter fullscreen"
                  disabled=""
                  scale="s"
                  icon="extent"
                  afterCreate={this._initializeFullscreen.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Enter fullscreen
                  </calcite-tooltip>
                </calcite-action>
              </calcite-action-group>
            </calcite-action-pad>
          ) : null}
          {includeMagnifier ? (
            <calcite-action-pad expand-disabled="">
              <calcite-action-group>
                <calcite-action
                  text={magnifier ? 'Hide magnifier' : 'Show magnifier'}
                  scale="s"
                  icon="magnifying-glass"
                  indicator={magnifier ? true : false}
                  onclick={this._toggleMagnifier.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    {magnifier ? 'Hide magnifier' : 'Show magnifier'}
                  </calcite-tooltip>
                </calcite-action>
              </calcite-action-group>
            </calcite-action-pad>
          ) : null}
        </div>
      </div>
    );
  }
}
