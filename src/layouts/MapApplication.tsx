import esri = __esri;

/**
 * MapApplication constructor properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
  /**
   * Disclaimer options.
   */
  disclaimerOptions?: DisclaimerModalOptions;
  /**
   * Component with an action at the end (bottom) of the action bar.
   *
   * Great place for an `About` modal...just saying.
   */
  endShellPanelComponent?: ShellPanelComponentInfo;
  /**
   * Custom header component.
   *
   * Must return a `div` VNode, and component `container` must not be set.
   *
   * Set to `false` for no header.
   */
  header?: esri.Widget | false;
  /**
   * Display compact header with full width search and no title for mobile apps.
   * @default false
   */
  headerCompact?: boolean;
  /**
   * Custom footer component.
   *
   * Must return a `shell-panel` VNode, and component `container` must not be set.
   *
   * All appropriate `shell-panel` properties are set by default. Only `collapsed` should be optionally set on the VNode.
   */
  footer?: esri.Widget;
  /**
   * Include disclaimer.
   * @default true
   */
  includeDisclaimer?: boolean;
  /**
   * Next basemap for basemap toggle.
   */
  nextBasemap?: esri.Basemap;
  /**
   * Loader options.
   */
  loaderOptions?: LoaderOptions;
  /**
   * OAuth instance for header user control.
   */
  oAuth?: OAuth;
  /**
   * SearchViewModel for header search.
   */
  searchViewModel?: esri.SearchViewModel;
  /**
   * Custom shell panel component.
   *
   * Must return a `calcite-shell-panel` VNode, with no attributes, and component `container` must not be set.
   *
   * Supersedes `shellPanelComponentInfos`.
   */
  shellPanel?: esri.Widget;
  /**
   * Components to add to the shell panel with an action bar action.
   */
  shellPanelComponentInfos?: ShellPanelComponentInfo[] | esri.Collection<ShellPanelComponentInfo>;
  /**
   * Title of the application.
   * @default Vernonia
   */
  title?: string;
  /**
   * Map or scene to display.
   */
  view: esri.MapView | esri.SceneView;
  /**
   * View control options.
   */
  viewControlOptions?: ViewControlOptions;
}

/**
 * Options to configure an action bar action and associated component.
 */
export interface ShellPanelComponentInfo {
  component: esri.Widget;
  icon: string;
  groupEnd?: boolean;
  text: string;
  type: 'flow' | 'modal' | 'panel';
}

/**
 * Options to show alert.
 */
export interface AlertOptions {
  /**
   * Alert auto close duration.
   * Also sets `auto-close` property.
   */
  duration?: 'fast' | 'medium' | 'slow';
  /**
   * Alert icon.
   */
  icon?: string;
  /**
   * Alert kind.
   * @default 'brand'
   */
  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
  /**
   * Alert accessible label (required).
   */
  label: string;
  /**
   * Alert link options.
   */
  link?: {
    /**
     * Link text.
     */
    text: string;
    /**
     * Link href.
     * Also sets `target="_blank"`.
     */
    href?: string;
    /**
     * Link click event.
     */
    click?: () => void;
  };
  /**
   * Alert message (required).
   */
  message: string;
  /**
   * Alert title.
   */
  title?: string;
  /**
   * Width of alert in pixels.
   */
  width?: number;
}

//////////////////////////////////////
// Types
//////////////////////////////////////
import type OAuth from './../support/OAuth';
import type { LoaderOptions } from './support/Loader';
import type { DisclaimerModalOptions } from './../components/modals/DisclaimerModal';
import type { ViewControlOptions } from './support/ViewControl2D';

//////////////////////////////////////
// Modules
//////////////////////////////////////
import esriConfig from '@arcgis/core/config';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import logoSvg from './support/logo';
import Loader from './support/Loader';
import DisclaimerModal from './../components/modals/DisclaimerModal';
import ViewControl2D from './support/ViewControl2D';
import basemapToggle from './support/basemapToggle';
import { subscribe } from 'pubsub-js';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  // base
  base: 'cov-layouts--map-application',
  // header
  header: 'cov-layouts--map-application_header',
  headerTitle: 'cov-layouts--map-application_header--content cov-layouts--map-application_header--title',
  headerControls: 'cov-layouts--map-application_header--content cov-layouts--map-application_header--controls',
  // compact header
  headerCompact: 'cov-layouts--map-application_header--compact',
  headerCompactControls: 'cov-layouts--map-application_header--compact-controls',
  // user control
  userControl: 'cov-layouts--map-application_user-control',
  userControlPopover: 'cov-layouts--map-application_user-control--popover',
  // view
  view: 'cov-layouts--map-application_view',
};

let KEY = 0;

