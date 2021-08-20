/**
 * Widget for working with water meters.
 */

// namespaces and types
import cov = __cov;

// base imports
import { whenOnce } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

// popup
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';

// search and print
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import LayerSearchSource from '@arcgis/core/widgets/Search/LayerSearchSource';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
// styles
import './WaterMeters.scss';

const CSS = {
  base: 'cov-water-meters cov-tabbed-widget',
  printResultButton: 'cov-water-meters--print-result-button',

  // popup
  table: 'esri-widget__table',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

let KEY = 0;

let PRINT_COUNT = 1;

/**
 * Popup widget.
 */
@subclass('WaterMeterPopup')
class WaterMeterPopup extends Widget {
  @property()
  graphic!: esri.Graphic;

  @property({
    aliasOf: 'graphic.layer',
  })
  layer!: esri.FeatureLayer;

  @property()
  private accountDomain!: esri.CodedValueDomain;

  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);
    whenOnce(this, 'layer.loaded', () => {
      this.accountDomain = this.layer.getFieldDomain('ACCT_TYPE') as esri.CodedValueDomain;
    });
  }

  render(): tsx.JSX.Element {
    const { graphic, accountDomain } = this;
    const {
      attributes: { WSC_TYPE, ACCT_TYPE, METER_SIZE_T, METER_SN, METER_REG_SN, METER_AGE },
    } = graphic;

    const acctType = accountDomain.codedValues.filter((codedValue: any) => {
      return codedValue.code === ACCT_TYPE;
    })[0].name;

    return (
      <table class={CSS.table}>
        <tr>
          <th class={CSS.th}>Service Type</th>
          <td class={CSS.td}>{WSC_TYPE}</td>
        </tr>
        <tr>
          <th class={CSS.th}>Account Type</th>
          <td class={CSS.td}>{acctType}</td>
        </tr>
        <tr>
          <th class={CSS.th}>Meter Size</th>
          <td class={CSS.td}>{METER_SIZE_T}"</td>
        </tr>
        <tr>
          <th class={CSS.th}>Serial No.</th>
          <td class={CSS.td}>{METER_SN}</td>
        </tr>
        {METER_REG_SN ? (
          <tr>
            <th class={CSS.th}>Register No.</th>
            <td class={CSS.td}>{METER_REG_SN}</td>
          </tr>
        ) : null}
        <tr>
          <th class={CSS.th}>Meter Age</th>
          <td class={CSS.td}>{METER_AGE} years</td>
        </tr>
      </table>
    );
  }
}

/**
 * Class export.
 */
@subclass('cov.widgets.WaterMeters')
export default class WaterMeters extends Widget {
  @property()
  protected search = new SearchViewModel({
    includeDefaultSources: false,
  });

  @property()
  protected print = new PrintViewModel();

  /**
   * constructor properties.
   */
  @property({
    aliasOf: 'print.view',
  })
  view!: esri.MapView;

  @property()
  waterMeters!: esri.FeatureLayer;

  @property({
    aliasOf: 'print.printServiceUrl',
  })
  printServiceUrl!: string;

  /**
   * Private properties.
   */
  @property()
  private _controller: AbortController | null = null;

  @property()
  private _searchResults: Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _printResults: Collection<{
    button: tsx.JSX.Element;
  }> = new Collection();

  constructor(properties: cov.WaterMetersProperties) {
    super(properties);
    whenOnce(this, 'waterMeters.loaded', this._init.bind(this));
  }

  /**
   * Initialize when layer loaded.
   */
  private _init(): void {
    const { view, waterMeters, search } = this;

    // guarantee outFields
    waterMeters.outFields = ['*'];

    // set extent to layer
    waterMeters
      .queryExtent({
        where: ' 1 = 1',
        outSpatialReference: view.spatialReference,
      })
      .then((extent: esri.Extent) => {
        view.goTo(extent).then(() => {
          if (view.scale > 20000) view.scale = 20000;
        });
      });

    // guarantee popup
    waterMeters.popupEnabled = true;

    waterMeters.popupTemplate = new PopupTemplate({
      outFields: ['*'],
      title: '{WSC_ID} - {ADDRESS}',
      content: [
        new CustomContent({
          outFields: ['*'],
          creator: (evt: any) => {
            return new WaterMeterPopup({
              graphic: evt.graphic,
            });
          },
        }),
      ],
    });

    search.sources.add(
      new LayerSearchSource({
        layer: waterMeters,
        searchFields: ['WSC_ID', 'ADDRESS'],
        outFields: ['*'],
        maxSuggestions: 6,
        suggestionTemplate: '{WSC_ID} - {ADDRESS}',
      }),
    );
  }

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
            <calcite-value-list-item
              key={KEY++}
              label={result.text}
              onclick={this._selectFeature.bind(this, result)}
            ></calcite-value-list-item>,
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
    const { waterMeters } = this;
    const value = (evt.target as HTMLCalciteSelectElement).selectedOption.value;
    const labelClass = waterMeters.labelingInfo[0].clone();

