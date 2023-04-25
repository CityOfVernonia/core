import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import ColorPicker from './ColorPicker';
const CSS = {
    symbolEditor: 'cov-markup--symbol-editor',
    sliderLabels: 'cov-markup--symbol-editor--slider-labels',
};
let KEY = 0;
let SymbolEditor = class SymbolEditor extends Widget {
    constructor(properties) {
        super(properties);
    }
    /**
     * Set symbol property with dot notation and value.
     * @param property
     * @param value
     */
    _setProperty(property, value) {
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
    render() {
        const { symbol } = this;
        if (!symbol)
            return tsx("div", null);
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
                return tsx("div", null);
        }
    }
    /**
     * Create and wire color picker.
     * @param symbol
     * @param property
     * @param container
     */
    _colorPicker(symbol, property, container) {
        // create color picker
        const colorPicker = new ColorPicker({
            color: symbol.get(property),
            container,
        });
        // set property
        this.addHandles(colorPicker.watch('color', (color) => {
            this._setProperty(property, color);
        }));
    }
    /**
     * Simple marker symbol editor.
     * @param symbol
     */
    _simpleMarkerSymbol(symbol) {
        const { style, size, outline: { width }, } = symbol;
        return (tsx("div", { key: KEY++, class: CSS.symbolEditor },
            tsx("calcite-label", null,
                "Color",
                tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'color') })),
            tsx("calcite-label", null,
                "Style",
                tsx("calcite-select", { afterCreate: (calciteSelect) => {
                        calciteSelect.addEventListener('calciteSelectChange', () => {
                            this._setProperty('style', calciteSelect.selectedOption.value);
                        });
                    } },
                    tsx("calcite-option", { key: KEY++, selected: style === 'circle', value: "circle" }, "Circle"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'square', value: "square" }, "Square"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'diamond', value: "diamond" }, "Diamond"))),
            tsx("calcite-label", null,
                "Size",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('size', calciteSlider.value);
                        });
                    }, min: "6", max: "18", value: size, step: "1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "Small"),
                    tsx("span", null, "Large"))),
            tsx("calcite-label", null,
                "Outline color",
                tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'outline.color') })),
            tsx("calcite-label", { style: "--calcite-label-margin-bottom: 0;" },
                "Outline width",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('outline.width', calciteSlider.value);
                        });
                    }, min: "1", max: "4", value: width, step: "1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "Thin"),
                    tsx("span", null, "Thick")))));
    }
    /**
     * Simple line symbol editor.
     * @param symbol
     */
    _simpleLineSymbol(symbol) {
        const { style, width } = symbol;
        return (tsx("div", { key: KEY++, class: CSS.symbolEditor },
            tsx("calcite-label", null,
                "Color",
                tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'color') })),
            tsx("calcite-label", null,
                "Style",
                tsx("calcite-select", { afterCreate: (calciteSelect) => {
                        calciteSelect.addEventListener('calciteSelectChange', () => {
                            this._setProperty('style', calciteSelect.selectedOption.value);
                        });
                    } },
                    tsx("calcite-option", { key: KEY++, selected: style === 'solid', value: "solid" }, "Solid"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dash', value: "dash" }, "Dash"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dot', value: "dot" }, "Dot"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dash-dot', value: "dash-dot" }, "Dash Dot"))),
            tsx("calcite-label", { style: "--calcite-label-margin-bottom: 0;" },
                "Width",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('width', calciteSlider.value);
                        });
                    }, min: "1", max: "6", value: width, step: "1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "Thin"),
                    tsx("span", null, "Thick")))));
    }
    /**
     * Simple fill symbol editor.
     * @param symbol
     */
    _simpleFillSymbol(symbol) {
        const { outline: { style, width }, color: { a }, } = symbol;
        return (tsx("div", { key: KEY++, class: CSS.symbolEditor },
            tsx("calcite-label", null,
                "Line color",
                tsx("div", { afterCreate: this._colorPicker.bind(this, symbol, 'outline.color') })),
            tsx("calcite-label", null,
                "Line style",
                tsx("calcite-select", { afterCreate: (calciteSelect) => {
                        calciteSelect.addEventListener('calciteSelectChange', () => {
                            this._setProperty('outline.style', calciteSelect.selectedOption.value);
                        });
                    } },
                    tsx("calcite-option", { key: KEY++, selected: style === 'solid', value: "solid" }, "Solid"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dash', value: "dash" }, "Dash"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dot', value: "dot" }, "Dot"),
                    tsx("calcite-option", { key: KEY++, selected: style === 'dash-dot', value: "dash-dot" }, "Dash Dot"))),
            tsx("calcite-label", null,
                "Line width",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('outline.width', calciteSlider.value);
                        });
                    }, min: "1", max: "6", value: width, step: "1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "Thin"),
                    tsx("span", null, "Thick"))),
            tsx("calcite-label", null,
                "Fill color",
                tsx("div", { afterCreate: (div) => {
                        // custom color picker for fill
                        const colorPicker = new ColorPicker({
                            color: symbol.color,
                            container: div,
                        });
                        colorPicker.watch('color', (color) => {
                            this._setProperty('color.r', color.r);
                            this._setProperty('color.b', color.b);
                            this._setProperty('color.g', color.g);
                        });
                    } })),
            tsx("calcite-label", { style: "--calcite-label-margin-bottom: 0;" },
                "Fill opacity",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('color.a', calciteSlider.value);
                        });
                    }, min: "0", max: "1", value: a, step: "0.1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "0%"),
                    tsx("span", null, "50%"),
                    tsx("span", null, "100%")))));
    }
    /**
     * Text symbol editor.
     * @param symbol
     */
    _textSymbol(symbol) {
        return (tsx("div", { key: KEY++, class: CSS.symbolEditor },
            tsx("calcite-label", null,
                "Text",
                tsx("calcite-input", { type: "text", value: symbol.text, afterCreate: (calciteInput) => {
                        calciteInput.addEventListener('calciteInputInput', () => {
                            this._setProperty('text', calciteInput.value);
                        });
                    } })),
            tsx("calcite-label", null,
                "Size",
                tsx("calcite-slider", { afterCreate: (calciteSlider) => {
                        calciteSlider.addEventListener('calciteSliderInput', () => {
                            this._setProperty('font.size', calciteSlider.value);
                        });
                    }, min: "10", max: "18", value: symbol.font.size, step: "1", snap: "" }),
                tsx("div", { class: CSS.sliderLabels },
                    tsx("span", null, "Small"),
                    tsx("span", null, "Large"))),
            tsx("calcite-label", null,
                "Color",
                tsx("div", { afterCreate: (div) => {
                        const colorPicker = new ColorPicker({
                            color: symbol.color,
                            container: div,
                        });
                        colorPicker.watch('color', (color) => {
                            this._setProperty('color', color);
                        });
                    } })),
            tsx("calcite-label", { style: "--calcite-label-margin-bottom: 0;" },
                "Halo color",
                tsx("div", { afterCreate: (div) => {
                        const colorPicker = new ColorPicker({
                            color: symbol.haloColor,
                            container: div,
                        });
                        colorPicker.watch('color', (color) => {
                            this._setProperty('haloColor', color);
                        });
                    } }))));
    }
};
__decorate([
    property()
], SymbolEditor.prototype, "graphic", void 0);
__decorate([
    property({ aliasOf: 'graphic.symbol' })
], SymbolEditor.prototype, "symbol", void 0);
SymbolEditor = __decorate([
    subclass('cov.widgets.Markup.SymbolEditor')
], SymbolEditor);
export default SymbolEditor;
