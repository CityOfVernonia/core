//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * WaterMetersLocation constructor properties.
 */
export interface WaterMetersLocationProperties extends esri.WidgetProperties {
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
let KEY = 0;

/**
 * Shell panel component for water meter apps.
 */
@subclass('cov.shellPanels.WaterMetersLocation')
export default class WaterMetersLocation extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: WaterMetersLocationProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { layer, view, _searchViewModel } = this;
    _searchViewModel.sources.add(
      new LayerSearchSource({
        layer,
        searchFields: ['wsc_id', 'address'],
        outFields: ['*'],
        maxSuggestions: 6,
        suggestionTemplate: '{wsc_id} - {address}',
      }),
    );

    this.addHandles(
      this.watch('_feature', (feature: esri.Graphic): void => {
        const oid = layer.objectIdField;

        layer.definitionExpression = feature ? `${oid} = ${feature.attributes[oid]}` : '';

        if (feature) {
          this._clickHandle.remove();
        } else {
          view.on('click', this._clickEvent.bind(this));
        }
      }),
    );

    this._layerView = await view.whenLayerView(layer);

    this._clickHandle = view.on('click', this._clickEvent.bind(this));

    console.log(this);
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
  private _clickHandle!: IHandle;

  @property()
  private _feature: esri.Graphic | null = null;

  private _layerView!: esri.FeatureLayerView;

  private _printViewModel = new PrintViewModel();

  private _searchAbortController: AbortController | null = null;

  private _searchResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _searchViewModel = new SearchViewModel({
    includeDefaultSources: false,
  });

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private async _print(): Promise<void> {
    const { _feature, _printViewModel } = this;

    if (!_feature) return;

    (
      (this.container as HTMLCalciteShellPanelElement).querySelector(
        'calcite-panel[data-feature-panel]',
      ) as HTMLCalcitePanelElement
    ).loading = true;

    try {
      const response = await _printViewModel.print(
        new PrintTemplate({
          format: 'pdf',
          layout: 'letter-ansi-a-landscape',
          layoutOptions: {
            titleText: _feature.attributes.Address,
          },
        }),
      );
      window.open(response.url, '_blank');
      this._feature = null;
    } catch (error: any) {
      console.log(error);
      this._feature = null;
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
        _searchResults.add(
          <calcite-list-item
            key={KEY++}
            label={result.text}
            onclick={this._selectSuggestFeature.bind(this, result)}
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

  private async _selectSuggestFeature(result: esri.SuggestResult): Promise<void> {
    const { _searchViewModel } = this;
    try {
      const feature = (await _searchViewModel.search(result)).results[0].results[0].feature;
      this._selectFeature(feature);
    } catch (error) {
      console.log(error);
    }
  }

  private _selectFeature(feature: esri.Graphic): void {
    const { view } = this;
    this._feature = feature;
    view.goTo(feature.geometry);
    view.scale = 600;
  }

  private _clearFeature(): void {
    console.log('clear');
    this._feature = null;
  }

  private async _clickEvent(event: esri.ViewClickEvent): Promise<void> {
    const { view, _layerView } = this;
    const { mapPoint, stopPropagation } = event;
    stopPropagation();

    const feature = (
      await _layerView.queryFeatures({
        geometry: mapPoint,
        outFields: ['*'],
        distance: view.resolution * 3,
        returnGeometry: true,
      })
    ).features[0];

    if (!feature) return;

    this._selectFeature(feature);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _feature, _searchResults } = this;
    return (
      <calcite-shell-panel>
        <calcite-panel hidden={_feature !== null}>
          <calcite-notice icon="cursor-click" open="" style="padding:0.75rem;">
            <div slot="message">Click or search to select a water meter</div>
          </calcite-notice>
          <calcite-input
            placeholder="Search service id or address"
            clearable=""
            style="padding:0 0.75rem 0.75rem 0.75rem;"
            afterCreate={(input: HTMLCalciteInputElement): void => {
              input.addEventListener('calciteInputInput', this._search.bind(this));
            }}
          ></calcite-input>
          <calcite-list>{_searchResults.toArray()}</calcite-list>
        </calcite-panel>
        {this._renderFeature()}
      </calcite-shell-panel>
    );
  }

  private _renderFeature(): tsx.JSX.Element | null {
    const { _feature } = this;
    if (!_feature) return null;
    const { wsc_id, Address } = _feature.attributes;
    return (
      <calcite-panel data-feature-panel="">
        <div style="padding:0.75rem;">
          <calcite-notice icon="information" open="" style="width:100%;">
            <div slot="title">{wsc_id}</div>
            <div slot="message">{Address}</div>
          </calcite-notice>
        </div>
        <calcite-button
          appearance="outline"
          slot="footer"
          width="half"
          afterCreate={(button: HTMLCalciteButtonElement): void => {
            button.addEventListener('click', this._clearFeature.bind(this));
          }}
        >
          Clear
        </calcite-button>
        <calcite-button
          slot="footer"
          width="half"
          afterCreate={(button: HTMLCalciteButtonElement): void => {
            button.addEventListener('click', this._print.bind(this));
          }}
        >
          Print
        </calcite-button>
      </calcite-panel>
    );
  }
}
