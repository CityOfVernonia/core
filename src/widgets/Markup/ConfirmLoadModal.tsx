import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.widgets.Markup.ConfirmLoadModal')
export default class ConfirmLoadModal extends Widget {
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
        outside-close-disabled=""
        style="--calcite-modal-width: 340px;"
      >
        <div slot="header">Load markup</div>
        <div slot="content">All current markup graphics will be deleted.</div>
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
