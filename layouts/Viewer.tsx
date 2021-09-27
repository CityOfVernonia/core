/**
 * A layout widget for all full page COV web maps.
 */

// namespaces and types
import cov = __cov;

// base imports
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// class imports
import Search from '@arcgis/core/widgets/Search';
import HeaderAccountControl from './../widgets/HeaderAccountControl';
import ViewControl from './../widgets/ViewControl';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';

// styles
import './Viewer.scss';
const CSS = {
  base: 'cov-viewer',
  // ui title when no header
  uiTitle: 'cov-viewer--ui-title',
  // header
  header: 'cov-viewer--header',
  // header title and menu toggle
  headerTitle: 'cov-viewer--header-title',
  headerTitleMenuToggle: 'cov-viewer--header-title--menu-toggle',
  headerTitleText: 'cov-viewer--header-title--title-text',
  // header search
  headerSearch: 'cov-viewer--header-search',
  // center and view
  center: 'cov-viewer--center',
  view: 'cov-viewer--view',
  // ui widgets
  uiWidgetsPanelContainer: 'cov-viewer-ui-widgets--panel-container',
  uiWidgetsPanel: 'cov-viewer-ui-widgets--panel',
  // menu
  menuWidgetsPanel: 'cov-viewer-menu-widgets--panel',
};

let KEY = 0;

@subclass('cov.Viewer.Menu')
class Menu extends Widget {
  @property()
  widgets!: esri.Collection<cov.ViewerWidgetProperties>;

  @property()
  collapsed = true;

  @property()
  private _active!: string;

  @property()
  private _actions: tsx.JSX.Element[] = [];

  @property()
  private _panels: tsx.JSX.Element[] = [];

  constructor(
    properties: esri.WidgetProperties & { widgets: esri.Collection<cov.ViewerWidgetProperties>; collapsed?: boolean },
  ) {
    super(properties);
  }

  postInitialize(): void {
    this.widgets.forEach((viewerWidget: cov.ViewerWidgetProperties, index: number) => {
      const { _actions, _panels } = this;
      const { icon, text, widget } = viewerWidget;

      _actions.push(
        <calcite-action
          key={KEY++}
          icon={icon}
          text={text}
          active={index === 0}
          onclick={() => {
            this._active = widget.id;
          }}
          afterCreate={(calciteAction: HTMLCalciteActionElement) => {
            watch(this, '_active', () => {
              calciteAction.active = this._active === widget.id;
            });
          }}
        ></calcite-action>,
      );

      _panels.push(
        <calcite-panel
          class={CSS.menuWidgetsPanel}
          hidden={index !== 0}
          afterCreate={(calcitePanel: HTMLCalcitePanelElement) => {
            watch(this, '_active', () => {
              calcitePanel.hidden = this._active !== widget.id;
            });
          }}
        >
          <div
            afterCreate={(div: HTMLDivElement) => {
              widget.container = div;
            }}
          ></div>
        </calcite-panel>,
      );
    });
  }

  render(): tsx.JSX.Element {
    const { collapsed, _actions, _panels } = this;
    return (
      <calcite-shell-panel
        slot="primary-panel"
        position="start"
        width-scale="m"
        collapsed={collapsed}
        hidden={collapsed}
      >
        <calcite-action-bar slot="action-bar">{_actions}</calcite-action-bar>
        {_panels}
      </calcite-shell-panel>
    );
  }
}

@subclass('cov.Viewer.UIWidgets')
class UIWidgets extends Widget {
  @property()
  widgets!: esri.Collection<cov.ViewerWidgetProperties>;

  @property()
  private _active: string | null = null;

  @property()
  private _actions: tsx.JSX.Element[] = [];

  @property()
  private _panels: tsx.JSX.Element[] = [];

  constructor(properties: esri.WidgetProperties & { widgets: esri.Collection<cov.ViewerWidgetProperties> }) {
    super(properties);
  }

