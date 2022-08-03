////////////////////////////////////////////
// types
////////////////////////////////////////////

import esri = __esri;
import type { LayoutProperties } from './Layout';

////////////////////////////////////////////
// interfaces
////////////////////////////////////////////

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
   * NOTE: the `widget` must return `calcite-panel` root VNode element unless modal.
   */
  widget: esri.Widget & {
    /**
     * Function called when widget container panel is shown.
     */
    onShow?: () => void | undefined;
    /**
     * Function called when widget container panel is hidden.
     */
    onHide?: () => void | undefined;
  };

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
   * Set this widget active.
   * Only sets first widget in collection of `WidgetInfos` with `active` property as active.
   */
  active?: boolean;
}

/**
 * Internal widget info.
 */
interface _WidgetInfo extends WidgetInfo {
  _action: tsx.JSX.Element;
}

////////////////////////////////////////////
// modules
////////////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/reactiveUtils';
import Layout, { CSS } from './Layout';

let KEY = 0;

/**
 * Application layout with action bar and floating widgets.
 */
@subclass('cov.layouts.ActionBarLayout')
export default class ActionBarLayout extends Layout {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(
    properties: esri.WidgetProperties &
      LayoutProperties & {
        /**
         * Widget infos to add to action pad.
         */
        widgetInfos: Collection<WidgetInfo> | WidgetInfo[];
      },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view: { ui },
      widgetInfos,
    } = this;

    ui.add(new ActionPadPanels({ widgetInfos }), 'top-right');
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  @property({ type: Collection })
  widgetInfos!: Collection<_WidgetInfo>;

  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { view, header, footer } = this;
    return (
      <calcite-shell content-behind="">
        {/* header */}
        {header ? (
          <div
            slot="header"
            afterCreate={(container: HTMLDivElement) => {
              header.container = container;
            }}
          ></div>
        ) : null}
        {/* view */}
        <div
          class={CSS.view}
          afterCreate={(container: HTMLDivElement) => {
            view.container = container;
          }}
        ></div>
        {/* footer */}
        {footer ? (
          <div
            slot="footer"
            afterCreate={(container: HTMLDivElement) => {
              footer.container = container;
            }}
          ></div>
        ) : null}
      </calcite-shell>
    );
  }
}

/**
 * Action pad with panels.
 */
@subclass('ActionPadPanels')
class ActionPadPanels extends Widget {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Widget infos to add to action pad.
       */
      widgetInfos: Collection<WidgetInfo> | WidgetInfo[];
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { widgetInfos } = this;

    // set first widget info with active property
    const active = widgetInfos.find((widgetInfo: _WidgetInfo): boolean => {
      return widgetInfo.active === true;
    });

    // set active widget
    if (active && !active.modal) {
      this._activeId = active.widget.id;
    }

    // create actions, action tooltips and panels/modals
    this._createActionsPanels();

    // create action groups
    this._createActionGroups();
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  @property({ type: Collection })
  widgetInfos!: Collection<_WidgetInfo>;

  ////////////////////////////////////////////
  // variables
  ////////////////////////////////////////////

  private _tooltips: Collection<tsx.JSX.Element> = new Collection();

  private _actionGroups: Collection<tsx.JSX.Element> = new Collection();

  private _panels: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _activeId: string | null = null;

  ////////////////////////////////////////////
  // private methods
  ////////////////////////////////////////////

  /**
   * create actions, action tooltips and panels/modals
   */
  private _createActionsPanels(): void {
    const { id, widgetInfos, _activeId, _tooltips, _panels } = this;

    // for each widget info
    widgetInfos.forEach((widgetInfo: _WidgetInfo): void => {
      const { icon, text, widget, modal: isModal } = widgetInfo;

      // create modal element if widget is modal
      const modal = isModal === true ? (document.createElement('calcite-modal') as HTMLCalciteModalElement) : null;

      // id for action and tooltip reference
      const actionId = `action_${id}_${KEY++}`;

      // create action
      const action = (
        <calcite-action
          key={KEY++}
          id={actionId}
          icon={icon}
          text={text}
          scale="s"
          active={widget.id === _activeId}
          afterCreate={this._actionAfterCreate.bind(this, widget, modal)}
        ></calcite-action>
      );

      // set _action property
      widgetInfo._action = action;

      // create tooltip
      _tooltips.add(
        <calcite-tooltip key={KEY++} reference-element={actionId} close-on-click="">
          {text}
        </calcite-tooltip>,
      );

      // create modal or panel
      if (modal) {
        // append element
        document.body.append(modal);

        // set container
        widget.container = modal;

        // wire on show/hide events
        modal.addEventListener('calciteModalOpen', (): void => {
          if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
        });

        modal.addEventListener('calciteModalClose', (): void => {
          if (widget.onHide && typeof widget.onHide === 'function') widget.onHide();
        });
      } else {
        _panels.add(
          <calcite-panel
            key={KEY++}
            width-scale="m"
            hidden={widget.id !== _activeId}
            afterCreate={this._panelAfterCreate.bind(this, widget)}
          ></calcite-panel>,
        );
      }
    });
  }

  /**
   * create action groups
   */
  private _createActionGroups(): void {
    const { widgetInfos, _actionGroups } = this;

    let actions: tsx.JSX.Element[] = [];

    widgetInfos.forEach((widgetInfo: _WidgetInfo, index: number) => {
      const { _action, groupEnd } = widgetInfo;

      actions.push(_action);

      if (groupEnd === true || index + 1 === widgetInfos.length) {
        _actionGroups.add(<calcite-action-group key={KEY++}>{actions}</calcite-action-group>);
        actions = [];
      }
    });
  }

  /**
   * wire action click event and set active
   * @param widget
   * @param modal
   * @param action
   */
  private _actionAfterCreate(
    widget: esri.Widget,
    modal: HTMLCalciteModalElement | null,
    action: HTMLCalciteActionElement,
  ): void {
    // open modal or set active panel id
    action.addEventListener('click', (): void => {
      if (modal) {
        modal.open = true;
      } else {
        this._activeId = this._activeId === widget.id ? null : widget.id;
      }
    });

    // set active
    this.own(
      watch(
        (): string | null => this._activeId,
        (id: any): void => {
          action.active = id === widget.id;
        },
      ),
    );
  }

  /**
   * set widget container, hide/unhide and call on hide/show
   * @param widget
   * @param element
   */
  private _panelAfterCreate(widget: WidgetInfo['widget'], element: HTMLCalcitePanelElement | HTMLDivElement): void {
    // set element
    widget.container = element;

    this.own(
      watch(
        (): string | null => this._activeId,
        (id: any, oldId: any): void => {
          // hide/unhide
          element.hidden = id !== widget.id;

          // wire on show/hide events
          if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
            widget.onShow();
          }

          if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
            widget.onHide();
          }
        },
      ),
    );
  }

  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { _actionGroups, _tooltips, _panels } = this;
    return (
      <div>
        <calcite-action-pad expand-disabled="">
          {_actionGroups.toArray()}
          {_tooltips.toArray()}
        </calcite-action-pad>
        <div class={CSS.actionPadPanels}>{_panels.toArray()}</div>
      </div>
    );
  }
}
