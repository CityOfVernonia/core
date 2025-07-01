import esri = __esri;

interface I {
  result: {
    feature: esri.Graphic;

    element: tsx.JSX.Element;
  };

  state: 'search' | 'info' | 'print';
}

export interface CemeteryShellPanelProperties extends esri.WidgetProperties {
  burials: esri.FeatureLayer;

  plots: esri.FeatureLayer;

  printServiceUrl: string;

  reservations: esri.FeatureLayer;

  view: esri.MapView;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { referenceElement } from './support';
import { DateTime } from 'luxon';

const DATE_SHORT = DateTime.DATE_SHORT;

const CSS_BASE = 'cov--cemetery-shell-panel';

const CSS = {
  plots: `${CSS_BASE}_plots`,
  print: `${CSS_BASE}_print`,
  search: `${CSS_BASE}_search`,
  spacing: `${CSS_BASE}_spacing`,
};

let KEY = 0;

let PRINT_COUNT = 1;

@subclass('cov.components.CemeteryShellPanel')
export default class CemeteryShellPanel extends Widget {
  constructor(properties: CemeteryShellPanelProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { plots, view, _graphicsLayer } = this;

    await this.view.when();

    if (!view.map) return;

    view.map.add(_graphicsLayer);

    this.addHandles(
      view.on('click', async (event: esri.ViewClickEvent): Promise<void> => {
        const plot = (
          await plots.queryFeatures({ geometry: event.mapPoint, outFields: ['PLOT_ID'], returnGeometry: false })
        ).features[0];

        if (!plot) {
          this._clearPlot();

          return;
        }

        this._plotInfo(plot.attributes.PLOT_ID);
      }),
    );
  }

  readonly burials!: esri.FeatureLayer;

  readonly plots!: esri.FeatureLayer;

  readonly printServiceUrl!: string;

  readonly reservations!: esri.FeatureLayer;

  readonly view!: esri.MapView;

  private _abortController: AbortController | null = null;

  private _graphicsLayer = new GraphicsLayer();

  private _infos: esri.Collection<tsx.JSX.Element> = new Collection();

  private _input!: HTMLCalciteInputElement;

  @property()
  private _plotId = '';

  private _printer?: esri.PrintViewModel;

  private _printResults: esri.Collection<tsx.JSX.Element> = new Collection();

  private _printTemplate!: esri.PrintTemplate;

  private _results: esri.Collection<I['result']> = new Collection();

  private _segmentedControl!: HTMLCalciteSegmentedControlElement;

