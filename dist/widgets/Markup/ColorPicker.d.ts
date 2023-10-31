import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class ColorPicker extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Selected color.
         */
        color?: esri.Color;
        /**
         * Available colors.
         * arcgis `Candy Shop` plus black, white and grey
         */
        colors?: {
            [key: string]: number[];
        };
    });
    /**
     * Available colors.
     * arcgis `Candy Shop` plus black, white and grey
     */
    colors: {
        [key: string]: number[];
    };
    protected color: esri.Color;
    protected r: number;
    protected g: number;
    protected b: number;
    protected a: number;
    render(): tsx.JSX.Element;
    private _renderColorTiles;
}
