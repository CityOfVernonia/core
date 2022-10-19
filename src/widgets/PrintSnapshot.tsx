import esri = __esri;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Print from './Print';
import Snapshot from './Snapshot';

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
    const { state } = this;

    return (
      <calcite-panel heading={state === 'print' ? 'Print' : 'Snapshot'}>
        {/* header action switch between print and snapshot */}
        <calcite-action
          slot="header-actions-end"
          active={state === 'print'}
          icon="print"
          onclick={(): void => {
            this.state = 'print';
          }}
        >
          <calcite-tooltip placement="bottom" slot="tooltip">
            Print
          </calcite-tooltip>
        </calcite-action>
        <calcite-action
          slot="header-actions-end"
          active={state === 'snapshot'}
          icon="image"
          onclick={(): void => {
            this.state = 'snapshot';
          }}
        >
          <calcite-tooltip placement="bottom" slot="tooltip">
            Snapshot
          </calcite-tooltip>
        </calcite-action>
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
