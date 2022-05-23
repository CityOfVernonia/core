import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

const CSS = {
  base: 'cov-water-meters',
  content: 'cov-water-meters--content',
};

let KEY = 0;

let PRINT_COUNT = 1;

/**
 * Vernonia water meters widget.
 */
@subclass('cov.widgets.WaterMeters')
export default class WaterMeters extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
      /**
       * Water meters feature layer.
       */
      layer: esri.FeatureLayer;
      /**
       * Print service URL.
       */
      printServiceUrl: string;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { layer, search } = this;
    search.sources.add(
      new LayerSearchSource({
        layer,
        searchFields: ['WSC_ID', 'ADDRESS'],
        outFields: ['*'],
        maxSuggestions: 6,
        suggestionTemplate: '{WSC_ID} - {ADDRESS}',
      }),
    );
  }

  protected search = new SearchViewModel({
    includeDefaultSources: false,
  });

  protected print = new PrintViewModel();

  @property({
    aliasOf: 'print.view',
  })
  view!: esri.MapView;

  @property()
  layer!: esri.FeatureLayer;

  @property({
    aliasOf: 'print.printServiceUrl',
  })
  printServiceUrl!: string;

  protected state: 'search' | 'print' | 'labels' = 'search';

  private _controller: AbortController | null = null;

  private _searchResults: Collection<tsx.JSX.Element> = new Collection();

  private _printResults: Collection<{
    item: tsx.JSX.Element;
  }> = new Collection();

  /**
   * Controller abort;
   */
  private _abortSearch(): void {
    const { _controller } = this;
    if (_controller) {
      _controller.abort();
      this._controller = null;
    }
  }

  /**
   * Search for features.
   * @param evt
   */
  private _search(evt: Event): void {
    const { search, _searchResults } = this;
    const value = (evt.target as HTMLCalciteInputElement).value;

    this._abortSearch();

    _searchResults.removeAll();

    if (!value) return;

    const controller = new AbortController();
    const { signal } = controller;
    this._controller = controller;

    search
      // @ts-ignore
      .suggest(value, null, { signal })
      .then((response: esri.SearchViewModelSuggestResponse) => {
        if (this._controller !== controller) return;
        this._controller = null;

        if (!response.numResults) return;

        response.results[response.activeSourceIndex].results.forEach((result: esri.SuggestResult) => {
          _searchResults.add(
            <calcite-list-item
              key={KEY++}
              label={result.text}
              onclick={this._selectFeature.bind(this, result)}
            ></calcite-list-item>,
          );
        });
      })
      .catch(() => {
        if (this._controller !== controller) return;
        this._controller = null;
      });
  }

  /**
   * Select a feature, set as popup feature and zoom to.
   * @param result
   */
  private _selectFeature(result: esri.SuggestResult): void {
    const {
      view,
      view: { popup },
      search,
    } = this;

    search.search(result).then((response: esri.SearchViewModelSearchResponse) => {
      const feature = response.results[0].results[0].feature;
      popup.open({
        features: [feature],
      });
      view.goTo(feature.geometry);
      view.scale = 1200;
    });
  }

  /**
   * Set labeling to selected attribute.
   * @param evt
   */
  private _setLabeling(evt: Event): void {
    const { layer } = this;
    const value = (evt.target as HTMLCalciteSelectElement).selectedOption.value;
    const labelClass = layer.labelingInfo[0].clone();

    labelClass.labelExpressionInfo.expression = `if ("${value}" == "METER_REG_SN" && $feature.${value} == null) { return "Non-radio" } else { return $feature.${value} }`;
    layer.labelingInfo = [labelClass];

    if (!layer.labelsVisible) layer.labelsVisible = true;
  }

  /**
   * Toggle labels on and off.
   * @param evt
   */
  private _toggleLabels(evt: Event): void {
    const { layer } = this;
    layer.labelsVisible = (evt.target as HTMLCalciteSwitchElement).checked;
  }

  /**
   * Print the map.
   */
  private _print(): void {
    const { print, _printResults } = this;
    const label = `Water Meters (${PRINT_COUNT})`;

    const result = {
      item: (
        <calcite-value-list-item key={KEY++} label="Printing..." non-interactive="">
          <calcite-action slot="actions-end" icon="download" disabled=""></calcite-action>
        </calcite-value-list-item>
      ),
    };

    PRINT_COUNT = PRINT_COUNT + 1;

    _printResults.add(result);

    print
      .print(
        new PrintTemplate({
          format: 'pdf',
          layout: 'letter-ansi-a-landscape',
          layoutOptions: {
            titleText: 'Water Meters',
          },
        }),
      )
      .then((response: any) => {
        result.item = (
          <calcite-value-list-item key={KEY++} label={label} non-interactive="">
            <calcite-action
              slot="actions-end"
              icon="download"
              onclick={(): void => {
                window.open(response.url, '_blank');
              }}
            ></calcite-action>
          </calcite-value-list-item>
        );

        this.scheduleRender();
      })
      .catch((error: esri.Error) => {
        console.log(error);

        result.item = (
          <calcite-value-list-item key={KEY++} label={label} description="Print error" non-interactive="">
            <calcite-action slot="actions-end" icon="exclamation-mark-triangle" disabled=""></calcite-action>
          </calcite-value-list-item>
        );

        this.scheduleRender();
      });
  }

  render(): tsx.JSX.Element {
    const { id, state, layer, _searchResults, _printResults } = this;

    const ids = [0, 1, 2].map((_id: number): string => {
      return `tt_${id}_${_id}`;
    });

    return (
      <calcite-panel class={CSS.base} heading="Water Meters" width-scale="m">
        <calcite-tooltip-manager slot="header-actions-end" hidden={state === 'search'}>
          <calcite-action
            id={ids[0]}
            text-enabled=""
            text="Back"
            icon="chevron-left"
            onclick={(): void => {
              this.state = 'search';
            }}
          ></calcite-action>
        </calcite-tooltip-manager>
        <calcite-tooltip reference-element={ids[0]} placement="bottom">
          Back
        </calcite-tooltip>

        <calcite-tooltip-manager slot="header-actions-end" hidden={state !== 'search'}>
          <calcite-action
            id={ids[1]}
            icon="print"
            onclick={(): void => {
              this.state = 'print';
            }}
          ></calcite-action>
        </calcite-tooltip-manager>
        <calcite-tooltip reference-element={ids[1]} placement="bottom">
          Print
        </calcite-tooltip>

        <calcite-tooltip-manager slot="header-actions-end" hidden={state !== 'search'}>
          <calcite-action
            id={ids[2]}
            icon="label"
            onclick={(): void => {
              this.state = 'labels';
            }}
          ></calcite-action>
        </calcite-tooltip-manager>
        <calcite-tooltip reference-element={ids[2]} placement="bottom">
          Labels
        </calcite-tooltip>

        <div hidden={state !== 'search'}>
          <div class={CSS.content}>
            <calcite-label>
              Water meter search
              <calcite-input
                type="text"
                clearable=""
                placeholder="service id or address"
                afterCreate={(input: HTMLCalciteInputElement) => {
                  input.addEventListener('calciteInputInput', this._search.bind(this));
                }}
              ></calcite-input>
            </calcite-label>
          </div>
          <calcite-list selection-follows-focus="">{_searchResults.toArray()}</calcite-list>
        </div>

        <div hidden={state !== 'print'}>
          <div class={CSS.content}>
            <p>
              Position the map to the area you wish to print and click the <i>Print Map</i> button to generate a PDF.
            </p>
            <calcite-button onclick={this._print.bind(this)}>Print Map</calcite-button>
          </div>
          <calcite-value-list selection-follows-focus="">
            {_printResults.toArray().map((printResult: { item: tsx.JSX.Element }) => {
              return printResult.item;
            })}
          </calcite-value-list>
        </div>

        <div hidden={state !== 'labels'}>
          <div class={CSS.content}>
            <calcite-label layout="inline">
              <calcite-switch
                switched={layer.labelsVisible}
                afterCreate={(_switch: HTMLCalciteSwitchElement) => {
                  _switch.addEventListener('calciteSwitchChange', this._toggleLabels.bind(this));
                }}
              ></calcite-switch>
              Labeling
            </calcite-label>
            <calcite-label>
              Label field
              <calcite-select
                afterCreate={(select: HTMLCalciteSelectElement) => {
                  select.addEventListener('calciteSelectChange', this._setLabeling.bind(this));
                }}
              >
                <calcite-option value="WSC_ID">Service Id</calcite-option>
                <calcite-option value="ADDRESS">Address</calcite-option>
                <calcite-option value="METER_SN">Serial No.</calcite-option>
                <calcite-option value="METER_REG_SN">Register No.</calcite-option>
                <calcite-option value="METER_SIZE_T">Meter Size</calcite-option>
              </calcite-select>
            </calcite-label>
          </div>
        </div>
      </calcite-panel>
    );
  }
}
