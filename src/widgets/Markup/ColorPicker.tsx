import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Color from '@arcgis/core/Color';

const CSS = {
  colorPicker: 'cov-markup--color-picker',
  colorPickerColor: 'cov-markup--color-picker--color',
  colorPickerColorSelected: 'cov-markup--color-picker--color--selected',
};

@subclass('cov.widgets.Markup.ColorPicker')
export default class ColorPicker extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Selected color.
       */
      color?: esri.Color;
      /**
       * Available colors.
       * arcgis `Candy Shop` plus black, white and grey
       */
      colors?: { [key: string]: number[] };
    },
  ) {
    super(properties);
  }

  /**
   * Available colors.
   * arcgis `Candy Shop` plus black, white and grey
   */
  colors: { [key: string]: number[] } = {
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

  @property()
  protected color!: esri.Color;

  @property({ aliasOf: 'color.r' })
  protected r!: number;

  @property({ aliasOf: 'color.g' })
  protected g!: number;

  @property({ aliasOf: 'color.b' })
  protected b!: number;

  @property({ aliasOf: 'color.a' })
  protected a!: number;

  render(): tsx.JSX.Element {
    return <div class={CSS.colorPicker}>{this._renderColorTiles()}</div>;
  }

  private _renderColorTiles(): tsx.JSX.Element[] {
    const { colors } = this;
    const tiles: tsx.JSX.Element[] = [];

    for (const color in colors) {
      const [r, g, b] = colors[color];

      const selected = this.color && r === this.r && g === this.g && b === this.b;

      tiles.push(
        <div
          class={this.classes(CSS.colorPickerColor, selected ? CSS.colorPickerColorSelected : '')}
          style={`background-color: rgba(${r}, ${g}, ${b}, 1);`}
          afterCreate={(div: HTMLDivElement): void => {
            div.addEventListener('click', (): void => {
              this.color = new Color({ r, g, b });
            });
          }}
        ></div>,
      );
    }

    return tiles;
  }
}
