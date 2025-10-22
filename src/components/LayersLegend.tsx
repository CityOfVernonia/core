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
        <arcgis-legend
          hidden={_viewState !== 'legend'}
          view={view}
          // afterCreate={this._legendAfterCreate.bind(this)}
        ></arcgis-legend>
      </calcite-panel>
    );
  }

  // private _legendAfterCreate(legend: HTMLArcgisLegendElement): void {
  //   // @ts-expect-error dev temp
  //   window.temp = legend.shadowRoot;

  //   const legendShadowRoot = legend.shadowRoot;

  //   if (!legendShadowRoot) return;

  //   const observerCallback = (mutations: MutationRecord[]): void => {
  //     for (const mutation of mutations) {
  //       if (mutation.type === 'childList') {
  //         mutation.addedNodes.forEach((node: Node) => {
  //           if (node.nodeType === Node.ELEMENT_NODE) {
  //             const classicViewShadowRoot = (node as HTMLDivElement).querySelector(
  //               'arcgis-legend-classic-view',
  //             )?.shadowRoot;

  //             if (!classicViewShadowRoot) return;

  //             const style = document.createElement('style');

  //             style.textContent = `
  //               * {
  //                 font-weight: var(--cov-layers-legend-font-weight) !important;
  //               }

  //               .arcgis-legend__symbol svg {
  //                 transform: scale(75%) !important;
  //               }
  //             `;

  //             classicViewShadowRoot.appendChild(style);
  //           }
  //         });
  //       }
  //     }
  //   };

  //   const observer = new MutationObserver(observerCallback);

  //   observer.observe(legendShadowRoot, { childList: true, subtree: true });
  // }
}
