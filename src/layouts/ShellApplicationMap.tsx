//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Module types.
 */
interface I {
  /**
   * Info to create action groups.
   */
  actionInfo: { action: tsx.JSX.Element; actionEnd?: boolean; groupEnd?: boolean };
  /**
   * Header options.
   */
  headerOptions: {
    /**
     * Header logo URL.
     * Set to `false` for no logo.
     * Defaults to `Vernonia 3 Trees` logo.
     */
    logoUrl?: string | false;
    /**
     * Header title.
     * @default 'Vernonia'
     */
    title?: string;
    /**
     * Search view model for header search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * OAuth instance for header user control.
     */
    oAuth?: OAuth;
  };
  /**
   * Shell panel and view control (opposite) position.
   */
  panelPosition: 'start' | 'end';
  /**
   * Widgets to add to action bar.
   */
  panelWidgets?: PanelWidget[] | esri.Collection<PanelWidget>;
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
}

/**
 * Properties to initialize a widget in the shell panel with an action in the action bar.
 * Must return a `calcite-panel`, `calcite-flow`, `calcite-modal`, or `div` VNode; widget `container` property must not be set; and corresponding VNode `type` must be provided.
 */
export interface PanelWidget {
  /**
   * Group action in `actions-end` slot.
   * `groupEnd` has no effect on bottom slotted actions.
   */
  actionEnd?: boolean;
  /**
   * Groups all actions above up to another ActionWidgets `groupEnd` into a group.
   */
  groupEnd?: boolean;
  /**
   * Action icon (required).
   */
  icon: string;
  /**
   * Widget is `open` on load.
   * Only opens first widget with `open` property.
   */
  open?: boolean;
  /**
   * Action text (required).
   */
  text: string;
  /**
   * Type of element to create for widget (required).
   */
  type: 'calcite-flow' | 'calcite-modal' | 'calcite-panel' | 'div';
  /**
   * The widget instance (required).
   */
  widget: esri.Widget & {
    /**
     * Function called when widget container panel is closed.
     */
    onHide?: () => void | undefined;
    /**
     * Function called when widget container panel is opened.
     */
    onShow?: () => void | undefined;
  };
}

/**
 * ShellApplicationMap widget constructor properties.
 */
export interface ShellApplicationMapProperties extends esri.WidgetProperties {
  /**
   * Floating panels.
   * @default true
   */
  contentBehind?: boolean;
  /**
   * Disclaimer options.
   */
  disclaimerOptions?: DisclaimerOptions;
  /**
   * Custom footer widget.
   * Must return a `div` VNode, and widget `container` must not be set.
   */
  footer?: esri.Widget;
  /**
   * Custom header widget.
   * Must return a `div` VNode, and widget `container` must not be set.
   */
  header?: esri.Widget;
  /**
   * Header options for default header.
   */
  headerOptions?: I['headerOptions'];
  /**
   * Include disclaimer.
   * @default true
   */
  includeDisclaimer?: boolean;
  /**
   * Include header.
   * @default true
   */
  includeHeader?: boolean;
  /**
   * Loader options.
   */
  loaderOptions?: LoaderOptions;
  /**
   * Next basemap for basemap toggle.
   */
  nextBasemap?: esri.Basemap;
  /**
   * Position of the shell panel (action bar and widgets) and places view control opposite.
   * @default 'start'
   */
  panelPosition?: I['panelPosition'];
  /**
   * Widgets to add to action bar.
   */
  panelWidgets?: PanelWidget[] | esri.Collection<PanelWidget>;
  /**
   * Shell panel widget. Supersedes `panelWidgets`.
   * Must return a `calcite-shell-panel` VNode, and widget `container` must not be set.
   */
  shellPanel?: esri.Widget;
  /**
   * Application title.
   * Convenience property to set loader and header titles without needing to pass loader or header options.
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

//////////////////////////////////////
// Types
//////////////////////////////////////
import type OAuth from '../support/OAuth';
import type { LoaderOptions } from '../widgets/Loader';
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl2D';

//////////////////////////////////////
// Modules
//////////////////////////////////////
import esriConfig from '@arcgis/core/config';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Collection from '@arcgis/core/core/Collection';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import logoSvg from '../support/logo';
import Loader from '../widgets/Loader';
import Disclaimer from '../widgets/Disclaimer';
import ViewControl2D from '../widgets/ViewControl2D';
import basemapToggle from '../support/basemapToggle';
import { subscribe } from 'pubsub-js';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  // base
  base: 'cov-layouts--shell-application-map',
  // header
  header: 'cov-layouts--shell-application-map_header',
  headerTitle: 'cov-layouts--shell-application-map_header--title',
  headerControls: 'cov-layouts--shell-application-map_header--controls',
  headerSearch: 'cov-layouts--shell-application-map_header--search',
  headerUserControl: 'cov-layouts--shell-application-map_header--user-control',
  headerUserControlPopover: 'cov-layouts--shell-application-map_header--user-control--popover',
  // view
  view: 'cov-layouts--shell-application-map_view',
};

let KEY = 0;

const TOPIC = 'shell-application-alert';

/**
 * Shell application map layout.
 */
@subclass('cov.layouts.ShellApplicationMap')
export default class ShellApplicationMap extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-shell');

