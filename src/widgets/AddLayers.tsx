import esri = __esri;

interface AddLayerInfo extends Object {
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

interface AddPortalLayerInfo extends AddLayerInfo {
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

interface AddServerLayerInfo extends AddLayerInfo {
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

export type AddLayerInfos = (AddPortalLayerInfo | AddServerLayerInfo)[];

interface QueriedPortalItem extends Object {
  id: string;
  element: tsx.JSX.Element;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';

const CSS = {
  base: 'cov-add-layers-widget',
  content: 'cov-add-layers-widget--content',
  message: 'cov-add-layers-widget--message',
};

let KEY = 0;

@subclass('cov.widgets.AddLayers')
export default class AddLayers extends Widget {
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
       * Portal to search for layers to add.
       */
      portal?: esri.Portal;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { addLayerInfos, portal } = this;

    if (addLayerInfos) {
      this._addLayersItems = new Collection();
      addLayerInfos.forEach(this._addLayerInfo.bind(this));
    }

    if (portal) this._addQueriedLayersItems = new Collection();

    if (portal && !portal.loaded) portal.load();

    if (!addLayerInfos && !portal) this.state = 'web';

    if (!addLayerInfos && portal) this.state = 'search';
  }

  view!: esri.MapView;

  addLayerInfos!: AddLayerInfos;

  portal?: esri.Portal;

  @property()
  protected state: 'add' | 'search' | 'web' = 'add';

  private _kmlLayer!: esri.KMLLayerConstructor;

  private async _addLayerInfo(addLayerInfo: AddPortalLayerInfo | AddServerLayerInfo, index: number): Promise<void> {
    const { _addLayersItems } = this;

    // @ts-ignore
    const { id, url, title, snippet } = addLayerInfo;

    let item = <calcite-list-item key={KEY++}></calcite-list-item>;

    _addLayersItems.add(item, index);

    if (id) {
      const portalItem = new PortalItem({
        id,
      });

      await portalItem.load();

      item = (
        <calcite-list-item
          key={KEY++}
          label={title || portalItem.title}
          description={snippet || portalItem.snippet}
          non-interactive=""
        >
          <calcite-action
            slot="actions-end"
            icon="add-layer"
            scale="s"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener(
                'click',
                this._addLayerFromPortalLayerInfo.bind(this, portalItem, action, addLayerInfo, item),
              );
            }}
          ></calcite-action>
        </calcite-list-item>
      );
    } else if (url) {
      item = (
        <calcite-list-item key={KEY++} label={title} description={snippet} non-interactive="">
          <calcite-action
            slot="actions-end"
            icon="add-layer"
            scale="s"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener(
                'click',
                this._addLayerFromServerLayerInfo.bind(this, url, action, addLayerInfo, item),
              );
            }}
          ></calcite-action>
        </calcite-list-item>
      );
    }

