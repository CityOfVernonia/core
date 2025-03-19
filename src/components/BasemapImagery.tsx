import esri = __esri;

export interface BasemapImageryProperties extends esri.WidgetProperties {
  layerInfos?: esri.Collection<LayerInfo> | LayerInfo[];
}

export interface LayerInfo {
  description: string;
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
    description: '2022 (1ft resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2022/OSIP_2022_WM/ImageServer',
  },
  {
    description: '2020 (60cm resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2020/NAIP_2020_WM/ImageServer',
  },
  {
    description: '2018 (60cm resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2018/OSIP_2018_WM/ImageServer',
  },
  {
    description: '2016 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2016/NAIP_2016_WM/ImageServer',
  },
  {
    description: '2014 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2014/NAIP_2014_WM/ImageServer',
  },
  {
    description: '2012 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2012/NAIP_2012_WM/ImageServer',
  },
  {
    description: '2011 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2011/NAIP_2011_WM/ImageServer',
  },
  {
    description: '2009 (unknown resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2009/NAIP_2009_SL/ImageServer',
  },
  {
    description: '2005 (0.5m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2005/NAIP_2005_SL/ImageServer',
  },
  {
    description: '2000 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2000/NAIP_2000_SL/ImageServer',
  },
  {
    description: '1995 (1m resolution)',
    url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_1995/NAIP_1995_WM/ImageServer',
  },
];

@subclass('cov.components.BasemapImagery')
export default class BasemapImagery extends Widget {
  constructor(properties?: BasemapImageryProperties) {
    super(properties);
  }

  override postInitialize(): void {
    const { layerInfos, _listItems } = this;

    layerInfos.forEach((layerInfo: LayerInfo) => {
      const { description } = layerInfo;

      _listItems.add(<calcite-list-item description={description} value={description}></calcite-list-item>);
    });
  }

  @property({ type: Collection })
  readonly layerInfos: esri.Collection<_LayerInfo> = new Collection(DEFAULT_LAYER_INFOS);

  private _listItems: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-list-item description="Current imagery" selected value="default"></calcite-list-item>,
  ]);

  override render(): tsx.JSX.Element {
    const { _listItems } = this;

    return (
      <calcite-panel heading="Basemap Imagery">
        <calcite-list selection-mode="single-persist" afterCreate={this._listAfterCreate.bind(this)}>
          {_listItems.toArray()}
        </calcite-list>
      </calcite-panel>
    );
  }

  private _listAfterCreate(list: HTMLCalciteListElement): void {
    const { layerInfos } = this;

    list.addEventListener('calciteListChange', async (): Promise<void> => {
      const value = list.selectedItems[0].value;

      if (value === 'default') {
        publish(IMAGERY_LAYER_TOPIC, 'default');
        return;
      }

      const _layerInfo: _LayerInfo | nullish = layerInfos.find((layerInfo: _LayerInfo): boolean => {
        return layerInfo.description === value;
      });

      if (!_layerInfo) return;

      const { layer, url } = _layerInfo;

      if (!layer) {
        _layerInfo.layer = await Layer.fromArcGISServerUrl({ url });
      }

      publish(IMAGERY_LAYER_TOPIC, _layerInfo.layer);
    });
  }
}