  constructor(properties: ShellApplicationMapProperties) {
    super(properties);
    const { container } = this;
    // manually set `contentBehind` on container to prevent improper rendering
    container.contentBehind = properties.contentBehind !== undefined ? properties.contentBehind : this.contentBehind;
    document.body.append(container);
  }

  async postInitialize(): Promise<void> {
    const {
      disclaimerOptions,
      loaderOptions,
      nextBasemap,
      panelPosition,
      panelWidgets,
      shellPanel,
      title,
      view,
      view: { ui },
      viewControlOptions,
    } = this;
    const loader = new Loader(loaderOptions.title ? loaderOptions : { ...loaderOptions, title });

    ui.remove('zoom');
    if (view.type === '2d') {
      ui.add(new ViewControl2D({ view, ...viewControlOptions }), panelPosition === 'start' ? 'top-right' : 'top-left');
    } else {
      // TODO: add view control 3D
    }

    if (nextBasemap) basemapToggle(view, nextBasemap, panelPosition === 'start' ? 'bottom-left' : 'bottom-right');

    if (!shellPanel && panelWidgets && panelWidgets.length) {
      const found = panelWidgets.find((actionWidget: PanelWidget): boolean => {
        return actionWidget.open === true;
      });
      if (found && found.type !== 'calcite-modal') {
        this._visiblePanelWidget = found.widget.id;
      }
      this._createShellPanelWidgets(panelWidgets);
    }

    subscribe(TOPIC, (message: string, options: AlertOptions): void => {
      this._alertEvent(options);
    });

    let { includeDisclaimer } = this;
    try {
      if (await IdentityManager.checkSignInStatus(esriConfig.portalUrl)) includeDisclaimer = false;
    } catch (error) {
      includeDisclaimer = true;
    }
    if (includeDisclaimer && !Disclaimer.isAccepted()) new Disclaimer(disclaimerOptions);

    await view.when();
    loader.end();
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  contentBehind = true;

  disclaimerOptions: DisclaimerOptions = {};

  footer!: esri.Widget;

  header!: esri.Widget;

  headerOptions: I['headerOptions'] = {};

  includeDisclaimer = true;

  includeHeader = true;

  loaderOptions: LoaderOptions = {};

  nextBasemap!: esri.Basemap;

  panelPosition: I['panelPosition'] = 'start';

  shellPanel!: esri.Widget;

  title = 'City of Vernonia';

  @property({ type: Collection })
  panelWidgets?: esri.Collection<PanelWidget>;

  view!: esri.MapView | esri.SceneView;

  viewControlOptions: ViewControlOptions = {};

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _actionGroups: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _alerts: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _panelWidgets: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _visiblePanelWidget: string | null = null;

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
   * Show (or hide) panel widget by id.
   * @param id
   */
  showWidget(id: string | null): void {
    this._visiblePanelWidget = id;
  }

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Wire action events.
   * @param modal
   * @param widgetId
   * @param action
   */
  private _actionAfterCreate(
    modal: HTMLCalciteModalElement | null,
    widgetId: string,
    action: HTMLCalciteActionElement,
  ): void {
    action.addEventListener('click', (): void => {
      if (modal) {
        modal.open = true;
      } else {
        this._visiblePanelWidget = this._visiblePanelWidget === widgetId ? null : widgetId;
      }
    });

    this.addHandles(
      watch(
        (): string | null => this._visiblePanelWidget,
        (id?: string | null): void => {
          action.active = id === widgetId;
        },
      ),
    );
  }

  /**
   * Create alert.
   * @param options
   */
  private _alertEvent(options: AlertOptions): void {
    const { _alerts } = this;
    const { duration, icon, kind, label, link, message, title } = options;
    _alerts.add(
      <calcite-alert
        key={KEY++}
        icon={icon || null}
        kind={kind || 'brand'}
        open=""
        label={label}
        auto-close={duration ? '' : null}
        auto-close-duration={duration || null}
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
   * Create action groups.
   * @param actionInfos
   */
  private _createActionGroups(actionInfos: I['actionInfo'][]): void {
    const { _actionGroups } = this;

    let actions: tsx.JSX.Element[] = [];

    actionInfos
      .filter((actionInfo: I['actionInfo']): boolean => {
        return actionInfo.actionEnd !== true;
      })
      .forEach((actionInfo: I['actionInfo'], index: number, arr: I['actionInfo'][]): void => {
        const { action, groupEnd } = actionInfo;

        actions.push(action);

        if (groupEnd === true || index + 1 === arr.length) {
          _actionGroups.add(<calcite-action-group key={KEY++}>{actions}</calcite-action-group>);
          actions = [];
        }
      });

    const actionsEnd = actionInfos
      .filter((actionInfo: I['actionInfo']): boolean => {
        return actionInfo.actionEnd === true;
      })
      .map((actionInfo: I['actionInfo']): tsx.JSX.Element => {
        return actionInfo.action;
      });

    if (actionsEnd.length)
      _actionGroups.add(
        <calcite-action-group key={KEY++} slot="actions-end">
          {actionsEnd}
        </calcite-action-group>,
      );
  }

  /**
   * Create actions and panels/modals.
   * @param panelWidgets
   */
  private _createShellPanelWidgets(panelWidgets: Collection<PanelWidget>): void {
    const { _visiblePanelWidget, _panelWidgets } = this;

    const actionInfos: I['actionInfo'][] = [];

    panelWidgets.forEach((panelWidget: PanelWidget): void => {
      const { icon, text, widget, type, groupEnd, actionEnd } = panelWidget;

      const modal =
        type === 'calcite-modal' ? (document.createElement('calcite-modal') as HTMLCalciteModalElement) : null;

      actionInfos.push({
        action: (
          <calcite-action
            active={widget.id === _visiblePanelWidget}
            icon={icon}
            key={KEY++}
            text={text}
            afterCreate={this._actionAfterCreate.bind(this, modal, widget.id)}
          >
            <calcite-tooltip close-on-click="" label={text} overlay-positioning="fixed" slot="tooltip">
              <span>{text}</span>
            </calcite-tooltip>
          </calcite-action>
        ),
        groupEnd,
        actionEnd,
      });

      if (modal) {
        document.body.append(modal);

        widget.container = modal;

        modal.addEventListener('calciteModalOpen', (): void => {
          if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
        });

        modal.addEventListener('calciteModalClose', (): void => {
          if (widget.onHide && typeof widget.onHide === 'function') widget.onHide();
        });
      } else {
        const hidden = widget.id !== _visiblePanelWidget;

        let element: tsx.JSX.Element;

        switch (type) {
          case 'calcite-panel':
            element = (
              <calcite-panel
                key={KEY++}
                hidden={hidden}
                afterCreate={this._widgetAfterCreate.bind(this, widget)}
              ></calcite-panel>
            );
            break;
          case 'calcite-flow':
            element = (
              <calcite-flow
                key={KEY++}
                hidden={hidden}
                afterCreate={this._widgetAfterCreate.bind(this, widget)}
              ></calcite-flow>
            );
            break;
          default:
            element = <div key={KEY++} hidden={hidden} afterCreate={this._widgetAfterCreate.bind(this, widget)}></div>;
        }

        _panelWidgets.add(element);
      }
    });

    this._createActionGroups(actionInfos);
  }

  /**
   * Set widget `container` and wire events.
   * @param widget
   * @param container
   */
  private _widgetAfterCreate(
    widget: PanelWidget['widget'],
    container: HTMLCalciteFlowElement | HTMLCalcitePanelElement | HTMLDivElement,
  ): void {
    widget.container = container;

    this.addHandles([
      widget.on(TOPIC, this._alertEvent.bind(this)),
      watch(
        (): string | null => this._visiblePanelWidget,
        (id: any, oldId: any): void => {
          container.hidden = id !== widget.id;

          if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
            widget.onShow();
          }

          if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
            widget.onHide();
          }
        },
      ),
    ]);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const {
      contentBehind,
      footer,
      header,
      panelPosition,
      shellPanel,
      view,
      _alerts,
      _actionGroups,
      _panelWidgets,
      _visiblePanelWidget,
    } = this;
    return (
      <calcite-shell>
        {/* header */}
        {header ? (
          <div
            slot="header"
            afterCreate={(container: HTMLDivElement): void => {
              header.container = container;
            }}
          ></div>
        ) : (
          this._renderHeader()
        )}

        {/* shell panel widget */}
        {shellPanel ? (
          <calcite-shell-panel
            afterCreate={(_shellPanel: HTMLCalciteShellPanelElement): void => {
              shellPanel.container = _shellPanel;
              _shellPanel.position = panelPosition;
              _shellPanel.slot = `panel-${panelPosition}`;
            }}
          ></calcite-shell-panel>
        ) : null}

        {/* panel widgets action bar and widgets */}
        {_actionGroups.length ? (
          <calcite-shell-panel
            display-mode={contentBehind ? 'float' : 'dock'}
            collapsed={!_visiblePanelWidget}
            position={panelPosition}
            slot={`panel-${panelPosition}`}
          >
            <calcite-action-bar
              slot="action-bar"
              afterCreate={(actionBar: HTMLCalciteActionBarElement): void => {
                if (!contentBehind) return;
                const setPadding = (): void => {
                  const width = actionBar.getBoundingClientRect().width;
                  view.padding = {
                    ...view.padding,
                    ...(panelPosition === 'start' ? { left: width } : { right: width }),
                  };
                };
                setPadding();
                new ResizeObserver((): void => {
                  setPadding();
                }).observe(actionBar);
              }}
            >
              {_actionGroups.toArray()}
            </calcite-action-bar>
            {_panelWidgets.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* view */}
        <div
          class={CSS.view}
          afterCreate={(container: HTMLDivElement): void => {
            this.view.container = container;
          }}
        ></div>

        {/* alerts */}
        <div slot="alerts">{_alerts.toArray()}</div>

        {/* footer */}
        {footer ? (
          <div
            slot="footer"
            afterCreate={(container: HTMLDivElement): void => {
              header.container = container;
            }}
          ></div>
        ) : null}
      </calcite-shell>
    );
  }

  /**
   * Create default header.
   */
  private _renderHeader(): tsx.JSX.Element | null {
    const {
      title,
      includeHeader,
      headerOptions: { title: headerTitle, searchViewModel, logoUrl, oAuth },
    } = this;

    if (!includeHeader) return null;

    return (
      <div class={CSS.header} slot="header">
        <div class={CSS.headerTitle}>
          {logoUrl !== false ? <img src={logoUrl || logoSvg} /> : null}
          {headerTitle || title ? <div>{headerTitle || title}</div> : null}
        </div>
        <div class={CSS.headerControls}>
          {searchViewModel ? (
            <div
              class={CSS.headerSearch}
              afterCreate={async (container: HTMLDivElement): Promise<void> => {
                new (await import('@arcgis/core/widgets/Search')).default({
                  container,
                  viewModel: searchViewModel,
                });
              }}
            ></div>
          ) : null}
          {oAuth ? (
            <div
              afterCreate={(container: HTMLDivElement): void => {
                new HeaderUserControl({ container, oAuth });
              }}
            ></div>
          ) : null}
        </div>
      </div>
    );
  }
}

/**
 * Header user control widget (internal).
 */
@subclass('HeaderUserControl')
class HeaderUserControl extends Widget {
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
      <div class={CSS.headerUserControl}>
        <calcite-avatar id={_id} full-name={fullName} thumbnail={thumbnailUrl} role="button"></calcite-avatar>
        <calcite-popover
          auto-close=""
          label="Sign out"
          placement="bottom"
          reference-element={_id}
          overlay-positioning="fixed"
        >
          <div class={CSS.headerUserControlPopover}>
            <div>{fullName}</div>
            <span>{username}</span>
            <calcite-button width="full" onclick={oAuth.signOut.bind(oAuth)}>
              Sign out
            </calcite-button>
          </div>
        </calcite-popover>
      </div>
    ) : (
      <div class={CSS.headerUserControl}>
        <calcite-icon id={_id} icon="sign-in" role="button" onclick={oAuth.signIn.bind(oAuth)}></calcite-icon>
        <calcite-tooltip label="Sign in" placement="bottom" reference-element={_id} overlay-positioning="fixed">
          Sign in
        </calcite-tooltip>
      </div>
    );
  }
}
