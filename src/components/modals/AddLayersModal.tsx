import esri = __esri;

/**
 * AddLayersModal constructor properties.
 */
export interface AddLayersModalProperties extends esri.WidgetProperties {
  /**
   * View to add layers to.
   */
  view: esri.MapView;
}

/**
 * Layer info for layers to add.
 */
interface LayerInfo {
  /**
   * Portal item id.
   * NOTE: loaded from default portal.
   */
  id?: string;
  /**
   * Override portal item title.
   */
  title?: string;
  /**
   * Override portal item snippet.
   */
  snippet?: string;
  /**
   * Service url.
   */
  url?: string;
  /**
   * Layer index.
   */
  index?: number;
  /**
   * Additional layer properties.
   */
  layerProperties?: esri.LayerProperties | any;
  /**
   * Called when layer added.
   */
  add?: (layer: esri.Layer) => void;
}

// import type OAuth from '../../support/OAuth';

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal for adding layers to a map.
 */
@subclass('cov.modals.AddLayersModal')
class AddLayersModal extends Widget {
  constructor(properties: AddLayersModalProperties) {
    super(properties);
  }

  // @property()
  // oAuth?: OAuth;

  render(): tsx.JSX.Element {
    return (
      <calcite-modal width-scale="s">
        <div slot="header">Add Layers</div>
        <div slot="content">
          <calcite-tabs>
            <calcite-tab-nav slot="title-group">
              <calcite-tab-title selected="">Layer</calcite-tab-title>
              <calcite-tab-title>Web Service</calcite-tab-title>
              <calcite-tab-title>Search</calcite-tab-title>
            </calcite-tab-nav>
            <calcite-tab selected=""></calcite-tab>
            <calcite-tab></calcite-tab>
            <calcite-tab></calcite-tab>
          </calcite-tabs>
        </div>
        <calcite-button
          slot="primary"
          width="full"
          onclick={(): void => {
            (this.container as HTMLCalciteModalElement).open = false;
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}

export default AddLayersModal;
