//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * BasemapImagery widget properties.
 */
export interface BasemapImageryProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
  /**
   * Basemap to change imagery layer (assumes imagery layer is index = 0);
   */
  basemap: esri.Basemap;
  /**
   * Imagery infos for additional imagery layers.
   */
  imageryInfos: ImageryInfo[] | esri.Collection<ImageryInfo>;
  /**
   * Layer select control type. Use `select` for more than 4 layers.
   * @default 'radio'
   */
  control?: 'radio' | 'select';
  /**
   * Default layer description.
   * @default 'Default imagery provided by Microsoft Bing Maps.'
   */
  description?: string;

  /**
   * Default layer link URL.
   * @default 'https://www.bing.com/map'
   */
  link?: string;
  /**
   * Default layer title.
   * @default 'Default Imagery'
   */
  title?: string;
  /**
   * Find BasemapToggle widget and toggle basemap if hybrid basemap is not active basemap.
   * @default true
   */
  toggleBasemap?: boolean;
}

/**
 * Basemap imagery info.
 */
export interface ImageryInfo {
  /**
   * Layer description;
   */
  description: string;
  /**
   * Optional `More info` URL. Defaults to service URL if not provided.
   */
  link?: string;
  /**
   * Layer properties.
   */
  properties?: any;
  /**
   * Title of the imagery layer.
   */
  title: string;
  /**
   * Service URL of the imagery layer.
   */
  url: string;
}

/**
 * Internal imagery info.
 */
interface _ImageryInfo extends ImageryInfo {
  layer?: esri.Layer;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import Layer from '@arcgis/core/layers/Layer';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const STYLE = {
  content: 'padding: 0.75rem;',
  notice: 'margin-bottom: 1rem;',
};

let KEY = 0;

/**
 * A widget for changing the imagery of a hybrid basemap.
 */
@subclass('BasemapImagery')
export default class BasemapImagery extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: BasemapImageryProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { basemap, control, description, imageryInfos, link, title, _controls } = this;

    await basemap.when();

    imageryInfos.add(
      {
        description,
        layer: basemap.baseLayers.getItemAt(0),
        title,
        url: link,
      },
      0,
    );

    imageryInfos.forEach((imageryInfo: ImageryInfo, index: number): void => {
      const { title } = imageryInfo;

      if (control === 'radio') {
        _controls.add(
          <calcite-label
            key={KEY++}
            layout="inline"
            style={index === imageryInfos.length - 1 ? '--calcite-label-margin-bottom: 0;' : null}
          >
            <calcite-radio-button checked={title === 'Default'} value={title}></calcite-radio-button>
            {title}
          </calcite-label>,
        );
      } else {
        _controls.add(
          <calcite-option key={KEY++} checked={title === 'Default'} value={title}>
            {title}
          </calcite-option>,
        );
      }
    });
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  basemap!: esri.Basemap;

  control: 'radio' | 'select' = 'radio';

  @property()
  protected description = 'Default imagery provided by Microsoft Bing Maps.';

  @property({ type: Collection })
  imageryInfos: esri.Collection<_ImageryInfo> = new Collection();

  @property()
  protected title = 'Default Imagery';

  toggleBasemap = true;

  @property()
  protected link = 'https://www.bing.com/maps';

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _controls: esri.Collection<tsx.JSX.Element> = new Collection();

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Set basemap imagery layer.
   * @param event
   */
  private async _setBasemapImagery(event: Event): Promise<void> {
    const {
      control,
      view: { map },
      basemap: { baseLayers },
      imageryInfos,
      toggleBasemap,
    } = this;

    const imageryInfo = imageryInfos.find((imageryInfo: _ImageryInfo): boolean => {
      const test =
        control === 'radio'
          ? (event.target as HTMLCalciteRadioButtonGroupElement).selectedItem.value
          : (event.target as HTMLCalciteSelectElement).selectedOption.value;

      return imageryInfo.title === test;
    });

    const { description, layer, link, title, url, properties } = imageryInfo;

    this.title = title;
    this.description = description;
    this.link = link || url;

    if (layer) {
      baseLayers.splice(0, 1, layer);
    } else {
      const _layer = await Layer.fromArcGISServerUrl({ url, properties: properties || {} });
      imageryInfo.layer = _layer;
      baseLayers.splice(0, 1, _layer);
    }

    const basemapToggle = (document.getElementsByClassName('esri-basemap-toggle')[0] as HTMLDivElement) || undefined;

    if (map.basemap !== this.basemap && basemapToggle && toggleBasemap) basemapToggle.click();
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { control, description, link, title, _controls } = this;
    return (
      <calcite-panel heading="Basemap Imagery">
        <div style={STYLE.content}>
          <calcite-notice icon="information" open="" scale="s" style={STYLE.notice}>
            <div slot="title">{title}</div>
            <div slot="message">{description}</div>
            <calcite-link href={link} slot="link" target="_blank">
              More info
            </calcite-link>
          </calcite-notice>
          {control === 'radio' ? (
            <calcite-radio-button-group
              layout="vertical"
              name="imagery-layers"
              afterCreate={(radioButtonGroup: HTMLCalciteRadioButtonGroupElement): void => {
                radioButtonGroup.addEventListener('calciteRadioButtonGroupChange', this._setBasemapImagery.bind(this));
              }}
            >
              {_controls.toArray()}
            </calcite-radio-button-group>
          ) : (
            <calcite-select
              afterCreate={(select: HTMLCalciteSelectElement): void => {
                select.addEventListener('calciteSelectChange', this._setBasemapImagery.bind(this));
              }}
            >
              {_controls.toArray()}
            </calcite-select>
          )}
        </div>
      </calcite-panel>
    );
  }
}