    _addLayersItems.splice(index, 1, item);
  }

  private _addLayerFromPortalLayerInfo(
    portalItem: esri.PortalItem,
    action: HTMLCalciteActionElement,
    addLayerInfo: AddLayerInfo,
    item: tsx.JSX.Element,
  ): void {
    const {
      view: { map },
      _addLayersItems,
    } = this;
    const { index, layerProperties, add } = addLayerInfo;

    action.loading = true;

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
      _addLayersItems.remove(item);
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
      _addLayersItems,
    } = this;
    const { index, layerProperties, add } = addLayerInfo;

    action.loading = true;

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
      _addLayersItems.remove(item);
    });
  }

  private _controller: AbortController | null = null;

  private _abort(): void {
    const { _controller } = this;
    if (_controller) {
      _controller.abort();
      this._controller = null;
    }
  }

  private _queryLayers(value: string): void {
    const {
      view: {
        map: { layers },
      },
      portal,
      _addQueriedLayersItems,
    } = this;

    if (!portal || !_addQueriedLayersItems) return;

    const { id } = portal;

    this._abort();

    if (!value) {
      _addQueriedLayersItems.removeAll();
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    this._controller = controller;

    const allLayers = `(type:("Feature Collection" OR "Feature Service" OR "Stream Service" OR "WFS" OR "Map Service" OR "WMS" OR "Image Service") -typekeywords:("Table" OR "Hosted" OR "Tiled") -type:("Web Map" OR "Web Mapping Application" OR "Shapefile")) -type:("Code Attachment" OR "Featured Items") -typekeywords:("MapAreaPackage") -type:("Map Area")`;

    const query = `${value} orgid:${id} ${allLayers}`;

    portal
      .queryItems(
        {
          query,
          num: 6,
        },
        { signal },
      )
      .then((result: esri.PortalQueryResult): void => {
        if (this._controller !== controller) return;
        this._controller = null;

        // result collection
        const results = new Collection(result.results);

        // remove any existing items which are not in the results
        _addQueriedLayersItems.forEach((item: QueriedPortalItem): void => {
          const exists = results.findIndex((portalItem: PortalItem): boolean => {
            return portalItem.id === item.id;
          });

          if (exists === -1) {
            _addQueriedLayersItems.remove(item);
          }
        });

        // handle results
        results.forEach(async (portalItem: esri.PortalItem): Promise<void> => {
          // serviceable portal item
          await portalItem.when();

          const { id, title, snippet, url } = portalItem;

          // index
          const exists = _addQueriedLayersItems.findIndex((item: QueriedPortalItem): boolean => {
            return portalItem.id === item.id;
          });

          // check if layer is map by portal id and url
          // maybe redundant...check by url only?
          const inMapPortalId = layers.find((portalLayer: any): boolean => {
            if (!portalLayer.portalItem) return false;
            return portalLayer.portalItem.id === id;
          });

          const inMapUrl = layers.find((portalLayer: any): boolean => {
            if (!portalLayer.url) return false;
            return portalLayer.url === url;
          });

          // add item if it doesn't exist
          if (exists === -1 && !inMapPortalId && !inMapUrl) {
            const item: QueriedPortalItem = {
              id,
              element: (
                <calcite-list-item key={KEY++} label={title} description={snippet} non-interactive="">
                  <calcite-action
                    slot="actions-end"
                    icon="add-layer"
                    scale="s"
                    afterCreate={(action: HTMLCalciteActionElement): void => {
                      action.addEventListener('click', this._addLayerFromPortal.bind(this, portalItem, action, item));
                    }}
                  ></calcite-action>
                </calcite-list-item>
              ),
            };
            _addQueriedLayersItems.add(item);
          }
        });
      })
      .catch((error: esri.Error): void => {
        if (this._controller !== controller) return;
        this._controller = null;
        console.log(error);
      });
  }

  private _addLayerFromPortal(
    portalItem: esri.PortalItem,
    action: HTMLCalciteActionElement,
    item: QueriedPortalItem,
  ): void {
    const {
      view: { map },
      _addQueriedLayersItems,
    } = this;

    action.loading = true;

    Layer.fromPortalItem({
      portalItem,
    }).then((layer: esri.Layer) => {
      map.add(layer);
      _addQueriedLayersItems.remove(item);
    });
  }

  private _addLayerFromWeb(event: Event): void {
    event.preventDefault();

    const {
      view: { map },
    } = this;

    const urlCheck = new RegExp(
      /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    );

    const form = event.target as HTMLFormElement;

    const typeSelect = form.querySelector('calcite-select') as HTMLCalciteSelectElement;

    const type = typeSelect.selectedOption.value as 'arcgis' | 'kml';

    const urlInput = form.querySelector('calcite-input') as HTMLCalciteInputElement;

    const url = urlInput.value;

    const errorMessage = form.querySelector('calcite-input-message') as HTMLCalciteInputMessageElement;

    const button = form.querySelector('calcite-button') as HTMLCalciteButtonElement;

    const loading = (): void => {
      typeSelect.disabled = true;
      urlInput.disabled = true;
      button.loading = true;
    };

    const loaded = (): void => {
      typeSelect.disabled = false;
      urlInput.disabled = false;
      button.loading = false;
      urlInput.value = '';
      urlInput.status = 'valid';
      errorMessage.active = false;
    };

    const error = (message: string): void => {
      typeSelect.disabled = false;
      urlInput.disabled = false;
      button.loading = false;
      urlInput.status = 'invalid';
      urlInput.setFocus();
      errorMessage.innerHTML = message;
      errorMessage.active = true;
    };

    const addKML = (layer: esri.KMLLayer): void => {
      layer
        .load()
        .then((): void => {
          map.add(layer);
          loaded();
        })
        .catch((_error: esri.Error): void => {
          console.log(_error);
          error('Invalid KML URL');
        });
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

    if (type === 'arcgis') {
      Layer.fromArcGISServerUrl({
        url,
      })
        .then((layer: esri.Layer): void => {
          map.add(layer);
          loaded();
        })
        .catch((_error: esri.Error): void => {
          console.log(_error);
          error('Invalid service URL');
        });
    }

    if (type === 'kml') {
      if (!this._kmlLayer) {
        import('@arcgis/core/layers/KMLLayer').then((module: any): void => {
          this._kmlLayer = module.default as esri.KMLLayerConstructor;

          const layer = new this._kmlLayer({
            url,
          });

          addKML(layer);
        });
      } else {
        const layer = new this._kmlLayer({
          url,
        });

        addKML(layer);
      }
    }
  }

  render(): tsx.JSX.Element {
    const { id, addLayerInfos, portal, state, _addLayersItems, _addQueriedLayersItems } = this;

    const tooltips = [0, 1, 2].map((num: number): string => {
      return `tooltip_${id}_${num}_${KEY++}`;
    });

    return (
      <calcite-panel class={CSS.base} heading="Add Layers">
        {addLayerInfos ? (
          <calcite-tooltip-manager slot="header-actions-end">
            <calcite-action
              id={tooltips[0]}
              active={state === 'add'}
              icon="add-layer"
              onclick={(): void => {
                this.state = 'add';
              }}
            ></calcite-action>
            <calcite-tooltip reference-element={tooltips[0]} overlay-positioning="fixed" placement="bottom">
              Add layers
            </calcite-tooltip>
          </calcite-tooltip-manager>
        ) : null}

        {portal ? (
          <calcite-tooltip-manager slot="header-actions-end">
            <calcite-action
              id={tooltips[1]}
              active={state === 'search'}
              icon="search"
              onclick={(): void => {
                this.state = 'search';
              }}
            ></calcite-action>
            <calcite-tooltip reference-element={tooltips[1]} overlay-positioning="fixed" placement="bottom">
              Search layers
            </calcite-tooltip>
          </calcite-tooltip-manager>
        ) : null}

        {addLayerInfos || portal ? (
          <calcite-tooltip-manager slot="header-actions-end">
            <calcite-action
              id={tooltips[2]}
              active={state === 'web'}
              icon="layer-service"
              onclick={(): void => {
                this.state = 'web';
              }}
            ></calcite-action>
            <calcite-tooltip reference-element={tooltips[2]} overlay-positioning="fixed" placement="bottom">
              Web layers
            </calcite-tooltip>
          </calcite-tooltip-manager>
        ) : null}

        {addLayerInfos ? (
          <div hidden={state !== 'add'}>
            {_addLayersItems.length ? (
              <calcite-list>{_addLayersItems.toArray()}</calcite-list>
            ) : (
              <p class={CSS.message}>No layers to add.</p>
            )}
          </div>
        ) : null}

        {portal ? (
          <div hidden={state !== 'search'}>
            <div class={CSS.content}>
              {/* <calcite-label> */}
              <calcite-input
                type="text"
                clearable=""
                placeholder="Search by name or keyword"
                afterCreate={(input: HTMLCalciteInputElement): void => {
                  input.addEventListener('calciteInputInput', (): void => {
                    this._queryLayers(input.value);
                  });
                }}
              ></calcite-input>
              {/* </calcite-label> */}
            </div>
            <calcite-list>
              {_addQueriedLayersItems
                .map((item: { id: string; element: tsx.JSX.Element }): tsx.JSX.Element => {
                  return item.element;
                })
                .toArray()}
            </calcite-list>
          </div>
        ) : null}

        <div class={CSS.content} hidden={state !== 'web'}>
          <form
            afterCreate={(form: HTMLFormElement): void => {
              form.addEventListener('submit', this._addLayerFromWeb.bind(this));
            }}
          >
            <calcite-label>
              Type
              <calcite-select>
                <calcite-option label="ArcGIS web service" value="arcgis"></calcite-option>
                <calcite-option label="KML" value="kml"></calcite-option>
              </calcite-select>
            </calcite-label>
            <calcite-label>
              URL
              <calcite-input type="text" placeholder="https://<web service url>"></calcite-input>
              <calcite-input-message icon="" status="invalid"></calcite-input-message>
            </calcite-label>
            <calcite-button type="submit">Add</calcite-button>
          </form>
        </div>

        {/* {content} */}
      </calcite-panel>
    );
  }

  @property()
  private _addLayersItems!: Collection<tsx.JSX.Element>;

  @property()
  private _addQueriedLayersItems!: Collection<QueriedPortalItem>;
}
