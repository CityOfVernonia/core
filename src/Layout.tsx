import esri = __esri;

import type { LoaderOptions } from './widgets/Loader';
import type { DisclaimerOptions } from './widgets/Disclaimer';
import type { ViewControlOptions } from './widgets/ViewControl';

/**
 * Extended widget with on show/hide methods called on show/hide.
 */
interface _Widget extends esri.Widget {
  /**
   * Function called when widget container panel is shown.
   */
  onShow?: () => void | undefined;
  /**
   * Function called when widget container panel is hidden.
   */
  onHide?: () => void | undefined;
}

/**
 * Internal widget info.
 */
interface _WidgetInfo extends WidgetInfo {
  _action: tsx.JSX.Element;
}

/**
 * Widget info properties for primary, contextual and ui widget placement.
 */
interface WidgetInfo extends Object {
  /**
   * Calcite action text.
   */
  text: string;

  /**
   * Calcite action icon.
   */
  icon: string;

  /**
   * The widget of your choosing.
   * NOTE: do not set `container` property.
   * NOTE: the `widget` must return `calcite-panel` root VNode element.
   * See `div` property.
   */
  widget: _Widget;

  /**
   * Initialize the widget with a `div` element instead of `calcite-panel`.
   * NOTE: only applied to UI widgets.
   * NOTE: width and height must be controlled by widget's own CSS.
   */
  div?: boolean;

  /**
   * Widget container as calcite modal with action click activating the modal.
   * NOTE: the `widget` must return `calcite-modal` root VNode element.
   */
  modal?: boolean;

  /**
   * Groups all actions above up to another WidgetInfo `groupEnd` into a group.
   */
  groupEnd?: boolean;

  /**
   * Groups all actions into bottom actions slot.
   * `groupEnd` has no effect on bottom slotted actions.
   * `bottomAction` WidgetInfos provided to `uiWidgets` grouped in last group.
   */
  bottomAction?: boolean;

  /**
   * Set this widget active.
   * Only sets first widget in collection of `WidgetInfos` as active.
   */
  active?: boolean;
}

/**
 * Application layout constructor properties.
 */
interface LayoutProperties extends esri.WidgetProperties {
  /**
   * The map view.
   */
  view: esri.MapView;

  /**
   * Options for configuring loader.
   */
  loaderOptions?: LoaderOptions;

  /**
   * Include disclaimer.
   * @default false
   */
  includeDisclaimer?: boolean;

  /**
   * Options for configuring disclaimer.
   */
  disclaimerOptions?: DisclaimerOptions;

  /**
   * Options for configuring map heading.
   */
  mapHeadingOptions?: MapHeadingOptions;

  /**
   * Options for configuring view control.
   */
  viewControlOptions?: ViewControlOptions;

  /**
   * Include basemap toggle.
   */
  nextBasemap?: esri.Basemap;

  /**
   * Header widget (slot="header").
   */
  header?: esri.Widget;

  /**
   * Footer widget (slot="footer").
   */
  footer?: esri.Widget;

  /**
   * Primary panel in menu mode.
   * NOTE: only works when `primaryShellPanel` is provided.
   * @default false
   */
  primaryMenu?: boolean;

  /**
   * Widgets to add to the primary shell panel.
   */
  primaryWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];

  /**
   * Widgets to add to the contextual shell panel.
   */
  contextualWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];

  /**
   * Widgets to add to ui widget selector.
   */
  uiWidgets?: esri.Collection<WidgetInfo> | WidgetInfo[];

  /**
   * Widget to add to as primary panel.
   * NOTE: do not set `container` property.
   * NOTE: the `widget` must return `calcite-shell-panel` root VNode element.
   */
  primaryShellPanel?: esri.Widget;

  /**
   * Widget to add to as contextual panel.
   * NOTE: do not set `container` property.
   * NOTE: the `widget` must return `calcite-shell-panel` root VNode element.
   */
  contextualShellPanel?: esri.Widget;
}

