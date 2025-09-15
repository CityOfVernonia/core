import esri = __esri;

export interface TopoMapsProperties extends esri.WidgetProperties {
  historicalTopo: esri.MapImageLayer;

  usgsTopo: esri.MapImageLayer;
}

interface I {
  layers: 'usgs' | '1979' | '1955' | '1943' | '1941';
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const SUBLAYERS = {
  '1941': 0,
  '1943': 1,
  '1955': 2,
  '1979': 3,
};

@subclass('cov.components.TopoMaps')
export default class TopoMaps extends Widget {
  constructor(properties: TopoMapsProperties) {
    super(properties);
  }

  override postInitialize(): void {
    this.addHandles([
      watch((): boolean => this._visible, this._setLayer.bind(this)),
      watch(
        (): I['layers'] => this._layer,
        (): void => {
          this._setLayer(this._visible);
        },
      ),
    ]);
  }

  public historicalTopo!: esri.MapImageLayer;

  public usgsTopo!: esri.MapImageLayer;

  @property()
  private _layer: I['layers'] = 'usgs';

  @property()
  private _visible = false;

  private async _setLayer(visible: boolean): Promise<void> {
    const { historicalTopo, usgsTopo, _layer } = this;

    if (visible) {
      if (_layer === 'usgs') {
        historicalTopo.visible = false;

        usgsTopo.visible = true;
      } else {
        usgsTopo.visible = false;

        if (!historicalTopo.loaded) await historicalTopo.load();

        historicalTopo.sublayers?.forEach((sublayer: esri.Sublayer): void => {
          sublayer.visible = sublayer.id === SUBLAYERS[_layer];

          historicalTopo.visible = true;
        });
      }
    } else {
      historicalTopo.visible = false;

      usgsTopo.visible = false;
    }
  }

  override render(): tsx.JSX.Element {
    const { _visible } = this;

    return (
      <calcite-panel
        heading="Topo Maps"
        style="--calcite-panel-space: 0.75rem; --calcite-panel-background-color: var(--calcite-color-foreground-1);"
      >
        <calcite-label>
          Topo map layer
          <calcite-switch afterCreate={this._switchAfterCreate.bind(this)}></calcite-switch>
        </calcite-label>
        <calcite-label>
          Select topo map
          <calcite-select disabled={!_visible} afterCreate={this._selectAfterCreate.bind(this)}>
            <calcite-option value="usgs">USGS topo map service</calcite-option>
            <calcite-option value="1979">1979 USGS topo quad</calcite-option>
            <calcite-option value="1955">1955 USGS topo quad</calcite-option>
            <calcite-option value="1943">1943 USGS topo quad</calcite-option>
            <calcite-option value="1941">1941 USGS topo quad</calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Layer opacity
          <calcite-slider disabled={!_visible} afterCreate={this._sliderAfterCreate.bind(this)}></calcite-slider>
        </calcite-label>
      </calcite-panel>
    );
  }

  private _selectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', (): void => {
      this._layer = select.selectedOption.value;
    });
  }

  private _sliderAfterCreate(slider: HTMLCalciteSliderElement): void {
    Object.assign(slider, {
      max: 100,
      min: 25,
      value: 100,
      step: 5,
      snap: true,
      ticks: 25,
      labelTicks: true,
      labelFormatter: (value: number): string => {
        return `${value}%`;
      },
    });

    slider.addEventListener('calciteSliderInput', (): void => {
      const { historicalTopo, usgsTopo } = this;

      const opacity = (slider.value as number) / 100;

      historicalTopo.opacity = opacity;

      usgsTopo.opacity = opacity;
    });
  }

  private _switchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    _switch.addEventListener('calciteSwitchChange', (): void => {
      this._visible = _switch.checked;
    });
  }
}
