import esri = __esri;

interface Item extends Object {
  taxmap: string;
  sublayer: esri.Sublayer;
  geometry: esri.Geometry;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { taxMapUrl } from './../support/AssessorURLs';
import PopupTemplate from '@arcgis/core/PopupTemplate';

/**
 * View and download tax maps.
 */
@subclass('cov.widgets.TaxMaps')
export default class TaxMaps extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
      /**
       * Tax maps boundary layer.
       */
      layer: esri.FeatureLayer;
      /**
       * Tax maps imagery layer.
       */
      imagery: esri.MapImageLayer;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { view, layer, imagery, _items } = this;

    layer.popupTemplate = new PopupTemplate({
      title: '{alias}',
      outFields: ['*'],
      content: (event: { graphic: esri.Graphic }) => {
        const popup = new TaxMapsPopup({
          graphic: event.graphic,
        });
        this.own(
          popup.on('action', (event: { taxmap: string; action: 'show' | 'hide' }): void => {
            const { _items } = this;
            const { taxmap, action } = event;
            if (action === 'show') {
              for (const item in _items) {
                if (_items[item].taxmap === taxmap) {
                  this._id = parseInt(item);
                  break;
                }
              }
            } else if (action === 'hide') {
              this._id = 9999;
            }
          }),
        );
        return popup.container;
      },
    });

    layer.popupEnabled = true;

    await view.when();
    await layer.when();
    await imagery.load();

    // this.sublayers = imagery.sublayers.getItemAt(0).sublayers;
    this.sublayers = imagery.sublayers;

    const result = (await layer.queryFeatures({
      where: '1 = 1',
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: view.spatialReference,
    })) as esri.FeatureSet;

    if (!result.features) {
      this.state = 'error';
      return;
    }

    const features = result.features;

    const options = [
      <calcite-option
        label="None"
        value="9999"
        selected={true}
        afterCreate={this._optionSelected.bind(this)}
      ></calcite-option>,
    ];

    features.forEach((graphic: esri.Graphic): void => {
      const {
        geometry,
        attributes: { name, taxmap },
      } = graphic;

      const sublayer = this.sublayers.find((sublayer: esri.Sublayer): boolean => {
        return sublayer.title === taxmap;
      });

      options.push(
        <calcite-option
          label={name}
          value={`${sublayer.id}`}
          afterCreate={this._optionSelected.bind(this)}
        ></calcite-option>,
      );

      _items[sublayer.id] = {
        taxmap,
        sublayer,
        geometry,
      };
    });

    this._select = (
      <calcite-select
        afterCreate={(select: HTMLCalciteSelectElement): void => {
          select.addEventListener('calciteSelectChange', (): void => {
            this._id = parseInt(select.selectedOption.value);
          });
        }}
      >
        {options}
      </calcite-select>
    );

    const idChange = this.watch('_id', (id: number) => {
      const { view, sublayers, _items } = this;

      sublayers.forEach((sublayer: esri.Sublayer): void => {
        sublayer.visible = id === sublayer.id;
      });

      if (id === 9999) {
        this.state = 'ready';
      } else {
        this.state = 'selected';
        view.goTo(_items[id].geometry);
      }
    });

    this.own(idChange);
  }

  view!: esri.MapView;

  layer!: esri.FeatureLayer;

  imagery!: esri.MapImageLayer;

  protected sublayers!: Collection<esri.Sublayer>;

  @property()
  protected state: 'ready' | 'selected' | 'error' = 'ready';

  @property()
  private _select: tsx.JSX.Element | null = null;

  private _items: { [key: number]: Item } = {};

  @property()
  private _id = 9999;

  private _optionSelected(option: HTMLCalciteOptionElement): void {
    this.own(
      this.watch('_id', (id: number): void => {
        if (id === parseInt(option.value)) option.selected = true;
      }),
    );
  }

  private _viewTaxMap(): void {
    const { _items, _id } = this;
    window.open(taxMapUrl(_items[_id].taxmap), '_blank');
  }

  render(): tsx.JSX.Element {
    const { layer, imagery, state, _select } = this;
    return (
      <calcite-panel heading="Tax Maps">
        <div style="margin: 0.75rem;">
          <div hidden={state === 'error'}>
            <calcite-label alignment="start" layout="inline-space-between">
              Tax map boundaries
              <calcite-switch
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.checked = layer.visible;
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    layer.visible = _switch.checked;
                  });
                  this.own(
                    this.watch('layer.visible', (visible: boolean): void => {
                      _switch.checked = visible;
                    }),
                  );
                }}
              ></calcite-switch>
            </calcite-label>
            <calcite-label>
              Select tax map
              {_select}
            </calcite-label>
          </div>
          <div hidden={state !== 'selected'}>
            <calcite-label>
              Layer transparency
              <calcite-slider
                max="1"
                min="0.2"
                step="0.05"
                afterCreate={(slider: HTMLCalciteSliderElement) => {
                  slider.value = imagery.opacity;
                  slider.addEventListener('calciteSliderInput', (): void => {
                    imagery.opacity = slider.value as number;
                  });
                }}
              ></calcite-slider>
            </calcite-label>
            <calcite-button
              appearance="outline"
              width="full"
              icon-start="file-pdf"
              afterCreate={(button: HTMLCalciteButtonElement) => {
                button.addEventListener('click', this._viewTaxMap.bind(this));
              }}
            >
              View Tax Map
            </calcite-button>
          </div>
          <div hidden={state !== 'error'}>An error ocurred loading tax maps.</div>
        </div>
      </calcite-panel>
    );
  }
}

@subclass('cov.widgets.TaxMaps.TaxMapsPopup')
class TaxMapsPopup extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
    },
  ) {
    super(properties);
  }

  container = document.createElement('div');

  graphic!: esri.Graphic;

  render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { taxmap },
      },
    } = this;

    return (
      <div style="display: flex; flex-flow: row; flex-wrap: wrap; gap: 0.75rem;">
        <calcite-link
          onclick={(): void => {
            this.emit('action', {
              taxmap,
              action: 'show',
            });
          }}
        >
          Show Tax Map
        </calcite-link>
        <calcite-link href={taxMapUrl(taxmap)} target="_blank">
          View Tax Map
        </calcite-link>
        <calcite-link
          onclick={(): void => {
            this.emit('action', {
              taxmap,
              action: 'hide',
            });
          }}
        >
          Hide Tax Maps
        </calcite-link>
      </div>
    );
  }
}
