//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Shared add layer info properties.
 */
interface AddLayerInfo {
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

/**
 * Info to add layer via a portal item id.
 */
export interface AddPortalLayerInfo extends AddLayerInfo {
  /**
   * Portal item id.
   * NOTE: loaded from default portal.
   */
  id: string;
  /**
   * Override portal item title.
   */
  title?: string;
  /**
   * Override portal item snippet.
   */
  snippet?: string;
}

/**
 * Info to add layer via a server url.
 */
export interface AddServerLayerInfo extends AddLayerInfo {
  /**
   * Service url.
   */
  url: string;
  /**
   * Item title.
   */
  title: string;
  /**
   * Item snippet.
   */
  snippet: string;
}

/**
 * Add layers modal widget properties.
 */
export interface AddLayersModalProperties extends esri.WidgetProperties {
  /**
   * Layers available to add.
   */
  addLayerInfos?: (AddPortalLayerInfo | AddServerLayerInfo)[];
  /**
   * Map or scene view to add layers.
   */
  view: esri.MapView | esri.SceneView;
}

import type { AlertOptions } from '../layouts/ShellApplicationMap';

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layer from '@arcgis/core/layers/Layer';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Collection from '@arcgis/core/core/Collection';
import { publish } from 'pubsub-js';
import { attributePopup } from '../support/layers';

const CSS = {
  form: 'cov-widgets--add-layers-modal_form',
};

let KEY = 0;

/**
 * Modal widget for adding layers from web resources.
 */
@subclass('cov.widgets.AddLayersModal')
export default class AddLayersModal extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container!: HTMLCalciteModalElement;

