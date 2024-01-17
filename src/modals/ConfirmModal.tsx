import esri = __esri;

import type { ConfirmModalOptions } from './modal';

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal widget for confirming.
 */
@subclass('cov.modals.ConfirmModal')
export default class ConfirmModal extends Widget {
  container = document.createElement('calcite-modal');

  constructor(properties?: esri.WidgetProperties & ConfirmModalOptions) {
    super(properties);
    document.body.append(this.container);
  }

  content = 'Proceed to be awesome?';

  header = 'Confirm';

  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';

  primaryButtonText = 'Ok';

  secondaryButtonText = 'Cancel';

  showConfirm(options?: ConfirmModalOptions) {
    const { container } = this;
    if (options) {
      const { content, header, kind, primaryButtonText, secondaryButtonText } = options;
      this.content = content;
      this.header = header;
      if (kind) this.kind = kind;
      if (primaryButtonText) this.primaryButtonText = primaryButtonText;
      if (secondaryButtonText) this.secondaryButtonText = secondaryButtonText;
      this.renderNow();
    }
    container.open = true;
  }

  render(): tsx.JSX.Element {
    const { container, content, header, kind, primaryButtonText, secondaryButtonText } = this;
    return (
      <calcite-modal
        close-button-disabled=""
        escape-disabled=""
        kind={kind ? kind : null}
        outside-close-disabled=""
        width-scale="s"
      >
        <div slot="header">{header}</div>
        <div slot="content">{content}</div>
        <calcite-button
          slot="primary"
          width="full"
          onclick={(): void => {
            container.open = false;
            this.emit('confirmed', true);
          }}
        >
          {primaryButtonText}
        </calcite-button>
        <calcite-button
          appearance="outline"
          slot="secondary"
          width="full"
          onclick={(): void => {
            container.open = false;
            this.emit('confirmed', false);
          }}
        >
          {secondaryButtonText}
        </calcite-button>
      </calcite-modal>
    );
  }
}