/**
 * Options for configuring map heading.
 */
interface MapHeadingOptions extends Object {
  title?: string;
  logoUrl?: string;
  searchViewModel?: esri.SearchViewModel;
}

// common modules
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

import Loader from './widgets/Loader';
import Disclaimer from './widgets/Disclaimer';
import ViewControl from './widgets/ViewControl';

// styles
const CSS = {
  // application
  base: 'cov-layout',
  view: 'cov-layout--view',
  // map heading
  mapHeading: 'cov-layout--map-heading',
  mapHeadingTitle: 'cov-layout--map-heading-title',
  mapHeadingLogo: 'cov-layout--map-heading-logo',
  mapHeadingSearch: 'cov-layout--map-heading-search',
  mapHeadingSearchPadding: 'cov-layout--map-heading-search-padding',
  // ui widget selector
  uiSelectorPanels: 'cov-layout--ui-selector-panels',
  uiSelectorRight: 'cov-layout--ui-selector-right',
  uiSelectorLeft: 'cov-layout--ui-selector-left',
  // user control
  userControl: 'cov-layout--user-control',
  userAvatar: 'cov-layout--user-control-avatar',
  userPopup: 'cov-layout--user-control-popup',
  userInfo: 'cov-layout--user-control-info',
  userLinks: 'cov-layout--user-control-links',
};

// uniqueness
let KEY = 0;

/**
 * Layout for City of Vernonia web maps.
 */
