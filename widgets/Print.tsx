/**
 * Super stupid simple print widget.
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
  private _titleInput!: tsx.JSX.Element;

  @property()
  private _layoutSelect!: tsx.JSX.Element;

  @property()
  private _results: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  constructor(properties: cov.PrintProperties) {
    super(properties);
  }

  postInitialize(): void {
    const { theme, scale } = this;
    this._titleInput = (
      <calcite-input type="text" theme={theme} scale={scale} placeholder="Title (optional)"></calcite-input>
    );
    this._renderLayoutSelects();
  }

  /**
   * Initiate print task and handle results.
   */
  private _print(): void {
    const { theme, scale, title, printer, _titleInput, _layoutSelect, _results } = this;

    //@ts-ignore
    const titleText = (_titleInput.domNode as HTMLCalciteInputElement).value || title;
    //@ts-ignore
    const layout = (_layoutSelect.domNode as HTMLCalciteSelectElement).selectedOption.value as any;

    const result = {
      element: (
        <div key={KEY++} class={CSS.result}>
          <calcite-button theme={theme} scale={scale} round="" appearance="transparent" loading="">
            {titleText}
          </calcite-button>
        </div>
      ),
    };

    _results.add(result);

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
          <div key={KEY++} class={CSS.result}>
            <calcite-button
              theme={theme}
              scale={scale}
              round=""
              appearance="transparent"
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
              theme={theme}
              scale={scale}
              round=""
              color="red"
              disabled=""
              appearance="transparent"
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
    const { theme, scale, _titleInput, _layoutSelect, _results } = this;
    return (
      <div class={CSS.base}>
        <calcite-label theme={theme} scale={scale}>
          Title
          {_titleInput}
        </calcite-label>
        <calcite-label theme={theme} scale={scale}>
          Layout
          {_layoutSelect}
        </calcite-label>
        <calcite-button theme={theme} scale={scale} width="full" onclick={this._print.bind(this)}>
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
   * Render layout selects.
   */
  private _renderLayoutSelects(): void {
    const { theme, scale, layouts } = this;
    const options = [];

    for (const layout in layouts) {
      options.push(<calcite-option label={layouts[layout]} value={layout}></calcite-option>);
    }

    this._layoutSelect = (
      <calcite-select theme={theme} scale={scale}>
        {options}
      </calcite-select>
    );
  }
}
