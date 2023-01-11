//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import esri = __esri;

/**
 * Image layer info.
 */
interface ImageLayerInfo {
  /**
   * Image media layer.
   */
  layer?: esri.MediaLayer;
  /**
   * Tax map file name.
   */
  fileName: string;
  /**
   * Tax map boundary feature.
   */
  feature: esri.Graphic;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { imageMediaLayer } from '@vernonia/georeferenced-media/dist/GeoreferencedMedia';

//////////////////////////////////////
// Constants
//////////////////////////////////////
// Styles
const CSS = {
  content: 'padding: 0.75rem;',
  sliderLabels:
    'display: flex; flex-flow: row; justify-content: space-between; margin: -1rem 0.35rem 0; font-size: var(--calcite-font-size--2);',
  popup: 'display: flex; flex-flow: row; gap: 0.75rem; width: 100%; padding: 0.75rem;',
};

// Uniqueness
let KEY = 0;

/**
 * A widget for displaying tax map image media layers.
 */
@subclass('cov.widgets.TaxMaps')
export default class TaxMaps extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
      /**
       * Tax map boundaries GeoJSON layer.
       */
      layer: esri.GeoJSONLayer;
      /**
       * Display boundaries layer visibility switch.
       * @default true
       */
      showSwitch?: boolean;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { popup },
      layer,
      _imageLayerInfos,
      _options,
    } = this;

    layer.popupTemplate = new PopupTemplate({
      outFields: ['*'],
      title: '{MAP_NAME}',
      content: (event: { graphic: esri.Graphic }): HTMLDivElement => {
        const container = document.createElement('div');

        const taxMapPopup = new TaxMapPopup({
          graphic: event.graphic,
          container,
        });

        taxMapPopup.on('show', (fileName: string) => {
          this._show(fileName);
          popup.close();
          popup.clear();
        });

        return container;
      },
    });

    await layer.when();

    const query = await layer.queryFeatures({
      where: '1 = 1',
      outFields: ['*'],
      returnGeometry: true,
      outSpatialReference: view.spatialReference,
    });

    query.features.forEach((feature: esri.Graphic): void => {
      const {
        attributes: { FILE_NAME, MAP_NAME },
      } = feature;

      _imageLayerInfos.push({
        feature,
        fileName: FILE_NAME,
      });

      _options.push(
        <calcite-option key={KEY++} value={FILE_NAME}>
          {MAP_NAME}
        </calcite-option>,
      );
    });

    this.scheduleRender();

    this.own(
      this.watch('_opacity', (opacity: number): void => {
        _imageLayerInfos.forEach((imageLayerInfo: ImageLayerInfo): void => {
          const { layer } = imageLayerInfo;
          if (layer) layer.opacity = opacity;
        });
      }),
    );
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  view!: esri.MapView;

  layer!: esri.GeoJSONLayer;

  showSwitch = true;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _imageLayerInfos: ImageLayerInfo[] = [];

  @property()
  private _imageLayerInfo: ImageLayerInfo | null = null;

  @property()
  private _opacity = 0.4;

  private _options = [
    <calcite-option key={KEY++} value="none" selected="">
      None
    </calcite-option>,
  ];

  @property()
  _loading = false;

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Show selected tax map image media layer.
   * @param value
   */
  private _show(value: string): void {
    const { view, _imageLayerInfos } = this;

    this._imageLayerInfo = null;

    _imageLayerInfos.forEach((imageLayerInfo: ImageLayerInfo): void => {
      const { layer, fileName, feature } = imageLayerInfo;

      if (layer && fileName === value) {
        this._imageLayerInfo = imageLayerInfo;
        layer.visible = true;
        view.goTo(feature);
      } else if (!layer && fileName === value) {
        this._loading = true;
        this._load(imageLayerInfo);
      } else {
        if (layer) layer.visible = false;
      }
    });
  }

  /**
   * On demand load image media layer.
   * @param imageLayerInfo
   */
  private async _load(imageLayerInfo: ImageLayerInfo): Promise<void> {
    const { view, _opacity } = this;
    const {
      feature,
      feature: {
        attributes: { FILE_NAME, MAP_NAME },
      },
    } = imageLayerInfo;

    const layer = await imageMediaLayer(
      `https://cityofvernonia.github.io/vernonia-tax-maps/tax-maps/jpg/${FILE_NAME}.jpg`,
      {
        opacity: _opacity,
        title: `Tax Map ${MAP_NAME}`,
      },
    );

    imageLayerInfo.layer = layer;

    this._imageLayerInfo = imageLayerInfo;

    view.map.add(layer, 0);
    view.goTo(feature);
    this._loading = false;
  }

  /**
   * Wire select events.
   * @param select
   */
  private _selectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', (): void => {
      this._show(select.selectedOption.value);
    });
    this.own(
      this.watch('_imageLayerInfo', (_imageLayerInfo: ImageLayerInfo | null): void => {
        console.log(_imageLayerInfo, select);
        select.value = !_imageLayerInfo ? 'none' : _imageLayerInfo.fileName;
      }),
    );
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { layer, showSwitch, _imageLayerInfo, _opacity, _options, _loading } = this;
    return (
      <calcite-panel heading="Tax Maps">
        {_imageLayerInfo ? (
          <calcite-button
            appearance="outline"
            href={`https://gis.columbiacountymaps.com/TaxMaps/${_imageLayerInfo.feature.attributes.FILE_NAME}.pdf`}
            icon-start="file-pdf"
            slot="footer-actions"
            target="_blank"
            width="full"
          >
            {`View ${_imageLayerInfo.feature.attributes.MAP_NAME}`}
          </calcite-button>
        ) : null}
        <div style={CSS.content}>
          {showSwitch ? (
            <calcite-label layout="inline">
              <calcite-switch
                checked={layer.visible}
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    layer.visible = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Tax map boundaries
            </calcite-label>
          ) : null}
          <calcite-label style={_imageLayerInfo ? '' : '--calcite-label-margin-bottom: 0;'}>
            Select tax map
            <calcite-select disabled={_loading} afterCreate={this._selectAfterCreate.bind(this)}>
              {_options}
            </calcite-select>
          </calcite-label>
          <calcite-label hidden={!_imageLayerInfo} style="--calcite-label-margin-bottom: 0;">
            Layer opacity
            <calcite-slider
              min="0.2"
              max="1"
              snap=""
              step="0.1"
              value={_opacity}
              afterCreate={(slider: HTMLCalciteSliderElement): void => {
                slider.addEventListener('calciteSliderInput', (): void => {
                  this._opacity = slider.value as number;
                });
              }}
            ></calcite-slider>
            <div style={CSS.sliderLabels}>
              <span>min</span>
              <span>max</span>
            </div>
          </calcite-label>
        </div>
      </calcite-panel>
    );
  }
}

/**
 * Popup widget for tax map boundaries.
 */
@subclass('TaxMapPopup')
class TaxMapPopup extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
    },
  ) {
    super(properties);
  }

  graphic!: esri.Graphic;

  render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { FILE_NAME, MAP_NAME },
      },
    } = this;
    return (
      <div style={CSS.popup}>
        <calcite-button
          icon-start="image"
          width="full"
          onclick={(): void => {
            this.emit('show', FILE_NAME);
          }}
        >
          {`Show ${MAP_NAME}`}
        </calcite-button>
        <calcite-button
          appearance="outline"
          href={`https://gis.columbiacountymaps.com/TaxMaps/${FILE_NAME}.pdf`}
          icon-start="file-pdf"
          target="_blank"
          width="full"
        >
          {`View ${MAP_NAME}`}
        </calcite-button>
      </div>
    );
  }
}
