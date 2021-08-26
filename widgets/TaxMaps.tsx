/**
 * Widget to control tax map imagery overlay.
 */

// namespaces and types
import cov = __cov;

// base imports
import { whenOnce } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { taxMapUrl } from '@vernonia/assessor-urls/src/AssessorURLs';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';

// styles
import './TaxMaps.scss';
const CSS = {
  base: 'cov-widget',
  title: 'cov-widget--title',
  titleText: 'cov-widget--title--text',
  popupContent: 'cov-tax-maps--popup-content',
};

let KEY = 0;

@subclass('cov.widgets.TaxMaps.TaxMapsPopupContent')
class TaxMapsPopupContent extends Widget {
  @property()
  graphic!: esri.Graphic;

  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: { name, alias, taxmap, filename },
      },
    } = this;
    return (
      <div class={CSS.popupContent}>
        <calcite-button
          width="full"
          appearance="outline"
          icon-start="view-visible"
          onclick={() => {
            this.emit('show', `${name},${alias},${taxmap},${filename}`);
          }}
        >
          {`Show ${alias}`}
        </calcite-button>
        <calcite-button
          width="full"
          appearance="outline"
          icon-start="view-hide"
          onclick={() => {
            this.emit('show', 'none,0,0,0');
          }}
        >
          Hide
        </calcite-button>
        <calcite-button
          width="full"
          appearance="outline"
          icon-start="download"
          onclick={() => {
            window.open(taxMapUrl(taxmap, 'pdf'), '_blank');
          }}
        >
          Download
        </calcite-button>
      </div>
    );
  }
}

// class export
@subclass('cov.widgets.TaxMaps')
export default class TaxMaps extends Widget {
  @property()
  view!: esri.MapView;

  @property()
  featureLayer!: esri.FeatureLayer;

  @property()
  mapImageLayer!: esri.MapImageLayer;

  @property()
  private _active: [string, string, string, string] | ['none', '', '', ''] = ['none', '', '', ''];

  @property()
  _taxMapSelect!: HTMLCalciteSelectElement;

  @property()
  private _options: Collection<tsx.JSX.Element> = new Collection([
    <calcite-option key={KEY++} selected={true} value="none,'','',''">
      None
    </calcite-option>,
  ]);

  constructor(properties: cov.TaxMapsProperties) {
    super(properties);
    whenOnce(this, 'featureLayer.loaded', this._init.bind(this));
  }

  private _init() {
    const { view, featureLayer, _options } = this;

    featureLayer
      .queryFeatures({
        where: '1 = 1',
        returnGeometry: false,
        outFields: ['*'],
      })
      .then((results: esri.FeatureSet) => {
        results.features.forEach((feature: esri.Graphic) => {
          const {
            attributes: { name, alias, taxmap, filename },
          } = feature;

          _options.add(
            <calcite-option key={KEY++} value={`${name},${alias},${taxmap},${filename}`}>
              {alias}
            </calcite-option>,
          );
        });
      })
      .catch();

    featureLayer.popupEnabled = true;

    featureLayer.popupTemplate = new PopupTemplate({
      outFields: ['*'],
      title: '{alias}',
      content: [
        new CustomContent({
          outFields: ['*'],
          creator: (createEvent: any): Widget => {
            const content = new TaxMapsPopupContent({
              graphic: createEvent.graphic,
            });

            content.on('show', (info: any) => {
              view.popup.close();
              this._selectTaxMap({
                target: {
                  selectedOption: {
                    value: info,
                  },
                },
              });
            });

            return content;
          },
        }),
      ],
    });
  }

  private _selectTaxMap(event: any): void {
    const {
      view,
      featureLayer,
      mapImageLayer: { sublayers },
      _options,
    } = this;

    let value = (event.target as HTMLCalciteSelectElement).selectedOption.value;

    _options.forEach((item: tsx.JSX.Element): void => {
      // @ts-ignore
      item.domNode.selected = item.domNode.value === value;
    });

    value = value.split(',');
    const [name, alias, taxmap, filename] = value;

    if (name === 'none') {
      sublayers.getItemAt(0).sublayers.forEach((sublayer: esri.Sublayer) => (sublayer.visible = false));
      this._active = ['none', '', '', ''];
      return;
    }

    this._active = [name, alias, taxmap, filename];

    sublayers.getItemAt(0).sublayers.forEach((sublayer: esri.Sublayer) => {
      sublayer.visible = sublayer.title === filename;
    });

    featureLayer
      .queryExtent({
        where: `name = '${name}'`,
        outSpatialReference: view.spatialReference,
      })
      .then((extent: esri.Extent) => {
        view.goTo(extent);
      })
      .catch();
  }

  private _setLayerOpacity(event: any) {
    const { mapImageLayer } = this;
    mapImageLayer.opacity = (event.target as HTMLCalciteSliderElement).value as number;
  }

  render(): tsx.JSX.Element {
    const { id, featureLayer, mapImageLayer, _active, _options } = this;
    const active = _active[1].length ? true : false;

    return (
      <div class={CSS.base}>
        <div class={CSS.title}>
          <div class={CSS.titleText}>Tax Maps</div>
          <calcite-popover-manager auto-close="">
            <calcite-icon id={`popover_${id}`} icon="information" scale="s"></calcite-icon>
          </calcite-popover-manager>
          <calcite-popover
            reference-element={`popover_${id}`}
            dismissible=""
            heading="Tax Maps"
            overlay-positioning="fixed"
          >
            <p>
              Select a tax map to view from the list, or click on a tax map boundary in the map. With a tax map
              selected, the opacity may be adjusted or downloaded.
            </p>
          </calcite-popover>
        </div>
        <calcite-label layout="inline">
          <calcite-checkbox
            checked={featureLayer.visible}
            afterCreate={(calciteCheckbox: HTMLCalciteCheckboxElement) => {
              calciteCheckbox.addEventListener('calciteCheckboxChange', (): void => {
                featureLayer.visible = calciteCheckbox.checked as boolean;
              });
            }}
          ></calcite-checkbox>
          Tax map boundaries
        </calcite-label>
        <calcite-label>
          Select tax map
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              this._taxMapSelect = calciteSelect;
              calciteSelect.addEventListener('calciteSelectChange', this._selectTaxMap.bind(this));
            }}
          >
            {_options.toArray()}
          </calcite-select>
        </calcite-label>
        <calcite-label>
          Tax map opacity
          <calcite-slider
            min="0"
            max="1"
            step="0.1"
            snap=""
            ticks="0.5"
            label-ticks=""
            disabled={!active}
            value={mapImageLayer.opacity}
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderChange', this._setLayerOpacity.bind(this));
            }}
          ></calcite-slider>
        </calcite-label>
        <calcite-button
          disabled={!active}
          width="full"
          alignment="center"
          appearance="outline"
          icon-start="download"
          onclick={(): void => {
            window.open(taxMapUrl(_active[2], 'pdf'), '_blank');
          }}
        >
          Download PDF
        </calcite-button>
      </div>
    );
  }
}