const TOPIC = 'show-alert';

/**
 * Return show alert topic.
 * @returns string
 */
export const showAlertTopic = (): string => {
  return TOPIC;
};

/**
 * Vernonia map application layout.
 */
@subclass('cov.layouts.MapApplication')
class MapApplication extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-shell');

  constructor(properties: MapApplicationProperties) {
    super(properties);
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const {
      disclaimerOptions,
      endShellPanelComponent,
      loaderOptions,
      nextBasemap,
      title,
      shellPanel,
      shellPanelComponentInfos,
      view,
      view: { ui },
      viewControlOptions,
    } = this;

    let { includeDisclaimer } = this;

    // application loader
    const loader = new Loader(loaderOptions.title ? loaderOptions : { ...loaderOptions, title });

    // add view control
    ui.remove('zoom');
    ui.add(new ViewControl2D({ view, ...viewControlOptions }), 'top-left');

    // basemap toggle
    if (nextBasemap) basemapToggle(view, nextBasemap, 'bottom-right');

    // add shell panel components
    if (shellPanelComponentInfos && !shellPanel) {
      this._addShellPanelComponents(shellPanelComponentInfos);
      if (endShellPanelComponent) this._addShellPanelComponents(new Collection([endShellPanelComponent]), true);
    }

    // disclaimer
    try {
      if (await IdentityManager.checkSignInStatus(esriConfig.portalUrl)) includeDisclaimer = false;
    } catch (error) {
      includeDisclaimer = true;
    }
    if (includeDisclaimer && !DisclaimerModal.isAccepted()) new DisclaimerModal(disclaimerOptions);

    // subscribe to alerts
    subscribe(TOPIC, (message: string, options: AlertOptions): void => {
      this._alertEvent(options);
    });

    // be loaded when view is serviceable
    await view.when();
    loader.end();
    this.loaded = true;
    this.emit('load');
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  disclaimerOptions: DisclaimerModalOptions = {};

  endShellPanelComponent?: ShellPanelComponentInfo;

  header?: esri.Widget | false;

  headerCompact = false;

  footer?: esri.Widget;

  includeDisclaimer = true;

  loaderOptions: LoaderOptions = {};

  nextBasemap?: esri.Basemap;

  oAuth?: OAuth;

  searchViewModel?: esri.SearchViewModel;

  shellPanel?: esri.Widget;

  @property({ type: Collection })
  shellPanelComponentInfos?: esri.Collection<ShellPanelComponentInfo>;

  title = 'Vernonia';

  view!: esri.MapView;

  viewControlOptions: ViewControlOptions = {};

  //////////////////////////////////////
  // Protected properties
  //////////////////////////////////////
  protected loaded = false;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _alerts: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _shellPanelActionGroups: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _shellPanelComponents: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _visibleShellPanelComponent: string | null = null;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Show alert.
   * @param options
   */
  showAlert(options: AlertOptions): void {
    this._alertEvent(options);
  }

  /**
   * Show (or hide) panel/flow widget by id.
   * @param id
   */
  showWidget(id: string | null): void {
    this._visibleShellPanelComponent = id;
  }

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Add widgets to shell panel and action bar.
   * @param widgetInfos WidgetInfo
   * @param endAction boolean
   */
  private _addShellPanelComponents(
    shellPanelComponentInfos: esri.Collection<ShellPanelComponentInfo>,
    endAction?: boolean,
  ): void {
    const { _shellPanelActionGroups, _shellPanelComponents } = this;

    let actions: tsx.JSX.Element[] = [];

    shellPanelComponentInfos.forEach((shellPanelComponentInfo: ShellPanelComponentInfo, index: number): void => {
      const { component, icon, groupEnd, text, type } = shellPanelComponentInfo;

      let element: tsx.JSX.Element | undefined;

      component.addHandles(component.on(TOPIC, this._alertEvent.bind(this)));

      switch (type) {
        case 'modal': {
          component.container = document.createElement('calcite-modal');
          document.body.append(component.container);
          break;
        }
        case 'panel': {
          element = (
            <calcite-panel
              afterCreate={(panel: HTMLCalcitePanelElement): void => {
                component.container = panel;
                this._shellPanelComponentEvents(component);
              }}
            ></calcite-panel>
          );
          break;
        }
        case 'flow': {
          element = (
            <calcite-flow
              afterCreate={(flow: HTMLCalciteFlowElement): void => {
                component.container = flow;
                this._shellPanelComponentEvents(component);
              }}
            ></calcite-flow>
          );
          break;
        }
      }

      if (type !== 'modal') component.visible = false;

      if (element) _shellPanelComponents.add(element);

      const action = (
        <calcite-action
          icon={icon}
          text={text}
          afterCreate={(action: HTMLCalciteActionElement): void => {
            if (type === 'modal') {
              action.addEventListener('click', (): void => {
                (component.container as HTMLCalciteModalElement).open = true;
              });
            } else {
              action.addEventListener('click', (): void => {
                this._visibleShellPanelComponent =
                  this._visibleShellPanelComponent === component.id ? null : component.id;
              });
              this.addHandles(
                watch(
                  (): string | null => this._visibleShellPanelComponent,
                  (id?: string | null): void => {
                    action.active = id === component.id;
                  },
                ),
              );
            }
          }}
        >
          <calcite-tooltip close-on-click="" slot="tooltip">
            {text}
          </calcite-tooltip>
        </calcite-action>
      );

      actions.push(action);

      if (groupEnd || index + 1 === shellPanelComponentInfos.length) {
        _shellPanelActionGroups.add(
          <calcite-action-group key={KEY++} slot={endAction ? 'actions-end' : null}>
            {actions}
          </calcite-action-group>,
        );
        actions = [];
      }
    });
  }

  /**
   * Show alert in the application.
   * @param optionsAlertOptions
   */
  private _alertEvent(options: AlertOptions): void {
    const { _alerts } = this;
    const { duration, icon, kind, label, link, message, title, width } = options;
    _alerts.add(
      <calcite-alert
        key={KEY++}
        icon={icon || null}
        kind={kind || 'brand'}
        open=""
        label={label}
        auto-close={duration ? '' : null}
        auto-close-duration={duration || null}
        style={width ? `--calcite-alert-width: ${width}px` : null}
      >
        {title ? <div slot="title">{title}</div> : null}
        <div slot="message">{message}</div>
        {link ? (
          <calcite-link
            href={link.href || null}
            slot="link"
            target={link.href ? '_blank' : null}
            onclick={(link: HTMLCalciteLinkElement): void => {
              if (link.click) {
                link.addEventListener('click', link.click);
              }
            }}
          >
            {link.text}
          </calcite-link>
        ) : null}
      </calcite-alert>,
    );
  }

  /**
   * Wire widget events.
   * @param widget esri.Widget
   */
  private _shellPanelComponentEvents(
    component: esri.Widget & {
      onHide?: () => void | undefined;
      onShow?: () => void | undefined;
    },
  ): void {
    component.addHandles(component.on(TOPIC, this._alertEvent.bind(this)));
    this.addHandles(
      watch(
        (): string | null => this._visibleShellPanelComponent,
        (id?: string | null, oldId?: string | null): void => {
          component.visible = id === component.id;
          /**
           * Legacy widget show/hide.
           * Widgets should watch `visible` property internally.
           * Remove when all widgets with `onShow` and/or `onHide` have been updated.
           */
          if (id === component.id && component.onShow && typeof component.onShow === 'function') {
            component.onShow();
          }
          if (oldId && oldId === component.id && component.onHide && typeof component.onHide === 'function') {
            component.onHide();
          }
        },
      ),
    );
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { header, shellPanel, _alerts, _shellPanelActionGroups, _shellPanelComponents } = this;
    return (
      <calcite-shell class={CSS.base} content-behind="">
        {/* header */}
        {header ? (
          <div slot="header" afterCreate={this._headerAfterCreate.bind(this)}></div>
        ) : header === false ? null : (
          this._defaultHeader()
        )}

        {/* view */}
        <div class={CSS.view} afterCreate={this._viewAfterCreate.bind(this)}></div>

        {/* shell panel */}
        {shellPanel ? (
          <calcite-shell-panel
            display-mode="float"
            position="end"
            slot="panel-end"
            afterCreate={this._shellPanelAfterCreate.bind(this)}
          ></calcite-shell-panel>
        ) : _shellPanelComponents && _shellPanelComponents.length ? (
          <calcite-shell-panel display-mode="float" position="end" slot="panel-end">
            <calcite-action-bar slot="action-bar" afterCreate={this._actionBarAfterCreate.bind(this)}>
              {_shellPanelActionGroups.toArray()}
            </calcite-action-bar>
            {_shellPanelComponents.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* footer */}
        <calcite-shell-panel
          layout="horizontal"
          position="end"
          resizable=""
          slot="footer"
          style="--calcite-shell-panel-min-height: 100px; --calcite-shell-panel-max-height: 500px;"
          afterCreate={this._footerAfterCreate.bind(this)}
        ></calcite-shell-panel>

        {/* alerts */}
        <div slot="alerts">{_alerts.toArray()}</div>
      </calcite-shell>
    );
  }

  //////////////////////////////////////
  // afterCreate methods
  //////////////////////////////////////
  /**
   * Wire view padding for action bar expand/collapse.
   * @param actionBar HTMLCalciteActionBarElement
   */
  private _actionBarAfterCreate(actionBar: HTMLCalciteActionBarElement): void {
    if (!actionBar.getAttribute('slot')) return;
    const { view } = this;
    const setPadding = (): void => {
      const width = actionBar.getBoundingClientRect().width;
      view.padding = {
        ...view.padding,
        right: width,
      };
    };
    setPadding();
    new ResizeObserver((): void => {
      setPadding();
    }).observe(actionBar);
  }

  /**
   * Default application header.
   * @returns tsx.JSX.Element
   */
  private _defaultHeader(): tsx.JSX.Element {
    const { headerCompact, title } = this;

    return headerCompact === true ? (
      <div class={CSS.headerCompact} slot="header">
        <div class={CSS.headerCompactControls}>
          <img src={logoSvg}></img>
          <div afterCreate={this._searchAfterCreate.bind(this)}></div>
          <div afterCreate={this._userControlAfterCreate.bind(this)}></div>
        </div>
      </div>
    ) : (
      <div class={CSS.header} slot="header">
        <div class={CSS.headerTitle}>
          <img src={logoSvg}></img>
          <div>{title}</div>
        </div>
        <div class={CSS.headerControls}>
          <div afterCreate={this._searchAfterCreate.bind(this)}></div>
          <div afterCreate={this._userControlAfterCreate.bind(this)}></div>
        </div>
      </div>
    );
  }

  /**
   * Add header widget.
   * @param container HTMLDivElement
   */
  private _headerAfterCreate(container: HTMLDivElement): void {
    const { header } = this;
    if (header) header.container = container;
  }

  /**
   * Add footer widget.
   * @param container HTMLCalciteShellPanelElement
   */
  private _footerAfterCreate(container: HTMLDivElement): void {
    const { footer } = this;
    if (footer) {
      footer.container = container;
    } else {
      container.remove();
    }
  }

  /**
   * Add shell panel.
   * @param container HTMLCalciteShellPanelElement
   */
  private _shellPanelAfterCreate(container: HTMLCalciteShellPanelElement): void {
    const { shellPanel } = this;
    if (!shellPanel) return;
    shellPanel.container = container;
    // hacky - but it's a race to render
    setTimeout((): void => {
      const actionBar = container.querySelector('calcite-action-bar');
      if (actionBar) this._actionBarAfterCreate(actionBar);
    }, 0);
  }

  /**
   * Create and add UserControl widget to header.
   * @param container HTMLDivElement
   */
  private _userControlAfterCreate(container: HTMLDivElement): void {
    const { oAuth } = this;
    if (oAuth) {
      new UserControl({ container, oAuth });
    } else {
      container.remove();
    }
  }

  /**
   * Create and add Search widget to header.
   * @param container HTMLDivElement
   */
  private async _searchAfterCreate(container: HTMLDivElement): Promise<void> {
    const { searchViewModel, view } = this;
    if (!searchViewModel) {
      container.remove();
    } else {
      if (!searchViewModel.view) searchViewModel.view = view;
      new (await import('@arcgis/core/widgets/Search')).default({ container, viewModel: searchViewModel });
    }
  }

  /**
   * Set view container.
   * @param container HTMLDivElement
   */
  private _viewAfterCreate(container: HTMLDivElement): void {
    this.view.container = container;
  }
}

/**
 * User control widget (internal).
 */
@subclass('UserControl')
class UserControl extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties & {
      oAuth: OAuth;
    },
  ) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  oAuth!: OAuth;

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const {
      id,
      oAuth,
      oAuth: { signedIn, fullName, username, thumbnailUrl },
    } = this;
    const _id = `user_control_${id}`;
    return signedIn ? (
      <div class={CSS.userControl}>
        <calcite-avatar id={_id} full-name={fullName} thumbnail={thumbnailUrl} role="button"></calcite-avatar>
        <calcite-popover
          auto-close=""
          label="Sign out"
          placement="bottom"
          reference-element={_id}
          overlay-positioning="fixed"
        >
          <div class={CSS.userControlPopover}>
            <div>{fullName}</div>
            <span>{username}</span>
            <calcite-button width="full" onclick={oAuth.signOut.bind(oAuth)}>
              Sign out
            </calcite-button>
          </div>
        </calcite-popover>
      </div>
    ) : (
      <div class={CSS.userControl}>
        <calcite-icon id={_id} icon="sign-in" role="button" onclick={oAuth.signIn.bind(oAuth)}></calcite-icon>
        <calcite-tooltip label="Sign in" placement="bottom" reference-element={_id} overlay-positioning="fixed">
          Sign in
        </calcite-tooltip>
      </div>
    );
  }
}

export default MapApplication;
