/**
 * Add layers to the map.
 */

// namespaces and types
import cov = __cov;

interface ListItem extends Object {
  element: esri.widget.tsx.JSX.Element;
}

// base imports
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PortalItem from '@arcgis/core/portal/PortalItem';
import Layer from '@arcgis/core/layers/Layer';

// styles
import './AddLayers.scss';
const CSS = {
  base: 'cov-add-layers',
  noLayers: 'cov-add-layers--no-layers',
};

let KEY = 0;

// class export
@subclass('cov.widgets.AddLayers')
export default class AddLayers extends Widget {
  @property()
  view!: esri.MapView;

  @property({
    type: Collection,
  })
  layers!: cov.PortalItemToAddProperties[] | esri.Collection<cov.PortalItemToAddProperties>;

  @property()
  private _listItems: esri.Collection<ListItem> = new Collection();

  constructor(properties: cov.AddLayersProperties) {
    super(properties);
  }

  postInitialize() {
    const { layers } = this;

    layers.forEach(this._createListItems.bind(this));
  }

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
          <calcite-pick-list-item
            key={KEY++}
            label={title || portalItem.title}
            description={snippet || portalItem.snippet}
          >
            <calcite-action
              slot="actions-end"
              icon="add-layer"
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
          </calcite-pick-list-item>
        );
      })
      .catch(() => {
        _listItems.remove(listItem);
      });

    _listItems.add(listItem);
  }

  render(): tsx.JSX.Element {
    const { _listItems } = this;

    const listItems = _listItems.length ? (
      _listItems.toArray().map((listItem: ListItem) => {
        return listItem.element;
      })
    ) : (
      <p class={CSS.noLayers}>There are no layers to add.</p>
    );

    return <div class={CSS.base}>{listItems}</div>;
  }
}
