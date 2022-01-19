import cov = __cov;
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
// TODO: work on dynamic loading that doesn't break widget for optional VMs
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import LocateViewModel from '@arcgis/core/widgets/Locate/LocateViewModel';
import FullscreenViewModel from '@arcgis/core/widgets/Fullscreen/FullscreenViewModel';

const CSS = {
  // header widget
  header: 'cov-application--header',
  headerTitle: 'cov-application--header--title',
  headerSearch: 'cov-application--header--search',
  headerUser: 'cov-application--header--user',
  // user widget
  user: 'cov-application--user',
  userInfo: 'cov-application--user--info',
  userLinks: 'cov-application--user--links',
  // ui widget selector
  selectorPanels: 'cov-application--ui-selector--panels',
  selectorRight: 'cov-application--ui-selector--right',
  selectorLeft: 'cov-application--ui-selector--left',
};

/**
 * Navigation control widget.
 */
@subclass('cov.Application._Control')
export class _Control extends Widget {
  constructor(
    properties: esri.WidgetProperties &
      cov.ApplicationProperties['viewControlOptions'] & {
        view: esri.MapView;
        fullscreenElement: HTMLElement;
      },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { view, includeHome, includeLocate, includeFullscreen, fullscreenElement } = this;

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

  view!: esri.MapView;

  includeHome = true;

  includeCompass = false;

  includeLocate = false;

  includeFullscreen = false;

  fullscreenElement!: HTMLElement;

  zoom!: esri.ZoomViewModel;

  home!: esri.HomeViewModel;

  locate!: esri.LocateViewModel;

  fullscreen!: esri.FullscreenViewModel;

  render(): tsx.JSX.Element {
    const { view, zoom, home, includeCompass, includeLocate, locate, includeFullscreen, fullscreen } = this;

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

/**
 * Default header widget.
 */
@subclass('cov.Application._Header')
export class _Header extends Widget {
  constructor(
    properties?: esri.WidgetProperties &
      cov.ApplicationProperties['headerOptions'] & { view: esri.MapView; title?: string },
  ) {
    super(properties);
  }

  view!: esri.MapView;

  includeSearch = true;

  searchViewModel?: esri.SearchViewModel;

  oAuthViewModel?: cov.OAuthViewModel;

  title = 'My Map';

  private _search(container: HTMLDivElement): void {
    const { view, includeSearch, searchViewModel } = this;

    if (includeSearch) {
      import('@arcgis/core/widgets/Search').then((module: any) => {
        // why esri.SearchConstructor no work???
        const search = new (module.default as any)({
          container,
        });
        if (searchViewModel) {
          searchViewModel.view = view;
          search.viewModel = searchViewModel;
        } else {
          search.view = view;
        }
      });
    }
  }

  private _user(container: HTMLDivElement): void {
    const { oAuthViewModel } = this;

    if (oAuthViewModel) {
      new _User({
        oAuthViewModel,
        container,
      });
    }
  }

  render(): esri.widget.tsx.JSX.Element {
    const { title } = this;
    return (
      <div class={CSS.header}>
        <div class={CSS.headerTitle}>{title}</div>
        <div class={CSS.headerSearch} afterCreate={this._search.bind(this)}></div>
        <div class={CSS.headerUser} afterCreate={this._user.bind(this)}></div>
      </div>
    );
  }
}

/**
 * Menu toggle widget.
 */
@subclass('cov.Application._MenuToggle')
export class _MenuToggle extends Widget {
  @property()
  menuOpen = false;

  render(): esri.widget.tsx.JSX.Element {
    const { menuOpen } = this;
    return (
      <calcite-action-pad expand-disabled="" scale="s">
        <calcite-action
          scale="s"
          icon={menuOpen ? 'chevron-left' : 'hamburger'}
          onclick={() => {
            this.menuOpen = !this.menuOpen;
          }}
        ></calcite-action>
      </calcite-action-pad>
    );
  }
}

/**
 * UI widget selector widget.
 */
@subclass('cov.Application._Selector')
export class _Selector extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      actionGroups: esri.Collection<esri.widget.tsx.JSX.Element>;
      panels: esri.Collection<esri.widget.tsx.JSX.Element>;
      position: 'top-left' | 'top-right';
    },
  ) {
    super(properties);
  }

  actionGroups!: esri.Collection<esri.widget.tsx.JSX.Element>;

  panels!: esri.Collection<esri.widget.tsx.JSX.Element>;

  position!: 'top-left' | 'top-right';

  render(): esri.widget.tsx.JSX.Element {
    const { actionGroups, panels, position } = this;
    return (
      <div>
        <calcite-action-pad expand-disabled="">{actionGroups.toArray()}</calcite-action-pad>
        <div class={this.classes(CSS.selectorPanels, position === 'top-left' ? CSS.selectorLeft : CSS.selectorRight)}>
          {panels.toArray()}
        </div>
      </div>
    );
  }
}

/**
 * User control widget for default header.
 */
@subclass('cov.Application._User')
class _User extends Widget {
  constructor(properties: esri.WidgetProperties & { oAuthViewModel: cov.OAuthViewModel }) {
    super(properties);
  }

  oAuthViewModel!: cov.OAuthViewModel;

  render(): esri.widget.tsx.JSX.Element {
    const { id, oAuthViewModel } = this;

    const _id = `popover_${id}`;

    return oAuthViewModel.signedIn ? (
      <div>
        <calcite-popover-manager auto-close="">
          <calcite-popover placement="left-leading" overlay-positioning="fixed" reference-element={_id}>
            <div class={CSS.user}>
              <div class={CSS.userInfo}>
                <calcite-avatar
                  scale="l"
                  username={oAuthViewModel.username}
                  full-name={oAuthViewModel.name}
                  thumbnail={
                    oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''
                  }
                ></calcite-avatar>
                <div>
                  <div>{oAuthViewModel.name}</div>
                  <div>{oAuthViewModel.username}</div>
                </div>
              </div>
              <div class={CSS.userLinks}>
                <calcite-link href={`${oAuthViewModel.portal.url}/home/content.html`} target="_blank">
                  My Content
                </calcite-link>
                <calcite-link href={`${oAuthViewModel.portal.url}/home/user.html`} target="_blank">
                  My Profile
                </calcite-link>
              </div>
              <calcite-button
                width="full"
                appearance="outline"
                icon-start="sign-out"
                onclick={oAuthViewModel.signOut.bind(oAuthViewModel)}
              >
                Sign Out
              </calcite-button>
            </div>
          </calcite-popover>
          <calcite-avatar
            id={_id}
            style="cursor: pointer;"
            scale="s"
            username={oAuthViewModel.username}
            full-name={oAuthViewModel.name}
            thumbnail={oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''}
            title={`Signed in as ${oAuthViewModel.name}`}
          ></calcite-avatar>
        </calcite-popover-manager>
      </div>
    ) : (
      <div>
        <calcite-button
          icon-start="sign-in"
          scale="s"
          round=""
          appearance="transparent"
          color="inverse"
          title="Sign In"
          onclick={oAuthViewModel.signIn.bind(oAuthViewModel)}
        >
          Sign In
        </calcite-button>
      </div>
    );
  }
}
