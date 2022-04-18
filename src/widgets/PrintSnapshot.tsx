import esri = __esri;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Print from './Print';
import Snapshot from './Snapshot';

let KEY = 0;

/**
 * Print and snapshot widgets in single UI widget.
 * NOTE: must include snapshot CSS.
 */
@subclass('PrintSnapshot')
export default class PrintSnapshot extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view to print.
       */
      view: esri.MapView;
      /**
       * URL of print service.
       */
      printServiceUrl: string;
      /**
       * Default map title.
       */
      printTitle?: string;
      /**
       * Key/value of layouts to include.
       * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
       */
      layouts?: { [key: string]: string };
      /**
       * Default snapshot title.
       */
      snapshotTitle?: string;
    },
  ) {
    super(properties);
  }

  view!: esri.MapView;

  printServiceUrl!: string;

  printTitle = 'Map Print';

  snapshotTitle = 'Map Snapshot';

  layouts: { [key: string]: string } = {
    'Letter ANSI A Landscape': 'Letter Landscape',
    'Letter ANSI A Portrait': 'Letter Portrait',
    'Tabloid ANSI B Landscape': 'Tabloid Landscape',
    'Tabloid ANSI B Portrait': 'Tabloid Portrait',
  };

  @property()
  protected state: 'print' | 'snapshot' = 'print';

  render(): tsx.JSX.Element {
    const { id, state } = this;

    const tooltips = [0, 1, 2].map((num: number): string => {
      return `tooltip_${id}_${num}_${KEY++}`;
    });

    return (
      <calcite-panel heading={state === 'print' ? 'Print' : 'Snapshot'}>
        {/* header action switch between print and snapshot */}
        <calcite-tooltip-manager slot="header-actions-end">
          <calcite-action
            id={tooltips[0]}
            active={state === 'print'}
            icon="print"
            onclick={(): void => {
              this.state = 'print';
            }}
          ></calcite-action>
          <calcite-tooltip reference-element={tooltips[0]} overlay-positioning="fixed" placement="bottom">
            Print
          </calcite-tooltip>
        </calcite-tooltip-manager>
        <calcite-tooltip-manager slot="header-actions-end">
          <calcite-action
            id={tooltips[1]}
            active={state === 'snapshot'}
            icon="image"
            onclick={(): void => {
              this.state = 'snapshot';
            }}
          ></calcite-action>
          <calcite-tooltip reference-element={tooltips[1]} overlay-positioning="fixed" placement="bottom">
            Snapshot
          </calcite-tooltip>
        </calcite-tooltip-manager>
        {/* print */}
        <div hidden={state !== 'print'}>
          <div afterCreate={this._createPrint.bind(this)}></div>
        </div>
        {/* snapshot */}
        <div hidden={state !== 'snapshot'}>
          <div afterCreate={this._createSnapshot.bind(this)}></div>
        </div>
      </calcite-panel>
    );
  }

  /**
   * Create Print widget.
   * @param container
   */
  private _createPrint(container: HTMLDivElement): void {
    const { view, printServiceUrl, printTitle: title, layouts } = this;
    new Print({
      view,
      printServiceUrl,
      title,
      layouts,
      container,
    });
  }

  /**
   * Create Snapshot widget.
   * @param container
   */
  private _createSnapshot(container: HTMLDivElement): void {
    const { view, snapshotTitle: title } = this;
    new Snapshot({
      view,
      title,
      container,
    });
  }
}
