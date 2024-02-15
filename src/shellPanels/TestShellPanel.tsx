import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.shellPanels.TestShellPanel')
class TestShellPanel extends Widget {
  @property()
  private _active: 'layer' | 'map' | null = 'layer';

  render(): tsx.JSX.Element {
    const { _active } = this;
    return (
      <calcite-shell-panel>
        <calcite-action-bar slot="action-bar">
          <calcite-action-group>
            <calcite-action
              active={_active === 'layer'}
              text="Layer"
              icon="layer"
              onclick={(): void => {
                this._active = _active === 'layer' ? null : 'layer';
              }}
            ></calcite-action>
            <calcite-action
              active={_active === 'map'}
              text="Map"
              icon="map"
              onclick={(): void => {
                this._active = _active === 'map' ? null : 'map';
              }}
            ></calcite-action>
          </calcite-action-group>
        </calcite-action-bar>
        <calcite-panel hidden={_active !== 'layer'} heading="Layer">
          <calcite-notice open="" style="margin: 0.75rem;">
            <div slot="message">This is a very fine layer with a lot of valuable information.</div>
          </calcite-notice>
        </calcite-panel>
        <calcite-panel hidden={_active !== 'map'} heading="Map">
          <calcite-notice open="" style="margin: 0.75rem;">
            <div slot="message">A map is good for conveying geospatial information.</div>
          </calcite-notice>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }
}

export default TestShellPanel;
