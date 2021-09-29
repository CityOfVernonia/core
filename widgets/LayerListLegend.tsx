/**
 * LayerList, Legend, and add layers widgets tabbed.
 */

// namespaces and types
import cov = __cov;

interface AddPortalItemOption extends cov.CollectionElement {
  portal: esri.Portal;
}

// base imports
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Portal from '@arcgis/core/portal/Portal';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';

// styles
import './LayerListLegend.scss';
const CSS = {
  base: 'cov-layer-list-legend cov-tabbed-widget cov-tabbed-widget--no-padding cov-tabbed-widget--scrolling',
  title: 'cov-layer-list-legend--title',
  addLayers: 'cov-layer-list-legend--add-layers',
  addButton: 'cov-layer-list-legend--add-button',
  imageryTab: 'cov-layer-list-legend--imagery-tab',
};

let KEY = 0;

// class export
@subclass('cov.widgets.LayerListLegend')
export default class LayerListLegend extends Widget {
  @property()
  view!: esri.MapView | esri.SceneView;

  @property({
    type: Collection,
  })
  addLayers!: cov.PortalItemToAddProperties[] | esri.Collection<cov.PortalItemToAddProperties>;

  @property()
  addFromWeb = true;

  @property()
  addFromPortals!: esri.Portal[];

  @property()
  imageryBasemap!: esri.Basemap;

  @property({
    type: Collection,
  })
  imageryLayers!: cov.LayerListLegendImageryLayer[] | esri.Collection<cov.LayerListLegendImageryLayer>;

  @property()
  basemapToggle!: esri.BasemapToggle;

  @property()
  private _listItems: esri.Collection<cov.CollectionElement> = new Collection();

  @property()
  private _addFromWebModal!: HTMLCalciteModalElement;

  @property()
  private _addServiceUrlInput!: HTMLCalciteInputElement;

  @property()
  private _invalidServiceUrlInputMessage!: HTMLCalciteInputMessageElement;

  @property()
  private _addPortalItemSelect!: HTMLCalciteSelectElement;

  @property()
  private _addPortalItemOptions: esri.Collection<AddPortalItemOption> = new Collection();

  @property()
  private _addPortalItemInput!: HTMLCalciteInputElement;

  @property()
  private _invalidPortalItemInputMessage!: HTMLCalciteInputMessageElement;

  @property()
  private _imageryRadioButtons: esri.Collection<cov.CollectionElement> = new Collection();

  constructor(properties: cov.LayerListLegendProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { addLayers, addFromPortals, imageryBasemap, imageryLayers } = this;
    if (addLayers) addLayers.forEach(this._createListItems.bind(this));

    if (addFromPortals && addFromPortals.length) {
      addFromPortals.forEach(this._createPortalOptions.bind(this));
    } else {
      this._createPortalOptions(new Portal(), 0);
    }

    if (imageryBasemap && imageryLayers) this._createImageryRadioButtons();
  }

