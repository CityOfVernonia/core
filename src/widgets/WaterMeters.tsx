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
  base: 'water-meters',
  content: 'water-meters_content',
  searchInput: 'water-meters_search-input',
  table: 'esri-widget__table',
};

let KEY = 0;

let PRINT_COUNT = 0;

@subclass('WaterMeters')
export default class WaterMeters extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      view: esri.MapView;
      layer: esri.FeatureLayer;
      printServiceUrl?: string;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { layer, _searchViewModel } = this;
    _searchViewModel.sources.add(
      new LayerSearchSource({
        layer,
        searchFields: ['wsc_id', 'address'],
        outFields: ['*'],
        maxSuggestions: 6,
        suggestionTemplate: '{wsc_id} - {address}',
      }),
    );
  }

  private _printViewModel = new PrintViewModel();

  @property({ aliasOf: '_printViewModel.view' })
  view!: esri.MapView;

  layer!: esri.FeatureLayer;

  @property({ aliasOf: '_printViewModel.printServiceUrl' })
  printServiceUrl!: string;

  @property()
  protected state: 'search' | 'print' | 'labels' = 'search';

  private _searchViewModel = new SearchViewModel({
    includeDefaultSources: false,
  });

  private _searchAbortController: AbortController | null = null;

  private _searchResults: Collection<tsx.JSX.Element> = new Collection();

  private _createSearch(input: HTMLCalciteInputElement): void {
    input.addEventListener('calciteInputInput', this._search.bind(this));
  }

  private _abortSearch(): void {
    const { _searchAbortController } = this;
    if (_searchAbortController) {
      _searchAbortController.abort();
      this._searchAbortController = null;
    }
  }

  private _search(event: Event): void {
    const { _searchViewModel, _searchResults } = this;
    const value = (event.target as HTMLCalciteInputElement).value;

    this._abortSearch();

    _searchResults.removeAll();

    if (!value) return;

    const controller = new AbortController();
    const { signal } = controller;
    this._searchAbortController = controller;

    _searchViewModel
      // @ts-ignore
      .suggest(value, null, { signal })
      .then((response: esri.SearchViewModelSuggestResponse) => {
        if (this._searchAbortController !== controller) return;
        this._searchAbortController = null;

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
        if (this._searchAbortController !== controller) return;
        this._searchAbortController = null;
      });
  }

  private async _selectFeature(result: esri.SuggestResult): Promise<void> {
    const {
      view,
      view: { popup },
      _searchViewModel,
    } = this;

    const feature = (await _searchViewModel.search(result)).results[0].results[0].feature;

    popup.open({
      features: [feature],
    });
    view.goTo(feature.geometry);
    view.scale = 1200;
  }

  private _printResults: Collection<tsx.JSX.Element> = new Collection();

  private _print(): void {
    const { _printViewModel, _printResults } = this;

    const index = PRINT_COUNT;
    const label = `Water Meters (${PRINT_COUNT + 1})`;

    _printResults.add(
      <calcite-value-list-item key={KEY++} label={label} description="Printing...">
        <calcite-action slot="actions-end" loading=""></calcite-action>
      </calcite-value-list-item>,
    );

    PRINT_COUNT = PRINT_COUNT + 1;

    _printViewModel
      .print(
        new PrintTemplate({
          format: 'pdf',
          layout: 'letter-ansi-a-landscape',
          layoutOptions: {
            titleText: 'Water Meters',
          },
        }),
      )
      .then((response: any): void => {
        _printResults.splice(index, 1, [
          <calcite-value-list-item key={KEY++} label={label}>
            <calcite-action
              slot="actions-end"
              icon="download"
              onclick={(): void => {
                window.open(response.url, '_blank');
              }}
            ></calcite-action>
          </calcite-value-list-item>,
        ]);
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        _printResults.splice(index, 1, [
          <calcite-value-list-item key={KEY++} label={label} description="Print error">
            <calcite-action disabled="" slot="actions-end" icon="exclamation-mark-triangle"></calcite-action>
          </calcite-value-list-item>,
        ]);
      });
  }

  private _labeling(control: HTMLCalciteSegmentedControlElement): void {
    const { layer } = this;
    control.addEventListener('calciteSegmentedControlChange', (): void => {
      const value = control.value;
      const labelClass = layer.labelingInfo[0];

      layer.labelsVisible = value ? true : false;

      if (!value) return;

      labelClass.labelExpressionInfo.expression = `$feature.${value}`;
    });
  }

  render(): tsx.JSX.Element {
    const { state, _searchResults, _printResults } = this;
    return (
      <calcite-shell-panel class={CSS.base} detached="">
        <calcite-panel heading="Water Meters" width-scale="m">
          <calcite-action
            active={state === 'print'}
            icon="print"
            slot="header-actions-end"
            text="Print"
            onclick={(): void => {
              this.state = 'print';
            }}
          >
            <calcite-tooltip label="Print" placement="bottom" slot="tooltip">
              Print
            </calcite-tooltip>
          </calcite-action>
          <calcite-action
            active={state === 'labels'}
            icon="label"
            slot="header-actions-end"
            text="Labels"
            onclick={(): void => {
              this.state = 'labels';
            }}
          >
            <calcite-tooltip label="Labels" placement="bottom" slot="tooltip">
              Labels
            </calcite-tooltip>
          </calcite-action>

          <div hidden={state !== 'search'}>
            <calcite-input
              class={CSS.searchInput}
              placeholder="Search service id or address"
              clearable=""
              afterCreate={this._createSearch.bind(this)}
            ></calcite-input>
            <calcite-list>{_searchResults.toArray()}</calcite-list>
          </div>

          <div hidden={state !== 'print'}>
            <div class={CSS.content}>
              <span>
                Position the map to the area you wish to print and click the <i>Print Map</i> button to generate a PDF.
              </span>
              <calcite-button onclick={this._print.bind(this)}>Print Map</calcite-button>
            </div>
            <calcite-list>{_printResults.toArray()}</calcite-list>
          </div>

          <div hidden={state !== 'labels'}>
            <div class={CSS.content}>
              <calcite-label>
                Water meter labels
                <calcite-segmented-control afterCreate={this._labeling.bind(this)}>
                  <calcite-segmented-control-item value="">None</calcite-segmented-control-item>
                  <calcite-segmented-control-item checked="" value="wsc_id">
                    Service id
                  </calcite-segmented-control-item>
                  <calcite-segmented-control-item value="address">Address</calcite-segmented-control-item>
                </calcite-segmented-control>
              </calcite-label>
            </div>
          </div>

          <calcite-button
            hidden={state === 'search'}
            appearance="outline"
            slot={state === 'search' ? '' : 'footer-actions'}
            width="full"
            onclick={(): void => {
              this.state = 'search';
            }}
          >
            Back
          </calcite-button>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }
}