@subclass('cov.Layout')
export default class Layout extends Widget {
  constructor(properties: LayoutProperties) {
    super(properties);

    document.body.append(this.container);

    const loader = new Loader(properties.loaderOptions || {});

    properties.view.when((): void => {
      loader.end();
    });

    if (properties.includeDisclaimer && !Disclaimer.isAccepted()) {
      new Disclaimer({
        ...(properties.disclaimerOptions || {}),
      });
    }
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      mapHeadingOptions,
      viewControlOptions,
      nextBasemap,
      primaryMenu,
      primaryShellPanel,
      primaryWidgets,
      contextualShellPanel,
      contextualWidgets,
      uiWidgets,
    } = this;
    // clear default zoom
    view.ui.empty('top-left');
    //////////////
    // map heading
    //////////////
    // menu mode?
    const menuControl = primaryShellPanel && primaryMenu;
    // create map heading
    const mapHeading = new MapHeading({
      menuControl,
      ...mapHeadingOptions,
      container: document.createElement('div'),
    });
    // set search view model view
    if (mapHeadingOptions.searchViewModel && !mapHeadingOptions.searchViewModel.view) {
      mapHeadingOptions.searchViewModel.view = view;
    }
    // in menu mode set primary hidden and watch map heading `menuOpen`
    if (menuControl) {
      this._primaryHidden = true;
      this.own(
        watch(mapHeading, 'menuOpen', (open: boolean): void => {
          this._primaryHidden = !open;
        }),
      );
    }
    // append map heading to body in menu mode or add to view ui if not
    menuControl ? document.body.append(mapHeading.container) : view.ui.add(mapHeading, 'top-left');
    ///////////////////
    // add view control
    ///////////////////
    view.ui.add(
      new ViewControl({
        ...(viewControlOptions || {}),
        view,
        fullscreenElement: document.body,
      }),
      'bottom-right',
    );
    /////////////////////
    // add basemap toggle
    ////////////////////
    if (nextBasemap) {
      import('@arcgis/core/widgets/BasemapToggle').then((module: any) => {
        const basemapToggle = new (module.default as esri.BasemapToggleConstructor)({
          view,
          nextBasemap,
        });
        view.ui.add(basemapToggle, 'bottom-right');
      });
    }
    /////////////////////////////
    // initialize primary widgets
    /////////////////////////////
    if (primaryWidgets && !primaryShellPanel) {
      this._widgetInfos('primary', primaryWidgets);
      // get first widget info with active property
      const primaryActiveId = primaryWidgets.find((widgetInfo: _WidgetInfo): boolean => {
        return widgetInfo.active === true;
      });
      // set active widget and shell panel not collapsed
      if (primaryActiveId) {
        this._primaryActiveId = primaryActiveId.widget.id;
        this._primaryCollapsed = false;
      }
    }
    ////////////////////////////////
    // initialize contextual widgets
    ////////////////////////////////
    if (contextualWidgets && !contextualShellPanel) {
      this._widgetInfos('contextual', contextualWidgets);
      // get first widget info with active property
      const contextualActiveId = contextualWidgets.find((widgetInfo: _WidgetInfo): boolean => {
        return widgetInfo.active === true;
      });
      // set active widget and shell panel not collapsed
      if (contextualActiveId) {
        this._contextualActiveId = contextualActiveId.widget.id;
        this._contextualCollapsed = false;
      }
    }
    ////////////////////////
    // initialize ui widgets
    ////////////////////////
    if (uiWidgets) {
      this._widgetInfos('ui', uiWidgets);
      // add ui selector
      view.ui.add(
        new UISelector({
          actionGroups: this._uiActionGroups,
          panels: this._uiPanels,
        }),
        'top-right',
      );
      // get first widget info with active property
      const activeWidgetInfo = uiWidgets.find((widgetInfo: _WidgetInfo): boolean => {
        return widgetInfo.active === true;
      });
      // set active widget and shell panel not collapsed
      if (activeWidgetInfo) {
        this._uiActiveId = activeWidgetInfo.widget.id;
      }
    }
    ////////////////////////////////////////
    // assure no view or dom race conditions
    ////////////////////////////////////////
    await setTimeout((): 0 => {
      return 0;
    }, 0);
    /////////////////////
    // set view container
    /////////////////////
    view.container = document.querySelector('div[data-layout-view-container]') as HTMLDivElement;
    ////////////////////////////
    // wait for serviceable view
    ////////////////////////////
    // await view.when(); // nothing to do here...yet
  }

  container = document.createElement('calcite-shell');

  view!: esri.MapView;

  includeDisclaimer = false;

  mapHeadingOptions: MapHeadingOptions = {};

  viewControlOptions!: ViewControlOptions;

  nextBasemap?: esri.Basemap;

  header?: esri.Widget;

  footer?: esri.Widget;

  primaryMenu = false;

  @property({ type: Collection })
  primaryWidgets?: esri.Collection<_WidgetInfo>;

  @property({ type: Collection })
  contextualWidgets?: esri.Collection<_WidgetInfo>;

  @property({ type: Collection })
  uiWidgets?: esri.Collection<_WidgetInfo>;

  primaryShellPanel?: esri.Widget;

  contextualShellPanel?: esri.Widget;

  private _primaryActionGroups!: esri.Collection<tsx.JSX.Element>;

  private _primaryPanels!: esri.Collection<tsx.JSX.Element>;

  // requires decoration
  @property()
  private _primaryActiveId: string | null = null;

  // requires decoration
  @property()
  private _primaryCollapsed = true;

  // requires decoration
  @property()
  private _primaryHidden = false;

  /**
   * Contextual panel variables.
   */
  private _contextualActionGroups!: esri.Collection<tsx.JSX.Element>;

  private _contextualPanels!: esri.Collection<tsx.JSX.Element>;

  // requires decoration
  @property()
  private _contextualActiveId: string | null = null;

  // requires decoration
  @property()
  private _contextualCollapsed = true;

  /**
   * UI panel variables.
   */
  private _uiActionGroups!: esri.Collection<tsx.JSX.Element>;

  private _uiPanels!: esri.Collection<tsx.JSX.Element>;

  // requires decoration
  @property()
  private _uiActiveId: string | null = null;

  /**
   * Initialize widget infos.
   * @param placement
   * @param widgetInfos
   */
  private _widgetInfos(placement: 'primary' | 'contextual' | 'ui', widgetInfos: esri.Collection<_WidgetInfo>): void {
    // create collections
    this[`_${placement}ActionGroups`] = new Collection();
    this[`_${placement}Panels`] = new Collection();

    // create actions, panel, modals
    widgetInfos.forEach(this._initializeWidget.bind(this, placement));

    // create action groups
    this[`_${placement}ActionGroups`].addMany(this._createActionGroups(widgetInfos, placement === 'ui'));
  }

  /**
   * Initialize action and panel or widget.
   * @param placement
   * @param widgetInfo
   */
  private _initializeWidget(placement: 'primary' | 'contextual' | 'ui', widgetInfo: _WidgetInfo): void {
    const { icon, text, widget, div, modal: isModal } = widgetInfo;

    const modal = isModal === true ? (document.createElement('calcite-modal') as HTMLCalciteModalElement) : null;

    const id = `action_${this.id}_${KEY++}`;

    widgetInfo._action =
      placement === 'ui' ? (
        <calcite-tooltip-manager>
          <calcite-action
            key={KEY++}
            id={id}
            icon={icon}
            text={text}
            afterCreate={this._actionAfterCreate.bind(this, placement, widget, modal)}
          ></calcite-action>
          <calcite-tooltip reference-element={id} overlay-positioning="fixed">
            {text}
          </calcite-tooltip>
        </calcite-tooltip-manager>
      ) : (
        <calcite-action
          key={KEY++}
          icon={icon}
          text={text}
          afterCreate={this._actionAfterCreate.bind(this, placement, widget, modal)}
        ></calcite-action>
      );

    if (modal) {
      document.body.append(modal);
      widget.container = modal;
      if (widget.onShow && typeof widget.onShow === 'function') {
        modal.addEventListener('calciteModalOpen', (): void => {
          if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
        });
      }
      if (widget.onHide && typeof widget.onHide === 'function') {
        modal.addEventListener('calciteModalClose', (): void => {
          if (widget.onHide && typeof widget.onHide === 'function') widget.onHide();
        });
      }
    } else {
      div && placement === 'ui'
        ? this[`_${placement}Panels`].add(
            <div key={KEY++} hidden="" afterCreate={this._panelAfterCreate.bind(this, placement, widget, modal)}></div>,
          )
        : this[`_${placement}Panels`].add(
            <calcite-panel
              key={KEY++}
              hidden=""
              afterCreate={this._panelAfterCreate.bind(this, placement, widget, modal)}
            ></calcite-panel>,
          );
    }
  }

  /**
   * Action logic and events.
   * @param placement
   * @param widget
   * @param modal
   * @param action
   */
  private _actionAfterCreate(
    placement: 'primary' | 'contextual' | 'ui',
    widget: esri.Widget,
    modal: HTMLCalciteModalElement | null,
    action: HTMLCalciteActionElement,
  ): void {
    if (
      (placement === 'primary' && this._primaryActiveId === widget.id && !modal) ||
      (placement === 'contextual' && this._contextualActiveId === widget.id && !modal)
    )
      action.active = true;

    if (placement === 'ui') {
      action.scale = 's';
      if (this._uiActiveId === widget.id && !modal) action.active = true;
    }

    action.addEventListener('click', (): void => {
      if (modal) {
        modal.setAttribute('active', '');
      } else {
        if (placement !== 'ui') this[`_${placement}Collapsed`] = this[`_${placement}ActiveId`] === widget.id;

        this[`_${placement}ActiveId`] = this[`_${placement}ActiveId`] === widget.id ? null : widget.id;
      }
    });

    this.own(
      watch(this, `_${placement}ActiveId`, (id: string): void => {
        action.active = id === widget.id;
      }),
    );
  }

  /**
   * Panel logic and events.
   * @param placement
   * @param widget
   * @param modal
   * @param element
   */
  private _panelAfterCreate(
    placement: 'primary' | 'contextual' | 'ui',
    widget: _Widget,
    modal: HTMLCalciteModalElement | null,
    element: HTMLCalcitePanelElement | HTMLDivElement,
  ): void {
    const type = element.tagName === 'DIV' ? 'div' : 'panel';

    if (
      (placement === 'primary' && this._primaryActiveId === widget.id && !modal) ||
      (placement === 'contextual' && this._contextualActiveId === widget.id && !modal)
    )
      element.hidden = false;

    if (placement === 'ui' && type === 'panel') {
      (element as HTMLCalcitePanelElement).widthScale = 'm';
      (element as HTMLCalcitePanelElement).heightScale = 'l';
    }

    if (placement === 'ui' && this._uiActiveId === widget.id) element.hidden = false;

    widget.container = element;

    this.own(
      watch(this, `_${placement}ActiveId`, (id: string, oldId: string): void => {
        element.hidden = id !== widget.id;

        // call `onShow` or `onHide`
        if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
          widget.onShow();
        }

        if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
          widget.onHide();
        }
      }),
    );
  }

  /**
   * Creates array of `calcite-action-group` VNodes based on WidgetInfo groups and bottom group.
   * @param widgetInfos
   * @returns esri.widget.tsx.JSX.(Element as HTMLCalcitePanelElement)[]
   */
  private _createActionGroups(
    widgetInfos: esri.Collection<_WidgetInfo>,
    uiWidgets?: boolean,
  ): esri.widget.tsx.JSX.Element[] {
    const groups: esri.widget.tsx.JSX.Element[] = [];

    let actions: esri.widget.tsx.JSX.Element[] = [];

    const bottomActions: esri.widget.tsx.JSX.Element[] = [];

    const groupWidgetInfos = widgetInfos.filter((widgetInfo: _WidgetInfo): boolean => {
      return widgetInfo.bottomAction !== true;
    });

    groupWidgetInfos.forEach((widgetInfo: _WidgetInfo, index: number) => {
      const { _action, groupEnd } = widgetInfo;

      actions.push(_action);

      if (groupEnd === true || index + 1 === groupWidgetInfos.length) {
        groups.push(<calcite-action-group key={KEY++}>{actions}</calcite-action-group>);
        actions = [];
      }
    });

    widgetInfos
      .filter((widgetInfo: _WidgetInfo): boolean => {
        return widgetInfo.bottomAction === true;
      })
      .forEach((widgetInfo: _WidgetInfo) => {
        const { _action } = widgetInfo;

        bottomActions.push(_action);
      });

    if (bottomActions.length)
      groups.push(
        <calcite-action-group key={KEY++} slot={uiWidgets ? null : 'bottom-actions'}>
          {bottomActions}
        </calcite-action-group>,
      );

    return groups;
  }

  render(): tsx.JSX.Element {
    const {
      header,
      footer,
      _primaryActionGroups,
      _primaryPanels,
      _primaryCollapsed,
      _primaryHidden,
      primaryShellPanel,
      _contextualActionGroups,
      _contextualPanels,
      _contextualCollapsed,
      contextualShellPanel,
    } = this;
    return (
      <calcite-shell class={CSS.base}>
        {/* header */}
        {header ? (
          <div
            slot="header"
            afterCreate={(div: HTMLDivElement) => {
              header.container = div;
            }}
          ></div>
        ) : null}

        {/* primary panel */}
        {_primaryActionGroups && _primaryActionGroups.length ? (
          <calcite-shell-panel slot="primary-panel" position="start" collapsed={_primaryCollapsed}>
            <calcite-action-bar slot="action-bar">{_primaryActionGroups.toArray()}</calcite-action-bar>
            {_primaryPanels.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* single primary panel widget */}
        {primaryShellPanel ? (
          <calcite-shell-panel
            slot="primary-panel"
            position="start"
            hidden={_primaryHidden}
            afterCreate={(calciteShellPanel: HTMLCalciteShellPanelElement): void => {
              primaryShellPanel.container = calciteShellPanel;
            }}
          ></calcite-shell-panel>
        ) : null}

        {/* view */}
        <div class={CSS.view} data-layout-view-container=""></div>

        {/* contextual panel */}
        {_contextualActionGroups && _contextualActionGroups.length ? (
          <calcite-shell-panel slot="contextual-panel" position="end" collapsed={_contextualCollapsed}>
            <calcite-action-bar slot="action-bar">{_contextualActionGroups.toArray()}</calcite-action-bar>
            {_contextualPanels.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* single contextual panel widget */}
        {contextualShellPanel ? (
          <calcite-shell-panel
            slot="contextual-panel"
            position="end"
            afterCreate={(calciteShellPanel: HTMLCalciteShellPanelElement): void => {
              contextualShellPanel.container = calciteShellPanel;
            }}
          ></calcite-shell-panel>
        ) : null}

        {/* footer */}
        {footer ? (
          <div
            slot="footer"
            afterCreate={(div: HTMLDivElement) => {
              footer.container = div;
            }}
          ></div>
        ) : null}
      </calcite-shell>
    );
  }
}

/**
 * Internal ui widget selector widget.
 */
@subclass('UISelector')
class UISelector extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      actionGroups: esri.Collection<esri.widget.tsx.JSX.Element>;
      panels: esri.Collection<esri.widget.tsx.JSX.Element>;
    },
  ) {
    super(properties);
  }

  actionGroups!: esri.Collection<esri.widget.tsx.JSX.Element>;

  panels!: esri.Collection<esri.widget.tsx.JSX.Element>;

  render(): esri.widget.tsx.JSX.Element {
    const { actionGroups, panels } = this;
    return (
      <div>
        <calcite-action-pad expand-disabled="">{actionGroups.toArray()}</calcite-action-pad>
        <div class={CSS.uiSelectorPanels}>{panels.toArray()}</div>
      </div>
    );
  }
}

