import esri = __esri;

interface I {
  format: 'jpg' | 'png';
}

/**
 * PrintSnapshot properties.
 */
export interface PrintSnapshotProperties extends esri.WidgetProperties {
  /**
   * Key/value of layouts to include.
   * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
   */
  layouts?: { [key: string]: string };
  /**
   * URL of print service.
   */
  printServiceUrl?: string;
  /**
   * Map view to print and snapshot.
   */
  view: esri.MapView;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
// import PrintParameters from '@arcgis/core/rest/support/PrintParameters';
// import PortalItem from '@arcgis/core/portal/PortalItem';
import PhotoDialog from './PhotoDialog';

const CSS_BASE = 'cov--print-snapshot';

const CSS = {
  base: CSS_BASE,
  footer: `${CSS_BASE}_footer`,
  snapshotResult: `${CSS_BASE}_snapshot-result`,
};

const TITLES = {
  print: 'Map Print',
  snapshot: 'Map Snapshot',
};

let KEY = 0;

/**
 * Print PDFs and snapshot a map.
 */
@subclass('cov.components.PrintSnapshot')
export default class PrintSnapshot extends Widget {
  private _container!: HTMLCalcitePanelElement;

  public get container(): HTMLCalcitePanelElement {
    return this._container;
  }

  public set container(value: HTMLCalcitePanelElement) {
    this._container = value;
  }

  constructor(properties: PrintSnapshotProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { printServiceUrl, view } = this;
    this._printer = new PrintViewModel({
      printServiceUrl,
      view,
    });
  }

  layouts: { [key: string]: string } = {
    'Letter ANSI A Landscape': 'Letter Landscape',
    'Letter ANSI A Portrait': 'Letter Portrait',
    'Tabloid ANSI B Landscape': 'Tabloid Landscape',
    'Tabloid ANSI B Portrait': 'Tabloid Portrait',
  };

  printServiceUrl =
    'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';

  view!: esri.MapView;

  private _photoDialog = new PhotoDialog();

  private _printer!: esri.PrintViewModel;

  private _printResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _snapshotResults: esri.Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _viewState: 'print' | 'snapshot' = 'print';

  /**
   * Add title to image and return data url.
   * @param data ImageData to be returned as data url string
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

  private _print(): void {
    const { container, _printer, _printResults } = this;

    const titleText =
      (container.querySelector('[data-print-snapshot="print title"]') as HTMLCalciteInputElement).value || TITLES.print;

    const layout = (container.querySelector('[data-print-snapshot="print layout"]') as HTMLCalciteSelectElement)
      .selectedOption.value;

    _printResults.add(
      <calcite-button
        key={KEY++}
        appearance="outline-fill"
        disabled
        loading
        width="full"
        afterCreate={async (button: HTMLCalciteButtonElement): Promise<void> => {
          try {
            const result = await _printer.print(
              new PrintTemplate({
                format: 'pdf',
                layout,
                layoutOptions: {
                  titleText,
                  scalebarUnit: 'Feet',
                },
                // outScale: 432,
              }),
            );
            button.disabled = false;
            button.loading = false;
            button.addEventListener('click', (): void => {
              window.open(result.url, '_blank');
            });
          } catch (error) {
            console.log(error);
            button.loading = false;
            button.kind = 'danger';
            button.iconStart = 'exclamation-mark-triangle';
          }
        }}
      >
        {titleText}
      </calcite-button>,
    );
  }

  private async _snapshot(): Promise<void> {
    const { container, view, _snapshotResults, _photoDialog } = this;

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
      <div key={KEY++} class={CSS.snapshotResult} style={`background-image: url(${dataUrl});`}>
        <calcite-action
          icon="image"
          text="View"
          onclick={_photoDialog.show.bind(_photoDialog, fileName, dataUrl)}
        ></calcite-action>
        <calcite-action
          icon="download"
          text="Download"
          onclick={_photoDialog.download.bind(_photoDialog, fileName, dataUrl)}
        ></calcite-action>
      </div>,
    );
  }

  override render(): tsx.JSX.Element {
    const { _printResults, _snapshotResults, _viewState } = this;
    return (
      <calcite-panel class={CSS.base} heading={_viewState === 'print' ? 'Print' : 'Snapshot'}>
        {/* header actions */}
        <calcite-action
          active={_viewState === 'print'}
          icon="print"
          slot="header-actions-end"
          text="Print"
          onclick={(): void => {
            this._viewState = 'print';
          }}
        >
          <calcite-tooltip close-on-click="" label="Print" placement="bottom" slot="tooltip">
            Print
          </calcite-tooltip>
        </calcite-action>
        <calcite-action
          active={_viewState === 'snapshot'}
          icon="image"
          slot="header-actions-end"
          text="Snapshot"
          onclick={(): void => {
            this._viewState = 'snapshot';
          }}
        >
          <calcite-tooltip close-on-click="" label="Snapshot" placement="bottom" slot="tooltip">
            Snapshot
          </calcite-tooltip>
        </calcite-action>

        {/* print */}
        <div hidden={_viewState !== 'print'}>
          <calcite-label>
            Title
            <calcite-input data-print-snapshot="print title" type="text" value={TITLES.print}></calcite-input>
          </calcite-label>
          <calcite-label style="--calcite-label-margin-bottom:0;">
            Layout
            <calcite-select data-print-snapshot="print layout">{this._renderLayoutOptions()}</calcite-select>
          </calcite-label>
        </div>
        <div class={CSS.footer} hidden={_viewState !== 'print'} slot={_viewState === 'print' ? 'footer' : null}>
          <calcite-button width="full" onclick={this._print.bind(this)}>
            Print
          </calcite-button>
          {_printResults.toArray()}
        </div>

        {/* snapshot */}
        <div hidden={_viewState !== 'snapshot'}>
          <calcite-label>
            Title
            <calcite-input data-print-snapshot="snapshot title" type="text" value={TITLES.snapshot}></calcite-input>
          </calcite-label>
          <calcite-label style="--calcite-label-margin-bottom:0;">
            Format
            <calcite-segmented-control data-print-snapshot="snapshot format">
              <calcite-segmented-control-item value="jpg" checked>
                JPG
              </calcite-segmented-control-item>
              <calcite-segmented-control-item value="png">PNG</calcite-segmented-control-item>
            </calcite-segmented-control>
          </calcite-label>
        </div>

        <div class={CSS.footer} hidden={_viewState !== 'snapshot'} slot={_viewState === 'snapshot' ? 'footer' : null}>
          <calcite-button width="full" onclick={this._snapshot.bind(this)}>
            Snapshot
          </calcite-button>
          {_snapshotResults.toArray()}
        </div>
      </calcite-panel>
    );
  }

  private _renderLayoutOptions(): tsx.JSX.Element[] {
    const { layouts } = this;
    const options = [];
    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }
    return options;
  }
}
