import esri = __esri;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

let KEY = 0;

@subclass('Print')
export default class Print extends Widget {
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
      title?: string;
      /**
       * Key/value of layouts to include.
       * `<LAYOUT_NAME>: <SELECT_OPTION_LABEL>`
       */
      layouts?: { [key: string]: string };
    },
  ) {
    super(properties);
  }

  printer = new PrintViewModel();

  @property({
    aliasOf: 'printer.view',
  })
  view!: esri.MapView;

  @property({
    aliasOf: 'printer.printServiceUrl',
  })
  printServiceUrl!: string;

  title = 'Map Print';

  layouts: { [key: string]: string } = {
    'Letter ANSI A Landscape': 'Letter Landscape',
    'Letter ANSI A Portrait': 'Letter Portrait',
    'Tabloid ANSI B Landscape': 'Tabloid Landscape',
    'Tabloid ANSI B Portrait': 'Tabloid Portrait',
  };

  private _print(): void {
    const { title, printer, _title, _layout, _printResults } = this;
    const titleText = _title || title;
    const layout = _layout.selectedOption.value;

    const result = {
      element: (
        <calcite-button key={KEY++} style="margin-top: 0.75rem;" width="full" appearance="transparent" loading="">
          {titleText}
        </calcite-button>
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
          <calcite-button
            key={KEY++}
            style="margin-top: 0.75rem;"
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
            style="margin-top: 0.75rem;"
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

  render(): tsx.JSX.Element {
    const { _printResults } = this;

    const results = _printResults
      .map((result: { element: tsx.JSX.Element }): tsx.JSX.Element => {
        return result.element;
      })
      .toArray();

    return (
      <calcite-panel heading="Print">
        <div style="padding: 0.75rem;">
          <calcite-label>
            Title
            <calcite-input
              type="text"
              afterCreate={(input: HTMLCalciteInputElement): void => {
                input.value = this.title;
                input.addEventListener('calciteInputInput', (): void => {
                  this._title = input.value;
                });
              }}
            ></calcite-input>
          </calcite-label>
          <calcite-label>
            Layout
            <calcite-select
              afterCreate={(select: HTMLCalciteSelectElement): void => {
                this._layout = select;
              }}
            >
              {this._renderLayoutSelects()}
            </calcite-select>
          </calcite-label>
          <calcite-button
            style="margin-top: 0.5rem;"
            width="full"
            afterCreate={(button: HTMLCalciteButtonElement): void => {
              button.addEventListener('click', this._print.bind(this));
            }}
          >
            Print
          </calcite-button>
          {results}
        </div>
      </calcite-panel>
    );
  }

  private _printResults: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  private _title = 'Map Print';

  private _layout!: HTMLCalciteSelectElement;

  private _renderLayoutSelects(): tsx.JSX.Element[] {
    const { layouts } = this;
    const options = [];

    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }

    return options;
  }
}
