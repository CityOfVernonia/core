/**
 * A layout widget for all full page COV web maps.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// class imports
import ViewControl from './widgets/ViewControl';
import WidgetSwitcher from './widgets/WidgetSwitcher';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Search from '@arcgis/core/widgets/Search';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';

// styles
import './Viewer.scss';
const CSS = {
  base: 'cov-viewer',
  uiTitle: 'cov-viewer--ui-title',
  header: 'cov-viewer--header',
  headerTitle: 'cov-viewer--header-title',
  headerSearch: 'cov-viewer--header-search',
  headerUser: 'cov-viewer--header-user',
  headerUserMenu: 'cov-viewer--header-user_menu',
  headerUserMenuClose: 'cov-viewer--header-user_menu--close',
  headerUserMenuVisible: 'cov-viewer--header-user_menu--visible',
  view: 'cov-viewer--view',
  title: 'cov-viewer--title',
};

// class export
@subclass('cov.Viewer')
export default class Viewer extends Widget {
  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  includeHeader = true;

  @property()
  title = 'Vernonia';

  @property()
  includeSearch = true;

  @property()
  searchViewModel!: esri.SearchViewModel;

  @property()
  markupViewModel!: cov.MarkupViewModel;

  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property()
  nextBasemap!: esri.Basemap;

  @property()
  widgets: cov.SwitcherWidgetProperties[] = [];

  @property()
  container = document.createElement('div');

  @property()
  private _userMenuVisible = false;

  constructor(properties: cov.ViewerProperties) {
    super(properties);
    // add directly to <body>
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      includeHeader,
      title,
      includeSearch,
      searchViewModel,
      nextBasemap,
      markupViewModel,
      widgets,
      container,
    } = this;

    // assure no view or dom race conditions
    await setTimeout(() => {
      return 0;
    }, 0);

    // set view container
    view.container = document.querySelector('div[data-viewer-view-container]') as HTMLDivElement;

    // wait for serviceable view
    await view.when();

    // clear default zoom
    view.ui.empty('top-left');

    // add title to header if no header
    if (!includeHeader) {
      const uiTitle = document.createElement('div');
      uiTitle.classList.add(CSS.uiTitle);
      uiTitle.innerHTML = title;
      view.ui.add(uiTitle, 'top-left');
    }

    // add view control to top left
    view.ui.add(
      new ViewControl({ view: view as esri.MapView, fullscreenElement: container as HTMLDivElement, markupViewModel }),
      'top-left',
    );

    // add scale bar to bottom left
    view.ui.add(new ScaleBar({ view, style: 'ruler' }), 'bottom-left');

    // add widget switcher to top right
    if (widgets.length) {
      view.ui.add(
        new WidgetSwitcher({
          widgets,
        }),
        'top-right',
      );
    }

    // add basemap toggle
    if (nextBasemap) {
      view.ui.add(
        new BasemapToggle({
          view,
          nextBasemap,
        }),
        'bottom-right',
      );
    }

    // search
    if (includeHeader && includeSearch) {
      const search = new Search();
      if (searchViewModel) {
        searchViewModel.view = view;
        search.viewModel = searchViewModel;
      } else {
        search.view = view;
      }
      search.container = document.querySelector('div[data-viewer-search-container]') as HTMLDivElement;
    }
  }

  render(): tsx.JSX.Element {
    const { includeHeader, title, oAuthViewModel } = this;
    return (
      <div class={CSS.base}>
        {/* header */}
        {includeHeader ? (
          <div class={CSS.header}>
            {/* header title */}
            <div class={CSS.headerTitle}>{title}</div>
            {/* header search */}
            <div class={CSS.headerSearch} data-viewer-search-container=""></div>
            {/* user */}
            <div class={CSS.headerUser}>{oAuthViewModel ? this._renderUser() : null}</div>
          </div>
        ) : null}

        {/* view container */}
        <div class={CSS.view} data-viewer-view-container=""></div>
      </div>
    );
  }

  /**
   * Render sign in button; or avatar and user menu.
   * @returns VNode
   */
  private _renderUser(): tsx.JSX.Element {
    const { oAuthViewModel, _userMenuVisible } = this;

    return oAuthViewModel.signedIn ? (
      <div>
        <calcite-avatar
          scale="s"
          username={oAuthViewModel.username}
          full-name={oAuthViewModel.name}
          thumbnail={oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''}
          title={`Signed in as ${oAuthViewModel.name}`}
          onclick={(): void => {
            this._userMenuVisible = !this._userMenuVisible;
          }}
        ></calcite-avatar>

        {/* user menu */}
        <div class={this.classes(CSS.headerUserMenu, _userMenuVisible ? CSS.headerUserMenuVisible : '')}>
          <div>
            <calcite-avatar
              scale="l"
              username={oAuthViewModel.username}
              full-name={oAuthViewModel.name}
              thumbnail={
                oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''
              }
            ></calcite-avatar>
          </div>
          <div>{oAuthViewModel.name}</div>
          <div>{oAuthViewModel.username}</div>
          <div>
            <calcite-link href={`${oAuthViewModel.portal.url}/home/content.html`} target="_blank">
              My Content
            </calcite-link>
          </div>
          <div>
            <calcite-link href={`${oAuthViewModel.portal.url}/home/user.html`} target="_blank">
              My Profile
            </calcite-link>
          </div>
          <calcite-button scale="s" width="full" onclick={oAuthViewModel.signOut.bind(oAuthViewModel)}>
            Sign Out
          </calcite-button>
          {/* close button */}
          <calcite-action
            class={CSS.headerUserMenuClose}
            scale="s"
            appearance="clear"
            icon="x"
            onclick={(): void => {
              this._userMenuVisible = false;
            }}
          ></calcite-action>
        </div>
      </div>
    ) : (
      <calcite-button
        scale="s"
        round=""
        appearance="transparent"
        color="inverse"
        title="Sign In"
        onclick={oAuthViewModel.signIn.bind(oAuthViewModel)}
      >
        Sign In
      </calcite-button>
    );
  }
}
