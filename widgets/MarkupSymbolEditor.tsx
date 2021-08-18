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

// styles
const CSS = {
  base: 'cov-markup-symbol-editor',
  title: 'cov-markup--title',
  buttonRow: 'cov-markup--button-row',
  inputRow: 'cov-markup--input-row',
  sliderLabels: 'cov-markup-symbol-editor--slider-labels',
  colorPicker: 'cov-markup-symbol-editor--color-picker',
  colorPickerRow: 'cov-markup-symbol-editor--color-picker--row',
  colorPickerChip: 'cov-markup-symbol-editor--color-picker--chip',
};

let KEY = 0;

@subclass('cov.widgets.MarkupSymbolEditor.ColorPicker')
class ColorPicker extends Widget {
  @property()
  value = '';

  // https://clrs.cc/
  @property()
  colors: [
    [string, string, string, string, string, string, string, string],
    [string, string, string, string, string, string, string, string],
  ] = [
    ['#111111', '#AAAAAA', '#FFFFFF', '#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970'],
    ['#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144B', '#F012BE', '#B10DC9'],
  ];

  constructor(properties?: esri.WidgetProperties & { value?: string }) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const { value, colors } = this;
    const colorsOne = colors[0];
    const colorsTwo = colors[1];
    return (
      <div class={CSS.colorPicker}>
        <div class={CSS.colorPickerRow}>
          {colorsOne.map((color: string | undefined): tsx.JSX.Element => {
            return (
              <div
                key={KEY++}
                style={`background-color: ${color};`}
                class={this.classes(
                  CSS.colorPickerChip,
                  value.toLowerCase() === color?.toLowerCase() ? 'selected' : '',
                )}
                onclick={this._selectColor.bind(this)}
              ></div>
            );
          })}
        </div>
        <div class={CSS.colorPickerRow}>
          {colorsTwo.map((color: string | undefined): tsx.JSX.Element => {
            return (
              <div
                key={KEY++}
                style={`background-color: ${color};`}
                class={this.classes(
                  CSS.colorPickerChip,
                  value.toLowerCase() === color?.toLowerCase() ? 'selected' : '',
                )}
                onclick={this._selectColor.bind(this)}
              ></div>
            );
          })}
        </div>
      </div>
    );
  }

  private _selectColor(evt: Event) {
    const hex = (evt.target as HTMLDivElement).style.backgroundColor
      .split('(')[1]
      .split(')')[0]
      .split(',')
      .map((x: string): string => {
        x = parseInt(x).toString(16);
        return x.length == 1 ? '0' + x : x;
      })
      .join('');
    this.value = `#${hex}`;
    this.emit('color-change', this.value);
  }
}

// class export
@subclass('cov.widgets.MarkupSymbolEditor')
export default class MarkupSymbolEditor extends Widget {
  @property()
  graphic!: esri.Graphic | null;

  @property({
    aliasOf: 'graphic.symbol',
  })
  symbol!: esri.Symbol2D3D;

  constructor(properties?: cov.MarkupSymbolEditorProperties) {
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
        <div class={CSS.inputRow}>
          <label>
            <span>Style</span>
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
          </label>
          <label>
            <span>Color</span>
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
          </label>
        </div>
        <div class={CSS.inputRow}>
          <label>
            <span>Size</span>
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
          </label>
          <label>
            <span>Outline color</span>
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
          </label>
        </div>
        <div class={CSS.inputRow}>
          <label>
            <span>Outline width</span>
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
          </label>
          <label></label>
        </div>
        {/* {this._buttons()} */}
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
        <div class={CSS.inputRow}>
          <label>
            <span>Style</span>
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
          </label>
          <label>
            <span>Color</span>
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
          </label>
        </div>
        <div class={CSS.inputRow}>
          <label>
            <span>Width</span>
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
          </label>
          <label></label>
        </div>
      </div>
    );
  }

  private _simpleFillSymbol(symbol: esri.SimpleFillSymbol): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div class={CSS.inputRow}>
          <label>
            <span>Outline style</span>
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
          </label>
          <label>
            <span>Outline color</span>
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
          </label>
        </div>
        <div class={CSS.inputRow}>
          <label>
            <span>Width</span>
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
          </label>
          <label>
            <span>Fill color</span>
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
          </label>
        </div>
        <div class={CSS.inputRow}>
          <label></label>
          <label>
            <span>Fill opacity</span>
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
          </label>
        </div>
      </div>
    );
  }

  /**
   * TODO
   */
  // private _buttons(): tsx.JSX.Element {
  //   return (
  //     <div class={CSS.buttonRow}>
  //       <calcite-button width="full">Set Default</calcite-button>
  //       <calcite-button width="full">Reset</calcite-button>
  //     </div>
  //   );
  // }
}
