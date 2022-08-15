import esri = __esri;

/**
 * Options for configuring view control.
 */
export interface ViewControlOptions extends Object {
  /**
   * Include locate button.
   * @default false
   */
  includeLocate?: boolean;

  /**
   * Include fullscreen toggle button.
   * @default false
   */
  includeFullscreen?: boolean;
}

export interface ViewControlProperties extends esri.WidgetProperties {
  view: esri.MapView;
  /**
   * Include locate button.
   * @default false
   */
  includeLocate?: boolean;
  /**
   * Include fullscreen toggle button.
   * @default false
   */
  includeFullscreen?: boolean;
  fullscreenElement?: HTMLElement;
}

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
@subclass('cov.widgets.ViewControl')
export default class ViewControl extends Widget {
  constructor(properties: ViewControlProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { view } = this;

    this.zoom = new ZoomViewModel({ view });
    this.home = new HomeViewModel({ view });
  }

  view!: esri.MapView;

  includeLocate = false;

  includeFullscreen = false;

  fullscreenElement!: HTMLElement;

  zoom!: esri.ZoomViewModel;

  home!: esri.HomeViewModel;

  render(): tsx.JSX.Element {
    const { view, zoom, home, includeLocate, includeFullscreen } = this;

    return (
      <div class={CSS.base}>
        <div class={CSS.pads}>
          {includeFullscreen ? (
            <calcite-action-pad expand-disabled="">
              <calcite-action-group>
                <calcite-action
                  text="Enter Fullscreen"
                  title="Enter Fullscreen"
                  disabled=""
                  scale="s"
                  icon="extent"
                  afterCreate={this._initializeFullscreen.bind(this)}
                ></calcite-action>
              </calcite-action-group>
            </calcite-action-pad>
          ) : null}
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action
                text="Default Extent"
                title="Default Extent"
                icon="home"
                scale="s"
                onclick={home.go.bind(home)}
              ></calcite-action>
              {includeLocate ? (
                <calcite-action
                  text="Zoom To Location"
                  title="Zoom To Location"
                  icon="gps-on"
                  scale="s"
                  disabled=""
                  afterCreate={this._initializeLocate.bind(this)}
                ></calcite-action>
              ) : null}
              {view.constraints.rotationEnabled ? (
                <calcite-action
                  text="Reset Orientation"
                  title="Reset Orientation"
                  icon="compass-needle"
                  scale="s"
                  afterCreate={this._compassRotation.bind(this)}
                  onclick={() => ((view as esri.MapView).rotation = 0)}
                ></calcite-action>
              ) : null}
            </calcite-action-group>
          </calcite-action-pad>
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action
                text="Zoom In"
                title="Zoom In"
                icon="plus"
                scale="s"
                disabled={!zoom.canZoomIn}
                onclick={zoom.zoomIn.bind(zoom)}
              ></calcite-action>
              <calcite-action
                text="Zoom Out"
                title="Zoom Out"
                icon="minus"
                scale="s"
                disabled={!zoom.canZoomOut}
                onclick={zoom.zoomOut.bind(zoom)}
              ></calcite-action>
            </calcite-action-group>
          </calcite-action-pad>
        </div>
      </div>
    );
  }

  // very hacky
  // continue to look a better solution
  private _compassRotation(action: HTMLCalciteActionElement) {
    const { view } = this;
    let icon: HTMLDivElement;
    if (action.shadowRoot) {
      icon = action.shadowRoot.querySelector('.icon-container') as HTMLDivElement;
      if (icon) {
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

  private _initializeFullscreen(calciteAction: HTMLCalciteActionElement): void {
    const { view, fullscreenElement } = this;

    import('@arcgis/core/widgets/Fullscreen/FullscreenViewModel').then((module: any) => {
      const fullscreen = new (module.default as esri.FullscreenViewModelConstructor)({
        view,
        element: fullscreenElement,
      });

      calciteAction.addEventListener('click', fullscreen.toggle.bind(fullscreen));
      calciteAction.disabled = fullscreen.state === 'disabled' || fullscreen.state === 'feature-unsupported';

      this.own(
        watch(
          (): esri.FullscreenViewModel['state'] => fullscreen.state,
          (state?: esri.FullscreenViewModel['state']): void => {
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
          },
        ),
      );
    });
  }

  private _initializeLocate(calciteAction: HTMLCalciteActionElement): void {
    const { view } = this;

    import('@arcgis/core/widgets/Locate/LocateViewModel').then((module: any) => {
      const locate = new (module.default as esri.LocateViewModelConstructor)({
        view,
      });

      calciteAction.addEventListener('click', locate.locate.bind(locate));
      calciteAction.disabled = locate.state === 'disabled';

      this.own(
        watch(
          (): esri.LocateViewModel['state'] => locate.state,
          (state?: esri.LocateViewModel['state']): void => {
            calciteAction.disabled = state === 'disabled';

            calciteAction.icon =
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
}
