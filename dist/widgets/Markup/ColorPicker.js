import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Color from '@arcgis/core/Color';
const CSS = {
    colorPicker: 'cov-markup--color-picker',
    colorPickerColor: 'cov-markup--color-picker--color',
    colorPickerColorSelected: 'cov-markup--color-picker--color--selected',
};
let ColorPicker = class ColorPicker extends Widget {
    constructor(properties) {
        super(properties);
        /**
         * Available colors.
         * arcgis `Candy Shop` plus black, white and grey
         */
        this.colors = {
            white: [255, 255, 255],
            black: [0, 0, 0],
            grey: [128, 128, 128],
            red: [237, 81, 81],
            blue: [20, 158, 206],
            green: [167, 198, 54],
            purple: [158, 85, 156],
            orange: [252, 146, 31],
            yellow: [255, 222, 62],
        };
    }
    render() {
        return tsx("div", { class: CSS.colorPicker }, this._renderColorTiles());
    }
    _renderColorTiles() {
        const { colors } = this;
        const tiles = [];
        for (const color in colors) {
            const [r, g, b] = colors[color];
            const selected = this.color && r === this.r && g === this.g && b === this.b;
            tiles.push(tsx("div", { class: this.classes(CSS.colorPickerColor, selected ? CSS.colorPickerColorSelected : ''), style: `background-color: rgba(${r}, ${g}, ${b}, 1);`, afterCreate: (div) => {
                    div.addEventListener('click', () => {
                        this.color = new Color({ r, g, b });
                    });
                } }));
        }
        return tiles;
    }
};
__decorate([
    property()
], ColorPicker.prototype, "color", void 0);
__decorate([
    property({ aliasOf: 'color.r' })
], ColorPicker.prototype, "r", void 0);
__decorate([
    property({ aliasOf: 'color.g' })
], ColorPicker.prototype, "g", void 0);
__decorate([
    property({ aliasOf: 'color.b' })
], ColorPicker.prototype, "b", void 0);
__decorate([
    property({ aliasOf: 'color.a' })
], ColorPicker.prototype, "a", void 0);
ColorPicker = __decorate([
    subclass('cov.widgets.Markup.ColorPicker')
], ColorPicker);
export default ColorPicker;
