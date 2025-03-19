import esri = __esri;

interface _ImageLayerInfo {
  feature: esri.Graphic;
  layer?: esri.MediaLayer;
  taxmap: string;
}

export interface TaxMapProperties extends esri.WidgetProperties {
  layer: esri.GeoJSONLayer;
  view: esri.MapView;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import imageMediaLayer from './../support/georeferencedImage';
import PopupTemplate from '@arcgis/core/PopupTemplate';

let KEY = 0;

const IMAGE_URL_TEMPLATE = 'https://cityofvernonia.github.io/geospatial-data/tax-maps/files/jpg/{taxmap}.jpg';

@subclass('cov.components.TaxMaps')
export default class TaxMaps extends Widget {
  constructor(properties: TaxMapProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { layer, view, _infos, _layer, _options } = this;

    layer.visible = false;

    layer.popupEnabled = true;

    layer.popupTemplate = new PopupTemplate({
      outFields: ['*'],
      title: 'Tax Map',
      content: (event: { graphic: esri.Graphic }): HTMLTableElement => {
        const popupContent = new PopupContent({ graphic: event.graphic });

        popupContent.on('show', (value: string): void => {
          const select = (this.container as HTMLCalcitePanelElement).querySelector('calcite-select');

          if (select) {
            select.value = value;
            this._showLayer(value);
          }
        });

        return popupContent.container;
      },
    });

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          layer.visible = visible;
          if (!visible) view.closePopup();
        },
      ),
    );

    await layer.when();

    const features = (
      await layer.queryFeatures({
        where: '1 = 1',
        outFields: ['*'],
        returnGeometry: true,
        outSpatialReference: view.spatialReference,
      })
    ).features;

    features.sort((a: esri.Graphic, b: esri.Graphic) => (a.attributes.name < b.attributes.name ? -1 : 1));

    features.forEach((feature: esri.Graphic): void => {
      const { name, taxmap } = feature.attributes;

      _infos.add({
        feature,
        taxmap,
      });

      _options.add(
        <calcite-option key={KEY++} value={taxmap}>
          {name}
        </calcite-option>,
      );
    });

    view.map.add(_layer, 0);

    this.addHandles(
      watch(
        (): number => this._opacity,
        (opacity: number): void => {
          const { _visibleLayer } = this;
          if (_visibleLayer) _visibleLayer.opacity = opacity;
        },
      ),
    );
  }

  layer!: esri.GeoJSONLayer;

  view!: esri.MapView;

  private _infos: esri.Collection<_ImageLayerInfo> = new Collection();

  private _layer = new GroupLayer({ listMode: 'hide' });

  @property()
  private _opacity = 0.4;

  private _options: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option key={KEY++} selected value="">
      None
    </calcite-option>,
  ]);

  @property()
  private _visibleLayer: esri.MediaLayer | nullish;

  private async _showLayer(value: string): Promise<void> {
    const { view, _infos, _layer, _opacity, _visibleLayer } = this;

    view.closePopup();

    if (_visibleLayer) _visibleLayer.visible = false;

    if (value === '') {
      this._visibleLayer = null;
      return;
    }

    const info = _infos.find((item: _ImageLayerInfo): boolean => {
      return item.taxmap === value;
    });

    if (!info) return;

    const { feature, layer } = info;

    if (!layer) {
      try {
        info.layer = await imageMediaLayer(IMAGE_URL_TEMPLATE.replace('{taxmap}', value));
        _layer.add(info.layer);
      } catch (error) {
        console.log(error);
      }
    }

    if (!info.layer) return;

    info.layer.opacity = _opacity;

    info.layer.visible = true;

    this._visibleLayer = info.layer;

    view.goTo(feature);
  }

  private _showPdf(): void {
    const { _infos, _visibleLayer } = this;

    if (!_visibleLayer) return;

    const info = _infos.find((item: _ImageLayerInfo): boolean => {
      const { layer } = item;

      return layer && layer === _visibleLayer ? true : false;
    });

    if (info) window.open(info.feature.attributes.county_url, '_blank');
  }

  override render(): tsx.JSX.Element {
    const { _options, _visibleLayer } = this;

    return (
      <calcite-panel
        heading="Tax Maps"
        style="--calcite-panel-space: 0.75rem; --calcite-panel-background-color: var(--calcite-color-foreground-1);"
      >
        <calcite-label style={_visibleLayer ? '' : '--calcite-label-margin-bottom: 0;'}>
          Select tax map
          <calcite-select afterCreate={this._selectAfterCreate.bind(this)}>{_options.toArray()}</calcite-select>
        </calcite-label>
        <calcite-label hidden={!_visibleLayer} style="--calcite-label-margin-bottom: 0;">
          Layer opacity
          <calcite-slider afterCreate={this._sliderAfterCreate.bind(this)}></calcite-slider>
        </calcite-label>
        <calcite-button
          appearance="outline"
          hidden={!_visibleLayer}
          icon-start="file-pdf"
          slot={_visibleLayer ? 'footer' : null}
          width="full"
          onclick={this._showPdf.bind(this)}
        >
          View PDF
        </calcite-button>
      </calcite-panel>
    );
  }

  private _selectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', (): void => {
      this._showLayer(select.selectedOption.value);
    });
  }

  private _sliderAfterCreate(slider: HTMLCalciteSliderElement): void {
    Object.assign(slider, {
      max: 100,
      min: 25,
      value: 40,
      step: 5,
      snap: true,
      ticks: 25,
      labelTicks: true,
      labelFormatter: (value: number): string => {
        return `${value}%`;
      },
    });

    slider.addEventListener('calciteSliderInput', (): void => {
      this._opacity = (slider.value as number) / 100;
    });
  }
}

class PopupContent extends Widget {
  private _container = document.createElement('table');

  public get container(): HTMLTableElement {
    return this._container;
  }

  public set container(value: HTMLTableElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);

    // why???
    this.graphic = properties.graphic;
  }

  graphic!: esri.Graphic;

  override render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { name, taxmap, county_url },
      },
    } = this;

    return (
      <table class="esri-widget__table">
        <tr>
          <th>Tax map</th>
          <td>
            <calcite-link
              onclick={(): void => {
                this.emit('show', taxmap);
              }}
            >
              Show {name}
            </calcite-link>
          </td>
        </tr>
        <tr>
          <th>Files</th>
          <td>
            <calcite-link href={county_url} target="_blank">
              View PDF
            </calcite-link>
            &nbsp; &nbsp;
            <calcite-link href={IMAGE_URL_TEMPLATE.replace('{taxmap}', taxmap)} target="_blank">
              View JPG
            </calcite-link>
          </td>
        </tr>
      </table>
    );
  }
}