  constructor(properties: AddLayersModalProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { addLayerInfos } = this;

    if (addLayerInfos) addLayerInfos.forEach(this._addLayerInfo.bind(this));
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  addLayerInfos!: (AddPortalLayerInfo | AddServerLayerInfo)[];

  view!: esri.MapView | esri.SceneView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _addLayerItems: esri.Collection<tsx.JSX.Element> = new Collection();

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private async _add(event: Event): Promise<void> {
    event.preventDefault();
    const {
      container,
      view,
      view: { map },
    } = this;
    const urlCheck = new RegExp(
      /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    );
    const form = event.target as HTMLFormElement;
    const typeSelect = form.querySelector('calcite-select') as HTMLCalciteSelectElement;
    const type = typeSelect.selectedOption.value as 'arcgis' | 'geojson' | 'kml';
    const urlInput = form.querySelector('calcite-input') as HTMLCalciteInputElement;
    const url = urlInput.value;
    const errorMessage = form.querySelector('calcite-input-message') as HTMLCalciteInputMessageElement;
    const button = form.querySelector('calcite-button[type="submit"]') as HTMLCalciteButtonElement;

    const loading = (): void => {
      typeSelect.disabled = true;
      urlInput.disabled = true;
      button.disabled = true;
    };

    const loaded = async (layer: esri.Layer, message: string): Promise<void> => {
      map.add(layer);
      container.open = false;
      await layer.when();
      view.goTo(layer.fullExtent);
      typeSelect.disabled = false;
      urlInput.disabled = false;
      button.disabled = false;
      urlInput.value = '';
      urlInput.status = 'valid';
      errorMessage.hidden = true;

      publish('shell-application-alert', {
        icon: 'check',
        duration: 'fast',
        label: 'add layers alert',
        message,
      } as AlertOptions);

      if (layer.type === 'feature' || layer.type === 'map-image' || layer.type === 'geojson')
        attributePopup(layer as esri.FeatureLayer | esri.MapImageLayer | esri.GeoJSONLayer);
    };

    const error = (message: string): void => {
      typeSelect.disabled = false;
      urlInput.disabled = false;
      button.disabled = false;
      urlInput.status = 'invalid';
      urlInput.setFocus();
      errorMessage.innerHTML = message;
      errorMessage.hidden = false;
    };

    if (!url) {
      error('URL required');
      return;
    }

    if (!url.match(urlCheck)) {
      error('Invalid URL');
      return;
    }

    loading();

    switch (type) {
      case 'arcgis':
        Layer.fromArcGISServerUrl({
          url,
        })
          .then((layer: esri.Layer): void => {
            loaded(layer, `${layer.title} successfully added`);
          })
          .catch((_error: esri.Error): void => {
            console.log(_error);
            error('Invalid service URL');
          });
        break;
      case 'geojson': {
        const layer = new (await import('@arcgis/core/layers/GeoJSONLayer')).default({
          url,
        });
        layer
          .load()
          .then(async (): Promise<void> => {
            loaded(layer, 'GeoJSON layer successfully added');
          })
          .catch((_error: esri.Error): void => {
            console.log(_error);
            error('Invalid GeoJSON URL');
          });
        break;
      }
      case 'kml': {
        const layer = new (await import('@arcgis/core/layers/KMLLayer')).default({
          url,
        });
        layer
          .load()
          .then((): void => {
            loaded(layer, 'KLM layer successfully added');
          })
          .catch((_error: esri.Error): void => {
            console.log(_error);
            error('Invalid KML URL');
          });
        break;
      }
    }
  }

  private async _addLayerInfo(addLayerInfo: AddPortalLayerInfo | AddServerLayerInfo, index: number): Promise<void> {
    const { _addLayerItems } = this;

    // @ts-ignore
    const { id, url, title, snippet } = addLayerInfo;

    let item = <calcite-list-item key={KEY++}></calcite-list-item>;

    _addLayerItems.add(item, index);

    const tooltip = (
      <calcite-tooltip close-on-click="" label="Add layer" slot="tooltip">
        Add layer
      </calcite-tooltip>
    );

    if (id) {
      const portalItem = new PortalItem({
        id,
      });

      await portalItem.load();

      item = (
        <calcite-list-item key={KEY++} label={title || portalItem.title} description={snippet || portalItem.snippet}>
          <calcite-action
            slot="actions-end"
            icon="add-layer"
            text="Add layer"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              // action.addEventListener(
              //   'click',
              //   this._addLayerFromPortalLayerInfo.bind(this, portalItem, action, addLayerInfo, item),
              // );
            }}
          >
            {tooltip}
          </calcite-action>
        </calcite-list-item>
      );
    } else if (url) {
      item = (
        <calcite-list-item key={KEY++} label={title} description={snippet}>
          <calcite-action
            slot="actions-end"
            icon="add-layer"
            text="Add layer"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              // action.addEventListener(
              //   'click',
              //   this._addLayerFromServerLayerInfo.bind(this, url, action, addLayerInfo, item),
              // );
            }}
          >
            {tooltip}
          </calcite-action>
        </calcite-list-item>
      );
    }

    _addLayerItems.splice(index, 1, item);
  }

  //////////////////////////////////////
  // Render and render methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { addLayerInfos, _addLayerItems } = this;

    return (
      <calcite-modal style="--calcite-modal-content-padding: 0.25rem;" width="s">
        <div slot="header">Add layers</div>

        <calcite-tabs layout="center" slot="content">
          <calcite-tab-nav slot="title-group">
            {addLayerInfos ? <calcite-tab-title selected={addLayerInfos}>Layers</calcite-tab-title> : null}

            <calcite-tab-title selected={!addLayerInfos}>Web</calcite-tab-title>
            <calcite-tab-title>Search</calcite-tab-title>
          </calcite-tab-nav>
          {/* layers tab */}
          {addLayerInfos ? (
            <calcite-tab selected={addLayerInfos}>
              <calcite-list>{_addLayerItems.toArray()}</calcite-list>
            </calcite-tab>
          ) : null}
          {/* web tab */}
          <calcite-tab selected={!addLayerInfos}>
            <form class={CSS.form} onsubmit={this._add.bind(this)}>
              <calcite-label>
                Type
                <calcite-select>
                  <calcite-option label="ArcGIS web service" value="arcgis"></calcite-option>
                  <calcite-option label="GeoJSON" value="geojson"></calcite-option>
                  <calcite-option label="KML" value="kml"></calcite-option>
                </calcite-select>
              </calcite-label>
              <calcite-label>
                URL
                <calcite-input type="text" placeholder="https://<web service url>"></calcite-input>
                <calcite-input-message hidden={true} icon="" status="invalid"></calcite-input-message>
              </calcite-label>
              <calcite-button type="submit">Add</calcite-button>
            </form>
          </calcite-tab>
          {/* search tab */}
          <calcite-tab>
            <calcite-notice icon="plane" open="">
              <div slot="message">Cross continents quickly</div>
            </calcite-notice>
          </calcite-tab>
        </calcite-tabs>

        {/* <calcite-button
          appearance="outline"
          slot="secondary"
          width="full"
          onclick={(): void => {
            this.container.open = false;
          }}
        >
          Close
        </calcite-button> */}
      </calcite-modal>
    );
  }
}
