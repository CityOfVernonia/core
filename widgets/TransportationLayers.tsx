/**
 * A widget for controlling the display of transportation network layers.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import { watch } from '@arcgis/core/core/watchUtils';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Legend from '@arcgis/core/widgets/Legend';

// styles
import './TransportationLayers.scss';
const CSS = {
  base: 'transportation-layers cov-widget',
  heading: 'transportation-layers--heading',
  subheading: 'transportation-layers--subheading',
  labelRow: 'transportation-layers--label-row',
  popupContent: 'transportation-layers--popup-content',
};

// class export
@subclass('cov.widgets.TransportationLayers')
export default class TransportationLayers extends Widget {
  @property()
  view!: esri.MapView;

  @property()
  layer!: esri.MapImageLayer;

  @property()
  private _currentOverlay: [number, number | null] = [4, null];

  @property()
  private _showDirectionalArrows = false;

  constructor(properties: cov.TransportationLayersProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    await this.layer.when();

    const {
      layer: { sublayers },
    } = this;

    [0, 1, 2, 3, 5, 7, 9].forEach((index: number) => {
      const sub = sublayers.find((sublayer: esri.Sublayer) => {
        return sublayer.id === index;
      });

      if (sub) sub.legendEnabled = false;
    });

    watch(this, '_showDirectionalArrows', (showDirectionalArrows: boolean) => {
      const { _currentOverlay } = this;
      if (_currentOverlay[1]) {
        sublayers.find((sublayer: esri.Sublayer) => {
          return sublayer.id === _currentOverlay[1];
        }).visible = showDirectionalArrows;
      } else {
        [5, 7, 9].forEach((id: number) => {
          sublayers.forEach((sublayer: esri.Sublayer) => {
            if (sublayer.id === id) {
              sublayer.visible = false;
            }
          });
        });
      }
    });
  }

  private _changeOverlay(overlayIndex: number, arrowIndex: number | null): void {
    const {
      layer: { sublayers },
    } = this;

    this._currentOverlay = [overlayIndex, arrowIndex];

    [4, 5, 6, 7, 8, 9, 10, 11].forEach((id: number) => {
      sublayers.forEach((sublayer: esri.Sublayer) => {
        if (sublayer.id === id) {
          sublayer.visible = false;
        }
      });
    });

    sublayers.find((sublayer: esri.Sublayer) => {
      return sublayer.id === overlayIndex;
    }).visible = true;

    if (!this._showDirectionalArrows || arrowIndex === null) return;

    sublayers.find((sublayer: esri.Sublayer) => {
      return sublayer.id === arrowIndex;
    }).visible = true;
  }

  private _toggleLRS(checked: boolean, indexes: number[]): void {
    const {
      layer: { sublayers },
    } = this;

    indexes.forEach((index: number) => {
      sublayers.find((sublayer: esri.Sublayer) => {
        return sublayer.id === index;
      }).visible = checked;
    });
  }

  render(): tsx.JSX.Element {
    const { id } = this;

    return (
      <div class={CSS.base}>
        <div class={CSS.heading}>Transportation Layers</div>
        <div class={CSS.subheading}>Overlays</div>
        <calcite-label layout="inline" alignment="start">
          <calcite-radio-button checked="" onclick={this._changeOverlay.bind(this, 4, null)}></calcite-radio-button>
          Functional Classification
        </calcite-label>
        <calcite-label layout="inline" alignment="start">
          <calcite-radio-button onclick={this._changeOverlay.bind(this, 6, 5)}></calcite-radio-button>
          Surface Type *
        </calcite-label>
        <div class={CSS.labelRow}>
          <calcite-label layout="inline" alignment="start">
            <calcite-radio-button onclick={this._changeOverlay.bind(this, 8, 7)}></calcite-radio-button>
            Surface Condition *
          </calcite-label>
          <calcite-popover-manager auto-close="">
            <calcite-popover reference-element={`popup_condition_${id}`} overlay-positioning="fixed">
              <div class={CSS.popupContent}>
                <p>
                  <span style="font-weight:500;">Poor (1)</span> - Pavement is in poor to very poor condition with
                  extensive and severe cracking, alligatoring (a pattern of cracking in all directions on the road
                  surface), and channeling. Ridability (a measure of surface smoothness) is poor, meaning that the
                  surface is rough and uneven.
                </p>
                <p>
                  <span style="font-weight:500;">Marginal (2)</span> - Pavement is in fair to poor condition with
                  frequent cracking, alligatoring, and channeling. Ridability is poor to fair, meaning that the surface
                  is moderately rough and uneven.
                </p>
                <p>
                  <span style="font-weight:500;">Fair (3)</span> - Pavement is in fair condition with frequent slight
                  cracking and intermittent, slight to moderate alligatoring and channeling. Ridability is fairly good,
                  with intermittent rough and uneven sections.
                </p>
                <p>
                  <span style="font-weight:500;">Good (4)</span> - Pavement is in good condition with very slight
                  cracking. Ridability is good, with a few rough or uneven sections.
                </p>
                <p>
                  <span style="font-weight:500;">Excellent (5)</span> - Pavement is in excellent condition with few
                  cracks. Ridability is excellent, with only a few areas of slight distortion.
                </p>
              </div>
            </calcite-popover>
            <calcite-icon id={`popup_condition_${id}`} icon="information" scale="s" appearance="clear"></calcite-icon>
          </calcite-popover-manager>
        </div>
        <calcite-label layout="inline" alignment="start">
          <calcite-radio-button onclick={this._changeOverlay.bind(this, 10, 9)}></calcite-radio-button>
          Surface Width *
        </calcite-label>
        <calcite-label layout="inline" alignment="start">
          <calcite-radio-button onclick={this._changeOverlay.bind(this, 11, null)}></calcite-radio-button>
          ODOT Reported
        </calcite-label>
        <calcite-label layout="inline" alignment="start">
          <calcite-switch
            bind={this}
            afterCreate={(_switch: HTMLCalciteSwitchElement) => {
              _switch.addEventListener('calciteSwitchChange', () => {
                this._showDirectionalArrows = _switch.switched;
              });
            }}
          ></calcite-switch>
          Directional arrows *
        </calcite-label>
        <div class={CSS.subheading}>Linear Referencing</div>
        <calcite-label layout="inline" alignment="start">
          <calcite-checkbox
            bind={this}
            afterCreate={(checkbox: HTMLCalciteCheckboxElement) => {
              checkbox.addEventListener('calciteCheckboxChange', () => {
                this._toggleLRS(checkbox.checked as boolean, [1, 2]);
              });
            }}
          ></calcite-checkbox>
          Stations
        </calcite-label>
        <calcite-label layout="inline" alignment="start">
          <calcite-checkbox
            bind={this}
            afterCreate={(checkbox: HTMLCalciteCheckboxElement) => {
              checkbox.addEventListener('calciteCheckboxChange', () => {
                this._toggleLRS(checkbox.checked as boolean, [3]);
              });
            }}
          ></calcite-checkbox>
          Directional Arrows
        </calcite-label>
        <div class={CSS.subheading}>Legend</div>
        <div
          afterCreate={(div: HTMLDivElement) => {
            new Legend({
              container: div,
              view: this.view,
              layerInfos: [
                {
                  layer: this.layer,
                },
              ],
            });
          }}
        ></div>
      </div>
    );
  }
}
