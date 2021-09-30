/**
 * Web map application layout with header and optional menu for most applications.
 */

// namespaces and types
import cov = __cov;

// imports
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './Viewer.scss';
const CSS = {
  base: 'cov-viewer',
  // header
  header: 'cov-viewer--header',
  // header title and menu toggle
  headerTitle: 'cov-viewer--header-title',
  headerTitleMenuToggle: 'cov-viewer--header-title--menu-toggle',
  headerTitleText: 'cov-viewer--header-title--title-text',
  // center and view
  center: 'cov-viewer--center',
  view: 'cov-viewer--view',
  // menu
  menuWidgetsPanel: 'cov-viewer-menu-widgets--panel',
};

let KEY = 0;

@subclass('cov.Viewer.Menu')
class Menu extends Widget {
  @property()
  widgets!: esri.Collection<cov.WidgetInfo>;

  @property()
  collapsed = true;

  @property()
  private _active!: string;

  @property()
  private _actions: tsx.JSX.Element[] = [];

  @property()
  private _panels: tsx.JSX.Element[] = [];

  constructor(properties: esri.WidgetProperties & { widgets: esri.Collection<cov.WidgetInfo>; collapsed?: boolean }) {
    super(properties);
  }

  postInitialize(): void {
    this.widgets.forEach((widgetInfo: cov.WidgetInfo, index: number) => {
      const { _actions, _panels } = this;
      const { icon, text, widget } = widgetInfo;

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

// class export
@subclass('cov.layouts.Viewer')
export default class Viewer extends Widget {
  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  title = 'Vernonia';

  @property()
  includeSearch = true;

  @property()
  searchViewModel!: esri.SearchViewModel;

  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property({
    type: Collection,
  })
  menuWidgets: esri.Collection<cov.WidgetInfo> = new Collection();

  @property()
  container = document.createElement('div');

  @property()
  private _menu!: Menu;

  @property({
    aliasOf: '_menu.collapsed',
  })
  private _menuCollapsed = true;

  constructor(properties: cov.ViewerProperties) {
    super(properties);

    // append container to body
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const { view } = this;

    // clear default zoom
    view.ui.empty('top-left');

    // assure no view or dom race conditions
    await setTimeout(() => {
      return 0;
    }, 0);

    // set view container
    view.container = document.querySelector('div[data-viewer-view-container]') as HTMLDivElement;

    // wait for serviceable view
    await view.when();
  }

  render(): tsx.JSX.Element {
    const { title, menuWidgets, _menuCollapsed } = this;
    return (
      <div class={CSS.base}>
        {/* header */}
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
      import('@arcgis/core/widgets/Search').then((module: any) => {
        const { default: Search } = module;
        const search = new Search({
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

  /**
   * Create header account control.
   * @param container
   */
  private _renderHeaderAccountControl(container: HTMLDivElement) {
    const { oAuthViewModel } = this;

    if (oAuthViewModel) {
      import('@vernonia/core/widgets/HeaderAccountControl').then((module: any) => {
        const { default: HeaderAccountControl } = module;
        new HeaderAccountControl({
          oAuthViewModel,
          container,
        });
      });
    }
  }
}
