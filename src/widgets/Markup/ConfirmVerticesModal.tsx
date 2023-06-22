import esri = __esri;
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.widgets.Markup.ConfirmVerticesModal')
export default class ConfirmVerticesModal extends Widget {
  container = document.createElement('calcite-modal');
  constructor(properties?: esri.WidgetProperties) {
    super(properties);
    document.body.append(this.container);
  }
  render(): tsx.JSX.Element {
    return (
      <calcite-modal
        close-button-disabled=""
        escape-disabled=""
        focus-trap-disabled=""
        outside-close-disabled=""
        width="s"
      >
        <div slot="header">Warning</div>
        <div slot="content">
          The selected geometry has a large number of vertices. Adding the vertices may result in the application
          becoming unstable or crashing. Continue with adding vertices?
        </div>
        <calcite-button
          slot="secondary"
          width="full"
          appearance="outline"
          onclick={(): void => {
            this.emit('confirmed', false);
            this.container.open = false;
          }}
        >
          Cancel
        </calcite-button>
        <calcite-button
          slot="primary"
          width="full"
          onclick={(): void => {
            this.emit('confirmed', true);
            this.container.open = false;
          }}
        >
          Ok
        </calcite-button>
      </calcite-modal>
    );
  }
}
