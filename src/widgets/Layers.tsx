import esri = __esri;

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

import type AddWebLayersModal from './AddWebLayersModal';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Collection from '@arcgis/core/core/Collection';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';

const CSS = {
  base: 'cov-widgets--layers',
  notice: 'cov-widgets--layers_notice',
};

let KEY = 0;

@subclass('cov.widgets.Layers')
export default class Layers extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
      /**
       * Layers available to add.
       */
      addLayerInfos?: (AddPortalLayerInfo | AddServerLayerInfo)[];
      /**
       * Include `Add Web Layers` fab.
       */
      addWebLayers?: boolean;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { addLayerInfos } = this;
    if (!addLayerInfos) return;
    addLayerInfos.forEach(this._addLayerInfo.bind(this));
  }

  view!: esri.MapView;

  addLayerInfos!: (AddPortalLayerInfo | AddServerLayerInfo)[];

  addWebLayers = false;

  @property()
  protected state: 'layers' | 'legend' | 'add' = 'layers';

  onHide(): void {
    this.state = 'layers';
  }

  private _addLayerItems: esri.Collection<tsx.JSX.Element> = new Collection();

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
            scale="s"
            text="Add layer"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener(
                'click',
                this._addLayerFromPortalLayerInfo.bind(this, portalItem, action, addLayerInfo, item),
              );
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
            scale="s"
            text="Add layer"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener(
                'click',
                this._addLayerFromServerLayerInfo.bind(this, url, action, addLayerInfo, item),
              );
            }}
          >
            {tooltip}
          </calcite-action>
        </calcite-list-item>
      );
    }

    _addLayerItems.splice(index, 1, item);
  }

  private _addLayerFromPortalLayerInfo(
    portalItem: esri.PortalItem,
    action: HTMLCalciteActionElement,
    addLayerInfo: AddLayerInfo,
    item: tsx.JSX.Element,
  ): void {
    const {
      view: { map },
      _addLayerItems,
    } = this;
    const { index, layerProperties, add } = addLayerInfo;

    action.loading = true;
    action.disabled = true;

    Layer.fromPortalItem({
      portalItem,
    }).then((layer: esri.Layer) => {
      for (const layerProperty in layerProperties) {
        //@ts-ignore
        layer[layerProperty] = layerProperties[layerProperty];
      }
      map.add(layer, index);
      if (add && typeof add === 'function') {
        add(layer);
      }
      _addLayerItems.remove(item);
    });
  }

  private _addLayerFromServerLayerInfo(
    url: string,
    action: HTMLCalciteActionElement,
    addLayerInfo: AddLayerInfo,
    item: tsx.JSX.Element,
  ): void {
    const {
      view: { map },
      _addLayerItems,
    } = this;
    const { index, layerProperties, add } = addLayerInfo;

    action.loading = true;
    action.disabled = true;

    Layer.fromArcGISServerUrl({
      url,
    }).then((layer: esri.Layer) => {
      for (const layerProperty in layerProperties) {
        //@ts-ignore
        layer[layerProperty] = layerProperties[layerProperty];
      }
      map.add(layer, index);
      if (add && typeof add === 'function') {
        add(layer);
      }
      _addLayerItems.remove(item);
    });
  }

  private _addWebLayersModal!: AddWebLayersModal;

  private async _showAddWebLayers(): Promise<void> {
    const { _addWebLayersModal } = this;
    if (!_addWebLayersModal) {
      this._addWebLayersModal = new (await import('./AddWebLayersModal')).default({
        view: this.view,
        container: document.createElement('calcite-modal'),
      });
      document.body.append(this._addWebLayersModal.container);
    }
    this._addWebLayersModal.container.open = true;
  }

  render(): tsx.JSX.Element {
    const { state, addLayerInfos, addWebLayers, _addLayerItems } = this;
    const heading = state === 'layers' ? 'Layers' : state === 'legend' ? 'Legend' : 'Add Layers';
    return (
      <calcite-panel class={CSS.base} heading={heading}>
        {/* header action switch between layers and legend and imagery */}
        <calcite-action
          active={state === 'layers'}
          icon="layers"
          slot="header-actions-end"
          text="Layers"
          onclick={(): void => {
            this.state = 'layers';
          }}
        >
          <calcite-tooltip close-on-click="" label="Layers" placement="bottom" slot="tooltip">
            Layers
          </calcite-tooltip>
        </calcite-action>
        <calcite-action
          active={state === 'legend'}
          icon="legend"
          slot="header-actions-end"
          text="Legend"
          onclick={(): void => {
            this.state = 'legend';
          }}
        >
          <calcite-tooltip close-on-click="" label="Legend" placement="bottom" slot="tooltip">
            Legend
          </calcite-tooltip>
        </calcite-action>
        {addLayerInfos ? (
          <calcite-action
            active={state === 'add'}
            icon="add-layer"
            slot="header-actions-end"
            text="Add layers"
            onclick={(): void => {
              this.state = 'add';
            }}
          >
            <calcite-tooltip close-on-click="" label="Add layers" placement="bottom" slot="tooltip">
              Add layers
            </calcite-tooltip>
          </calcite-action>
        ) : null}
        {/* layers */}
        <div hidden={state !== 'layers'} afterCreate={this._createLayerList.bind(this)}></div>
        {/* legend */}
        <div hidden={state !== 'legend'} afterCreate={this._createLegend.bind(this)}></div>
        {/* add layers */}
        {addLayerInfos ? (
          <div hidden={state !== 'add'}>
            {_addLayerItems.length ? (
              <calcite-list>{_addLayerItems.toArray()}</calcite-list>
            ) : (
              <calcite-notice class={CSS.notice} icon="information" open="">
                <div slot="message">No layers to add</div>
              </calcite-notice>
            )}
          </div>
        ) : null}
        {addWebLayers ? (
          <calcite-fab
            hidden={state !== 'add'}
            icon="layer-service"
            slot={state === 'add' ? 'fab' : null}
            text="Add Web Layers"
            text-enabled=""
            onclick={this._showAddWebLayers.bind(this)}
          ></calcite-fab>
        ) : null}
      </calcite-panel>
    );
  }

  private _createLayerList(container: HTMLDivElement): void {
    new LayerList({
      view: this.view,
      container,
    });
  }

  private _createLegend(container: HTMLDivElement): void {
    new Legend({
      view: this.view,
      container,
    });
  }
}
