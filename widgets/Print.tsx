/**
 * Simple print widget with title, layout and format.
 */

// namespaces and types
import esri = __esri;

// constructor properties
export interface PrintProperties extends esri.WidgetProperties {
  /**
   * Map or scene view.
   */
  view: esri.MapView;
  /**
   * URL of REST Export Web Map Task.
   */
  printServiceUrl: string;
  /**
   * Default print title.
   * @default 'Map Print'
   */
  title?: string;
}

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

// class imports
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

// styles
import './Print/styles/Print.scss';
const CSS = {
  base: 'cov-print',
  result: 'cov-print--result',
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
  printer = new PrintViewModel();

  @property()
  private _titleInput = (<calcite-input scale="s" type="text" placeholder="Title"></calcite-input>);

  @property()
  private _layoutSelect!: tsx.JSX.Element;

  @property()
  private _formatSelect!: tsx.JSX.Element;

  @property()
  private _results: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  constructor(properties: PrintProperties) {
    super(properties);
    const { printer } = this;
    printer.load().then(this._renderSelects.bind(this)).catch();
  }

  /**
   * Initiate print task and handle results.
   */
  private _print(): void {
    const { title, printer, _titleInput, _layoutSelect, _formatSelect, _results } = this;

    //@ts-ignore
    const titleText = (_titleInput.domNode as HTMLCalciteInputElement).value || title;
    //@ts-ignore
    const format = (_formatSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;
    //@ts-ignore
    const layout = (_layoutSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;

    const result = {
      element: (
        <div key={KEY++} class={CSS.result}>
          <calcite-button scale="s" round="" appearance="outline" loading="">
            {titleText}
          </calcite-button>
        </div>
      ),
    };

    _results.add(result);

    printer
      .print(
        new PrintTemplate({
          format,
          layout,
          layoutOptions: {
            titleText,
          },
        }),
      )
      .then((printResult: any): void => {
        result.element = (
          <div key={KEY++} class={CSS.result}>
            <calcite-button
              scale="s"
              round=""
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
          <div key={KEY++} class={CSS.result}>
            <calcite-button
              scale="s"
              round=""
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

  render(): tsx.JSX.Element {
    const { _titleInput, _layoutSelect, _formatSelect, _results } = this;
    return (
      <div class={CSS.base}>
        <calcite-label scale="s">
          Title
          {_titleInput}
        </calcite-label>
        <calcite-label scale="s">
          Layout
          {_layoutSelect}
        </calcite-label>
        <calcite-label scale="s">
          Format
          {_formatSelect}
        </calcite-label>
        <calcite-button scale="s" width="full" onclick={this._print.bind(this)}>
          Print
        </calcite-button>
        <div>
          {_results.toArray().map((result: { element: tsx.JSX.Element }): tsx.JSX.Element => {
            return result.element;
          })}
        </div>
      </div>
    );
  }

  /**
   * Render layout and format selects from print service info.
   */
  private _renderSelects(printer: PrintViewModel): void {
    const {
      defaultTemplates,
      templatesInfo: { format, layout },
    } = printer;

    this._layoutSelect = (
      <calcite-select scale="s">
        {layout.choiceList.map((choice: 'string') => {
          const dt = defaultTemplates.find((item: esri.CustomTemplate) => {
            return (item.layout as any) === choice;
          });
          return (
            <calcite-option label={dt.label} value={choice} selected={layout.defaultValue === choice}></calcite-option>
          );
        })}
      </calcite-select>
    );

    this._formatSelect = (
      <calcite-select scale="s">
        {format.choiceList.map((choice: 'string') => {
          return (
            <calcite-option
              label={choice.toUpperCase()}
              value={choice}
              selected={format.defaultValue === choice}
            ></calcite-option>
          );
        })}
      </calcite-select>
    );
  }
}
