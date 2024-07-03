import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';

let KEY = 0;

@subclass('cov.shellPanels.WaterMeterSnapshot')
class WaterMeterSnapshot extends Widget {
  constructor(properties: esri.WidgetProperties & { layer: esri.FeatureLayer; view: esri.MapView }) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { view, layer, _searchViewModel } = this;

    _searchViewModel.sources.add(
      new LayerSearchSource({
        layer,
        searchFields: ['wsc_id', 'address'],
        outFields: ['*'],
        maxSuggestions: 6,
        suggestionTemplate: '{wsc_id} - {address}',
      }),
    );

    this._layerView = await view.whenLayerView(layer);

    this.addHandles(view.on('click', this._clickEvent.bind(this)));
  }

  layer!: esri.FeatureLayer;

  view!: esri.MapView;

  private _feature: esri.Graphic | null = null;

  private _highlightHandle!: IHandle;

  private _layerView!: esri.FeatureLayerView;

  private _searchAbortController: AbortController | null = null;

  private _searchResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _searchViewModel = new SearchViewModel({
    includeDefaultSources: false,
  });

  @property()
  private _viewState: 'default' | 'selected' = 'default';

  private _clearFeature(): void {
    const { _highlightHandle } = this;
    if (_highlightHandle) _highlightHandle.remove();
    this._feature = null;
    this._viewState = 'default';
  }

  private async _clickEvent(event: esri.ViewClickEvent): Promise<void> {
    const { view, _layerView, _viewState } = this;
    const { mapPoint, stopPropagation } = event;

    stopPropagation();

    if (_viewState === 'selected') return;

    const feature = (
      await _layerView.queryFeatures({
        geometry: mapPoint,
        outFields: ['*'],
        distance: view.resolution * 3,
      })
    ).features[0];

    if (!feature) return;

    this._selectFeature(feature);
  }

  private async _featureFromSuggestion(result: esri.SuggestResult): Promise<void> {
    const { _searchViewModel } = this;

    try {
      const feature = (await _searchViewModel.search(result)).results[0].results[0].feature;
      this._selectFeature(feature);
    } catch (error) {
      console.log(error);
    }
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
        console.log(result);

        _searchResults.add(
          <calcite-list-item
            key={KEY++}
            label={result.text}
            onclick={this._featureFromSuggestion.bind(this, result)}
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

  private _selectFeature(feature: esri.Graphic): void {
    const { _highlightHandle, _layerView } = this;
    if (_highlightHandle) _highlightHandle.remove();

    this._highlightHandle = _layerView.highlight(feature);

    this._feature = feature;
    this._viewState = 'selected';
  }

  render(): tsx.JSX.Element {
    const { _feature, _searchResults, _viewState } = this;
    return (
      <calcite-shell-panel>
        <calcite-panel hidden={_viewState !== 'default'}>
          <calcite-notice icon="cursor-click" open="" style="margin: 0.75rem;">
            <div slot="message">Click on a water meter in the map or search by address or service id.</div>
          </calcite-notice>
          <calcite-input
            placeholder="Search service id or address"
            clearable=""
            style="margin: 0 0.75rem 0.75rem;"
            afterCreate={(input: HTMLCalciteInputElement): void => {
              input.addEventListener('calciteInputInput', this._search.bind(this));
            }}
          ></calcite-input>
          <calcite-list>{_searchResults.toArray()}</calcite-list>
        </calcite-panel>

        <calcite-panel hidden={_viewState !== 'selected'}>
          <calcite-button appearance="outline" slot="footer" width="full" onclick={this._clearFeature.bind(this)}>
            Clear
          </calcite-button>
          <calcite-button slot="footer" width="full">
            Snapshot
          </calcite-button>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }
}

export default WaterMeterSnapshot;
