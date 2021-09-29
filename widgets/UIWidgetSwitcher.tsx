/**
 * A widget switcher for use in the view's UI.
 */
import cov = __cov;

import { watch } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import './UIWidgetSwitcher.scss';
const CSS = {
  panelContainer: 'cov-ui-widget-switcher--panel-container',
  widgetPanel: 'cov-ui-widget-switcher--panel',
  'vertical-left': 'cov-ui-widget-switcher--vertical-left',
  'horizontal-left': 'cov-ui-widget-switcher--horizontal-left',
  'vertical-right': 'cov-ui-widget-switcher--vertical-right',
  'horizontal-right': 'cov-ui-widget-switcher--horizontal-right',
};

let KEY = 0;

@subclass('cov.widgets.UIWidgetSwitcher')
export default class UIWidgetSwitcher extends Widget {
  @property({
    type: Collection,
  })
  widgetInfos!: esri.Collection<cov.WidgetInfo>;

  @property()
  layout: 'vertical' | 'horizontal' = 'vertical';

  @property()
  panelPosition: 'right' | 'left' = 'right';

  @property()
  panelWidthScale: 's' | 'm' | 'l' = 'm';

  @property()
  panelHeightScale: 's' | 'm' | 'l' = 'l';

  @property()
  private _active: string | null = null;

  @property()
  private _actions: tsx.JSX.Element[] = [];

  @property()
  private _panels: tsx.JSX.Element[] = [];

  constructor(properties: cov.UIWidgetSwitcherProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.widgetInfos.forEach(this.add.bind(this));
  }

  /**
   * Add action and panel.
   * @param widgetInfo
   */
  add(widgetInfo: cov.WidgetInfo): void {
    const { panelWidthScale, panelHeightScale, _actions, _panels } = this;
    const { icon, text, widget } = widgetInfo;

    _actions.push(
      <calcite-action
        key={KEY++}
        scale="s"
        icon={icon}
        text={text}
        title={text}
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
        key={KEY++}
        class={CSS.widgetPanel}
        hidden=""
        width-scale={panelWidthScale}
        height-scale={panelHeightScale}
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
  }

  render(): tsx.JSX.Element {
    const { layout, panelPosition, _actions, _panels } = this;
    return (
      <div>
        <calcite-action-pad layout={layout} expand-disabled="">
          {_actions}
        </calcite-action-pad>
        <div class={this.classes(CSS.panelContainer, CSS[`${layout}-${panelPosition}`])}>{_panels}</div>
      </div>
    );
  }
}
