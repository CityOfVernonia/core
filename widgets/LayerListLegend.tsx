/**
 * LayerList and Legend widgets tabbed.
 */

// namespaces and types
import esri = __esri;

// constructor properties
export interface LayerListLegendProperties extends esri.WidgetProperties {
  /**
   * Application title.
   */
  view: esri.MapView | esri.SceneView;
}

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// class imports
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';

// styles
import './LayerListLegend/styles/LayerListLegend.scss';
const CSS = {
  base: 'cov-layer-list-legend',
};

// class export
@subclass('cov.widgets.LayerListLegend')
export default class LayerListLegend extends Widget {
  @property()
  view!: esri.MapView | esri.SceneView;

  constructor(properties: LayerListLegendProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Layers</calcite-tab-title>
            <calcite-tab-title>Legend</calcite-tab-title>
          </calcite-tab-nav>
          <calcite-tab active="">
            <div
              bind={this}
              afterCreate={(container: HTMLDivElement) => {
                const { view } = this;
                new LayerList({
                  view,
                  container,
                });
              }}
            ></div>
          </calcite-tab>
          <calcite-tab>
            <div
              bind={this}
              afterCreate={(container: HTMLDivElement) => {
                const { view } = this;
                new Legend({
                  view,
                  container,
                });
              }}
            ></div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }
}
