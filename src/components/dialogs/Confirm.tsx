import esri = __esri;

export interface ConfirmOptions {
  /**
   * Modal content.
   */
  content?: string;
  /**
   * Modal header.
   */
  heading?: string;
  /**
   * Modal kind.
   */
  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
  /**
   * Ok button text.
   * @default 'Ok'
   */
  okText?: string;
  /**
   * Ok button danger kind.
   * @default false
   */
  okButtonDanger?: boolean;
  /**
   * Cancel button text.
   * @default 'Cancel'
   */
  cancelText?: string;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A confirm modal for confirming.
 */
@subclass('cov.components.dialogs.Confirm')
export default class Confirm extends Widget {
  container = document.createElement('calcite-dialog');

  constructor(properties?: esri.WidgetProperties & ConfirmOptions) {
    super(properties);
    document.body.append(this.container);
  }

  content = 'Proceed to be awesome?';

  heading = 'Confirm';

  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';

  okText = 'Ok';

  okButtonDanger = false;

  cancelText = 'Cancel';

  showConfirm(options?: ConfirmOptions) {
    const { container } = this;
    if (options) {
      const { content, heading, kind, okText, okButtonDanger, cancelText } = options;
      if (content) this.content = content;
      if (heading) this.heading = heading;
      if (kind) this.kind = kind;
      if (okText) this.okText = okText;
      if (okButtonDanger) this.okButtonDanger = okButtonDanger;
      if (cancelText) this.cancelText = cancelText;
      this.renderNow();
    }
    container.open = true;
  }

  render(): tsx.JSX.Element {
    const { container, content, heading, kind, okText, okButtonDanger, cancelText } = this;
    return (
      <calcite-dialog
        close-disabled=""
        escape-disabled=""
        heading={heading}
        kind={kind ? kind : null}
        modal=""
        outside-close-disabled=""
        width-scale="s"
      >
        {content}
        <calcite-button
          appearance="outline"
          slot="footer-end"
          onclick={(): void => {
            container.open = false;
            this.emit('confirmed', false);
          }}
        >
          {cancelText}
        </calcite-button>
        <calcite-button
          kind={okButtonDanger ? 'danger' : ''}
          slot="footer-end"
          onclick={(): void => {
            container.open = false;
            this.emit('confirmed', true);
          }}
        >
          {okText}
        </calcite-button>
      </calcite-dialog>
    );
  }
}
