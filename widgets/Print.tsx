/**
 * Print and snapshot widget.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

// class imports
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

// styles
import './Print.scss';
const CSS = {
  base: 'cov-tabbed-widget cov-tabbed-widget--scrolling',
  printResult: 'cov-print--print-result',
  snapshotResult: 'cov-print--snapshot-result',
  snapshotDownloadButton: 'cov-print--snapshot-download-button',
  snapshotArea: 'cov-print--snapshot-area',
};

// unique keys
let KEY = 0;

// class export
@subclass('cov.widgets.Print')
export default class Print extends Widget {
  @property({
    aliasOf: 'printer.view',
  })
  view!: esri.MapView;

  @property({
    aliasOf: 'printer.printServiceUrl',
  })
  printServiceUrl!: string;

  @property()
  title = 'Map Print';

  @property()
  layouts: HashMap<string> = {
    'Letter ANSI A Landscape': 'Letter Landscape',
    'Letter ANSI A Portrait': 'Letter Portrait',
    'Tabloid ANSI B Landscape': 'Tabloid Landscape',
    'Tabloid ANSI B Portrait': 'Tabloid Portrait',
  };

  @property()
  printer = new PrintViewModel();

  @property()
  private _printTitleInput!: HTMLCalciteInputElement;

  @property()
  private _printLayoutSelect!: HTMLCalciteSelectElement;

  @property()
  private _printResults: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  @property()
  private _snapshotTitleInput!: HTMLCalciteInputElement;

  @property()
  private _snapshotFormatRadioGroup!: HTMLCalciteRadioGroupElement;

  @property()
  private _snapshotElement = document.createElement('div');

  @property()
  private _snapshotResults: Collection<tsx.JSX.Element> = new Collection();

  constructor(properties: cov.PrintProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { _snapshotElement } = this;
    document.body.append(_snapshotElement);
    _snapshotElement.classList.add(CSS.snapshotArea);
  }

  /**
   * Initiate print task and handle results.
   */
  private _print(): void {
    const { title, printer, _printTitleInput, _printLayoutSelect, _printResults } = this;
    const titleText = _printTitleInput.value || title;
    const layout = _printLayoutSelect.selectedOption.value;

    const result = {
      element: (
        <div key={KEY++} class={CSS.printResult}>
          <calcite-button width="full" appearance="outline" loading="">
            {titleText}
          </calcite-button>
        </div>
      ),
    };

    _printResults.add(result);

    printer
      .print(
        new PrintTemplate({
          format: 'pdf',
          layout,
          layoutOptions: {
            titleText,
          },
        }),
      )
      .then((printResult: any): void => {
        result.element = (
          <div key={KEY++} class={CSS.printResult}>
            <calcite-button
              width="full"
              appearance="outline"
              icon-start="download"
              onclick={(): void => {
                window.open(printResult.url, '_blank');
              }}
            >
              {titleText}
            </calcite-button>
          </div>
        );
      })
      .catch((printError: any): void => {
        console.log(printError);
        result.element = (
          <div key={KEY++} class={CSS.printResult}>
            <calcite-button
              width="full"
              color="red"
              disabled=""
              appearance="outline"
              icon-start="exclamation-mark-triangle"
            >
              {titleText}
            </calcite-button>
          </div>
        );
      })
      .then(this.scheduleRender.bind(this));
  }

  /**
   * Initiate full view snapshot.
   */
  private _snapshot(): void {
    const { view, _snapshotFormatRadioGroup } = this;
    const format = _snapshotFormatRadioGroup.selectedItem.value;
    view
      .takeScreenshot({
        format,
      })
      .then(this._snapshotCallback.bind(this));
  }

  /**
   * Initiate area snapshot.
   */
  private _snapshotArea(): void {
    const { view, _snapshotFormatRadioGroup, _snapshotElement } = this;
    const format = _snapshotFormatRadioGroup.selectedItem.value;

    const clamp = (value: number, from: number, to: number): number => {
      return value < from ? from : value > to ? to : value;
    };

    const mask = (maskArea: esri.MapViewTakeScreenshotOptionsArea | null): void => {
      if (maskArea) {
        _snapshotElement.style.display = 'block';
        _snapshotElement.style.left = maskArea.x + 'px';
        _snapshotElement.style.top = maskArea.y + 'px';
        _snapshotElement.style.width = maskArea.width + 'px';
        _snapshotElement.style.height = maskArea.height + 'px';
      } else {
        _snapshotElement.style.display = 'none';
      }
    };

    let area: esri.MapViewTakeScreenshotOptionsArea | null = null;

    view.container.style.cursor = 'crosshair';

    const handle = this.view.on('drag', (evt: any) => {
      evt.stopPropagation();

      if (evt.action !== 'end') {
        const xmin = clamp(Math.min(evt.origin.x, evt.x), 0, view.width);
        const xmax = clamp(Math.max(evt.origin.x, evt.x), 0, view.width);
        const ymin = clamp(Math.min(evt.origin.y, evt.y), 0, view.height);
        const ymax = clamp(Math.max(evt.origin.y, evt.y), 0, view.height);

        area = {
          x: xmin,
          y: ymin,
          width: xmax - xmin,
          height: ymax - ymin,
        };

        mask(area);
      } else {
        handle.remove();

        mask(null);

        view.container.style.cursor = 'default';

        view
          .takeScreenshot({
            format,
            area: area as esri.MapViewTakeScreenshotOptionsArea,
          })
          .then(this._snapshotCallback.bind(this));
      }
    });
  }

  /**
   * Handle snapshot results.
   * @param screenshotResult
   */
  private _snapshotCallback(screenshotResult: esri.Screenshot): void {
    const { title, _snapshotTitleInput, _snapshotFormatRadioGroup, _snapshotResults } = this;
    const titleText = _snapshotTitleInput.value || title;
    const format = _snapshotFormatRadioGroup.selectedItem.value;

    const data = screenshotResult.data;

    // canvas and context
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = data.width;
    canvas.height = data.height;

    // add image
    context.putImageData(data, 0, 0);

    // add text
    context.font = 'bold 14px Arial';
    context.strokeStyle = '#fff';
    context.strokeText(`${titleText}`, 5, data.height - 5, data.width - 5);
    context.font = 'bold 14px Arial';
    context.fillStyle = '#000';
    context.fillText(`${titleText}`, 5, data.height - 5, data.width - 5);

    // new image
    const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png') as string;

    // add to results
    _snapshotResults.add(
      <div key={KEY++} class={CSS.snapshotResult} style={`background-image: url(${dataUrl})`}>
        <calcite-action
          class={CSS.snapshotDownloadButton}
          icon="download"
          scale="s"
          onclick={this._download.bind(this, dataUrl, titleText)}
        ></calcite-action>
      </div>,
    );
  }

  /**
   * Download image.
   * @param dataUrl
   * @param titleText
   */
  private _download(dataUrl: string, titleText: string): void {
    const a = document.createElement('a');
    a.setAttribute('href', dataUrl);
    a.setAttribute('download', titleText);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render(): tsx.JSX.Element {
    const { _printResults, _snapshotResults } = this;
    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Print</calcite-tab-title>
            <calcite-tab-title>Snapshot</calcite-tab-title>
          </calcite-tab-nav>

          {/* print tab */}
          <calcite-tab active="">
            <calcite-label>
              Title
              <calcite-input
                type="text"
                bind={this}
                afterCreate={storeNode}
                data-node-ref="_printTitleInput"
              ></calcite-input>
            </calcite-label>
            <calcite-label>
              Layout
              <calcite-select bind={this} afterCreate={storeNode} data-node-ref="_printLayoutSelect">
                {this._renderLayoutSelects()}
              </calcite-select>
            </calcite-label>
            <calcite-button width="full" icon-start="print" onclick={this._print.bind(this)}>
              Print
            </calcite-button>
            {_printResults.toArray().map((result: { element: tsx.JSX.Element }): tsx.JSX.Element => {
              return result.element;
            })}
          </calcite-tab>

          {/* snapshot tab */}
          <calcite-tab>
            <calcite-label>
              Title
              <calcite-input
                type="text"
                bind={this}
                afterCreate={storeNode}
                data-node-ref="_snapshotTitleInput"
              ></calcite-input>
            </calcite-label>
            <calcite-label>
              Format
              <calcite-radio-group bind={this} afterCreate={storeNode} data-node-ref="_snapshotFormatRadioGroup">
                <calcite-radio-group-item value="jpg" checked="">
                  JPEG
                </calcite-radio-group-item>
                <calcite-radio-group-item value="png">PNG</calcite-radio-group-item>
              </calcite-radio-group>
            </calcite-label>
            <calcite-button
              appearance="outline"
              width="half"
              icon-start="image-plus"
              onclick={this._snapshotArea.bind(this)}
            >
              Area
            </calcite-button>
            <calcite-button width="half" icon-start="image" onclick={this._snapshot.bind(this)}>
              Full
            </calcite-button>
            {_snapshotResults.toArray()}
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }

  /**
   * Render layout selects.
   */
  private _renderLayoutSelects(): tsx.JSX.Element[] {
    const { layouts } = this;
    const options = [];

    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }

    return options;
  }
}
