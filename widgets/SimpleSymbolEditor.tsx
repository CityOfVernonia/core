/**
 * Widget for editing markup graphic symbols.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Color from '@arcgis/core/Color';
import ColorPicker from './ColorPicker';

// styles
import './SimpleSymbolEditor.scss';
const CSS = {
  base: 'cov-symbol-editor',
  row: 'cov-symbol-editor--row',
  sliderLabels: 'cov-symbol-editor--slider-labels',
};

// class export
@subclass('cov.widgets.SimpleSymbolEditor')
export default class SimpleSymbolEditor extends Widget {
  @property()
  graphic!: esri.Graphic | null;

  @property({
    aliasOf: 'graphic.symbol',
  })
  symbol!: esri.Symbol2D3D;

  constructor(properties?: cov.SimpleSymbolEditorProperties) {
    super(properties);
  }

  /**
   * Sets any symbol property.
   * @param property the property to set in dot notation, e.g. 'color.a'
   * @param evt onchange or oninput event
   * @param value property value to set
   */
  setSymbolProperty(property: string, evt?: Event, value?: string | number | esri.Color): void {
    const { graphic, symbol: orginalSymbol } = this;
    const symbol = orginalSymbol.clone();
    if (!evt && !value) return;
    if (evt && !value) value = (evt.target as HTMLSelectElement | HTMLInputElement).value;
    symbol.set({
      [property]: value,
    });
    graphic?.set({
      symbol: symbol,
    });
  }

  render(): tsx.JSX.Element {
    const { graphic, symbol } = this;

    if (!graphic) {
      return <div>Select a markup graphic in the map to edit symbol.</div>;
    }

    switch (symbol.type) {
      case 'simple-marker':
        return this._simpleMarkerSymbol(symbol);
      case 'simple-line':
        return this._simpleLineSymbol(symbol);
      case 'simple-fill':
        return this._simpleFillSymbol(symbol);
      default:
        return <div></div>;
    }
  }

  /**
   * Simple marker symbol editor.
   * @param symbol
   * @returns
   */
  private _simpleMarkerSymbol(symbol: esri.SimpleMarkerSymbol): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div class={CSS.row}>
          <calcite-label>
            Color
            <div
              afterCreate={(div: HTMLDivElement) => {
                const colorPicker = new ColorPicker({
                  value: symbol.color.toHex(),
                  container: div,
                });
                colorPicker.on('color-change', (color: string) => {
                  this.setSymbolProperty('color', undefined, color);
                });
              }}
            ></div>
          </calcite-label>
          <calcite-label>
            Style
            <calcite-select
              afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
                calciteSelect.addEventListener('calciteSelectChange', () => {
                  this.setSymbolProperty('style', undefined, calciteSelect.selectedOption.value);
                });
              }}
            >
              <calcite-option selected={symbol.style === 'circle'} value="circle">
                Circle
              </calcite-option>
              <calcite-option selected={symbol.style === 'square'} value="square">
                Square
              </calcite-option>
              <calcite-option selected={symbol.style === 'diamond'} value="diamond">
                Diamond
              </calcite-option>
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Size
            <calcite-slider
              afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
                calciteSlider.addEventListener('calciteSliderChange', () => {
                  this.setSymbolProperty('size', undefined, calciteSlider.value as number);
                });
              }}
              min="6"
              max="12"
              value={symbol.size}
              step="1"
              snap=""
            ></calcite-slider>
            <div class={CSS.sliderLabels}>
              <span>Small</span>
              <span>Large</span>
            </div>
          </calcite-label>
        </div>
        <div class={CSS.row}>
          <calcite-label>
            Outline color
            <div
              afterCreate={(div: HTMLDivElement) => {
                const colorPicker = new ColorPicker({
                  value: symbol.outline.color.toHex(),
                  container: div,
                });
                colorPicker.on('color-change', (color: string) => {
                  this.setSymbolProperty('outline.color', undefined, color);
                });
              }}
            ></div>
          </calcite-label>
          <calcite-label>
            Outline width
            <calcite-slider
              afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
                calciteSlider.addEventListener('calciteSliderChange', () => {
                  this.setSymbolProperty('outline.width', undefined, calciteSlider.value as number);
                });
              }}
              min="1"
              max="4"
              value={symbol.outline.width}
              step="1"
              snap=""
            ></calcite-slider>
            <div class={CSS.sliderLabels}>
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </calcite-label>
          <calcite-label></calcite-label>
        </div>
      </div>
    );
  }

  /**
   * Simple line symbol editor.
   * @param symbol
   * @returns
   */
  private _simpleLineSymbol(symbol: esri.SimpleLineSymbol): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div class={CSS.row}>
          <calcite-label>
            Color
            <div
              afterCreate={(div: HTMLDivElement) => {
                const colorPicker = new ColorPicker({
                  value: symbol.color.toHex(),
                  container: div,
                });
                colorPicker.on('color-change', (color: string) => {
                  this.setSymbolProperty('color', undefined, color);
                });
              }}
            ></div>
          </calcite-label>
          <calcite-label>
            Style
            <calcite-select
              afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
                calciteSelect.addEventListener('calciteSelectChange', () => {
                  this.setSymbolProperty('style', undefined, calciteSelect.selectedOption.value);
                });
              }}
            >
              <calcite-option selected={symbol.style === 'solid'} value="solid">
                Solid
              </calcite-option>
              <calcite-option selected={symbol.style === 'dash'} value="dash">
                Dash
              </calcite-option>
              <calcite-option selected={symbol.style === 'dot'} value="dot">
                Dot
              </calcite-option>
              <calcite-option selected={symbol.style === 'dash-dot'} value="dash-dot">
                Dash Dot
              </calcite-option>
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Width
            <calcite-slider
              afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
                calciteSlider.addEventListener('calciteSliderChange', () => {
                  this.setSymbolProperty('width', undefined, calciteSlider.value as number);
                });
              }}
              min="1"
              max="6"
              value={symbol.width}
              step="1"
              snap=""
            ></calcite-slider>
            <div class={CSS.sliderLabels}>
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </calcite-label>
        </div>
      </div>
    );
  }

  private _simpleFillSymbol(symbol: esri.SimpleFillSymbol): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div class={CSS.row}>
          <calcite-label>
            Line color
            <div
              afterCreate={(div: HTMLDivElement) => {
                const colorPicker = new ColorPicker({
                  value: symbol.outline.color.toHex(),
                  container: div,
                });
                colorPicker.on('color-change', (color: string) => {
                  this.setSymbolProperty('outline.color', undefined, color);
                });
              }}
            ></div>
          </calcite-label>
          <calcite-label>
            Line style
            <calcite-select
              afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
                calciteSelect.addEventListener('calciteSelectChange', () => {
                  this.setSymbolProperty('outline.style', undefined, calciteSelect.selectedOption.value);
                });
              }}
            >
              <calcite-option selected={symbol.outline.style === 'solid'} value="solid">
                Solid
              </calcite-option>
              <calcite-option selected={symbol.outline.style === 'dash'} value="dash">
                Dash
              </calcite-option>
              <calcite-option selected={symbol.outline.style === 'dot'} value="dot">
                Dot
              </calcite-option>
              <calcite-option selected={symbol.outline.style === 'dash-dot'} value="dash-dot">
                Dash Dot
              </calcite-option>
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Line width
            <calcite-slider
              afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
                calciteSlider.addEventListener('calciteSliderChange', () => {
                  this.setSymbolProperty('outline.width', undefined, calciteSlider.value as number);
                });
              }}
              min="1"
              max="6"
              value={symbol.outline.width}
              step="1"
              snap=""
            ></calcite-slider>
            <div class={CSS.sliderLabels}>
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </calcite-label>
        </div>
        <div class={CSS.row}>
          <calcite-label>
            Fill color
            <div
              afterCreate={(div: HTMLDivElement) => {
                const colorPicker = new ColorPicker({
                  value: symbol.color.toHex(),
                  container: div,
                });
                colorPicker.on('color-change', (color: string) => {
                  const fill = new Color(color);
                  fill.a = symbol.color.a;
                  this.setSymbolProperty('color', undefined, fill);
                });
              }}
            ></div>
          </calcite-label>
          <calcite-label>
            Fill opacity
            <calcite-slider
              afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
                calciteSlider.addEventListener('calciteSliderChange', () => {
                  const fill = this.symbol.color.clone();
                  fill.a = calciteSlider.value as number;
                  this.setSymbolProperty('color', undefined, fill);
                });
              }}
              min="0"
              max="1"
              value={symbol.color.a}
              step="0.1"
              snap=""
            ></calcite-slider>
            <div class={CSS.sliderLabels}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </calcite-label>
          <calcite-label></calcite-label>
        </div>
      </div>
    );
  }
}
