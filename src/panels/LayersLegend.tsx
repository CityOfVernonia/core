//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * LayersLegend panel constructor properties.
 */
export interface LayersLegendConstructorProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  base: 'cov-panels--layers-legend',
};

/**
 * A panel component to display layer list and legend.
 */
@subclass('cov.panels.LayersLegend')
class LayersLegend extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: LayersLegendConstructorProperties) {
    super(properties);
  }

  postInitialize(): void {
    this.addHandles(
      this.watch('visible', (visible: boolean): void => {
        if (!visible) this._viewState = 'layers';
      }),
    );
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _viewState: 'layers' | 'legend' = 'layers';

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _viewState } = this;
    const heading = _viewState === 'layers' ? 'Layers' : 'Legend';
    return (
      <calcite-panel class={CSS.base} heading={heading}>
        <calcite-action
          active={_viewState === 'layers'}
          icon="layers"
          slot="header-actions-end"
          text="Layers"
          onclick={(): void => {
            this._viewState = 'layers';
          }}
        >
          <calcite-tooltip close-on-click="" label="Layers" placement="bottom" slot="tooltip">
            Layers
          </calcite-tooltip>
        </calcite-action>
        <calcite-action
          active={_viewState === 'legend'}
          icon="legend"
          slot="header-actions-end"
          text="Legend"
          onclick={(): void => {
            this._viewState = 'legend';
          }}
        >
          <calcite-tooltip close-on-click="" label="Legend" placement="bottom" slot="tooltip">
            Legend
          </calcite-tooltip>
        </calcite-action>
        {/* layers */}
        <div hidden={_viewState !== 'layers'} afterCreate={this._createLayerList.bind(this)}></div>
        {/* legend */}
        <div hidden={_viewState !== 'legend'} afterCreate={this._createLegend.bind(this)}></div>
      </calcite-panel>
    );
  }

  /**
   * Create LayerList.
   * @param container HTMLDivElement
   */
  private _createLayerList(container: HTMLDivElement): void {
    new LayerList({
      view: this.view,
      container,
    });
  }

  /**
   * Create Legend.
   * @param container HTMLDivElement
   */
  private _createLegend(container: HTMLDivElement): void {
    new Legend({
      view: this.view,
      container,
    });
  }
}

export default LayersLegend;
