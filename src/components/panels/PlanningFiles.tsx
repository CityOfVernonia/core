import esri = __esri;

export interface PlanningFilesProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

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
  container!: HTMLCalcitePanelElement;

  constructor(properties: PlanningFilesProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { layer, _planningStatusOptions, _planningTypeOptions } = this;

    await layer.when();

    // status
    const statusField = layer.fields.find((field: esri.Field): boolean => {
      return field.name === 'status';
    });
    const statuses = (statusField?.domain as esri.CodedValueDomain).codedValues.sort(
      (a: esri.CodedValue, b: esri.CodedValue) => (a.name < b.name ? -1 : 1),
    );
    statuses.forEach((codedValue: esri.CodedValue): void => {
      const { code, name } = codedValue;
      _planningStatusOptions.add(
        <calcite-option key={KEY++} value={code}>
          {name}
        </calcite-option>,
      );
    });

    // types
    const typeField = layer.fields.find((field: esri.Field): boolean => {
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

  layer!: esri.FeatureLayer;

  @property()
  private _filtered = false;

  private _planningStatusOptions: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option selected="" value="">
      No status filter
    </calcite-option>,
  ]);

  private _planningTypeOptions: esri.Collection<tsx.JSX.Element> = new Collection([
    <calcite-option selected="" value="">
      No type filter
    </calcite-option>,
  ]);

  private _clearFilters(): void {
    const { container, layer } = this;

    (container.querySelector('[data-filter="status"]') as HTMLCalciteSelectElement).value = '';
    (container.querySelector('[data-filter="type"]') as HTMLCalciteSelectElement).value = '';

    this._filtered = false;

    layer.definitionExpression = '';
  }

  private _filter(): void {
    const { container, layer } = this;

    const status = (container.querySelector('[data-filter="status"]') as HTMLCalciteSelectElement).selectedOption.value;
    const type = (container.querySelector('[data-filter="type"]') as HTMLCalciteSelectElement).selectedOption.value;

    let definitionExpression = '';

    this._filtered = status || type;

    if (status) definitionExpression += `status = '${status}'`;
    if (status && type) definitionExpression += ' AND ';
    if (type) definitionExpression += `planning_type = '${type}'`;

    layer.definitionExpression = definitionExpression;
  }

  render(): tsx.JSX.Element {
    const { _filtered, _planningStatusOptions, _planningTypeOptions } = this;
    return (
      <calcite-panel heading="Planning Files">
        <div class={CSS.content}>
          <calcite-label layout="inline">
            <calcite-switch afterCreate={this._layerSwitchAfterCreate.bind(this)}></calcite-switch>
            Planning Files
          </calcite-label>
          <calcite-label>
            Filter planning status
            <calcite-select data-filter="status" afterCreate={this._filterSelectAfterCreate.bind(this)}>
              {_planningStatusOptions.toArray()}
            </calcite-select>
          </calcite-label>
          <calcite-label style="--calcite-label-margin-bottom: 0;">
            Filter planning type
            <calcite-select data-filter="type" afterCreate={this._filterSelectAfterCreate.bind(this)}>
              {_planningTypeOptions.toArray()}
            </calcite-select>
          </calcite-label>
        </div>
        <calcite-button
          appearance="transparent"
          hidden={!_filtered}
          slot={_filtered ? 'footer' : null}
          width="full"
          onclick={this._clearFilters.bind(this)}
        >
          Clear Filters
        </calcite-button>
      </calcite-panel>
    );
  }

  private _filterSelectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', this._filter.bind(this));
  }

  private _layerSwitchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    const { layer } = this;

    if (layer.visible) _switch.checked = true;

    _switch.addEventListener('calciteSwitchChange', (): void => {
      layer.visible = _switch.checked;
    });

    this.addHandles(
      layer.watch('visible', (visible: boolean): void => {
        _switch.checked = visible;
      }),
    );
  }
}

export default PlanningFiles;
