import esri = __esri;

export interface AttributeEditorProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';

const CSS = {
  base: 'cov-editor__attribute-editor',
};

@subclass('Editor.AttributeEditor')
export default class AttributeEditor extends Widget {
  constructor(properties: AttributeEditorProperties) {
    super(properties);
  }

  postInitialize(): void {
    watch(this, 'feature', this._feature.bind(this));
  }

  layer!: esri.FeatureLayer;

  @property({
    aliasOf: 'layer.fields',
  })
  fields!: esri.Field[];

  @property()
  feature!: esri.Graphic;

  private form!: HTMLFormElement;

  private notice!: HTMLCalciteNoticeElement;

  private _feature(feature: esri.Graphic): void {
    if (!feature) return;

    const { layer, fields, form } = this;
    const { attributes } = feature;

    if (layer !== feature.layer) return;

    this.feature = feature;

    for (const attribute in attributes) {
      const field = fields.find((field: esri.Field): boolean => {
        return field.name === attribute;
      }) as esri.Field;

      const value = attributes[attribute];

      const control = form.querySelector(`[data-attribute-name="${attribute}"`) as
        | HTMLCalciteInputElement
        | HTMLCalciteSelectElement;

      if (control) {
        // ensure select sets selected value
        if (
          (field.type === 'small-integer' || field.type === 'integer') &&
          field.domain &&
          field.domain.type === 'coded-value'
        ) {
          // must set value before setting selected option
          control.value = value;

          const options = (control as HTMLCalciteSelectElement).querySelectorAll('calcite-option');

          options.forEach((option: any) => {
            option.selected = option.value === value;
          });
        } else {
          control.value = value;
        }
      }
    }
  }

  private _updateFeatureAttributes(event: Event): void {
    event.preventDefault();

    const {
      layer,
      feature,
      feature: { attributes },
      form,
      notice,
    } = this;

    if (!feature) return;

    this.emit('updating');

    notice.hidden = false;

    this._toggleUpdating(true);

    for (const attribute in attributes) {
      const control = form.querySelector(`[data-attribute-name="${attribute}"`) as
        | HTMLCalciteInputElement
        | HTMLCalciteSelectElement;

      if (control) {
        feature.attributes[attribute] = control.value;
      }
    }

    layer
      .applyEdits({
        updateFeatures: [feature],
      })
      .then((editResults: any): void => {
        const updateResult = editResults.updateFeatureResults[0];

        if (updateResult.error) {
          console.log(updateResult.error);
          notice.hidden = true;
          this.emit('update-error', updateResult.error);
        }

        this.emit('updated');

        this._toggleUpdating(false);
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        notice.hidden = true;
        this.emit('update-error', error);
        this._toggleUpdating(false);
      });
  }

  private _toggleUpdating(updating: boolean): void {
    const { form } = this;

    const button = form.querySelector('calcite-button') as HTMLCalciteButtonElement;
    const labels = form.querySelectorAll('calcite-label') as NodeListOf<HTMLCalciteLabelElement>;

    button.loading = updating;
    labels.forEach((calciteLabel: HTMLCalciteLabelElement) => {
      // @ts-ignore
      calciteLabel.disabled = updating;
    });
  }

  private _createIntegerControl(field: esri.Field): tsx.JSX.Element {
    const { name, alias, domain, editable, nullable } = field;

    let input: tsx.JSX.Element;

    if (domain && domain.type === 'range') {
      input = (
        <calcite-input
          data-attribute-name={name}
          disabled={!editable}
          required={!nullable}
          type="number"
          step="1"
          min={domain.minValue}
          max={domain.maxValue}
        ></calcite-input>
      );
    } else if (domain && domain.type === 'coded-value') {
      input = (
        <calcite-select data-attribute-name={name} disabled={!editable}>
          {domain.codedValues.map((codedValue: esri.CodedValue): tsx.JSX.Element => {
            return <calcite-option value={codedValue.code}>{codedValue.name}</calcite-option>;
          })}
        </calcite-select>
      );
    } else {
      input = (
        <calcite-input
          data-attribute-name={name}
          disabled={!editable}
          required={!nullable}
          type="number"
          step="1"
        ></calcite-input>
      );
    }

    return (
      <calcite-label>
        {alias || name}
        {input}
      </calcite-label>
    );
  }

  private _createStringControl(field: esri.Field): tsx.JSX.Element {
    const { name, alias, domain, editable, length, nullable } = field;

    let input: tsx.JSX.Element;

    if (domain && domain.type === 'coded-value') {
      input = (
        <calcite-select data-attribute-name={name} disabled={!editable}>
          {domain.codedValues.map((codedValue: esri.CodedValue): tsx.JSX.Element => {
            return <calcite-option value={codedValue.code}>{codedValue.name}</calcite-option>;
          })}
        </calcite-select>
      );
    } else {
      input = (
        <calcite-input
          data-attribute-name={name}
          disabled={!editable}
          required={!nullable}
          type="text"
          max-length={length}
        ></calcite-input>
      );
    }

    return (
      <calcite-label>
        {alias || name}
        {input}
      </calcite-label>
    );
  }

  private _createDateControl(field: esri.Field): tsx.JSX.Element {
    const { name, alias, editable, nullable } = field;

    return (
      <calcite-label>
        {alias || name}
        <calcite-input data-attribute-name={name} disabled={!editable} required={!nullable} type="date"></calcite-input>
      </calcite-label>
    );
  }

  render(): tsx.JSX.Element {
    const { fields } = this;

    const controls = fields.map((field: esri.Field): tsx.JSX.Element | null => {
      const { type } = field;
      switch (type) {
        case 'integer':
        case 'small-integer':
          return this._createIntegerControl(field);
        case 'string':
          return this._createStringControl(field);
        case 'date':
          return this._createDateControl(field);
        default:
          return null;
      }
    });

    return (
      <div class={CSS.base}>
        <calcite-notice color="red" dismissible="" scale="s" afterCreate={storeNode.bind(this)} data-node-ref="notice">
          <div slot="message">An error occurred updating the feature.</div>
        </calcite-notice>
        <form
          afterCreate={(form: HTMLFormElement): void => {
            this.form = form;
            form.addEventListener('submit', this._updateFeatureAttributes.bind(this));
          }}
        >
          {controls}
          <calcite-button type="submit" appearance="outline">
            Update
          </calcite-button>
        </form>
      </div>
    );
  }
}
