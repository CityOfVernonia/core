import esri = __esri;

export interface ImageryInfo extends Object {
  title: string;
  layer: esri.Layer;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import LayerList from '@arcgis/core/widgets/LayerList';
import Legend from '@arcgis/core/widgets/Legend';
import Collection from '@arcgis/core/core/Collection';

const CSS = {
  base: 'cov-layers',
  content: 'cov-layers--content',
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
       * Basemap to switch imagery.
       */
      basemap?: esri.Basemap;
      /**
       * Imagery layers to select from;
       */
      imageryInfos?: ImageryInfo[] | Collection<ImageryInfo>;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { id, basemap, imageryInfos } = this;

    if (!basemap || !imageryInfos) return;

    const currentLayer = basemap.baseLayers.getItemAt(0);

    const radioButtons = imageryInfos
      .map((imageryInfo: ImageryInfo): tsx.JSX.Element => {
        const { title, layer } = imageryInfo;
        const checked = currentLayer === layer;
        const _id = `button_${id}_${KEY++}`;

        return (
          <calcite-label for={_id} layout="inline" afterCreate={this._addImageryChangeEvent.bind(this, layer)}>
            <calcite-radio-button id={_id} checked={checked}></calcite-radio-button>
            {title}
          </calcite-label>
        );
      })
      .toArray();

    this._radioButtonGroup = <calcite-radio-button-group layout="vertical">{radioButtons}</calcite-radio-button-group>;
  }

  view!: esri.MapView;

  protected basemap!: esri.Basemap;

  @property({
    type: Collection,
  })
  protected imageryInfos!: Collection<ImageryInfo>;

  @property()
  protected state: 'layers' | 'legend' | 'imagery' = 'layers';

  protected layers!: LayerList;

  protected legend!: Legend;

  @property()
  private _radioButtonGroup: tsx.JSX.Element | null = null;

  private _addImageryChangeEvent(layer: esri.Layer, label: HTMLCalciteLabelElement): void {
    const { basemap } = this;

    label.addEventListener('click', (): void => {
      basemap.baseLayers.removeAt(0);
      basemap.baseLayers.add(layer, 0);
    });
  }

  onHide(): void {
    this.state = 'layers';
  }

  render(): tsx.JSX.Element {
    const { state, _radioButtonGroup } = this;

    const heading = state === 'layers' ? 'Layers' : state === 'legend' ? 'Legend' : 'Imagery';

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
          <calcite-tooltip placement="bottom" slot="tooltip">
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
          <calcite-tooltip placement="bottom" slot="tooltip">
            Legend
          </calcite-tooltip>
        </calcite-action>
        {_radioButtonGroup ? (
          <calcite-action
            active={state === 'imagery'}
            icon="layer-basemap"
            slot="header-actions-end"
            text="Imagery"
            onclick={(): void => {
              this.state = 'imagery';
            }}
          >
            <calcite-tooltip placement="bottom" slot="tooltip">
              Imagery
            </calcite-tooltip>
          </calcite-action>
        ) : null}
        {/* layers */}
        <div
          hidden={state !== 'layers'}
          afterCreate={(container: HTMLDivElement): void => {
            const { view } = this;
            this.layers = new LayerList({
              view,
              container,
            });
          }}
        ></div>
        {/* legend */}
        <div
          hidden={state !== 'legend'}
          afterCreate={(container: HTMLDivElement): void => {
            const { view } = this;
            this.legend = new Legend({
              view,
              container,
            });
          }}
        ></div>
        {/* imagery */}
        {_radioButtonGroup ? (
          <div hidden={state !== 'imagery'} class={CSS.content}>
            <p>Select basemap imagery.</p>
            {_radioButtonGroup}
          </div>
        ) : null}
      </calcite-panel>
    );
  }
}
