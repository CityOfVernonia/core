/**
 * Print and snapshot widget.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

// class imports
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

// styles
import './Print.scss';
const CSS = {
  base: 'cov-print cov-tabbed-widget cov-tabbed-widget--scrolling',
  printResult: 'cov-print--print-result',
  buttonRow: 'cov-print--button-row',
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
  theme = 'light';

  @property()
  scale = 'm';

  @property()
  printer = new PrintViewModel();

  @property()
  private _printTitleInput!: tsx.JSX.Element;

  @property()
  private _printLayoutSelect!: tsx.JSX.Element;

  @property()
  private _printResults: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  @property()
  private _snapshotTitleInput!: tsx.JSX.Element;

  @property()
  private _snapshotFormat: 'jpg' | 'png' = 'jpg';

  @property()
  private _snapshotElement = document.createElement('div');

  @property()
  private _snapshotResults: Collection<tsx.JSX.Element> = new Collection();

  constructor(properties: cov.PrintProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { theme, scale, _snapshotElement } = this;
    this._printTitleInput = (
      <calcite-input type="text" theme={theme} scale={scale} placeholder="Title (optional)"></calcite-input>
    );
    this._renderLayoutSelects();
    this._snapshotTitleInput = (
      <calcite-input type="text" theme={theme} scale={scale} placeholder="Title (optional)"></calcite-input>
    );
    document.body.append(_snapshotElement);
    _snapshotElement.classList.add(CSS.snapshotArea);
  }

  /**
   * Initiate print task and handle results.
   */
  private _print(): void {
    const { theme, scale, title, printer, _printTitleInput, _printLayoutSelect, _printResults } = this;

    //@ts-ignore
    const titleText = (_printTitleInput.domNode as HTMLCalciteInputElement).value || title;
    //@ts-ignore
    const layout = (_printLayoutSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;

    const result = {
      element: (
        <div key={KEY++} class={CSS.printResult}>
          <calcite-button theme={theme} scale={scale} width="full" appearance="outline" loading="">
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
              theme={theme}
              scale={scale}
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
              theme={theme}
              scale={scale}
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
    const { view, _snapshotFormat } = this;
    view
      .takeScreenshot({
        format: _snapshotFormat,
      })
      .then(this._snapshotCallback.bind(this));
  }

  /**
   * Initiate area snapshot.
   */
  private _snapshotArea(): void {
    const { view, _snapshotFormat, _snapshotElement } = this;

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
            format: _snapshotFormat,
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
    const { theme, title, _snapshotTitleInput, _snapshotFormat, _snapshotResults } = this;

    // @ts-ignore
    const titleText = (_snapshotTitleInput.domNode as HTMLCalciteInputElement).value || title;

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
    const dataUrl = canvas.toDataURL(_snapshotFormat === 'jpg' ? 'image/jpeg' : 'image/png') as string;

    // add to results
    _snapshotResults.add(
      <div key={KEY++} class={CSS.snapshotResult} style={`background-image: url(${dataUrl})`}>
        <calcite-action
          class={CSS.snapshotDownloadButton}
          icon="download"
          scale="s"
          theme={theme}
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
    const { theme, scale, _printTitleInput, _printLayoutSelect, _printResults, _snapshotTitleInput, _snapshotResults } =
      this;
    return (
      <div class={CSS.base}>
        <calcite-tabs theme={theme} scale={scale} layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Print</calcite-tab-title>
            <calcite-tab-title>Snapshot</calcite-tab-title>
          </calcite-tab-nav>

          {/* print tab */}
          <calcite-tab active="">
            <calcite-label theme={theme} scale={scale}>
              Title
              {_printTitleInput}
            </calcite-label>
            <calcite-label theme={theme} scale={scale}>
              Layout
              {_printLayoutSelect}
            </calcite-label>
            <calcite-button theme={theme} scale={scale} width="full" onclick={this._print.bind(this)}>
              Print
            </calcite-button>
            {_printResults.toArray().map((result: { element: tsx.JSX.Element }): tsx.JSX.Element => {
              return result.element;
            })}
          </calcite-tab>

          {/* snapshot tab */}
          <calcite-tab>
            <calcite-label theme={theme} scale={scale}>
              Title
              {_snapshotTitleInput}
            </calcite-label>
            <calcite-label theme={theme} scale={scale}>
              Format
              <calcite-radio-button-group layout="horizontal">
                <calcite-label theme={theme} scale={scale} layout="inline">
                  <calcite-radio-button
                    checked=""
                    onclick={() => {
                      this._snapshotFormat = 'jpg';
                    }}
                  ></calcite-radio-button>
                  JPG
                </calcite-label>
                <calcite-label theme={theme} scale={scale} layout="inline">
                  <calcite-radio-button
                    onclick={() => {
                      this._snapshotFormat = 'png';
                    }}
                  ></calcite-radio-button>
                  PNG
                </calcite-label>
              </calcite-radio-button-group>
            </calcite-label>
            <div class={CSS.buttonRow}>
              <calcite-button theme={theme} scale={scale} width="full" onclick={this._snapshot.bind(this)}>
                Full
              </calcite-button>
              <calcite-button theme={theme} scale={scale} width="full" onclick={this._snapshotArea.bind(this)}>
                Area
              </calcite-button>
            </div>
            {_snapshotResults.toArray()}
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }

  /**
   * Render layout selects.
   */
  private _renderLayoutSelects(): void {
    const { theme, scale, layouts } = this;
    const options = [];

    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }

    this._printLayoutSelect = (
      <calcite-select theme={theme} scale={scale}>
        {options}
      </calcite-select>
    );
  }
}
