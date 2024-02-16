import esri = __esri;

import type { AlertModalOptions } from './modal';

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal widget for altering.
 */
@subclass('cov.modals.AlertModal')
export default class AlertModal extends Widget {
  container = document.createElement('calcite-modal');

  constructor(properties?: esri.WidgetProperties & AlertModalOptions) {
    super(properties);
    const { container } = this;
    document.body.append(container);
    container.addEventListener('calciteModalClose', (): void => {
      this.emit('alerted');
    });
  }

  content = 'His name was Bruce McNair.';

  header = 'Alert';

  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';

  primaryButtonText = 'Ok';

  showAlert(options?: AlertModalOptions) {
    const { container } = this;
    if (options) {
      const { content, header, kind, primaryButtonText } = options;
      this.content = content;
      this.header = header;
      if (kind) this.kind = kind;
      if (primaryButtonText) this.primaryButtonText = primaryButtonText;
      this.renderNow();
    }
    container.open = true;
  }

  render(): tsx.JSX.Element {
    const { container, content, header, kind, primaryButtonText } = this;
    return (
      <calcite-modal kind={kind ? kind : null} width-scale="s">
        <div slot="header">{header}</div>
        <div slot="content">{content}</div>
        <calcite-button
          slot="primary"
          width="full"
          onclick={(): void => {
            container.open = false;
          }}
        >
          {primaryButtonText}
        </calcite-button>
      </calcite-modal>
    );
  }
}
