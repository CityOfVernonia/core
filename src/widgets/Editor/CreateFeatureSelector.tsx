export interface CreateFeatureSelectorProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

import Collection from '@arcgis/core/core/Collection';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { renderPreviewHTML } from '@arcgis/core/symbols/support/symbolUtils';

const CSS = {
  base: 'cov-editor__create-feature-selector',
  item: 'cov-editor__create-feature-selector--item',
  symbol: 'cov-editor__create-feature-selector--symbol',
  html: 'cov-editor__create-feature-selector--html',
};

@subclass('Editor.CreateFeatureSelector')
export default class CreateFeatureSelector extends Widget {
  constructor(properties: CreateFeatureSelectorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { layer } = this;

    await layer.when();

    const renderer = layer.renderer;

    switch (renderer.type) {
      case 'simple':
        this.simpleRenderer(renderer as esri.SimpleRenderer);
        break;
      case 'unique-value':
        this.uniqueValueRenderer(renderer as esri.UniqueValueRenderer);
        break;
      default:
        break;
    }
  }

  layer!: esri.FeatureLayer;

  @property({
    aliasOf: 'layer.title',
  })
  title = 'Layer';

  @property()
  selectors: esri.Collection<tsx.JSX.Element> = new Collection();

  async simpleRenderer(renderer: esri.SimpleRenderer): Promise<void> {
    const { layer, selectors } = this;

    const html = await renderPreviewHTML((renderer as esri.SimpleRenderer).symbol);

    html.classList.add(CSS.html);

    selectors.add(
      <div
        class={CSS.item}
        afterCreate={(div: HTMLDivElement): void => {
          div.addEventListener('click', () => {
            this.emit('create', {
              layer,
              template: layer.templates[0],
            });
          });
        }}
      >
        <div
          class={CSS.symbol}
          afterCreate={(div: HTMLDivElement) => {
            div.append(html);
          }}
        ></div>
        <div>{layer.title}</div>
      </div>,
    );
  }

  async uniqueValueRenderer(renderer: esri.UniqueValueRenderer): Promise<void> {
    const {
      layer,
      layer: { types },
      selectors,
    } = this;

    const { uniqueValueInfos } = renderer;

    const _selectors = uniqueValueInfos.map((uniqueValueInfo: esri.UniqueValueInfo): tsx.JSX.Element => {
      const { label, symbol } = uniqueValueInfo;

      const template = types.find((featureType: esri.FeatureType): boolean => {
        return featureType.name === label;
      })?.templates[0] as esri.FeatureTemplate;

      return (
        <div
          class={CSS.item}
          afterCreate={(div: HTMLDivElement): void => {
            div.addEventListener('click', () => {
              this.emit('create', {
                layer,
                template,
              });
            });
          }}
        >
          <div
            class={CSS.symbol}
            afterCreate={async (div: HTMLDivElement): Promise<void> => {
              const html = await renderPreviewHTML(symbol);
              html.classList.add(CSS.html);
              div.append(html);
            }}
          ></div>
          <div>{label}</div>
        </div>
      );
    });

    selectors.add(<div>{_selectors}</div>);
  }

  render(): tsx.JSX.Element {
    const { title, selectors } = this;

    return (
      <calcite-block heading={title || ''} collapsible="">
        {selectors.toArray()}
      </calcite-block>
    );
  }
}
