import cov = __cov;
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Loader from './Application/Loader';
import { _Control, _Header, _MenuToggle, _Selector } from './Application/_widgets';

const CSS = {
  base: 'cov-application',
  uiTitle: 'cov-application--ui-title',
  view: 'cov-application--view',
};

let KEY = 0;

/**
 * A calcite shell application widget.
 * One layout to rule them all!
 */
@subclass('cov.Application')
export default class ShellApplication extends Widget {
  constructor(properties: cov.ApplicationProperties) {
    super(properties);

    // initialize internal loader
    if (!properties.loader) {
      this._loader = new Loader({
        ...{
          title: properties.title || this.title,
        },
        ...(properties.loaderOptions || {}),
      });
    }

    // initialize disclaimer modal
    if (properties.includeDisclaimer) {
      import('./Application/Disclaimer').then((module: any) => {
        const { default: Disclaimer } = module;

        if (!Disclaimer.isAccepted()) {
          new Disclaimer({
            ...(properties.disclaimerOptions || {}),
          });
        }
      });
    }

    // append container to <body>
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const {
      _loader,
      view,
      view: { ui },
      viewControlOptions,
      viewControlPosition,
      title,
      headerOptions,
      headerWidget,
      includeHeader,
      includeUITitle,
      includeScaleBar,
      nextBasemap,
      primaryWidgetsMode,
      primaryWidgets,
      contextualWidgets,
      uiWidgets,
    } = this;

    // control and selector ui positions
    const controlPosition = viewControlPosition === 'left' ? 'top-left' : 'top-right';
    const selectorPosition = viewControlPosition === 'left' ? 'top-right' : 'top-left';

    // clear default zoom
    ui.empty('top-left');

    // ui title
    if (includeHeader === false && includeUITitle === true) {
      const uiTitle = document.createElement('div');
      uiTitle.classList.add(CSS.uiTitle);
      uiTitle.innerHTML = title;
      ui.add(uiTitle, 'top-left');
    }

    if (includeHeader === true) {
      this._header =
        headerWidget ||
        new _Header({
          view,
          title,
          ...headerOptions,
        });
    }

    if (primaryWidgetsMode === 'menu') {
      ui.add(
        (this._menuToggle = new _MenuToggle({
          container: document.createElement('calcite-action-pad'),
        })),
        'top-left',
      );
    }

    // control widget
    ui.add(
      new _Control({
        ...{
          view,
          fullscreenElement: this.container,
        },
        ...viewControlOptions,
      }),
      controlPosition,
    );

    // scale bar
    if (includeScaleBar === true) {
      import('@arcgis/core/widgets/ScaleBar').then((module: any) => {
        ui.add(
          new (module.default as esri.ScaleBarConstructor)({
            view,
            style: 'ruler',
          }),
          'bottom-left',
        );
      });
    }

    // basemap toggle
    if (nextBasemap) {
      import('@arcgis/core/widgets/BasemapToggle').then((module: any) => {
        ui.add(
          new (module.default as esri.BasemapToggleConstructor)({
            view,
            nextBasemap,
          }),
          'bottom-right',
        );
      });
    }

    // initialize panel and UI widgets
    if (primaryWidgets) {
      if (primaryWidgetsMode === 'menu') {
        this._firstMenuPanelIndex = primaryWidgets.findIndex((widgetInfo: cov._WidgetInfo): boolean => {
          return !widgetInfo.modal;
        });
      }

      this._widgetInfos('primary', primaryWidgets);
    }

    if (contextualWidgets) this._widgetInfos('contextual', contextualWidgets);

    if (uiWidgets) {
      this._widgetInfos('ui', uiWidgets);
      ui.add(
        new _Selector({
          actionGroups: this._uiActionGroups,
          panels: this._uiPanels,
          position: selectorPosition,
        }),
        selectorPosition,
      );

      const activeWidgetInfo = uiWidgets.find((widgetInfo: cov._WidgetInfo): boolean => {
        return widgetInfo.active === true;
      });

      if (activeWidgetInfo) {
        this._uiActiveId = activeWidgetInfo.widget.id;
      }
    }

    // assure no view or dom race conditions
    await setTimeout((): 0 => {
      return 0;
    }, 0);

    // set view container
    view.container = document.querySelector('div[data-shell-application-view-container]') as HTMLDivElement;

    // wait for serviceable view
    await view.when();

    // end internal loader
    if (_loader) this._loader.end();
  }

  readonly container = document.createElement('calcite-shell');

  view!: esri.MapView;

  viewControlOptions: cov.ApplicationProperties['viewControlOptions'] = {};

