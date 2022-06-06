export interface SettingsProperties extends esri.WidgetProperties {
  snappingOptions: esri.SnappingOptions;
}

import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const CSS = {
  base: 'cov-editor__settings',
};

let KEY = 0;

@subclass('Editor.Settings')
export default class Settings extends Widget {
  constructor(properties: SettingsProperties) {
    super(properties);
  }

  postInitialize(): void {
    const {
      snappingOptions: { featureSources },
    } = this;

    featureSources.forEach(this._addFeatureSource.bind(this));

    this.own(
      featureSources.on('after-add', (event: { item: esri.FeatureSnappingLayerSource }): void => {
        this._addFeatureSource(event.item);
      }),
    );
  }

  @property()
  snappingOptions!: esri.SnappingOptions;

  @property({
    aliasOf: 'snappingOptions.enabled',
  })
  enabled!: boolean;

  @property({
    aliasOf: 'snappingOptions.featureEnabled',
  })
  featureEnabled!: boolean;

  @property({
    aliasOf: 'snappingOptions.selfEnabled',
  })
  selfEnabled!: boolean;

  private _layers: Collection<tsx.JSX.Element> = new Collection();

  private _addFeatureSource(featureSource: esri.FeatureSnappingLayerSource): void {
    const { _layers } = this;
    const {
      layer: { title },
      enabled,
    } = featureSource;

    _layers.add(
      <calcite-label key={KEY++} alignment="end" layout="inline">
        <calcite-checkbox
          checked={enabled}
          afterCreate={(calciteCheckbox: HTMLCalciteSwitchElement) => {
            calciteCheckbox.addEventListener('calciteCheckboxChange', () => {
              featureSource.enabled = calciteCheckbox.checked;
            });
          }}
        ></calcite-checkbox>
        {title}
      </calcite-label>,
    );
  }

  createSnappingOptionsBlock(): tsx.JSX.Element {
    return (
      <calcite-block heading="Snapping options" collapsible="">
        <calcite-label alignment="start" layout="inline-space-between">
          Enabled
          <calcite-switch
            afterCreate={(calciteSwitch: HTMLCalciteSwitchElement) => {
              const { enabled } = this;
              calciteSwitch.checked = enabled;
              calciteSwitch.addEventListener('calciteSwitchChange', () => {
                this.enabled = calciteSwitch.checked;
              });
            }}
          ></calcite-switch>
        </calcite-label>
        <calcite-label alignment="start" layout="inline-space-between">
          Features
          <calcite-switch
            afterCreate={(calciteSwitch: HTMLCalciteSwitchElement) => {
              const { featureEnabled } = this;
              calciteSwitch.checked = featureEnabled;
              calciteSwitch.addEventListener('calciteSwitchChange', () => {
                this.featureEnabled = calciteSwitch.checked;
              });
            }}
          ></calcite-switch>
        </calcite-label>
        <calcite-label alignment="start" layout="inline-space-between">
          Guides
          <calcite-switch
            afterCreate={(calciteSwitch: HTMLCalciteSwitchElement) => {
              const { selfEnabled } = this;
              calciteSwitch.checked = selfEnabled;
              calciteSwitch.addEventListener('calciteSwitchChange', () => {
                this.selfEnabled = calciteSwitch.checked;
              });
            }}
          ></calcite-switch>
        </calcite-label>
      </calcite-block>
    );
  }

  render(): tsx.JSX.Element {
    const { _layers } = this;

    return (
      <div class={CSS.base}>
        {this.createSnappingOptionsBlock()}
        <calcite-block heading="Snapping layers" collapsible="">
          {_layers.toArray()}
        </calcite-block>
      </div>
    );
  }
}
