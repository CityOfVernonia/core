import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

@subclass('cov.components.actions.Print')
export default class Print extends Widget {
  container!: HTMLCalciteActionElement;

  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Print file name.
       * @default 'map_print'
       */
      printFileName?: string;
      /**
       * Print file format.
       * @default 'pdf'
       */
      printFormat?: 'png8' | 'png32' | 'jpg' | 'pdf' | 'gif' | 'svg' | 'svgz' | 'eps';
      /**
       * Print layout.
       * @default 'letter-ansi-a-landscape'
       */
      printLayout?:
        | 'letter-ansi-a-landscape'
        | 'map-only'
        | 'a3-landscape'
        | 'a3-portrait'
        | 'a4-landscape'
        | 'a4-portrait'
        | 'letter-ansi-a-portrait'
        | 'tabloid-ansi-b-landscape'
        | 'tabloid-ansi-b-portrait';
      /**
       * URL of print service.
       */
      printServiceUrl: string;
      /**
       * Print title.
       * @default 'Map Print'
       */
      printTitle?: string;
      /**
       * Map view to print.
       */
      view: esri.MapView;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { printServiceUrl, view, _reader } = this;

    this._printViewModel = new PrintViewModel({ printServiceUrl, view });

    _reader.onload = this._readerOnload.bind(this);
    _reader.onerror = this._error.bind(this);
  }

  printFileName = 'map_print';

  printFormat: 'png8' | 'png32' | 'jpg' | 'pdf' | 'gif' | 'svg' | 'svgz' | 'eps' = 'pdf';

  printLayout:
    | 'letter-ansi-a-landscape'
    | 'map-only'
    | 'a3-landscape'
    | 'a3-portrait'
    | 'a4-landscape'
    | 'a4-portrait'
    | 'letter-ansi-a-portrait'
    | 'tabloid-ansi-b-landscape'
    | 'tabloid-ansi-b-portrait' = 'letter-ansi-a-landscape';

  printServiceUrl!: string;

  printTitle = 'Map Print';

  view!: esri.MapView;

  private _printViewModel!: esri.PrintViewModel;

  @property()
  private _printing = false;

  private _reader = new FileReader();
  // @ts-expect-error generic error
  private _error(error): void {
    console.log(error);
    this._printing = false;
  }

  private async _print(): Promise<void> {
    const { container, printFormat, printLayout, printTitle, _printing, _printViewModel, _reader } = this;

    if (_printing) {
      return;
    } else {
      this._printing = true;
    }

    container.loading = true;

    let url: string | undefined;
    let blob: Blob | undefined;

    try {
      url = (
        await _printViewModel.print(
          new PrintTemplate({
            format: printFormat,
            layout: printLayout,
            layoutOptions: {
              titleText: printTitle,
            },
          }),
        )
      ).url;
    } catch (error) {
      this._error(error);
    }

    if (!url) return;

    try {
      blob = await (await fetch(url)).blob();
    } catch (error) {
      this._error(error);
    }

    if (!blob) return;

    _reader.readAsDataURL(blob);
  }

  private _readerOnload(): void {
    const {
      printFileName,
      printFormat,
      _reader: { result },
    } = this;

    const a = Object.assign(document.createElement('a'), {
      href: result,
      download: `${printFileName}.${printFormat}`,
      style: {
        display: 'none',
      },
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render(): tsx.JSX.Element {
    const { _printing } = this;

    const text = _printing ? 'Printing' : 'Print';

    return (
      <calcite-action icon="print" loading={_printing} text={text} onclick={this._print.bind(this)}>
        <calcite-tooltip slot="tooltip">{text}</calcite-tooltip>
      </calcite-action>
    );
  }
}
