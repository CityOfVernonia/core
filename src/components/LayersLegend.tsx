import esri = __esri;

/**
 * LayersLegend properties.
 */
export interface LayersLegendProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-layer-list';

const CSS = {
  base: 'cov--layers-legend',
};

/**
 * A panel with layer controls and and legend.
 */
@subclass('cov.components.LayersLegend')
export default class LayersLegend extends Widget {
  constructor(properties: LayersLegendProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          if (!visible) this._viewState = 'layers';
        },
      ),
    );
  }

  view!: esri.MapView;

  @property()
  private _viewState: 'layers' | 'legend' = 'layers';

  override render(): tsx.JSX.Element {
    const { view, _viewState } = this;

    const heading = _viewState === 'layers' ? 'Layers' : 'Legend';

    return (
      <calcite-panel class={CSS.base} heading={heading}>
        {/* actions */}
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
        <arcgis-layer-list hidden={_viewState !== 'layers'} view={view}></arcgis-layer-list>

        {/* legend */}
        <arcgis-legend hidden={_viewState !== 'legend'} view={view}></arcgis-legend>
      </calcite-panel>
    );
  }

  // private _layers(layerList: HTMLArcgisLayerListElement & { view: esri.MapView }): void {
  //   layerList.view = this.view;
  // }

  // private _legend(legend: HTMLArcgisLegendElement & { view: esri.MapView }): void {
  //   legend.view = this.view;
  // }
}
