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
import imageMediaLayer from '../support/georeferencedImage';

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
       * URL template for image and georeference files with field in curly braces, e.g. `{taxmap}`.
       * Should probably be `fileAttributeField`. ;)
       */
      imageUrlTemplate: string;
      /**
       * Attribute field containing filename.
       */
      fileAttributeField: string;
      /**
       * Attribute field for titles, buttons, options, etc.
       */
      titleAttributeField: string;
      /**
       * URL attribute field containing pdf url.
       */
      urlAttributeField: string;
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
    const { view, layer, titleAttributeField, fileAttributeField, urlAttributeField, _imageLayerInfos, _options } =
      this;

    layer.visible = false;

    layer.popupEnabled = true;

    layer.popupTemplate = new PopupTemplate({
      outFields: ['*'],
      title: `{${titleAttributeField}}`,
      content: (event: { graphic: esri.Graphic }): HTMLDivElement => {
        const container = document.createElement('div');

        const taxMapPopup = new TaxMapPopup({
          graphic: event.graphic,
          container,
          fileAttributeField,
          titleAttributeField,
          urlAttributeField,
        });

        taxMapPopup.on('show', (fileName: string) => {
          this._show(fileName);
          view.closePopup();
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

    query.features.sort((a: any, b: any) => (a.attributes.name < b.attributes.name ? -1 : 1));

    query.features.forEach((feature: esri.Graphic): void => {
      const { titleAttributeField, fileAttributeField } = this;
      const { attributes } = feature;

      _imageLayerInfos.push({
        feature,
        fileName: attributes[fileAttributeField],
      });

      _options.push(
        <calcite-option key={KEY++} value={attributes[fileAttributeField]}>
          {attributes[titleAttributeField]}
        </calcite-option>,
      );
    });

    this.scheduleRender();

    this.addHandles(
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

  imageUrlTemplate!: string;

  fileAttributeField!: string;

  titleAttributeField!: string;

  urlAttributeField!: string;

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
    const { view, imageUrlTemplate, fileAttributeField, titleAttributeField, _opacity } = this;
    const {
      feature,
      feature: { attributes },
    } = imageLayerInfo;

    const layer = await imageMediaLayer(
      imageUrlTemplate.replace(`{${fileAttributeField}}`, attributes[fileAttributeField]),
      {
        opacity: _opacity,
        title: `Tax Map ${attributes[titleAttributeField]}`,
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
    this.addHandles(
      this.watch('_imageLayerInfo', (_imageLayerInfo: ImageLayerInfo | null): void => {
        // console.log(_imageLayerInfo, select);
        select.value = !_imageLayerInfo ? 'none' : _imageLayerInfo.fileName;
      }),
    );
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { layer, titleAttributeField, urlAttributeField, showSwitch, _imageLayerInfo, _opacity, _options, _loading } =
      this;
    return (
      <calcite-panel heading="Tax Maps">
        {_imageLayerInfo ? (
          <calcite-button
            appearance="outline"
            href={_imageLayerInfo.feature.attributes[urlAttributeField]}
            icon-start="file-pdf"
            slot="footer"
            target="_blank"
            width="full"
          >
            {`View ${_imageLayerInfo.feature.attributes[titleAttributeField]}`}
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
      /**
       * Attribute field containing filename.
       */
      fileAttributeField: string;
      /**
       * Attribute field for titles, buttons, options, etc.
       */
      titleAttributeField: string;
      /**
       * URL attribute field containing pdf url.
       */
      urlAttributeField: string;
    },
  ) {
    super(properties);
  }

  graphic!: esri.Graphic;

  fileAttributeField!: string;

  titleAttributeField!: string;

  urlAttributeField!: string;

  render(): tsx.JSX.Element {
    const {
      graphic: { attributes },
      fileAttributeField,
      titleAttributeField,
      urlAttributeField,
    } = this;
    return (
      <div style={CSS.popup}>
        <calcite-button
          icon-start="image"
          width="full"
          onclick={(): void => {
            this.emit('show', attributes[fileAttributeField]);
          }}
        >
          {`Show ${attributes[titleAttributeField]}`}
        </calcite-button>
        <calcite-button
          appearance="outline"
          href={attributes[urlAttributeField]}
          icon-start="file-pdf"
          target="_blank"
          width="full"
        >
          {`View ${attributes[titleAttributeField]}`}
        </calcite-button>
      </div>
    );
  }
}