  private _symbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [255, 0, 0],
      width: 1.5,
    },
  });

  @property()
  private _viewState: I['state'] = 'search';

  private _abort(): void {
    const { _abortController } = this;
    if (_abortController) {
      _abortController.abort();
      this._abortController = null;
    }
  }

  private _clearPlot(): void {
    const { _graphicsLayer } = this;

    this._infos.removeAll();

    this._plotId = '';

    _graphicsLayer.removeAll();
  }

  private _burialDates(feature: esri.Graphic): { dob: string; dod: string; doi: string } {
    const {
      attributes: { DOB, DOD, DOI },
    } = feature;

    return {
      dob: DOB ? DateTime.fromMillis(DOB, { zone: 'utc' }).toLocaleString(DATE_SHORT) : 'Unknown',
      dod: DOD ? DateTime.fromMillis(DOD, { zone: 'utc' }).toLocaleString(DATE_SHORT) : 'Unknown',
      doi: DOI ? DateTime.fromMillis(DOI, { zone: 'utc' }).toLocaleString(DATE_SHORT) : 'Unknown',
    };
  }

  private async _plotInfo(id: string): Promise<void> {
    const { burials, plots, reservations, _graphicsLayer, _infos, _symbol, view } = this;

    this._clearPlot();

    const where = `PLOT_ID = '${id}'`;

    try {
      const plot = (
        await plots.queryFeatures({
          where,
          outFields: ['STATUS'],
          returnGeometry: true,
        })
      ).features[0];

      if (!plot) return;

      switch (plot.attributes.STATUS) {
        case 'AVAILABLE':
          _infos.add(
            <calcite-notice key={KEY++} open scale="s">
              <div slot="title">Available</div>
              <div slot="message">Plot {id} is available for purchase.</div>
            </calcite-notice>,
          );
          break;
        case 'RESTRICTED':
          _infos.add(
            <calcite-notice key={KEY++} open scale="s">
              <div slot="title">Restricted</div>
              <div slot="message">Plot {id} is restricted.</div>
            </calcite-notice>,
          );
          break;
        case 'RESERVED': {
          const reservation = (
            await reservations.queryFeatures({
              where,
              outFields: ['OWNER_NAME'],
            })
          ).features[0];

          console.log(reservation);

          _infos.add(
            <calcite-notice key={KEY++} open scale="s">
              <div slot="title">Reserved</div>
              <div slot="message">
                Plot {id} is reserved un the name <i>{reservation.attributes.OWNER_NAME}</i>. The legal rights of this
                plot may or may not be with this person(s). Please contact City Hall at{' '}
                <calcite-link href="tel:+1-503-429-5291">503.429.5291</calcite-link> for mor information.
              </div>
            </calcite-notice>,
          );

          break;
        }
        case 'OCCUPIED': {
          const _burials = (
            await burials.queryFeatures({
              where,
              orderByFields: ['DOD DESC'],
              outFields: ['*'],
            })
          ).features;

          _burials.forEach((burial: esri.Graphic): void => {
            const {
              attributes: { FULL_NAME, BURIAL_ID, VETERAN },
            } = burial;

            const { dob, dod, doi } = this._burialDates(burial);

            _infos.add(
              <calcite-notice key={KEY++} open scale="s">
                <div slot="title">{FULL_NAME}</div>
                <div slot="message">
                  Born: {dob}
                  <br></br>
                  Died: {dod}
                  <br></br>
                  Interred: {doi}
                  <br></br>
                  Veteran: {VETERAN === 'YES' ? 'Yes' : 'No'}
                  <br></br>
                  Burial id: {BURIAL_ID}
                </div>
              </calcite-notice>,
            );
          });
          break;
        }
      }

      const geometry = plot.geometry as esri.Polygon | nullish;

      if (geometry) {
        const graphic = new Graphic({
          geometry: geometry.clone(),
          symbol: _symbol.clone(),
        });

        _graphicsLayer.add(graphic);

        view.goTo(geometry.extent?.expand(3));
      }

      this._plotId = id;

      this._setState('info');
    } catch (error) {
      console.log(error);
    }
  }

  private async _print(): Promise<void> {
    if (!this._printer) {
      this._printer = new (await import('@arcgis/core/widgets/Print/PrintViewModel')).default({
        printServiceUrl: this.printServiceUrl,
        view: this.view,
      });

      this._printTemplate = new (await import('@arcgis/core/rest/support/PrintTemplate')).default({
        format: 'pdf',
        // @ts-expect-error custom layout template
        layout: 'Vernonia Memorial Cemetery',
      });
    }

    const { _printer, _printResults, _printTemplate } = this;

    _printResults.add(
      <calcite-button
        appearance="outline"
        disabled
        key={KEY++}
        loading
        afterCreate={async (button: HTMLCalciteButtonElement): Promise<void> => {
          try {
            const result = await _printer.print(_printTemplate);

            button.disabled = false;

            button.loading = false;

            button.iconStart = 'download';

            button.addEventListener('click', (): void => {
              window.open(result.url, '_blank');
            });
          } catch (error) {
            console.log(error);

            button.loading = false;

            button.kind = 'danger';

            button.iconStart = 'exclamation-mark-triangle';
          }
        }}
      >
        Print ({PRINT_COUNT++})
      </calcite-button>,
    );
  }

  private async _search(): Promise<void> {
    const { burials, reservations, _input, _results, _segmentedControl } = this;

    const value = _input.value;

    const type = _segmentedControl.selectedItem.value as 'burials' | 'reservations';

    this._abort();

    if (!value || value.length < 3) {
      _results.removeAll();

      return;
    }

    const controller = new AbortController();

    const { signal } = controller;

    this._abortController = controller;

    try {
      if (type === 'burials') {
        const features = (
          await burials.queryFeatures(
            {
              where: `(LOWER(FULL_NAME) like '%${value.toLowerCase()}%')`,
              outFields: ['*'],
              orderByFields: ['DOD DESC'],
              // num: 10,
              returnGeometry: false,
            },
            { signal },
          )
        ).features;

        _results.removeAll();

        features.forEach((feature: esri.Graphic): void => {
          const {
            attributes: { FULL_NAME, PLOT_ID },
          } = feature;

          const { dod } = this._burialDates(feature);

          const result: I['result'] = {
            feature,
            element: (
              <calcite-list-item
                description={`${dod} (${PLOT_ID})`}
                key={KEY++}
                label={FULL_NAME}
                onclick={this._plotInfo.bind(this, PLOT_ID)}
              ></calcite-list-item>
            ),
          };

          _results.add(result);
        });
      } else {
        const features = (
          await reservations.queryFeatures(
            {
              where: `(LOWER(OWNER_NAME) like '%${value.toLowerCase()}%')`,
              outFields: ['OWNER_NAME', 'PLOT_ID'],
              returnGeometry: false,
            },
            { signal },
          )
        ).features;

        _results.removeAll();

        features.forEach((feature: esri.Graphic): void => {
          const {
            attributes: { OWNER_NAME, PLOT_ID },
          } = feature;

          const result: I['result'] = {
            feature,
            element: (
              <calcite-list-item
                description={PLOT_ID}
                key={KEY++}
                label={OWNER_NAME}
                onclick={this._plotInfo.bind(this, PLOT_ID)}
              ></calcite-list-item>
            ),
          };

          _results.add(result);
        });
      }
    } catch (error) {
      // @ts-expect-error error has message
      if (!error.message && error.message !== 'Aborted') console.log(error);

      this._abort();
    }
  }

  private _setState(state: I['state']): void {
    this._viewState = state;
  }

  override render(): tsx.JSX.Element {
    const { _infos, _plotId, _printResults, _results, _viewState } = this;

    return (
      <calcite-shell-panel class={this.classes(CSS_BASE, _viewState !== 'search' ? CSS.spacing : null)}>
        <calcite-action-bar slot="action-bar">
          <calcite-action
            active={_viewState === 'search'}
            icon="search"
            text="Burial Search"
            afterCreate={this._actionAfterCreate.bind(this, 'search')}
          ></calcite-action>
          <calcite-tooltip close-on-click="" afterCreate={referenceElement.bind(this)}>
            Burial Search
          </calcite-tooltip>
          <calcite-action
            active={_viewState === 'info'}
            icon="information"
            text="Plot Info"
            afterCreate={this._actionAfterCreate.bind(this, 'info')}
          ></calcite-action>
          <calcite-tooltip close-on-click="" afterCreate={referenceElement.bind(this)}>
            Plot Info
          </calcite-tooltip>
          <calcite-action
            active={_viewState === 'print'}
            icon="print"
            text="Print"
            afterCreate={this._actionAfterCreate.bind(this, 'print')}
          ></calcite-action>
          <calcite-tooltip close-on-click="" afterCreate={referenceElement.bind(this)}>
            Print
          </calcite-tooltip>
        </calcite-action-bar>

        <calcite-panel heading="Burial Search" hidden={_viewState !== 'search'}>
          <div class={CSS.search}>
            <calcite-label>
              <calcite-input
                clearable
                placeholder="Search by name"
                afterCreate={this._inputAfterCreate.bind(this)}
              ></calcite-input>
            </calcite-label>
            <calcite-label>
              <calcite-segmented-control scale="s" afterCreate={this._segmentedControlAfterCreate.bind(this)}>
                <calcite-segmented-control-item value="burials" checked>
                  Burials
                </calcite-segmented-control-item>
                <calcite-segmented-control-item value="reservations">Reservations</calcite-segmented-control-item>
              </calcite-segmented-control>
            </calcite-label>
          </div>
          <calcite-list>
            {_results.toArray().map((result: I['result']): tsx.JSX.Element => {
              return result.element;
            })}
          </calcite-list>
        </calcite-panel>

        <calcite-panel heading={_plotId ? `Plot ${_plotId}` : 'Plot Info'} hidden={_viewState !== 'info'}>
          <div class={CSS.plots}>
            {_infos.length ? (
              _infos.toArray()
            ) : (
              <calcite-notice open>
                <div slot="message">Click on a plot in the map to view plot information.</div>
                <calcite-link
                  slot="link"
                  onclick={(): void => {
                    this._setState('search');

                    this._input.setFocus();
                  }}
                >
                  Burial Search
                </calcite-link>
              </calcite-notice>
            )}
          </div>
        </calcite-panel>

        <calcite-panel heading="Print" hidden={_viewState !== 'print'}>
          <div class={CSS.print}>
            <calcite-notice open>
              <div slot="message">To print a downloadable PDF, position the map to the area you wish to print.</div>
            </calcite-notice>
            <calcite-button width="full" onclick={this._print.bind(this)}>
              Print
            </calcite-button>
            {_printResults.toArray()}
          </div>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }

  private _actionAfterCreate(state: I['state'], action: HTMLCalciteActionElement): void {
    action.addEventListener('click', this._setState.bind(this, state));
  }

  private _inputAfterCreate(input: HTMLCalciteInputElement): void {
    this._input = input;

    input.addEventListener('calciteInputInput', this._search.bind(this));
  }

  private _segmentedControlAfterCreate(segmentedControl: HTMLCalciteSegmentedControlElement): void {
    this._segmentedControl = segmentedControl;

    segmentedControl.addEventListener('calciteSegmentedControlChange', (): void => {
      const { _input, _results } = this;

      _results.removeAll();

      _input.value = '';

      _input.setFocus();
    });
  }
}