    labelClass.labelExpressionInfo.expression = `if ("${value}" == "METER_REG_SN" && $feature.${value} == null) { return "Non-radio" } else { return $feature.${value} }`;
    waterMeters.labelingInfo = [labelClass];

    if (!waterMeters.labelsVisible) waterMeters.labelsVisible = true;
  }

  /**
   * Toggle labels on and off.
   * @param evt
   */
  private _toggleLabels(evt: Event): void {
    const { waterMeters } = this;
    waterMeters.labelsVisible = (evt.target as HTMLCalciteSwitchElement).switched;
  }

  /**
   * Print the map.
   */
  private _print(): void {
    const { print, _printResults } = this;
    const title = `Water Meters (${PRINT_COUNT})`;

    const result = {
      button: (
        <calcite-button key={KEY++} class={CSS.printResultButton} appearance="outline" round="" loading="">
          {title}
        </calcite-button>
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
        result.button = (
          <calcite-button
            key={KEY++}
            class={CSS.printResultButton}
            appearance="outline"
            round=""
            icon-start="download"
            onclick={(): void => {
              window.open(response.url, '_blank');
            }}
          >
            {title}
          </calcite-button>
        );

        this.scheduleRender();
      })
      .catch((error: esri.Error) => {
        console.log(error);

        result.button = (
          <calcite-button
            key={KEY++}
            class={CSS.printResultButton}
            color="red"
            disabled=""
            appearance="outline"
            round=""
            icon-start="exclamation-mark-triangle"
          >
            {title}
          </calcite-button>
        );

        this.scheduleRender();
      });
  }

  render(): tsx.JSX.Element {
    const { waterMeters, _searchResults, _printResults } = this;
    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Search</calcite-tab-title>
            <calcite-tab-title>Labels</calcite-tab-title>
            <calcite-tab-title>Print</calcite-tab-title>
          </calcite-tab-nav>
          {/* search tab */}
          <calcite-tab active="">
            <calcite-label>
              Search
              <calcite-input
                type="text"
                clearable=""
                placeholder="Service id or address"
                afterCreate={(calciteInput: HTMLCalciteInputElement) => {
                  calciteInput.addEventListener('calciteInputInput', this._search.bind(this));
                }}
              ></calcite-input>
            </calcite-label>
            <calcite-value-list selection-follows-focus="">{_searchResults.toArray()}</calcite-value-list>
          </calcite-tab>
          {/* labels tab */}
          <calcite-tab>
            <calcite-label>
              Label
              <calcite-select
                afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
                  calciteSelect.addEventListener('calciteSelectChange', this._setLabeling.bind(this));
                }}
              >
                <calcite-option value="WSC_ID">Service Id</calcite-option>
                <calcite-option value="ADDRESS">Address</calcite-option>
                <calcite-option value="METER_SN">Serial No.</calcite-option>
                <calcite-option value="METER_REG_SN">Register No.</calcite-option>
                <calcite-option value="METER_SIZE_T">Meter Size</calcite-option>
              </calcite-select>
            </calcite-label>
            <calcite-label>
              Show Labels
              <calcite-switch
                switched={waterMeters.labelsVisible}
                afterCreate={(calciteSwitch: HTMLCalciteSwitchElement) => {
                  calciteSwitch.addEventListener('calciteSwitchChange', this._toggleLabels.bind(this));
                }}
              ></calcite-switch>
            </calcite-label>
          </calcite-tab>
          {/* print tab */}
          <calcite-tab>
            <p>
              Position the map to the area you wish to print and click the <i>Print Map</i> button to generate a PDF.
            </p>
            <calcite-button onclick={this._print.bind(this)}>Print Map</calcite-button>
            <div>
              {_printResults.toArray().map((printResult: { button: tsx.JSX.Element }) => {
                return printResult.button;
              })}
            </div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }
}
