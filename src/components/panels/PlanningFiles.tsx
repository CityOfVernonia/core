import esri = __esri;

export interface PlanningFilesProperties extends esri.WidgetProperties {
  planningFilesLayer: esri.FeatureLayer;
  view: esri.MapView;
}

// import { once, whenOnce } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

const CSS = {
  content: 'cov-panels--planning-files_content',
};

let KEY = 0;

@subclass('cov.components.panels.PlanningFiles')
class PlanningFiles extends Widget {
  constructor(properties: PlanningFilesProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { planningFilesLayer, _planningTypeOptions } = this;

    await planningFilesLayer.when();

    const typeField = planningFilesLayer.fields.find((field: esri.Field): boolean => {
      return field.name === 'planning_type';
    });

    const types = (typeField?.domain as esri.CodedValueDomain).codedValues.sort(
      (a: esri.CodedValue, b: esri.CodedValue) => (a.name < b.name ? -1 : 1),
    );

    types.forEach((codedValue: esri.CodedValue): void => {
      const { code, name } = codedValue;
      _planningTypeOptions.add(
        <calcite-option key={KEY++} value={code}>
          {name}
        </calcite-option>,
      );
    });

    this.scheduleRender();
  }

  planningFilesLayer!: esri.FeatureLayer;

  view!: esri.MapView;

  @property()
  private _definitionExpression = '';

  @property()
  private _filtered = false;

  @property()
  private _filterCount = 0;

  @property()
  private _filterType = '';

  private _planningTypeOptions: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option selected="" value="none">
      All (no filter)
    </calcite-option>,
  ]);

  private async _getFilterCount(): Promise<void> {
    const { planningFilesLayer, _definitionExpression } = this;
    this._filterCount = await planningFilesLayer.queryFeatureCount({
      where: _definitionExpression,
    });
    this._filtered = true;
  }

  private async _zoomToFiltered(): Promise<void> {
    const { planningFilesLayer, view, _definitionExpression } = this;
    const { count, extent } = await planningFilesLayer.queryExtent({
      where: _definitionExpression,
    });
    if (count) {
      view.goTo(extent);
    }
  }

  render(): tsx.JSX.Element {
    const { _filtered, _filterCount, _filterType, _planningTypeOptions } = this;
    return (
      <calcite-panel heading="Planning Files">
        <div class={CSS.content}>
          <calcite-label layout="inline">
            <calcite-switch afterCreate={this._layerSwitchAfterCreate.bind(this)}></calcite-switch>
            Planning Files
          </calcite-label>
          <calcite-label style={_filtered ? null : '--calcite-label-margin-bottom: 0;'}>
            Filter planning type
            <calcite-select afterCreate={this._filterSelectAfterCreate.bind(this)}>
              {_planningTypeOptions.toArray()}
            </calcite-select>
          </calcite-label>
          <calcite-notice icon="filter" open={_filtered} scale="s">
            <div slot="title">{_filterType}</div>
            <div slot="message">
              {_filterCount} planning file{_filterCount === 1 ? '' : 's'}
            </div>
            <calcite-link slot="link" onclick={this._zoomToFiltered.bind(this)}>
              Zoom to
            </calcite-link>
          </calcite-notice>
        </div>
      </calcite-panel>
    );
  }

  private _filterSelectAfterCreate(select: HTMLCalciteSelectElement): void {
    const { planningFilesLayer } = this;
    select.addEventListener('calciteSelectChange', (): void => {
      this._filtered = false;
      const value = select.selectedOption.value;
      if (value === 'none') {
        this._definitionExpression = this._filterType = planningFilesLayer.definitionExpression = '';
      } else {
        this._definitionExpression = planningFilesLayer.definitionExpression = `planning_type = '${value}'`;
        this._filterType = value;
        this._getFilterCount();
      }
    });
  }

  private _layerSwitchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    const { planningFilesLayer } = this;

    if (planningFilesLayer.visible) _switch.checked = true;

    _switch.addEventListener('calciteSwitchChange', (): void => {
      planningFilesLayer.visible = _switch.checked;
    });

    this.addHandles(
      planningFilesLayer.watch('visible', (visible: boolean): void => {
        _switch.checked = visible;
      }),
    );
  }
}

export default PlanningFiles;
