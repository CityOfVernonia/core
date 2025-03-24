import esri = __esri;

export interface SurveySearchDialogProperties extends esri.WidgetProperties {
  surveys: esri.GeoJSONLayer;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

let KEY = 0;

@subclass('cov.components.SurveySearchDialog')
export default class SurveySearchDialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  public get container(): HTMLCalciteDialogElement {
    return this._container;
  }

  public set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties: SurveySearchDialogProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  override async postInitialize(): Promise<void> {
    const { container, surveys, _types } = this;

    if (!surveys.loaded) await surveys.load();

    const types: string[] = [];

    const response = await surveys.queryFeatures({ where: '1 = 1', outFields: ['SurveyType'], returnGeometry: false });

    response.features.forEach((feature: esri.Graphic): void => {
      const type = feature.attributes.SurveyType;

      if (type && !types.includes(type)) types.push(type);
    });

    types.sort();

    types.forEach((type: string): void => {
      _types.add(
        <calcite-option key={KEY++} value={type}>
          {type}
        </calcite-option>,
      );
    });

    container.addEventListener('calciteDialogClose', this._close.bind(this));
  }

  readonly surveys!: esri.GeoJSONLayer;

  private _abortController: AbortController | null = null;

  private _input!: HTMLCalciteInputElement;

  private _results: esri.Collection<tsx.JSX.Element> = new Collection();

  private _select!: HTMLCalciteSelectElement;

  private _types: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option selected value="all">
      All survey types
    </calcite-option>,
  ]);

  private _abort(): void {
    const { _abortController } = this;
    if (_abortController) {
      _abortController.abort();
      this._abortController = null;
    }
  }

  private _close(): void {
    const { container, _input, _results, _select } = this;

    _results.removeAll();

    _input.value = '';

    _select.value = 'all';

    container.open = false;
  }

  private async _search(): Promise<void> {
    const { surveys, _input, _results, _select } = this;

    const value = _input.value;

    const type = _select.selectedOption.value;

    this._abort();

    if (!value || value.length < 3) {
      _results.removeAll();

      return;
    }

    const controller = new AbortController();

    const { signal } = controller;

    this._abortController = controller;

    let where = `((LOWER(SurveyId) like '%${value.toLowerCase()}%') OR (LOWER(Subdivision) like '%${value.toLowerCase()}%'))`;

    if (type !== 'all') where += ` AND (SurveyType = '${type}')`;

    try {
      const features = (
        await surveys.queryFeatures(
          {
            where,
            outFields: ['*'],
            num: 10,
            returnGeometry: false,
          },
          { signal },
        )
      ).features;

      _results.removeAll();

      if (features.length) {
        features.forEach((feature: esri.Graphic): void => {
          const {
            attributes: {
              Client,
              Comments,
              FileDate,
              Firm,
              SurveyDate,
              SurveyType,
              Sheets,
              Subdivision,
              SurveyId,
              SurveyUrl,
            },
          } = feature;

          _results.add(
            <calcite-list-item
              description={`${SurveyType} - ${SurveyDate}`}
              key={KEY++}
              label={Subdivision ? `${Subdivision} (${SurveyId})` : SurveyId}
            >
              <calcite-action
                slot="actions-end"
                icon="file-pdf"
                text="View PDF"
                afterCreate={(action: HTMLCalciteActionElement): void => {
                  action.addEventListener('click', (): void => {
                    window.open(SurveyUrl, '_blank');
                  });
                }}
              ></calcite-action>

              <table class="esri-widget__table">
                <tr>
                  <th>Client</th>
                  <td>{Client}</td>
                </tr>
                <tr>
                  <th>Firm</th>
                  <td>{Firm}</td>
                </tr>
                <tr>
                  <th>Filed</th>
                  <td>{FileDate}</td>
                </tr>
                <tr>
                  <th>Comments</th>
                  <td>{Comments}</td>
                </tr>
                <tr>
                  <th>Pages</th>
                  <td>{(Sheets as number).toString()}</td>
                </tr>
              </table>
            </calcite-list-item>,
          );
        });
      }
    } catch (error) {
      // @ts-expect-error error has message
      if (!error.message && error.message !== 'Aborted') console.log(error);

      this._abort();
    }
  }

  override render(): tsx.JSX.Element {
    const { _results, _types } = this;

    return (
      <calcite-dialog heading="Survey Search" modal placement="top" width="s">
        <calcite-label>
          <calcite-input
            clearable
            placeholder="Search surveys by survey number, subdivision name or partition number"
            afterCreate={this._inputAfterCreate.bind(this)}
          ></calcite-input>
          {/* <calcite-input-message></calcite-input-message> */}
        </calcite-label>
        <calcite-label>
          Survey type
          <calcite-select afterCreate={this._selectAfterCreate.bind(this)}>{_types.toArray()}</calcite-select>
        </calcite-label>

        <calcite-list>{_results.toArray()}</calcite-list>

        <calcite-button slot="footer-end" onclick={this._close.bind(this)}>
          Close
        </calcite-button>
      </calcite-dialog>
    );
  }

  private _inputAfterCreate(input: HTMLCalciteInputElement): void {
    this._input = input;

    input.addEventListener('calciteInputInput', this._search.bind(this));
  }

  private _selectAfterCreate(select: HTMLCalciteSelectElement): void {
    this._select = select;
  }
}
