import esri = __esri;

/**
 * Attribution constructor properties.
 */
export interface AttributionProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import AttributionViewModel from '@arcgis/core/widgets/Attribution/AttributionViewModel';
import { referenceElement } from './support';

const CSS_BASE = 'cov--attribution';

const CSS = {
  attribution: CSS_BASE,
  attributionContent: `${CSS_BASE}_content`,
};

/**
 * Attribution component to replace default ArcGIS attribution.
 */
@subclass('cov.components.Attribution')
export default class Attribution extends Widget {
  constructor(properties: AttributionProperties) {
    super(properties);

    this._vm.view = properties.view;

    this.container = document.createElement('calcite-action-bar');
  }

  readonly view!: esri.MapView;

  private _vm = new AttributionViewModel();

  @property({ aliasOf: '_vm.items' })
  private _items?: esri.Collection<esri.AttributionItem>;

  override render(): tsx.JSX.Element {
    const { _items } = this;

    const attribution = _items
      ?.map((item: esri.AttributionItem): string => {
        return item.text;
      })
      .join(', ');

    return (
      <calcite-action-bar class={CSS.attribution} expand-disabled="" floating scale="s">
        <calcite-action icon="map-information" scale="s" text="Attribution"></calcite-action>
        <calcite-popover
          auto-close=""
          closable
          heading="Powered by Esri"
          overlay-positioning="fixed"
          placement="top"
          scale="s"
          afterCreate={referenceElement}
        >
          <div class={CSS.attributionContent}>{attribution}</div>
        </calcite-popover>
      </calcite-action-bar>
    );
  }
}