  viewControlPosition: 'left' | 'right' = 'left';

  title = 'My Map';

  includeHeader = true;

  includeUITitle = false;

  headerWidget!: esri.Widget;

  headerOptions: cov.ApplicationProperties['headerOptions'] = {
    includeSearch: true,
  };

  footerWidget?: esri.Widget;

  includeScaleBar = true;

  nextBasemap!: esri.Basemap;

  primaryWidgetsMode: 'static' | 'menu' = 'static';

  @property({
    type: Collection,
  })
  primaryWidgets?: esri.Collection<cov._WidgetInfo>;

  @property({
    type: Collection,
  })
  contextualWidgets?: esri.Collection<cov._WidgetInfo>;

  @property({
    type: Collection,
  })
  uiWidgets?: esri.Collection<cov._WidgetInfo>;

  contextualShellPanel!: esri.Widget;

  /**
   * Initialize widget infos.
   * @param placement
   * @param widgetInfos
   */
  private _widgetInfos(
    placement: 'primary' | 'contextual' | 'ui',
    widgetInfos: esri.Collection<cov._WidgetInfo>,
  ): void {
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
  private _initializeWidget(
    placement: 'primary' | 'contextual' | 'ui',
    widgetInfo: cov._WidgetInfo,
    index: number,
  ): void {
    const { primaryWidgetsMode, _firstMenuPanelIndex } = this;

    const { icon, text, widget, containerElement, modal: isModal } = widgetInfo;

    const modal = isModal === true ? (document.createElement('calcite-modal') as HTMLCalciteModalElement) : null;

    const menu = placement === 'primary' && primaryWidgetsMode === 'menu';

    const firstMenuPanel = menu && index === _firstMenuPanelIndex;

    widgetInfo._action = (
      <calcite-action
        key={KEY++}
        icon={icon}
        text={text}
        active={firstMenuPanel}
        onclick={() => {
          if (modal) {
            modal.setAttribute('active', '');
          } else {
            if (placement !== 'ui') this[`_${placement}Collapsed`] = this[`_${placement}ActiveId`] === widget.id;

            if (menu && this[`_${placement}ActiveId`] !== widget.id) {
              this[`_${placement}ActiveId`] = widget.id;
            }

            if (!menu) {
              this[`_${placement}ActiveId`] = this[`_${placement}ActiveId`] === widget.id ? null : widget.id;
            }
          }
        }}
        afterCreate={(calciteAction: HTMLCalciteActionElement) => {
          if (placement === 'ui') {
            calciteAction.scale = 's';
            calciteAction.title = text;
            if (this._uiActiveId === widget.id && !modal) calciteAction.active = true;
          }
          this.own(
            watch(this, `_${placement}ActiveId`, (id: string): void => {
              calciteAction.active = id === widget.id;
            }),
          );
        }}
      ></calcite-action>
    );

    if (modal) {
      document.body.append(modal);
      widgetInfo.widget.container = modal;
      if (widget.onShow && typeof widget.onShow === 'function') {
        modal.addEventListener('calciteModalOpen', widget.onShow.bind(widget));
      }
      if (widget.onHide && typeof widget.onHide === 'function') {
        modal.addEventListener('calciteModalClose', widget.onHide.bind(widget));
      }
      return;
    }

    this[`_${placement}Panels`].add(
      <calcite-panel
        key={KEY++}
        hidden={!firstMenuPanel}
        afterCreate={(calcitePanel: HTMLCalcitePanelElement) => {
          if (placement === 'ui') {
            calcitePanel.widthScale = 'm';
            calcitePanel.heightScale = 'l';
            if (this._uiActiveId === widget.id) calcitePanel.hidden = false;
          }
          if (containerElement === 'calcite-panel') {
            widget.container = calcitePanel;
          } else {
            widget.container = document.createElement(containerElement || 'div');
            calcitePanel.append(widget.container);
          }
          this.own(
            watch(this, `_${placement}ActiveId`, (id: string, oldId: string): void => {
              calcitePanel.hidden = id !== widget.id;

              // call `onShow` or `onHide`
              // NOTE: `onShow` not called initially on first primary widget when in menu mode
              if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
                widget.onShow.bind(widget);
              }

              if (id !== oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
                widget.onHide.bind(widget);
              }
            }),
          );
        }}
      ></calcite-panel>,
    );
  }

