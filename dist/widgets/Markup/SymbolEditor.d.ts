import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class SymbolEditor extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Graphic of interest.
         */
        graphic?: esri.Graphic;
    });
    /**
     * Graphic of interest.
     */
    graphic: esri.Graphic;
    /**
     * Graphic's symbol.
     */
    protected symbol: esri.SimpleMarkerSymbol | esri.SimpleLineSymbol | esri.SimpleFillSymbol | esri.TextSymbol;
    /**
     * Set symbol property with dot notation and value.
     * @param property
     * @param value
     */
    private _setProperty;
    /**
     * Render widget.
     */
    render(): tsx.JSX.Element;
    /**
     * Create and wire color picker.
     * @param symbol
     * @param property
     * @param container
     */
    private _colorPicker;
    /**
     * Simple marker symbol editor.
     * @param symbol
     */
    private _simpleMarkerSymbol;
    /**
     * Simple line symbol editor.
     * @param symbol
     */
    private _simpleLineSymbol;
    /**
     * Simple fill symbol editor.
     * @param symbol
     */
    private _simpleFillSymbol;
    /**
     * Text symbol editor.
     * @param symbol
     */
    private _textSymbol;
}
