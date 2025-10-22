import esri = __esri;

export interface WaterMetersShellPanelProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
  view: esri.MapView;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';

const CSS = {
  table: 'esri-widget__table',
};

const HANDLES = {
  click: 'click',
  highlight: 'highlight',
};

let KEY = 0;

const STYLE = {
  dialog: '--calcite-dialog-content-space: 0; --calcite-dialog-min-size-y: 0;',
  input: 'margin: 0.75rem;',
  panel: '--calcite-panel-background-color: var(--calcite-color-foreground-1);',
};

@subclass('cov.components.WaterMetersShellPanel')
export default class WaterMetersShellPanel extends Widget {
  constructor(properties: WaterMetersShellPanelProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { layer, view } = this;

    this._svm = new SearchViewModel({
      includeDefaultSources: false,
      sources: [
        new LayerSearchSource({
          layer,
          searchFields: ['wsc_id', 'address'],
          outFields: ['*'],
          maxSuggestions: 6,
          suggestionTemplate: '{wsc_id} - {address}',
        }),
      ],
    });

    try {
      this._layerView = await view.whenLayerView(layer);

      this.addHandles(view.on('click', this._click.bind(this)), HANDLES.click);
    } catch (error: unknown) {
      console.log(error);
    }
  }

  readonly layer!: esri.FeatureLayer;

  readonly view!: esri.MapView;

  private _controller: AbortController | null = null;

  @property()
  private _data: { [key: string]: string | number } = {};

  private _dialog = new Dialog();

  @property()
  private _feature: esri.Graphic | null = null;

  private _layerView!: esri.FeatureLayerView;

  private _results: esri.Collection<tsx.JSX.Element> = new Collection();

  private _svm!: esri.SearchViewModel;

  @property()
  private _state: 'info' | 'search' = 'search';

  private _abort(): void {
    const { _controller } = this;

    if (_controller) {
      _controller.abort();

      this._controller = null;
    }
  }

  private _clear(): void {
    this._state = 'search';

    this._feature = null;

    this._data = {};

    this.removeHandles(HANDLES.highlight);
  }

  private async _click(event: esri.ViewClickEvent): Promise<void> {
    const { _dialog, _layerView } = this;

    const { mapPoint } = event;

    try {
      const query = await _layerView.queryFeatures({
        geometry: mapPoint,
        outFields: ['*'],
        distance: 5,
      });

      if (query.features.length > 1) {
        _dialog.items.removeAll();

        query.features.forEach((feature: esri.Graphic): void => {
          const { Address, wsc_id } = feature.attributes;

          _dialog.items.add(
            <calcite-list-item
              key={KEY++}
              label={`${wsc_id} - ${Address}`}
              onclick={(): void => {
                this._select(feature);

                _dialog.container.open = false;
              }}
            ></calcite-list-item>,
          );
        });

        _dialog.container.open = true;

        return;
      }

      const feature = query.features[0];

      if (!feature) return;

      this._select(feature);
    } catch (error: unknown) {
      this._clear();

      console.log(error);
    }
  }

  private async _info(feature: esri.Graphic): Promise<void> {
    const { layer } = this;

    const objectId = feature.attributes[layer.objectIdField];

    try {
      const query = await layer.queryRelatedFeatures({
        relationshipId: 0,
        outFields: ['*'],
        objectIds: [objectId],
      });

      const related = query[objectId as number];
      if (related && related.features && related.features.length > 0) {
        this._data = related.features[0].attributes;
      } else {
        this._data = {};
      }

      this._state = 'info';
    } catch (error: unknown) {
      console.log(error);

      this._state = 'info';
    }
  }

  private async _search(result: esri.SuggestResult): Promise<void> {
    const { _svm } = this;

    try {
      const results = (await _svm.search(result))?.results;

      if (!results || !results[0].results || !results[0].results.length) return;

      const feature = results[0].results[0].feature;

      this._select(feature, true);
    } catch (error) {
      console.log(error);

      this._clear();
    }
  }

  private _select(feature: esri.Graphic, zoom?: boolean): void {
    const { view, _layerView } = this;

    this._feature = feature;

    this._info(feature);

    this.removeHandles(HANDLES.highlight);

    this.addHandles(_layerView.highlight(feature), HANDLES.highlight);

    if (zoom === true) {
      view.goTo(feature);

      view.scale = 1200;
    }
  }

  private async _suggest(event: Event): Promise<void> {
    const { _results, _svm } = this;

    const value = (event.target as HTMLCalciteInputTextElement).value;

    this._abort();

    _results.removeAll();

    if (!value) return;

    const controller = new AbortController();

    const { signal } = controller;

    this._controller = controller;

    try {
      const response = await _svm.suggest(value, null, { signal });

      if (this._controller !== controller) return;

      this._controller = null;

      if (!response || !response.results || !response.numResults) return;

      response.results[response.activeSourceIndex].results?.forEach((result: esri.SuggestResult) => {
        _results.add(
          <calcite-list-item
            key={KEY++}
            label={result.text}
            onclick={this._search.bind(this, result)}
          ></calcite-list-item>,
        );
      });
    } catch (error: unknown) {
      this._abort();

      if (error instanceof Error && error.message !== 'Aborted') console.log(error);
    }
  }

  override render(): tsx.JSX.Element {
    const { _data, _results, _state } = this;

    return (
      <calcite-shell-panel>
        <calcite-panel style={STYLE.panel}>
          {/* search */}
          <div hidden={_state !== 'search'}>
            <calcite-input-text
              clearable
              placeholder="Search service id or address"
              style={STYLE.input}
              afterCreate={this._inputAfterCreate.bind(this)}
            ></calcite-input-text>
            <calcite-list>{_results.toArray()}</calcite-list>
          </div>

          {/* info */}
          <table class={CSS.table} hidden={_state !== 'info'}>
            <tr>
              <th>Address</th>
              <td>{_data.ADDRESS}</td>
            </tr>
            <tr>
              <th>Service id</th>
              <td>{_data.WSC_ID}</td>
            </tr>
            <tr>
              <th>Meter size</th>
              <td>{_data.METER_SIZE_T}"</td>
            </tr>
            <tr>
              <th>Serial no.</th>
              <td>{_data.METER_SN}</td>
            </tr>
            <tr>
              <th>Register no.</th>
              <td>{_data.METER_REG_SN || 'n/a'}</td>
            </tr>
            <tr>
              <th>Meter age</th>
              <td>{_data.METER_AGE} years</td>
            </tr>
          </table>

          {/* clear button */}
          <calcite-button
            appearance="outline"
            hidden={_state !== 'info'}
            slot={_state === 'info' ? 'footer' : null}
            width="full"
            afterCreate={this._buttonAfterCreate.bind(this)}
          >
            Clear
          </calcite-button>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }

  private _buttonAfterCreate(button: HTMLCalciteButtonElement): void {
    button.addEventListener('click', this._clear.bind(this));
  }

  private _inputAfterCreate(input: HTMLCalciteInputTextElement): void {
    input.addEventListener('calciteInputTextInput', this._suggest.bind(this));
  }
}

@subclass('Dialog')
class Dialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  public items: esri.Collection<tsx.JSX.Element> = new Collection();

  override render(): tsx.JSX.Element {
    const { items } = this;

    return (
      <calcite-dialog heading="Select water meter" modal style={STYLE.dialog} width="s">
        <calcite-list>{items.toArray()}</calcite-list>
      </calcite-dialog>
    );
  }
}
