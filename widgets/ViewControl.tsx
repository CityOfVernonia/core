/**
 * A view control widget to replace default zoom widget with home, locate, fullscreen, compass and markup create actions.
 */

// namespaces and types
import cov = __cov;

// imports
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { whenOnce } from '@arcgis/core/core/watchUtils';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import LocateViewModel from '@arcgis/core/widgets/Locate/LocateViewModel';
import FullscreenViewModel from '@arcgis/core/widgets/Fullscreen/FullscreenViewModel';

@subclass('cov.widgets.ViewControl')
export default class ViewControl extends Widget {
  @property()
  view!: esri.MapView;

  @property()
  includeHome = true;

  @property()
  includeCompass = true;

  @property()
  includeLocate = true;

  @property()
  includeFullscreen = true;

  @property()
  fullscreenElement!: HTMLElement;

  @property()
  protected markup!: cov.Markup;

  @property()
  protected zoom!: ZoomViewModel;

  @property()
  protected home!: HomeViewModel;

  @property()
  protected locate!: LocateViewModel;

  @property()
  protected fullscreen!: FullscreenViewModel;

  constructor(properties?: cov.ViewControlProperties) {
    super(properties);
    // initialize when serviceable view
    whenOnce(this, 'view', this._init.bind(this));
  }

  /**
   * Initialize view models.
   * @param view esri.MapView
   */
  private _init(view: esri.MapView): void {
    const { includeHome, includeLocate, includeFullscreen, fullscreenElement } = this;
    // zoom (always)
    this.zoom = new ZoomViewModel({ view });
    // home
    if (includeHome) this.home = new HomeViewModel({ view });
    // locate
    if (includeLocate) this.locate = new LocateViewModel({ view });
    // fullscreen
    if (includeFullscreen) {
      this.fullscreen = new FullscreenViewModel({
        view,
        element: fullscreenElement,
      });
    }
  }

  render(): tsx.JSX.Element {
    const { view, zoom, home, includeCompass, includeLocate, locate, includeFullscreen, fullscreen, markup } = this;

    const locateIcon =
      includeLocate && locate.state === 'ready'
        ? 'gps-on'
        : includeLocate && locate.state === 'locating'
        ? 'gps-on-f'
        : includeLocate && locate.state === 'disabled'
        ? 'gps-off'
        : '';

    const fullscreenActive = includeFullscreen && fullscreen.state === 'active';

    const fullscreenText = includeFullscreen && fullscreenActive ? 'Exit Fullscreen' : 'Enter Fullscreen';

    return (
      <div>
        <calcite-action-pad expand-disabled="">
          {/* zoom and home group */}
          <calcite-action-group>
            <calcite-action
              text="Zoom In"
              title="Zoom In"
              icon="plus"
              scale="s"
              disabled={!zoom.canZoomIn}
              onclick={zoom.zoomIn.bind(zoom)}
            ></calcite-action>

            {home ? (
              <calcite-action
                text="Default Extent"
                title="Default Extent"
                icon="home"
                scale="s"
                onclick={home.go.bind(home)}
              ></calcite-action>
            ) : null}

            <calcite-action
              text="Zoom Out"
              title="Zoom Out"
              icon="minus"
              scale="s"
              disabled={!zoom.canZoomOut}
              onclick={zoom.zoomOut.bind(zoom)}
            ></calcite-action>
          </calcite-action-group>

          {/* compass, locate and fullscreen */}
          {(includeCompass && view.constraints.rotationEnabled) || locate || fullscreen ? (
            <calcite-action-group>
              {includeCompass && view.constraints.rotationEnabled ? (
                <calcite-action
                  text="Reset Orientation"
                  title="Reset Orientation"
                  icon="compass-needle"
                  scale="s"
                  afterCreate={this._compassRotation.bind(this)}
                  onclick={() => ((view as esri.MapView).rotation = 0)}
                ></calcite-action>
              ) : null}

              {locate ? (
                <calcite-action
                  text="Zoom To Location"
                  title="Zoom To Location"
                  icon={locateIcon}
                  scale="s"
                  disabled={locate.state === 'disabled'}
                  onclick={locate.locate.bind(locate)}
                ></calcite-action>
              ) : null}

              {fullscreen && fullscreen.state !== 'feature-unsupported' ? (
                <calcite-action
                  title={fullscreenText}
                  text={fullscreenText}
                  disabled={fullscreen.state === 'disabled'}
                  scale="s"
                  icon={fullscreenActive ? 'full-screen-exit' : 'extent'}
                  onclick={fullscreen.toggle.bind(fullscreen)}
                ></calcite-action>
              ) : null}
            </calcite-action-group>
          ) : null}

          {/* markup */}
          {markup ? (
            <calcite-action-group>
              <calcite-action
                text="Draw Point"
                title="Draw Point"
                icon="point"
                scale="s"
                onclick={() => markup.markup('point')}
              ></calcite-action>
              <calcite-action
                text="Draw Polyline"
                title="Draw Polyline"
                icon="line"
                scale="s"
                onclick={() => markup.markup('polyline')}
              ></calcite-action>
              <calcite-action
                text="Draw Polygon"
                title="Draw Polygon"
                icon="polygon-vertices"
                scale="s"
                onclick={() => markup.markup('polygon')}
              ></calcite-action>
              <calcite-action-menu>
                <calcite-action slot="trigger" style="margin: 0;" icon="ellipsis" scale="s"></calcite-action>
                <calcite-action
                  text="Draw Rectangle"
                  title="Draw Rectangle"
                  text-enabled=""
                  icon="rectangle"
                  scale="s"
                  onclick={() => markup.markup('rectangle')}
                ></calcite-action>
                <calcite-action
                  text="Draw Circle"
                  title="Draw Circle"
                  text-enabled=""
                  icon="circle"
                  scale="s"
                  onclick={() => markup.markup('circle')}
                ></calcite-action>
              </calcite-action-menu>
            </calcite-action-group>
          ) : null}
        </calcite-action-pad>
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
}
