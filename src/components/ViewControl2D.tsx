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
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import { referenceElement } from './support';

//////////////////////////////////////
// Constants
//////////////////////////////////////

const CSS_BASE = 'cov--view-control-2d';

const CSS = {
  base: CSS_BASE,
  actions: `${CSS_BASE}_actions`,
};

/**
 * View control widget for map view.
 */
@subclass('cov.components.ViewControl2D')
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

    if (document.fullscreenElement) this._fullscreen = true;

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

  @property()
  private _fullscreen = false;

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
    if (!document.body.requestFullscreen) {
      action.disabled = true;

      return;
    }

    action.addEventListener('click', (): void => {
      const { _fullscreen } = this;

      if (!_fullscreen) {
        document.body.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', (): void => {
      this._fullscreen = document.fullscreenElement ? true : false;
    });
  }

  private async _initializeLocate(action: HTMLCalciteActionElement): Promise<void> {
    const { view, locateProperties } = this;

    const locate = new (await import('@arcgis/core/widgets/Locate/LocateViewModel')).default({
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
    const { view, _zoom, _fullscreen, _home, includeLocate, includeFullscreen, includeMagnifier } = this;

    const magnifier = view.magnifier.visible;

    const fullscreenText = _fullscreen ? 'Exit fullscreen' : 'Enter fullscreen';

    const fullscreenIcon = _fullscreen ? 'full-screen-exit' : 'extent';

    return (
      <div class={CSS.base}>
        <div class={CSS.actions}>
          <calcite-action-bar expand-disabled="" floating>
            <calcite-action-group>
              <calcite-action
                text="Zoom in"
                icon="plus"
                scale="s"
                disabled={!_zoom.canZoomIn}
                onclick={_zoom.zoomIn.bind(_zoom)}
              ></calcite-action>
              <calcite-tooltip close-on-click="" overlay-positioning="fixed" afterCreate={referenceElement.bind(this)}>
                Zoom in
              </calcite-tooltip>
              <calcite-action
                text="Zoom out"
                icon="minus"
                scale="s"
                disabled={!_zoom.canZoomOut}
                onclick={_zoom.zoomOut.bind(_zoom)}
              ></calcite-action>
              <calcite-tooltip close-on-click="" overlay-positioning="fixed" afterCreate={referenceElement.bind(this)}>
                Zoom out
              </calcite-tooltip>
            </calcite-action-group>
          </calcite-action-bar>
          <calcite-action-bar expand-disabled="" floating>
            <calcite-action-group>
              <calcite-action
                text="Default extent"
                icon="home"
                scale="s"
                onclick={_home.go.bind(_home)}
              ></calcite-action>
              <calcite-tooltip close-on-click="" overlay-positioning="fixed" afterCreate={referenceElement.bind(this)}>
                Default extent
              </calcite-tooltip>
              {includeLocate
                ? [
                    <calcite-action
                      text="Zoom to location"
                      icon="gps-on"
                      scale="s"
                      disabled=""
                      afterCreate={this._initializeLocate.bind(this)}
                    ></calcite-action>,
                    <calcite-tooltip
                      close-on-click=""
                      overlay-positioning="fixed"
                      afterCreate={referenceElement.bind(this)}
                    >
                      Zoom to location
                    </calcite-tooltip>,
                  ]
                : null}
              {view.constraints.rotationEnabled
                ? [
                    <calcite-action
                      text="Reset orientation"
                      icon="compass-needle"
                      scale="s"
                      afterCreate={this._compassRotation.bind(this)}
                      onclick={() => ((view as esri.MapView).rotation = 0)}
                    ></calcite-action>,
                    <calcite-tooltip
                      close-on-click=""
                      overlay-positioning="fixed"
                      afterCreate={referenceElement.bind(this)}
                    >
                      Reset orientation
                    </calcite-tooltip>,
                  ]
                : null}
            </calcite-action-group>
          </calcite-action-bar>
          {includeFullscreen ? (
            <calcite-action-bar expand-disabled="" floating>
              <calcite-action-group>
                <calcite-action
                  text={fullscreenText}
                  disabled=""
                  scale="s"
                  icon={fullscreenIcon}
                  afterCreate={this._initializeFullscreen.bind(this)}
                ></calcite-action>
                <calcite-tooltip
                  close-on-click=""
                  overlay-positioning="fixed"
                  afterCreate={referenceElement.bind(this)}
                >
                  {fullscreenText}
                </calcite-tooltip>
              </calcite-action-group>
            </calcite-action-bar>
          ) : null}
          {includeMagnifier ? (
            <calcite-action-bar expand-disabled="" floating>
              <calcite-action-group>
                <calcite-action
                  text={magnifier ? 'Hide magnifier' : 'Show magnifier'}
                  scale="s"
                  icon="magnifying-glass"
                  indicator={magnifier ? true : false}
                  onclick={this._toggleMagnifier.bind(this)}
                ></calcite-action>
                <calcite-tooltip
                  close-on-click=""
                  overlay-positioning="fixed"
                  afterCreate={referenceElement.bind(this)}
                >
                  {magnifier ? 'Hide magnifier' : 'Show magnifier'}
                </calcite-tooltip>
              </calcite-action-group>
            </calcite-action-bar>
          ) : null}
        </div>
      </div>
    );
  }
}
