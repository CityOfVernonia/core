import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.components.TestShellPanel')
export default class TestShellPanel extends Widget {
  render(): tsx.JSX.Element {
    return (
      <calcite-shell-panel>
        <calcite-action-bar slot="action-bar">
          <calcite-action active icon="home" text="Home"></calcite-action>
        </calcite-action-bar>
        <calcite-panel heading="Home" style="--calcite-panel-space: 0.75rem;">
          <calcite-notice icon="home" open style="width: 100%;">
            <div slot="title">Home</div>
            <div slot="message">Home all the way down.</div>
          </calcite-notice>
        </calcite-panel>
      </calcite-shell-panel>
    );
  }
}
