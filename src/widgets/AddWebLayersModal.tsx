//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

export interface AddWebLayersModalProperties extends esri.WidgetProperties {
  /**
   * Map or scene view to add layers.
   */
  view: esri.MapView | esri.SceneView;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layer from '@arcgis/core/layers/Layer';

/**
 * Modal widget for adding layers from web resources.
 */
@subclass('cov.widgets.AddWebLayersModal')
export default class AddWebLayersModal extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container!: HTMLCalciteModalElement;

  constructor(properties: AddWebLayersModalProperties) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  view!: esri.MapView | esri.SceneView;

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
    const button = container.querySelector('calcite-button[type="submit"]') as HTMLCalciteButtonElement;

    const loading = (): void => {
      typeSelect.disabled = true;
      urlInput.disabled = true;
      button.disabled = true;
    };

    const loaded = async (layer: esri.Layer): Promise<void> => {
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
            loaded(layer);
            if (layer.type === 'feature') {
              (layer as esri.FeatureLayer).popupEnabled = true;
            }
            if (layer.type === 'map-image') {
              (layer as esri.MapImageLayer).sublayers.forEach((sublayer: esri.Sublayer): void => {
                sublayer.popupEnabled = true;
              });
            }
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
          .then((): void => {
            loaded(layer);
            layer.popupEnabled = true;
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
            loaded(layer);
          })
          .catch((_error: esri.Error): void => {
            console.log(_error);
            error('Invalid KML URL');
          });
        break;
      }
    }
  }

  //////////////////////////////////////
  // Render and render methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { id } = this;
    const form = `add_web_layers_${id}`;
    return (
      <calcite-modal width="s">
        <div slot="header">Add web layers</div>
        <div slot="content">
          <form id={form} onsubmit={this._add.bind(this)}>
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
          </form>
        </div>
        <calcite-button form={form} slot="primary" type="submit" width="full">
          Add Layer
        </calcite-button>
        <calcite-button
          appearance="outline"
          slot="secondary"
          width="full"
          onclick={(): void => {
            this.container.open = false;
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
