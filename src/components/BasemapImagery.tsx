import esri = __esri;

export interface BasemapImageryProperties extends esri.WidgetProperties {
  layerInfos?: esri.Collection<LayerInfo> | LayerInfo[];
}

export interface LayerInfo {
  value: string;
  url: string;
}

interface _LayerInfo extends LayerInfo {
  layer?: esri.Layer;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';
import { publish } from 'pubsub-js';
import { IMAGERY_LAYER_TOPIC } from './Basemap';

export const DEFAULT_LAYER_INFOS: LayerInfo[] = [
  {
    value: '2022',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2022/OSIP_2022_WM/ImageServer',
  },
  {
    value: '2020',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2020/NAIP_2020_SL/ImageServer',
  },
  {
    value: '2018',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2018/OSIP_2018_WM/ImageServer',
  },
  {
    value: '2016',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2016/NAIP_2016_SL/ImageServer',
  },
  {
    value: '2014',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2014/NAIP_2014_WM/ImageServer',
  },
  {
    value: '2012',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2012/NAIP_2012_WM/ImageServer',
  },
  {
    value: '2011',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2011/NAIP_2011_WM/ImageServer',
  },
  {
    value: '2009',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2009/NAIP_2009_WM/ImageServer',
  },
  {
    value: '2005',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2005/NAIP_2005_WM/ImageServer',
  },
  {
    value: '1995',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_1995/NAIP_1995_WM/ImageServer',
  },
];

@subclass('cov.components.BasemapImagery')
export default class BasemapImagery extends Widget {
  constructor(properties?: BasemapImageryProperties) {
    super(properties);
  }

  override postInitialize(): void {
    const { layerInfos, _options } = this;

    layerInfos.forEach((layerInfo: LayerInfo) => {
      const { value } = layerInfo;

      _options.add(<calcite-option value={value}>{value}</calcite-option>);
    });
  }

  @property({ type: Collection })
  readonly layerInfos: esri.Collection<_LayerInfo> = new Collection(DEFAULT_LAYER_INFOS);

  private _options: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option selected value="default">
      2024 (default)
    </calcite-option>,
  ]);

  override render(): tsx.JSX.Element {
    const { _options } = this;

    return (
      <calcite-panel
        heading="Basemap Imagery"
        style="--calcite-panel-background-color: var(--calcite-color-foreground-1); --calcite-panel-space: 0.75rem;"
      >
        <calcite-notice icon="image-layer" scale="s" style="margin-bottom: 0.75rem;" open>
          <div slot="title">Select imagery by year</div>
          <div slot="message">
            Some imagery may have georeferencing or orthocorrection issues, and may not be available at all scales.
          </div>
        </calcite-notice>
        <calcite-select afterCreate={this._selectAfterCreate.bind(this)}>{_options.toArray()}</calcite-select>
      </calcite-panel>
    );
  }

  private _selectAfterCreate(select: HTMLCalciteSelectElement): void {
    const { layerInfos } = this;

    select.addEventListener('calciteSelectChange', async (): Promise<void> => {
      const value = select.selectedOption.value;

      if (value === 'default') {
        publish(IMAGERY_LAYER_TOPIC, 'default');
        return;
      }

      const _layerInfo: _LayerInfo | nullish = layerInfos.find((layerInfo: _LayerInfo): boolean => {
        return layerInfo.value === value;
      });

      if (!_layerInfo) return;

      const { layer, url } = _layerInfo;

      if (!layer) {
        _layerInfo.layer = await Layer.fromArcGISServerUrl({ url });

        await _layerInfo.layer.load();
      }

      publish(IMAGERY_LAYER_TOPIC, _layerInfo.layer);
    });
  }
}
