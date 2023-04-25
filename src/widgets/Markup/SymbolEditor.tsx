import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Color from '@arcgis/core/Color';
import ColorPicker from './ColorPicker';

const CSS = {
  symbolEditor: 'cov-markup--symbol-editor',
  sliderLabels: 'cov-markup--symbol-editor--slider-labels',
};

let KEY = 0;

@subclass('cov.widgets.Markup.SymbolEditor')
export default class SymbolEditor extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Graphic of interest.
       */
      graphic?: esri.Graphic;
    },
  ) {
    super(properties);
  }

  /**
   * Graphic of interest.
   */
  @property()
  graphic!: esri.Graphic;

  /**
   * Graphic's symbol.
   */
  @property({ aliasOf: 'graphic.symbol' })
  protected symbol!: esri.SimpleMarkerSymbol | esri.SimpleLineSymbol | esri.SimpleFillSymbol | esri.TextSymbol;

  /**
   * Set symbol property with dot notation and value.
   * @param property
   * @param value
   */
  private _setProperty(property: string, value: string | number | Color): void {
    const { graphic, symbol: originalSymbol } = this;
    // clones symbol
    const symbol = originalSymbol.clone();
    // set the property
    symbol.set({
      [property]: value,
    });
    // set the symbol
    graphic.set({
      symbol: symbol,
    });

    this.emit('set-symbol-property', {
      originalSymbol,
      symbol,
      graphic,
    });
  }

  /**
   * Render widget.
   */
  render(): tsx.JSX.Element {
    const { symbol } = this;
    if (!symbol) return <div></div>;
    // select editor by symbol type
    switch (symbol.type) {
      case 'simple-marker':
        return this._simpleMarkerSymbol(symbol);
      case 'simple-line':
        return this._simpleLineSymbol(symbol);
      case 'simple-fill':
        return this._simpleFillSymbol(symbol);
      case 'text':
        return this._textSymbol(symbol);
      default:
        return <div></div>;
    }
  }

  /**
   * Create and wire color picker.
   * @param symbol
   * @param property
   * @param container
   */
  private _colorPicker(symbol: esri.Symbol, property: string, container: HTMLDivElement): void {
    // create color picker
    const colorPicker = new ColorPicker({
      color: symbol.get(property),
      container,
    });
    // set property
    this.addHandles(
      colorPicker.watch('color', (color: Color): void => {
        this._setProperty(property, color);
      }),
    );
  }

  /**
   * Simple marker symbol editor.
   * @param symbol
   */
  private _simpleMarkerSymbol(symbol: esri.SimpleMarkerSymbol): tsx.JSX.Element {
    const {
      style,
      size,
      outline: { width },
    } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'color')}></div>
        </calcite-label>
        <calcite-label>
          Style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'circle'} value="circle">
              Circle
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'square'} value="square">
              Square
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'diamond'} value="diamond">
              Diamond
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label>
          Size
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('size', calciteSlider.value as number);
              });
            }}
            min="6"
            max="18"
            value={size}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </calcite-label>
        <calcite-label>
          Outline color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'outline.color')}></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Outline width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('outline.width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="4"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Simple line symbol editor.
   * @param symbol
   */
  private _simpleLineSymbol(symbol: esri.SimpleLineSymbol): tsx.JSX.Element {
    const { style, width } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'color')}></div>
        </calcite-label>
        <calcite-label>
          Style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'solid'} value="solid">
              Solid
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash'} value="dash">
              Dash
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dot'} value="dot">
              Dot
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash-dot'} value="dash-dot">
              Dash Dot
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="6"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Simple fill symbol editor.
   * @param symbol
   */
  private _simpleFillSymbol(symbol: esri.SimpleFillSymbol): tsx.JSX.Element {
    const {
      outline: { style, width },
      color: { a },
    } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Line color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'outline.color')}></div>
        </calcite-label>
        <calcite-label>
          Line style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('outline.style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'solid'} value="solid">
              Solid
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash'} value="dash">
              Dash
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dot'} value="dot">
              Dot
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash-dot'} value="dash-dot">
              Dash Dot
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label>
          Line width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('outline.width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="6"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
        <calcite-label>
          Fill color
          <div
            afterCreate={(div: HTMLDivElement) => {
              // custom color picker for fill
              const colorPicker = new ColorPicker({
                color: symbol.color,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('color.r', color.r);
                this._setProperty('color.b', color.b);
                this._setProperty('color.g', color.g);
              });
            }}
          ></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Fill opacity
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('color.a', calciteSlider.value as number);
              });
            }}
            min="0"
            max="1"
            value={a}
            step="0.1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Text symbol editor.
   * @param symbol
   */
  private _textSymbol(symbol: esri.TextSymbol): tsx.JSX.Element {
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Text
          <calcite-input
            type="text"
            value={symbol.text}
            afterCreate={(calciteInput: HTMLCalciteInputElement) => {
              calciteInput.addEventListener('calciteInputInput', () => {
                this._setProperty('text', calciteInput.value);
              });
            }}
          ></calcite-input>
        </calcite-label>
        <calcite-label>
          Size
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('font.size', calciteSlider.value as number);
              });
            }}
            min="10"
            max="18"
            value={symbol.font.size}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </calcite-label>
        <calcite-label>
          Color
          <div
            afterCreate={(div: HTMLDivElement) => {
              const colorPicker = new ColorPicker({
                color: symbol.color,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('color', color);
              });
            }}
          ></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Halo color
          <div
            afterCreate={(div: HTMLDivElement) => {
              const colorPicker = new ColorPicker({
                color: symbol.haloColor,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('haloColor', color);
              });
            }}
          ></div>
        </calcite-label>
      </div>
    );
  }
}