@subclass('WaterMeterPopup')
export class WaterMeterPopup extends Widget {
  container = document.createElement('table');

  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { graphic, layer, objectIdField, _rows } = this;

    const objectId = graphic.attributes[objectIdField];

    const notes = graphic.attributes.Notes;

    const query = await layer.queryRelatedFeatures({
      relationshipId: 0,
      outFields: ['*'],
      objectIds: [objectId],
    });

    const {
      WSC_TYPE,
      ACCT_TYPE,
      METER_SIZE_T,
      METER_SN,
      METER_REG_SN,
      METER_AGE,
      LINE_IN_MATERIAL,
      LINE_IN_SIZE,
      LINE_OUT_MATERIAL,
      LINE_OUT_SIZE,
    } = query[objectId].features[0].attributes;

    _rows.addMany([
      <tr>
        <th>Service type</th>
        <td>{WSC_TYPE}</td>
      </tr>,
      <tr>
        <th>Account type</th>
        <td>{ACCT_TYPE}</td>
      </tr>,
      <tr>
        <th>Meter size</th>
        <td>{METER_SIZE_T}"</td>
      </tr>,
      <tr>
        <th>Serial no.</th>
        <td>{METER_SN}</td>
      </tr>,
      <tr>
        <th>Register no.</th>
        <td>{METER_REG_SN}</td>
      </tr>,
      <tr>
        <th>Meter age</th>
        <td>{METER_AGE} years</td>
      </tr>,
      <tr>
        <th>Size in</th>
        <td>{LINE_IN_SIZE}"</td>
      </tr>,
      <tr>
        <th>Material in</th>
        <td>{LINE_IN_MATERIAL}</td>
      </tr>,
      <tr>
        <th>Size out</th>
        <td>{LINE_OUT_SIZE}"</td>
      </tr>,
      <tr>
        <th>Material out</th>
        <td>{LINE_OUT_MATERIAL}</td>
      </tr>,
    ]);

    if (notes) {
      _rows.add(
        <tr>
          <th>Notes</th>
          <td>{notes}</td>
        </tr>,
      );
    }
  }

  graphic!: esri.Graphic;

  @property({ aliasOf: 'graphic.layer' })
  layer!: esri.FeatureLayer;

  @property({ aliasOf: 'graphic.layer.objectIdField' })
  objectIdField!: string;

  private _rows: Collection<tsx.JSX.Element> = new Collection();

  render(): tsx.JSX.Element {
    const { _rows } = this;
    return <table class={CSS.table}>{_rows.toArray()}</table>;
  }
}
