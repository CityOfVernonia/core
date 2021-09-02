/**
 * Simple color picker.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './ColorPicker.scss';
const CSS = {
  base: 'cov-color-picker',
  colorPickerRow: 'cov-color-picker--row',
  colorPickerChip: 'cov-color-picker--chip',
};

let KEY = 0;

@subclass('cov.widgets.ColorPicker')
export default class ColorPicker extends Widget {
  @property()
  value = '';

  // https://clrs.cc/
  @property()
  colors = [
    ['#111111', '#AAAAAA', '#FFFFFF', '#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970'],
    ['#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144B', '#F012BE', '#B10DC9'],
  ];

  constructor(properties?: cov.ColorPickerProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const { value, colors } = this;
    const colorsOne = colors[0];
    const colorsTwo = colors[1];
    return (
      <div class={CSS.base}>
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