  /**
   * Creates array of `calcite-action-group` VNodes based on WidgetInfo groups and bottom group.
   * @param widgetInfos
   * @returns esri.widget.tsx.JSX.Element[]
   */
  private _createActionGroups(
    widgetInfos: esri.Collection<cov._WidgetInfo>,
    uiWidgets?: boolean,
  ): esri.widget.tsx.JSX.Element[] {
    const groups: esri.widget.tsx.JSX.Element[] = [];

    let actions: esri.widget.tsx.JSX.Element[] = [];

    const bottomActions: esri.widget.tsx.JSX.Element[] = [];

    const groupWidgetInfos = widgetInfos.filter((widgetInfo: cov._WidgetInfo): boolean => {
      return widgetInfo.bottomAction !== true;
    });

    groupWidgetInfos.forEach((widgetInfo: cov._WidgetInfo, index: number) => {
      const { _action, groupEnd } = widgetInfo;

      actions.push(_action);

      if (groupEnd === true || index + 1 === groupWidgetInfos.length) {
        groups.push(<calcite-action-group key={KEY++}>{actions}</calcite-action-group>);
        actions = [];
      }
    });

    widgetInfos
      .filter((widgetInfo: cov._WidgetInfo): boolean => {
        return widgetInfo.bottomAction === true;
      })
      .forEach((widgetInfo: cov._WidgetInfo) => {
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

  render(): esri.widget.tsx.JSX.Element {
    const {
      includeHeader,
      _header,
      footerWidget,
      _menuToggle,
      _menuOpen,
      _primaryActionGroups,
      _primaryPanels,
      _primaryCollapsed,
      _contextualActionGroups,
      _contextualPanels,
      _contextualCollapsed,
      contextualShellPanel,
    } = this;

    return (
      <calcite-shell class={this.classes('', CSS.base)}>
        {/* header widget */}
        {_header && includeHeader ? (
          <div
            slot="header"
            afterCreate={(div: HTMLDivElement) => {
              _header.container = div;
            }}
          ></div>
        ) : null}

        {/* primary panel */}
        {_primaryActionGroups && _primaryActionGroups.length ? (
          <calcite-shell-panel
            slot="primary-panel"
            position="start"
            collapsed={_menuToggle ? null : _primaryCollapsed}
            hidden={_menuToggle && !_menuOpen}
          >
            <calcite-action-bar slot="action-bar">{_primaryActionGroups.toArray()}</calcite-action-bar>
            {_primaryPanels.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* view container */}
        <div class={CSS.view} data-shell-application-view-container=""></div>

        {/* contextual panel */}
        {_contextualActionGroups && _contextualActionGroups.length ? (
          <calcite-shell-panel slot="contextual-panel" position="end" collapsed={_contextualCollapsed}>
            <calcite-action-bar slot="action-bar">{_contextualActionGroups.toArray()}</calcite-action-bar>
            {_contextualPanels.toArray()}
          </calcite-shell-panel>
        ) : null}

        {!_contextualActionGroups && contextualShellPanel ? (
          <calcite-shell-panel
            slot="contextual-panel"
            position="end"
            afterCreate={(calciteShellPanel: HTMLCalciteShellPanelElement): void => {
              contextualShellPanel.container = calciteShellPanel;
            }}
          ></calcite-shell-panel>
        ) : null}

        {/* header widget */}
        {footerWidget ? (
          <div
            slot="footer"
            afterCreate={(div: HTMLDivElement) => {
              footerWidget.container = div;
            }}
          ></div>
        ) : null}
      </calcite-shell>
    );
  }

  /**
   * Loader instance.
   */
  private _loader!: Loader;

  /**
   * Header instance.
   */
  private _header!: esri.Widget;

  /**
   * Primary panel variables.
   */
  private _menuToggle!: _MenuToggle;

  @property({
    aliasOf: '_menuToggle.menuOpen',
  })
  private _menuOpen!: boolean;

  private _firstMenuPanelIndex = -1;

  private _primaryActionGroups!: esri.Collection<esri.widget.tsx.JSX.Element>;

  private _primaryPanels!: esri.Collection<esri.widget.tsx.JSX.Element>;

  // requires decoration
  @property()
  private _primaryActiveId: string | null = null;

  private _primaryCollapsed = true;

  /**
   * Contextual panel variables.
   */
  private _contextualActionGroups!: esri.Collection<esri.widget.tsx.JSX.Element>;

  private _contextualPanels!: esri.Collection<esri.widget.tsx.JSX.Element>;

  // requires decoration
  @property()
  private _contextualActiveId: string | null = null;

  private _contextualCollapsed = true;

  /**
   * UI panel variables.
   */
  private _uiActionGroups!: esri.Collection<esri.widget.tsx.JSX.Element>;

  private _uiPanels!: esri.Collection<esri.widget.tsx.JSX.Element>;

  // requires decoration
  @property()
  private _uiActiveId: string | null = null;
}