  postInitialize(): void {
    this.widgets.forEach((viewerWidget: cov.ViewerWidgetProperties) => {
      const { _actions, _panels } = this;
      const { icon, text, widget } = viewerWidget;

      _actions.push(
        <calcite-action
          key={KEY++}
          scale="s"
          icon={icon}
          text={text}
          onclick={() => {
            this._active = this._active && this._active === widget.id ? null : widget.id;
          }}
          afterCreate={(calciteAction: HTMLCalciteActionElement) => {
            watch(this, '_active', () => {
              calciteAction.active = this._active === widget.id;
            });
          }}
        ></calcite-action>,
      );

      _panels.push(
        <calcite-panel
          class={CSS.uiWidgetsPanel}
          hidden=""
          width-scale="m"
          height-scale="l"
          afterCreate={(calcitePanel: HTMLCalcitePanelElement) => {
            watch(this, '_active', () => {
              calcitePanel.hidden = this._active !== widget.id;
            });
          }}
        >
          <div
            afterCreate={(div: HTMLDivElement) => {
              widget.container = div;
            }}
          ></div>
        </calcite-panel>,
      );
    });
  }

  render(): tsx.JSX.Element {
    const { _actions, _panels } = this;
    return (
      <div>
        <calcite-action-pad expand-disabled="">{_actions}</calcite-action-pad>
        <div class={CSS.uiWidgetsPanelContainer}>{_panels}</div>
      </div>
    );
  }
}

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
  protected markup!: cov.Markup;

  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property()
  nextBasemap!: esri.Basemap;

  @property({
    type: Collection,
  })
  menuWidgets: esri.Collection<cov.ViewerWidgetProperties> = new Collection();

  @property({
    type: Collection,
  })
  uiWidgets: esri.Collection<cov.ViewerWidgetProperties> = new Collection();

  @property()
  container = document.createElement('div');

  @property()
  private _userMenuVisible = false;

  @property()
  private _menu!: Menu;

  @property({
    aliasOf: '_menu.collapsed',
  })
  private _menuCollapsed = true;

  constructor(properties: cov.ViewerProperties) {
    super(properties);
    // add directly to <body>
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const { view, includeHeader, title, uiWidgets, nextBasemap, markup, container } = this;

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
      new ViewControl({ view: view as esri.MapView, fullscreenElement: container as HTMLDivElement, markup }),
      'top-left',
    );

    // add scale bar to bottom left
    view.ui.add(new ScaleBar({ view, style: 'ruler' }), 'bottom-left');

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

    // add ui widgets
    if (uiWidgets.length) {
      view.ui.add(
        new UIWidgets({
          widgets: uiWidgets,
        }),
        'top-right',
      );
    }
  }

  render(): tsx.JSX.Element {
    const { includeHeader, title, menuWidgets, _menuCollapsed } = this;
    return (
      <div class={CSS.base}>
        {/* header */}
        {includeHeader ? (
          <div class={CSS.header}>
            {/* header title */}
            <div class={CSS.headerTitle}>
              {menuWidgets.length ? (
                <div class={CSS.headerTitleMenuToggle}>
                  <calcite-icon
                    scale="s"
                    icon={_menuCollapsed ? 'hamburger' : 'chevrons-left'}
                    onclick={() => (this._menuCollapsed = !this._menuCollapsed)}
                  ></calcite-icon>
                </div>
              ) : null}
              <div class={CSS.headerTitleText}>{title}</div>
            </div>
            {/* header search */}
            <div afterCreate={this._renderHeaderSearch.bind(this)}></div>
            {/* user */}
            <div afterCreate={this._renderHeaderAccountControl.bind(this)}></div>
          </div>
        ) : null}
        {/* center content (menu and view) */}
        <div class={CSS.center}>
          {/* menu */}
          {menuWidgets.length ? (
            <calcite-shell-panel
              afterCreate={(calciteShellPanel: HTMLCalciteShellPanelElement) => {
                this._menu = new Menu({
                  widgets: menuWidgets,
                  container: calciteShellPanel,
                });
              }}
            ></calcite-shell-panel>
          ) : null}
          {/* view container */}
          <div class={CSS.view} data-viewer-view-container=""></div>
        </div>
      </div>
    );
  }

  /**
   * Create header search.
   * @param container
   */
  private _renderHeaderSearch(container: HTMLDivElement): void {
    const { view, includeSearch, searchViewModel } = this;

    if (includeSearch) {
      const search = new Search({
        container,
      });
      if (searchViewModel) {
        searchViewModel.view = view;
        search.viewModel = searchViewModel;
      } else {
        search.view = view;
      }
    }
  }

  /**
   * Create header account control.
   * @param container
   */
  private _renderHeaderAccountControl(container: HTMLDivElement) {
    const { oAuthViewModel } = this;

    if (oAuthViewModel) {
      new HeaderAccountControl({
        oAuthViewModel,
        container,
      });
    }
  }
}
