//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * WaterMeters constructor properties.
 */
export interface WaterMetersProperties extends esri.WidgetProperties {
  /**
   * Water meter layer.
   */
  layer: esri.FeatureLayer;
  /**
   * Print service URL.
   */
  printServiceUrl: string;
  /**
   * Map view.
   */
  view: esri.MapView;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  content: 'cov-shell-panels--water-meters_content',
  printButtons: 'cov-shell-panels--water-meters_print-buttons',
  searchInput: 'cov-shell-panels--water-meters_search-input',
};

let KEY = 0;

let PRINT_COUNT = 0;

/**
 * Shell panel component for water meter apps.
 */
@subclass('cov.shellPanels.WaterMeters')
export default class WaterMeters extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: WaterMetersProperties) {
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

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  layer!: esri.FeatureLayer;

  @property({ aliasOf: '_printViewModel.printServiceUrl' })
  printServiceUrl!: string;

  @property({ aliasOf: '_printViewModel.view' })
  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  private _printResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _printViewModel = new PrintViewModel();

  private _searchAbortController: AbortController | null = null;

  private _searchResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _searchViewModel = new SearchViewModel({
    includeDefaultSources: false,
  });

  @property()
  private _viewState: 'search' | 'print' | 'labels' = 'search';

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private _changeLabels(event: Event): void {
    const { layer } = this;
    const value = (event.target as HTMLCalciteSegmentedControlElement).value;
    const labelClass = layer.labelingInfo[0];
    layer.labelsVisible = value ? true : false;
    if (!value) return;
    labelClass.labelExpressionInfo.expression = `$feature.${value}`;
  }

  private _print(): void {
    const { _printResults, _printViewModel } = this;
    _printResults.add(
      <calcite-button
        key={KEY++}
        appearance="outline-fill"
        disabled=""
        loading=""
        width="full"
        afterCreate={async (button: HTMLCalciteButtonElement): Promise<void> => {
          try {
            const response = await _printViewModel.print(
              new PrintTemplate({
                format: 'pdf',
                layout: 'letter-ansi-a-landscape',
                layoutOptions: {
                  titleText: 'Water Meters',
                },
              }),
            );
            button.innerText = `Map Print (${++PRINT_COUNT})`;
            button.disabled = false;
            button.loading = false;
            button.addEventListener('click', (): void => {
              window.open(response.url, '_blank');
            });
          } catch (error: any) {
            console.log(error);
            button.loading = false;
            button.kind = 'danger';
            button.iconStart = 'exclamation-mark-triangle';
            button.innerText = 'Print error';
          }
        }}
      >
        Printing
      </calcite-button>,
    );
  }

  private async _search(event: Event): Promise<void> {
    const { _searchViewModel, _searchResults } = this;
    const value = (event.target as HTMLCalciteInputElement).value;

    this._searchAbort();

    _searchResults.removeAll();

    if (!value) return;

    const controller = new AbortController();
    const { signal } = controller;
    this._searchAbortController = controller;

    try {
      // @ts-expect-error signal is not typed
      const response = await _searchViewModel.suggest(value, null, { signal });

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
    } catch (error: any) {
      this._searchAbortController = null;
      if (error.message !== 'Aborted') console.log('water meter query error', error);
    }
  }

  private _searchAbort(): void {
    const { _searchAbortController } = this;
    if (_searchAbortController) {
      _searchAbortController.abort();
      this._searchAbortController = null;
    }
  }

  private async _selectFeature(result: esri.SuggestResult): Promise<void> {
    const {
      view,
      view: { popup },
      _searchViewModel,
    } = this;

    try {
      const feature = (await _searchViewModel.search(result)).results[0].results[0].feature;
      popup.open({
        features: [feature],
      });
      view.goTo(feature.geometry);
      view.scale = 1200;
    } catch (error) {
      console.log(error);
    }
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _printResults, _searchResults, _viewState } = this;
    return (
      <calcite-shell-panel>
        <calcite-panel heading="Water Meters">
          <calcite-action
            active={this._viewState === 'print'}
            icon="print"
            slot="header-actions-end"
            text="Print"
            onclick={(): void => {
              this._viewState = _viewState === 'print' ? 'search' : 'print';
            }}
          >
            <calcite-tooltip close-on-click="" label="Print" placement="bottom" slot="tooltip">
              Print
            </calcite-tooltip>
          </calcite-action>
          <calcite-action
            active={this._viewState === 'labels'}
            icon="label"
            slot="header-actions-end"
            text="Labels"
            onclick={(): void => {
              this._viewState = _viewState === 'labels' ? 'search' : 'labels';
            }}
          >
            <calcite-tooltip close-on-click="" label="Labels" placement="bottom" slot="tooltip">
              Labels
            </calcite-tooltip>
          </calcite-action>
          <div hidden={_viewState !== 'search'}>
            <calcite-input
              class={CSS.searchInput}
              placeholder="Search service id or address"
              clearable=""
              afterCreate={(input: HTMLCalciteInputElement): void => {
                input.addEventListener('calciteInputInput', this._search.bind(this));
              }}
            ></calcite-input>
            <calcite-list>{_searchResults.toArray()}</calcite-list>
          </div>
          <div class={CSS.content} hidden={_viewState !== 'print'}>
            <calcite-notice icon="print" open="">
              <div slot="message">Position the map to the area you wish to print.</div>
              <calcite-link slot="link" onclick={this._print.bind(this)}>
                Print map
              </calcite-link>
            </calcite-notice>
            {_printResults.length ? <div class={CSS.printButtons}>{_printResults.toArray()}</div> : null}
          </div>
          <div class={CSS.content} hidden={_viewState !== 'labels'}>
            <calcite-label>
              Water meter labels
              <calcite-segmented-control
                afterCreate={(control: HTMLCalciteSegmentedControlElement): void => {
                  control.addEventListener('calciteSegmentedControlChange', this._changeLabels.bind(this));
                }}
              >
                <calcite-segmented-control-item value="">None</calcite-segmented-control-item>
                <calcite-segmented-control-item checked="" value="wsc_id">
                  Service id
                </calcite-segmented-control-item>
                <calcite-segmented-control-item value="address">Address</calcite-segmented-control-item>
              </calcite-segmented-control>
            </calcite-label>
          </div>
          <calcite-button
            appearance="outline"
            hidden={_viewState === 'search'}
            slot={_viewState !== 'search' ? 'footer' : null}
            width="full"
            onclick={(): void => {
              this._viewState = 'search';
            }}
          >
            Back
          </calcite-button>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }
}
