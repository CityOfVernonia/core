import esri = __esri;

export interface SwitcherWidgetProperties extends Object {
  /**
   * Calcite action text/title.
   */
  text: string;
  /**
   * Calcite action icon.
   */
  icon: string;
  /**
   * The widget of your choosing.
   */
  widget: esri.Widget & { onShow?: () => void | undefined; onHide?: () => void | undefined };
}

export interface WidgetSwitcherProperties extends esri.WidgetProperties {
  /**
   * Array of SwitcherWidgetProperties to switch between.
   */
  widgets: SwitcherWidgetProperties[];
  /**
   * Calcite theme.
   */
  theme?: 'light' | 'dark';
  /**
   * Calcite scale.
   */
  scale?: 's' | 'm' | 'l';
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './WidgetSwitcher/styles/WidgetSwitcher.scss';
const CSS = {
  base: 'cov-widget-switcher',
  container: 'cov-widget-switcher--container',
  widget: 'cov-widget-switcher--widget',
  pad: 'cov-widget-switcher--pad',
};

let KEY = 0;

@subclass('cov.widgets.WidgetSwitcher')
export default class WidgetSwitcher extends Widget {
  /**
   * Constructor/public properties.
   */
  @property()
  widgets: SwitcherWidgetProperties[] = [];

  @property()
  theme = 'light';

  @property()
  scale: 's' | 'm' | 'l' = 's';

  /**
   * private properties
   */
  @property()
  private _activeWidgetId: string | null = null;

  @property()
  private _container!: HTMLDivElement;

  @property()
  private _actions: tsx.JSX.Element[] = [];

  @property()
  private _widgets: {
    [key: string]: {
      widget: esri.Widget & { onShow?: () => void | undefined; onHide?: () => void | undefined };
      action: tsx.JSX.Element;
      icon: string;
      container: HTMLDivElement;
    };
  } = {};

  constructor(properties?: WidgetSwitcherProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { id, widgets, scale, _actions, _widgets } = this;

    if (!widgets.length) this.destroy();

    widgets.forEach((switcherWidgetProperties: SwitcherWidgetProperties): void => {
      const { text, icon, widget } = switcherWidgetProperties;

      const _id = `${id}_widget_${widget.id}`;

      const action = (
        <calcite-action
          key={KEY++}
          text={text}
          title={text}
          icon={icon}
          scale={scale}
          onclick={this._switch.bind(this, _id)}
        ></calcite-action>
      );

      _actions.push(action);

      const container = (widget.container = document.createElement('div'));
      container.classList.add(CSS.widget);

      _widgets[_id] = {
        widget,
        action,
        icon,
        container,
      };
    });
  }

  /**
   * show, hide or switch widget
   * @param id
   */
  private _switch(id: string): void {
    const { _activeWidgetId, _container, _widgets } = this;

    const { widget, action, icon, container } = _widgets[id];

    if (!_activeWidgetId) {
      /**
       * show widget
       */
      _container.append(container);
      if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
      // @ts-ignore
      action.domNode.setAttribute('icon', 'chevron-right');
      this._activeWidgetId = id;
    } else if (_activeWidgetId === id) {
      /**
       * hide active widget
       */
      _container.removeChild(container);
      if (widget.onHide && typeof widget.onHide === 'function') widget.onHide();
      // @ts-ignore
      action.domNode.setAttribute('icon', icon);
      this._activeWidgetId = null;
    } else {
      /**
       * switch active widget
       */
      const activeWidget = _widgets[_activeWidgetId];
      if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
      if (activeWidget.widget.onHide && typeof activeWidget.widget.onHide === 'function') activeWidget.widget.onHide();
      // @ts-ignore
      activeWidget.action.domNode.setAttribute('icon', activeWidget.icon);
      // @ts-ignore
      action.domNode.setAttribute('icon', 'chevron-right');
      _container.removeChild(_container.firstChild as HTMLDivElement);
      _container.append(container);
      this._activeWidgetId = id;
    }

    this.scheduleRender();
  }

  render(): tsx.JSX.Element {
    const { theme, _actions } = this;
    return (
      <div class={CSS.base}>
        <div
          class={CSS.container}
          bind={this}
          afterCreate={(div: HTMLDivElement) => {
            this._container = div;
          }}
        ></div>
        <div class={CSS.pad}>
          <calcite-action-pad theme={theme} expand-disabled="">
            {_actions}
          </calcite-action-pad>
        </div>
      </div>
    );
  }
}
