/**
 * Classic Vernonia measure in Calcite.
 */
import cov = __cov;

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';

import { accessibleHandler, tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';

import MeasureViewModel from '../viewModels/MeasureViewModel';
import UnitsViewModel from '../viewModels/UnitsViewModel';

// styles
import './Measure/styles/Measure.scss';
const CSS = {
  base: 'cov-measure',
  row: 'cov-measure--row',
  result: 'cov-measure--result',
  clear: 'cov-measure--clear',
  clearVisible: 'cov-measure--clear-visible',
};

let KEY = 0;

@subclass('cov.widgets.Measure')
export default class Measure extends Widget {
  /**
   * Constructor properties.
   */
  @property({
    aliasOf: 'viewModel.view',
  })
  view!: esri.MapView;

  @property({
    aliasOf: 'viewModel.showText',
  })
  showText!: boolean;

  @property({
    aliasOf: 'viewModel.color',
  })
  color!: any;

  @property({
    aliasOf: 'viewModel.fillColor',
  })
  fillColor!: any;

  /**
   * Public widget properties.
   */
  @property()
  viewModel = new MeasureViewModel();

  @property({
    aliasOf: 'viewModel.state',
  })
  protected state!: cov.MeasureState;

  @property({
    aliasOf: 'viewModel.units',
  })
  protected units!: UnitsViewModel;

  @property({
    aliasOf: 'viewModel.hasGround',
  })
  protected hasGround!: boolean;

  constructor(properties?: cov.MeasureProperties) {
    super(properties);
  }

  /**
   * View model methods called by the widget.
   */
  @accessibleHandler()
  clear(): void {
    this.viewModel.clear();
  }

  @accessibleHandler()
  length(): void {
    this.viewModel.length();
  }

  @accessibleHandler()
  area(): void {
    this.viewModel.area();
  }

  @accessibleHandler()
  elevation(): void {
    this.viewModel.elevation();
  }

  @accessibleHandler()
  location(): void {
    this.viewModel.location();
  }

  /**
   * Convenience method for other widgets to clear when hiding this widget.
   */
  onHide(): void {
    this.viewModel.clear();
  }

  /**
   * Wire switch change to showText.
   * @param _switch
   */
  private _showTextHandle(_switch: HTMLCalciteSwitchElement): void {
    _switch.addEventListener('calciteSwitchChange', (evt: any) => {
      this.showText = evt.detail.switched;
    });
  }

  /**
   * Wire units change to units<unit>.
   * @param type
   * @param select
   */
  private _unitChangeHandle(
    type: 'length' | 'area' | 'location' | 'elevation',
    select: HTMLCalciteSelectElement,
  ): void {
    select.addEventListener('calciteSelectChange', (evt: any) => {
      const value = evt.target.selectedOption.value;
      switch (type) {
        case 'length':
          this.units.lengthUnit = value;
          break;
        case 'area':
          this.units.areaUnit = value;
          break;
        case 'location':
          this.units.locationUnit = value;
          break;
        case 'elevation':
          this.units.elevationUnit = value;
          break;
        default:
          break;
      }
    });
  }

  render(): tsx.JSX.Element {
    const {
      state,
      hasGround,
      showText,
      units: {
        lengthUnits,
        lengthUnit,
        areaUnits,
        areaUnit,
        locationUnits,
        locationUnit,
        elevationUnits,
        elevationUnit,
      },
    } = this;

    const measureClear = {
      [CSS.clearVisible]:
        state.action === 'measuringLength' ||
        state.action === 'length' ||
        state.action === 'measuringArea' ||
        state.action === 'area',
    };
    const locationClear = {
      [CSS.clearVisible]: state.action === 'queryingLocation' || state.action === 'location',
    };
    const elevationClear = {
      [CSS.clearVisible]: state.action === 'queryingElevation' || state.action === 'elevation',
    };

    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Measure</calcite-tab-title>
            <calcite-tab-title>Location</calcite-tab-title>
            <calcite-tab-title style={hasGround ? '' : 'display:none;'}>Elevation</calcite-tab-title>
          </calcite-tab-nav>

          {/* length and area */}
          <calcite-tab active="">
            <div class={CSS.row}>
              <calcite-button title="Measure length" onclick={this.length.bind(this)}>
                Length
              </calcite-button>
              <calcite-select title="Select length unit" afterCreate={this._unitChangeHandle.bind(this, 'length')}>
                {this._createUnitOptions(lengthUnits, lengthUnit)}
              </calcite-select>
            </div>

            <div class={CSS.row}>
              <calcite-button title="Measure area" onclick={this.area.bind(this)}>
                Area
              </calcite-button>
              <calcite-select title="Select area unit" afterCreate={this._unitChangeHandle.bind(this, 'area')}>
                {this._createUnitOptions(areaUnits, areaUnit)}
              </calcite-select>
            </div>

            <div class={CSS.row}>
              <label>
                <calcite-switch
                  title="Show text while measuring"
                  switched={showText}
                  afterCreate={this._showTextHandle.bind(this)}
                ></calcite-switch>
                Show text
              </label>
            </div>

            {this._createMeasureResult()}

            <div class={this.classes(CSS.clear, measureClear)}>
              <calcite-button title="Clear" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>

          {/* location */}
          <calcite-tab>
            <div class={CSS.row}>
              <calcite-button title="Identify location" onclick={this.location.bind(this)}>
                Location
              </calcite-button>
              <calcite-select title="Select location unit" afterCreate={this._unitChangeHandle.bind(this, 'location')}>
                {this._createUnitOptions(locationUnits, locationUnit)}
              </calcite-select>
            </div>

            <div class={CSS.row}>
              <label>
                <calcite-switch
                  title="Show text while measuring"
                  switched={showText}
                  afterCreate={this._showTextHandle.bind(this)}
                ></calcite-switch>
                Show text
              </label>
            </div>

            <div class={this.classes(CSS.row, CSS.result)}>
              <div>Latitude: {state.y}</div>
              <div>Longitude: {state.x}</div>
            </div>

            <div class={this.classes(CSS.clear, locationClear)}>
              <calcite-button title="Clear" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>

          {/* elevation */}
          <calcite-tab style={hasGround ? '' : 'display:none;'}>
            <div class={CSS.row}>
              <calcite-button title="Identify elevation" onclick={this.elevation.bind(this)}>
                Elevation
              </calcite-button>
              <calcite-select
                title="Select elevation unit"
                afterCreate={this._unitChangeHandle.bind(this, 'elevation')}
              >
                {this._createUnitOptions(elevationUnits, elevationUnit)}
              </calcite-select>
            </div>

            <div class={CSS.row}>
              <label>
                <calcite-switch
                  title="Show text while measuring"
                  switched={showText}
                  afterCreate={this._showTextHandle.bind(this)}
                ></calcite-switch>
                Show text
              </label>
            </div>

            <div class={this.classes(CSS.row, CSS.result)}>
              Elevation: {state.z} {elevationUnit}
            </div>

            <div class={this.classes(CSS.clear, elevationClear)}>
              <calcite-button title="Clear" onclick={this.clear.bind(this)}>
                Clear
              </calcite-button>
            </div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }

  /**
   * tsx helpers.
   */
  private _createUnitOptions(units: Record<string, string>, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <calcite-option value={unit} selected={unit === defaultUnit}>
          {units[unit]}
        </calcite-option>,
      );
    }
    return options;
  }

  private _createMeasureResult(): tsx.JSX.Element {
    const {
      state,
      units: { lengthUnit, areaUnit },
    } = this;
    switch (state.action) {
      case 'length':
      case 'measuringLength':
        return (
          <div key={KEY++} class={this.classes(CSS.row, CSS.result)}>
            <span>Length:</span> {state.length.toLocaleString()} {lengthUnit}
          </div>
        );
      case 'area':
      case 'measuringArea':
        return (
          <div key={KEY++} class={this.classes(CSS.row, CSS.result)}>
            <div>
              <span>Area:</span> {state.area.toLocaleString()} {areaUnit}
            </div>
            <div>
              <span>Perimeter:</span> {state.length.toLocaleString()} {lengthUnit}
            </div>
          </div>
        );
      default:
        return (
          <div key={KEY++} class={this.classes(CSS.row, CSS.result)}>
            Select a measure tool
          </div>
        );
    }
  }
}
