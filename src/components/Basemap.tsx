import esri = __esri;

/**
 * Hillshade and imagery basemap layers.
 * Exported as a convenience for use will application components.
 */
export interface BasemapOptions {
  /**
   * Hillshade basemap.
   */
  hillshade: esri.Basemap;
  /**
   * Imagery basemap.
   */
  imagery: esri.Basemap;
}

/**
 * Basemap constructor properties.
 */
export interface BasemapProperties extends esri.WidgetProperties, BasemapOptions {
  view: esri.MapView;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { subscribe } from 'pubsub-js';

const CSS_BASE = 'cov--basemap';

const CSS = {
  base: CSS_BASE,
  image: `${CSS_BASE}_image`,
};

/**
 * Pub/Sub topic to change basemap imagery layer.
 */
export const IMAGERY_LAYER_TOPIC = 'basemap-imagery-layer-topic';

/**
 * Pub/Sub topic to toggle imagery reference layer visibility.
 */
export const IMAGERY_REFERENCE_LAYER_TOPIC = 'basemap-imagery-reference-layer-topic';

/**
 * Basemap toggle component to switch between hillshade and imagery, as well as manipulate basemap properties.
 */
@subclass('cov.components.Basemap')
export default class Basemap extends Widget {
  private _container!: HTMLDivElement;

  public get container(): HTMLDivElement {
    return this._container;
  }

  public set container(value: HTMLDivElement) {
    this._container = value;
  }

  constructor(properties: BasemapProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { hillshade, imagery } = this;

    if (hillshade.thumbnailUrl) {
      this._hillshadeThumbnail = hillshade.thumbnailUrl;
    } else {
      await hillshade.load();
      this._hillshadeThumbnail = hillshade.thumbnailUrl || '';
    }

    if (imagery.thumbnailUrl) {
      this._imageryThumbnail = imagery.thumbnailUrl;
    } else {
      await imagery.load();
      this._imageryThumbnail = imagery.thumbnailUrl || '';
    }

    const _default = imagery.baseLayers.getItemAt(0);

    if (_default) this._default = _default;

    subscribe(IMAGERY_LAYER_TOPIC, (message: string, layer: esri.Layer | 'default'): void => {
      if (layer === 'default') {
        this.imageryLayer(this._default);
      } else {
        this.imageryLayer(layer);
      }
    });

    subscribe(IMAGERY_REFERENCE_LAYER_TOPIC, (message: string, visible: boolean): void => {
      this.imageryReferenceVisibility(visible);
    });
  }

  readonly hillshade!: esri.Basemap;

  readonly imagery!: esri.Basemap;

  readonly view!: esri.MapView;

  /**
   * Set the imagery layer.
   * @param layer esri.Layer
   */
  public imageryLayer(layer: esri.Layer): void {
    const {
      imagery,
      imagery: { baseLayers },
      _basemap,
    } = this;

    baseLayers.splice(0, 1, layer);

    if (_basemap !== imagery) this._basemap = imagery;
  }

  public imageryReferenceVisibility(visible: boolean): void {
    const {
      imagery,
      imagery: { baseLayers },
      _basemap,
    } = this;

    const reference = baseLayers.getItemAt(baseLayers.length - 1);

    if (reference) reference.visible = visible;

    if (_basemap !== imagery) this._basemap = imagery;
  }

  @property({ aliasOf: 'view.map.basemap' })
  private _basemap!: esri.Basemap;

  private _default!: esri.Layer;

  @property()
  private _hillshadeThumbnail = '';

  @property()
  private _imageryThumbnail = '';

  private _info(): { tooltip: string; url: string } {
    const { hillshade, _basemap, _hillshadeThumbnail, _imageryThumbnail } = this;

    const isHillshade = _basemap === hillshade;

    return {
      tooltip: isHillshade ? 'Imagery' : 'Map',
      url: isHillshade ? _imageryThumbnail : _hillshadeThumbnail,
    };
  }

  private _toggle(): void {
    const { hillshade, imagery, _basemap } = this;

    this._basemap = _basemap === hillshade ? imagery : hillshade;
  }

  private _tooltip(tooltip: HTMLCalciteTooltipElement): void {
    tooltip.referenceElement = this.container;
  }

  override render(): tsx.JSX.Element {
    const { tooltip, url } = this._info();

    return (
      <div class={CSS.base}>
        <div class={CSS.image} style={`background-image: url(${url})`} onclick={this._toggle.bind(this)}></div>
        <calcite-tooltip close-on-click="" overlay-positioning="fixed" afterCreate={this._tooltip.bind(this)}>
          {tooltip}
        </calcite-tooltip>
      </div>
    );
  }
}