/**
 * Internal map heading widget to display app title and optional menu toggle and search.
 */
@subclass('MapHeading')
class MapHeading extends Widget {
  constructor(
    properties: esri.WidgetProperties &
      MapHeadingOptions & {
        menuControl?: boolean;
      },
  ) {
    super(properties);
  }

  title!: string;

  logoUrl!: string;

  searchViewModel!: esri.SearchViewModel;

  menuControl?: boolean;

  @property()
  menuOpen = false;

  render(): tsx.JSX.Element {
    const { id, title, logoUrl, searchViewModel, menuControl, menuOpen } = this;

    const tooltip = `tooltip_${id}`;

    return (
      <div class={this.classes(CSS.mapHeading, searchViewModel ? CSS.mapHeadingSearchPadding : '')}>
        {menuControl ? (
          <calcite-tooltip-manager>
            <calcite-icon
              id={tooltip}
              scale="m"
              icon={menuOpen ? 'x' : 'hamburger'}
              afterCreate={(icon: HTMLCalciteIconElement): void => {
                icon.addEventListener('click', (): void => {
                  this.menuOpen = !this.menuOpen;
                });
              }}
            ></calcite-icon>
            <calcite-tooltip reference-element={tooltip} overlay-positioning="fixed" placement="bottom-trailing">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </calcite-tooltip>
          </calcite-tooltip-manager>
        ) : null}
        {logoUrl ? <img class={CSS.mapHeadingLogo} src={logoUrl}></img> : null}
        {title ? <div class={CSS.mapHeadingTitle}>{title}</div> : null}
        {searchViewModel ? <div class={CSS.mapHeadingSearch} afterCreate={this._renderSearch.bind(this)}></div> : null}
      </div>
    );
  }

  private _renderSearch(container: HTMLDivElement): void {
    const { searchViewModel } = this;
    import('@arcgis/core/widgets/Search').then((module: any) => {
      new (module.default as any)({
        viewModel: searchViewModel,
        container,
      });
    });
  }
}
