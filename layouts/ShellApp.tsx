/**
 * A calcite shell layout.
 */

// namespaces and types
import cov = __cov;

// base imports
import { watch } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// class imports
import ViewControl from './../widgets/ViewControl';
import Search from '@arcgis/core/widgets/Search';
import HeaderAccountControl from './../widgets/HeaderAccountControl';

// styles
import './ShellApp.scss';
const CSS = {
  base: 'cov-shell-app',
  header: 'cov-shell-app--header',
  headerTitle: 'cov-shell-app--header--title',
  view: 'cov-shell-app--view',
};

let KEY = 0;

// class export
@subclass('cov.layouts.ShellApp')
export default class ShellApp extends Widget {
  @property()
  container = document.createElement('div');

  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  title = 'Vernonia';

  @property()
  includeSearch = true;

  @property()
  searchViewModel!: esri.SearchViewModel;

  @property()
  panelCollapsed = false;

  @property()
  panelPosition: 'start' | 'end' = 'start';

  @property()
  widthScale: 's' | 'm' | 'l' = 'm';

  @property()
  actionWidgets: cov.WidgetInfo[] = [];

  @property()
  markup!: cov.Markup;

  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property()
  private _actions: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _panels: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _activeActionWidget: string | null = null;

  constructor(properties: cov.ShellAppProperties) {
    super(properties);
    // add container to body
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const { container, view, panelPosition, actionWidgets, markup } = this;

    // assure no view or dom race conditions
    await setTimeout((): 0 => {
      return 0;
    }, 0);

    // set view container
    view.container = document.querySelector('div[shell-app-view-container]') as HTMLDivElement;

    // wait for serviceable view
    await view.when();

    // clear default zoom
    view.ui.empty('top-left');

    // add view control to top left or right depending on panel position
    view.ui.add(
      new ViewControl({ view: view as esri.MapView, fullscreenElement: container as HTMLDivElement, markup }),
      panelPosition === 'start' ? 'top-right' : 'top-left',
    );

    // add action widgets
    actionWidgets.forEach(this.addActionWidget.bind(this));
  }

  /**
   * Add action and widget to end shell panel.
   * @param actionWidget
   */
  addActionWidget(actionWidget: cov.WidgetInfo, index: number): void {
    const { id, _actions, _panels, panelCollapsed } = this;
    const { icon, text, widget } = actionWidget;

    const _id = `shell_app_action_widget_${id}_${KEY++}`;

    _actions.add(
      <calcite-action
        key={KEY++}
        icon={icon}
        text={text}
        active={!panelCollapsed && index === 0}
        afterCreate={(calciteAction: HTMLCalciteActionElement) => {
          calciteAction.addEventListener('click', (): void => {
            this.panelCollapsed = this._activeActionWidget === _id;
            this._activeActionWidget = this._activeActionWidget === _id ? null : _id;
          });
          watch(this, '_activeActionWidget', (__id: string): void => {
            calciteAction.active = __id === _id;
          });
        }}
      ></calcite-action>,
    );

    _panels.add(
      <calcite-panel
        detached=""
        key={KEY++}
        hidden={!(!panelCollapsed && index === 0)}
        afterCreate={(calcitePanel: HTMLCalcitePanelElement) => {
          watch(this, '_activeActionWidget', (__id: string): void => {
            calcitePanel.hidden = __id !== _id;
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
  }

  render(): tsx.JSX.Element {
    const { title, panelCollapsed, panelPosition, widthScale, _actions, _panels } = this;

    return (
      <div class={CSS.base}>
        <calcite-shell>
          <div slot="header" class={CSS.header}>
            <div class={CSS.headerTitle}>{title}</div>
            <div afterCreate={this._renderHeaderSearch.bind(this)}></div>
            <div afterCreate={this._renderHeaderAccountControl.bind(this)}></div>
          </div>
          <calcite-shell-panel
            slot="primary-panel"
            position={panelPosition}
            width-scale={widthScale}
            collapsed={panelCollapsed}
          >
            <calcite-action-bar slot="action-bar">{_actions.toArray()}</calcite-action-bar>
            {_panels.toArray()}
          </calcite-shell-panel>
          <div class={CSS.view} shell-app-view-container=""></div>
        </calcite-shell>
      </div>
    );
  }

  /**
   * Create header search.
   * @param div
   */
  private _renderHeaderSearch(div: HTMLDivElement): void {
    const { view, includeSearch, searchViewModel } = this;

    if (includeSearch) {
      const search = new Search({
        container: div,
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
   * @param div
   */
  private _renderHeaderAccountControl(div: HTMLDivElement) {
    const { oAuthViewModel } = this;

    if (oAuthViewModel) {
      new HeaderAccountControl({
        oAuthViewModel,
        container: div,
      });
    }
  }
}
