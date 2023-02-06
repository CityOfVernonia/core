//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import esri = __esri;

import type PhotoModal from './../modals/PhotoModal';

/**
 * Internal types.
 */
interface I {
  format: 'jpg' | 'png';
  mode: 'default' | 'print' | 'snapshot';
  result: {
    element: tsx.JSX.Element;
  };
  state: 'print' | 'snapshot';
}

import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const STYLE = {
  content: 'padding: var(--calcite-font-size--2);',
  resultButton: 'margin-top: var(--calcite-font-size--2);',
  snapshotResult: `width: 100%; margin-top: var(--calcite-font-size--2); display: flex; flex-flow: row; justify-content: flex-end; background-size: cover; background-repeat: no-repeat; background-position: center center; box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04); border-inline-start: 2px solid var(--calcite-ui-brand);`,
};

const TITLES = {
  print: 'Map Print',
  snapshot: 'Map Snapshot',
};

let KEY = 0;

/**
 * Print (via print service) and map view snapshot widget.
 */
@subclass('cov.widgets.PrintSnapshot')
export default class PrintSnapshot extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container!: HTMLCalcitePanelElement;

  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Key/value of layouts to include.
       * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
       */
      layouts?: { [key: string]: string };
      /**
       * Widget mode for just print or snapshot functionality.
       * @default 'default'
       */
      mode?: I['mode'];
      /**
       * URL of print service.
       */
      printServiceUrl?: string;
      /**
       * Map view to print and snapshot.
       */
      view: esri.MapView;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { mode, printServiceUrl, view } = this;

    if (mode === 'snapshot') this._state = 'snapshot';

    if (mode === 'default' || mode === 'snapshot') {
      this._photoModal = new (await import('./../modals/PhotoModal')).default();
    }

    if (mode === 'default' || mode === 'print') {
      this._printer = new (await import('@arcgis/core/widgets/Print/PrintViewModel')).default({
        printServiceUrl,
        view,
      });

      this._PrintTemplate = (await import('@arcgis/core/rest/support/PrintTemplate')).default;
    }
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  layouts: { [key: string]: string } = {
    'Letter ANSI A Landscape': 'Letter Landscape',
    'Letter ANSI A Portrait': 'Letter Portrait',
    'Tabloid ANSI B Landscape': 'Tabloid Landscape',
    'Tabloid ANSI B Portrait': 'Tabloid Portrait',
  };

  mode: I['mode'] = 'default';

  printServiceUrl =
    'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';

  view!: esri.MapView;

  //////////////////////////////////////
  // Display state
  //////////////////////////////////////
  @property()
  private _state: I['state'] = 'print';

  private _setState(state: I['state']): void {
    this._state = state;
  }

  //////////////////////////////////////
  // Print variables and methods
  //////////////////////////////////////
  private _printer!: esri.PrintViewModel;

  private _PrintTemplate!: esri.PrintTemplateConstructor;

  private _printResults: esri.Collection<I['result']> = new Collection();

  /**
   * Create a print.
   */
  private _print(): void {
    const { container, _printer, _PrintTemplate, _printResults } = this;

    const titleText =
      (container.querySelector('[data-print-snapshot="print title"]') as HTMLCalciteInputElement).value || TITLES.print;

    const layout = (container.querySelector('[data-print-snapshot="print layout"]') as HTMLCalciteSelectElement)
      .selectedOption.value;

    const result = {
      element: (
        <calcite-button key={KEY++} style={STYLE.resultButton} width="full" appearance="transparent" loading="">
          {titleText}
        </calcite-button>
      ),
    };

    _printResults.add(result);

    _printer
      .print(
        new _PrintTemplate({
          format: 'pdf',
          layout,
          layoutOptions: {
            titleText,
          },
        }),
      )
      .then((printResult: any): void => {
        result.element = (
          <calcite-button
            key={KEY++}
            style={STYLE.resultButton}
            width="full"
            appearance="transparent"
            icon-start="download"
            afterCreate={(button: HTMLCalciteButtonElement): void => {
              button.addEventListener('click', (): void => {
                window.open(printResult.url, '_blank');
              });
            }}
          >
            {titleText}
          </calcite-button>
        );
      })
      .catch((printError: esri.Error): void => {
        console.log(printError);
        result.element = (
          <calcite-button
            key={KEY++}
            style={STYLE.resultButton}
            width="full"
            color="red"
            disabled=""
            appearance="transparent"
            icon-start="exclamation-mark-triangle"
          >
            {titleText}
          </calcite-button>
        );
      })
      .then(this.scheduleRender.bind(this));
  }

  //////////////////////////////////////
  // Snapshot variables and methods
  //////////////////////////////////////
  private _snapshotResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _photoModal!: PhotoModal;

  /**
   * Create a snapshot.
   */
  private async _snapshot(): Promise<void> {
    const { container, view, _snapshotResults, _photoModal } = this;

    const title =
      (container.querySelector('[data-print-snapshot="snapshot title"]') as HTMLCalciteInputElement).value ||
      TITLES.print;

    const format = (
      container.querySelector('[data-print-snapshot="snapshot format"]') as HTMLCalciteSegmentedControlElement
    ).value as I['format'];

    const fileName = `${title}.${format}`;

    const data = (
      await view.takeScreenshot({
        format,
      })
    ).data;

    const dataUrl = this._dataUrl(data, title, format);

    _snapshotResults.add(
      <div key={KEY++} style={this.classes(STYLE.snapshotResult, `background-image: url(${dataUrl});`)}>
        <calcite-action
          icon="image"
          text="View"
          onclick={_photoModal.show.bind(_photoModal, fileName, dataUrl)}
        ></calcite-action>
        <calcite-action
          icon="download"
          text="Download"
          onclick={_photoModal.download.bind(_photoModal, fileName, dataUrl)}
        ></calcite-action>
      </div>,
    );
  }

  /**
   * Add title to image and return data url.
   * @param data Image data to be returned as data url string
   * @param title Title of the image
   * @param format Format of the image
   * @returns Data url string
   */
  private _dataUrl(data: ImageData, title: string, format: I['format']): string {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = data.width;
    canvas.height = data.height;
    context.putImageData(data, 0, 0);
    context.font = 'bold 20px Arial';
    context.strokeStyle = '#fff';
    context.strokeText(`${title}`, 5, data.height - 5, data.width - 5);
    context.font = 'bold 20px Arial';
    context.fillStyle = '#000';
    context.fillText(`${title}`, 5, data.height - 5, data.width - 5);
    return canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png') as string;
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { mode, _state, _printResults, _snapshotResults } = this;
    return (
      <calcite-panel heading={_state === 'print' ? 'Print' : 'Snapshot'}>
        {mode === 'default'
          ? [
              <calcite-action
                active={_state === 'print'}
                icon="print"
                slot="header-actions-end"
                text="Print"
                onclick={this._setState.bind(this, 'print')}
              >
                <calcite-tooltip close-on-click="" label="Print" placement="bottom" slot="tooltip">
                  Print
                </calcite-tooltip>
              </calcite-action>,
              <calcite-action
                active={_state === 'snapshot'}
                icon="image"
                slot="header-actions-end"
                text="Snapshot"
                onclick={this._setState.bind(this, 'snapshot')}
              >
                <calcite-tooltip close-on-click="" label="Snapshot" placement="bottom" slot="tooltip">
                  Snapshot
                </calcite-tooltip>
              </calcite-action>,
            ]
          : null}

        {mode !== 'snapshot' ? (
          <div hidden={_state !== 'print'} style={STYLE.content}>
            <calcite-label>
              Title
              <calcite-input data-print-snapshot="print title" type="text" value={TITLES.print}></calcite-input>
            </calcite-label>
            <calcite-label>
              Layout
              <calcite-select data-print-snapshot="print layout">{this._renderLayoutOptions()}</calcite-select>
            </calcite-label>
            <calcite-button width="full" onclick={this._print.bind(this)}>
              Print
            </calcite-button>
            {_printResults
              .map((result: I['result']): tsx.JSX.Element => {
                return result.element;
              })
              .toArray()}
          </div>
        ) : null}

        {mode !== 'print' ? (
          <div hidden={_state !== 'snapshot'} style={STYLE.content}>
            <calcite-label>
              Title
              <calcite-input data-print-snapshot="snapshot title" type="text" value={TITLES.snapshot}></calcite-input>
            </calcite-label>
            <calcite-label>
              Format
              <calcite-segmented-control data-print-snapshot="snapshot format">
                <calcite-segmented-control-item value="jpg" checked="">
                  JPG
                </calcite-segmented-control-item>
                <calcite-segmented-control-item value="png">PNG</calcite-segmented-control-item>
              </calcite-segmented-control>
            </calcite-label>
            <calcite-button width="full" onclick={this._snapshot.bind(this)}>
              Snapshot
            </calcite-button>
            {_snapshotResults.toArray()}
          </div>
        ) : null}
      </calcite-panel>
    );
  }

  /**
   * Create options for print layout select.
   * @returns Array of tsx elements
   */
  private _renderLayoutOptions(): tsx.JSX.Element[] {
    const { layouts } = this;
    const options = [];
    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }
    return options;
  }
}