  /**
   * Create list items for layers to add.
   * @param itemToAdd
   */
  private _createListItems(itemToAdd: cov.PortalItemToAddProperties): void {
    const {
      view: { map },
      _listItems,
    } = this;

    const { id, title, snippet, index, layerProperties, add } = itemToAdd;

    const listItem = {
      element: <calcite-list-item key={KEY++}></calcite-list-item>,
    };

    const portalItem = new PortalItem({
      id,
    });

    portalItem
      .load()
      .then(() => {
        listItem.element = (
          <calcite-list-item
            key={KEY++}
            label={title || portalItem.title}
            description={snippet || portalItem.snippet}
            non-interactive=""
          >
            <calcite-action
              slot="actions-end"
              icon="add-layer"
              title="Add layer"
              onclick={(event: Event) => {
                const target = event.target as HTMLCalciteActionElement;
                target.disabled = true;
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
                  _listItems.remove(listItem);
                });
              }}
            ></calcite-action>
          </calcite-list-item>
        );
      })
      .catch(() => {
        _listItems.remove(listItem);
      });

    _listItems.add(listItem);
  }

  /**
   * Create portal options for add portal item.
   * @param portal
   * @param index
   */
  private _createPortalOptions(portal: esri.Portal, index: number): void {
    const { _addPortalItemOptions } = this;
    const name = portal.name;
    const option = {
      portal,
      element: <calcite-option key={KEY++}></calcite-option>,
    };

    _addPortalItemOptions.add(option);

    portal.load().then(() => {
      option.element = (
        <calcite-option key={KEY++} value={index}>
          {name || portal.name}
        </calcite-option>
      );
    });
  }

  /**
   * Add service from url or portal item.
   * @param type
   * @param event
   */
  private _addServicePortalItem(type: 'url' | 'item', event: Event): void {
    const {
      view: { map },
      _addFromWebModal,
      _addServiceUrlInput,
      _invalidServiceUrlInputMessage,
      _addPortalItemOptions,
      _addPortalItemSelect,
      _addPortalItemInput,
      _invalidPortalItemInputMessage,
    } = this;

    let target: HTMLCalciteButtonElement;

    if (type === 'url' && _addServiceUrlInput.value) {
      target = event.target as HTMLCalciteButtonElement;
      target.disabled = true;
      _addServiceUrlInput.disabled = true;

      Layer.fromArcGISServerUrl({
        url: _addServiceUrlInput.value,
      })
        .then((_layer: esri.Layer) => {
          _addFromWebModal.active = false;
          target.disabled = false;
          _addServiceUrlInput.disabled = false;
          _addServiceUrlInput.value = '';
          _invalidServiceUrlInputMessage.active = false;
          map.add(_layer);
        })
        .catch(() => {
          target.disabled = false;
          _addServiceUrlInput.disabled = false;
          _addServiceUrlInput.setFocus();
          _invalidServiceUrlInputMessage.active = true;
        });
    }

    if (type === 'item' && _addPortalItemInput.value) {
      target = event.target as HTMLCalciteButtonElement;
      target.disabled = true;
      _addPortalItemInput.disabled = true;

      const option = _addPortalItemOptions.getItemAt(parseInt(_addPortalItemSelect.selectedOption.value));

      Layer.fromPortalItem({
        portalItem: new PortalItem({
          id: _addPortalItemInput.value,
          portal: option.portal,
        }),
      })
        .then((_layer: esri.Layer) => {
          _addFromWebModal.active = false;
          target.disabled = false;
          _addPortalItemInput.disabled = false;
          _addPortalItemInput.value = '';
          _invalidPortalItemInputMessage.active = false;
          map.add(_layer);
        })
        .catch(() => {
          target.disabled = false;
          _addPortalItemInput.disabled = false;
          _addPortalItemInput.setFocus();
          _invalidPortalItemInputMessage.active = true;
        });
    }
  }

  /**
   * Create radio buttons for imagery.
   */
  private _createImageryRadioButtons(): void {
    const { id, imageryBasemap, imageryLayers, basemapToggle, _imageryRadioButtons } = this;

    imageryLayers.forEach((imageryLayer: cov.LayerListLegendImageryLayer) => {
      const checked = imageryBasemap.baseLayers.getItemAt(0).id === imageryLayer.layer.id;
      const _id = `imagery_radio_button_${id}_${KEY++}`;
      _imageryRadioButtons.add({
        element: (
          <calcite-label
            for={_id}
            layout="inline"
            onclick={() => {
              imageryBasemap.baseLayers.removeAt(0);
              imageryBasemap.baseLayers.add(imageryLayer.layer, 0);
              if (basemapToggle && basemapToggle.activeBasemap !== imageryBasemap) basemapToggle.toggle();
            }}
          >
            <calcite-radio-button key={KEY++} id={_id} checked={checked}></calcite-radio-button>
            {imageryLayer.title}
          </calcite-label>
        ),
      });
    });
  }

  render(): tsx.JSX.Element {
    const { addLayers, addFromWeb, imageryBasemap, imageryLayers, _listItems, _addFromWebModal, _imageryRadioButtons } =
      this;

    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title title="Layers" active="">
              <calcite-icon scale="s" icon="layers"></calcite-icon>
            </calcite-tab-title>
            <calcite-tab-title title="Legend">
              <calcite-icon scale="s" icon="legend"></calcite-icon>
            </calcite-tab-title>
            {addLayers || addFromWeb ? (
              <calcite-tab-title title="Add layers">
                <calcite-icon scale="s" icon="add-layer"></calcite-icon>
              </calcite-tab-title>
            ) : null}
            {imageryBasemap && imageryLayers ? (
              <calcite-tab-title title="Select basemap imagery">
                <calcite-icon scale="s" icon="layer-basemap"></calcite-icon>
              </calcite-tab-title>
            ) : null}
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
          {addLayers || addFromWeb ? (
            <calcite-tab>
              <div class={CSS.addLayers}>
                {_listItems.length ? (
                  _listItems.toArray().map((listItem: cov.CollectionElement) => {
                    return listItem.element;
                  })
                ) : (
                  <p>No layers to add.</p>
                )}
                {addFromWeb ? (
                  <div class={CSS.addButton}>
                    <calcite-button
                      width="full"
                      icon-start="add-layer"
                      onclick={() => {
                        _addFromWebModal.active = true;
                      }}
                    >
                      Add From Web
                    </calcite-button>
                  </div>
                ) : null}
              </div>
            </calcite-tab>
          ) : null}
          {imageryBasemap && imageryLayers ? (
            <calcite-tab>
              <div class={CSS.imageryTab}>
                <p>Select basemap imagery:</p>
                <calcite-radio-button-group layout="vertical">
                  {_imageryRadioButtons.toArray().map((radioButton: cov.CollectionElement): tsx.JSX.Element => {
                    return radioButton.element;
                  })}
                </calcite-radio-button-group>
              </div>
            </calcite-tab>
          ) : null}
        </calcite-tabs>
        {addFromWeb ? this._renderAddFromWebModal() : null}
      </div>
    );
  }

  /**
   * Render add from web modal.
   */
  private _renderAddFromWebModal(): tsx.JSX.Element {
    const { _addFromWebModal, _addPortalItemOptions } = this;
    return (
      <calcite-modal afterCreate={storeNode.bind(this)} data-node-ref="_addFromWebModal">
        <div slot="header">Add web layer</div>
        <div slot="content">
          <div class={CSS.title}>Map or Feature Service</div>
          <calcite-label>
            URL
            <calcite-input
              type="text"
              width="full"
              placeholder="https://<service-url>"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_addServiceUrlInput"
            >
              <calcite-button slot="action" onclick={this._addServicePortalItem.bind(this, 'url')}>
                Add Layer
              </calcite-button>
            </calcite-input>
            <calcite-input-message
              icon=""
              scale="m"
              status="invalid"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_invalidServiceUrlInputMessage"
            >
              Invalid service URL
            </calcite-input-message>
          </calcite-label>
          <div class={CSS.title}>Portal Item</div>
          <calcite-label>
            Portal
            <calcite-select afterCreate={storeNode.bind(this)} data-node-ref="_addPortalItemSelect">
              {_addPortalItemOptions.toArray().map((option: AddPortalItemOption) => {
                return option.element;
              })}
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Item id
            <calcite-input
              type="text"
              width="full"
              placeholder="5dab8...93884"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_addPortalItemInput"
            >
              <calcite-button slot="action" onclick={this._addServicePortalItem.bind(this, 'item')}>
                Add Item
              </calcite-button>
            </calcite-input>
            <calcite-input-message
              icon=""
              scale="m"
              status="invalid"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_invalidPortalItemInputMessage"
            >
              Invalid portal item
            </calcite-input-message>
          </calcite-label>
        </div>
        <calcite-button
          slot="primary"
          width="full"
          onclick={() => {
            _addFromWebModal.active = false;
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
