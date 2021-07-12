/**
 * A modal for selecting which layers have snapping enabled.
 */

import esri = __esri;

export interface SnappingOptionsModalProperties extends esri.WidgetProperties {
  /**
   * Snapping options.
   */
  snappingOptions?: esri.SnappingOptions;
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { whenOnce, watch } from '@arcgis/core/core/watchUtils';

import './SnappingOptionsModal/styles/SnappingOptionsModal.scss';
const CSS = {
  toggles: 'cov-snapping-options-modal--toggles',
};

let KEY = 0;

@subclass('cov.widgets.SnappingOptionsModal')
export default class SnappingOptionsModal extends Widget {
  @property()
  snappingOptions!: esri.SnappingOptions;

  @property({
    aliasOf: 'snappingOptions.featureSources',
  })
  featureSources!: esri.Collection<esri.FeatureSnappingLayerSource>;

  @property()
  container = document.createElement('div');

  @property()
  private _active = false;

  @property()
  private _layerSnappingToggles: Collection<{
    element: tsx.JSX.Element;
  }> = new Collection();

  constructor(properties?: SnappingOptionsModalProperties) {
    super(properties);

    document.body.append(this.container);

    whenOnce(this, 'featureSources', this._renderLayerSnapping.bind(this));
  }

  show(): void {
    this._active = true;
  }

  render(): tsx.JSX.Element {
    const { _active, _layerSnappingToggles } = this;

    return (
      <div>
        <calcite-modal scale="s" width="s" active={_active}>
          <h3 slot="header">Snapping Options</h3>
          <div slot="content">
            <div class={CSS.toggles}>
              {_layerSnappingToggles.toArray().map((_switch: { element: tsx.JSX.Element }): tsx.JSX.Element => {
                return _switch.element;
              })}
            </div>
          </div>
          <calcite-button
            slot="primary"
            scale="s"
            onclick={(): void => {
              this._active = false;
            }}
          >
            Done
          </calcite-button>
        </calcite-modal>
      </div>
    );
  }

  private _renderLayerSnapping(featureSources: esri.Collection<esri.FeatureSnappingLayerSource>): void {
    const { _layerSnappingToggles } = this;
    featureSources.forEach((featureSource: esri.FeatureSnappingLayerSource): void => {
      const { layer, enabled } = featureSource;
      if (layer.title) {
        _layerSnappingToggles.add({
          element: (
            <calcite-label key={KEY++} scale="s" layout="inline">
              <calcite-switch
                scale="s"
                switched={enabled}
                bind={this}
                afterCreate={(element: HTMLCalciteSwitchElement) => {
                  this._switchEvents(element, featureSource);
                }}
              ></calcite-switch>
              {layer.title}
            </calcite-label>
          ),
        });
      }
    });
  }

  private _switchEvents(element: HTMLCalciteSwitchElement, featureSource: esri.FeatureSnappingLayerSource) {
    element.addEventListener(
      'calciteSwitchChange',
      (event: any) => (featureSource.enabled = event.detail.switched as boolean),
    );
    watch(featureSource, 'enabled', (value: boolean) => (element.switched = value));
  }
}
