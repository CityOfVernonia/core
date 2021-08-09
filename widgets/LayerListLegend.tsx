/**
 * LayerList and Legend widgets tabbed.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// class imports
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';

// styles
import './LayerListLegend.scss';
const CSS = {
  base: 'cov-layer-list-legend',
  scroll: 'cov-layer-list-legend--scroll',
};

// class export
@subclass('cov.widgets.LayerListLegend')
export default class LayerListLegend extends Widget {
  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  theme = 'light';

  @property()
  scale = 'm';

  constructor(properties: cov.LayerListLegendProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const { theme, scale } = this;
    return (
      <div class={CSS.base}>
        <calcite-tabs them={theme} scale={scale} layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Layers</calcite-tab-title>
            <calcite-tab-title>Legend</calcite-tab-title>
          </calcite-tab-nav>
          <calcite-tab active="">
            <div class={CSS.scroll}>
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
            </div>
          </calcite-tab>
          <calcite-tab>
            <div class={CSS.scroll}>
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
            </div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }
}
