import esri = __esri;

export interface AlertOptions {
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
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal dialog for altering.
 */
@subclass('cov.components.dialogs.Alert')
export default class Alert extends Widget {
  container = document.createElement('calcite-dialog');

  constructor(properties?: esri.WidgetProperties & AlertOptions) {
    super(properties);
    const { container } = this;
    document.body.append(container);
  }

  content = 'His name was Bruce McNair.';

  heading = 'Alert';

  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';

  okText = 'Ok';

  showAlert(options?: AlertOptions) {
    const { container } = this;
    if (options) {
      const { content, heading, kind, okText } = options;
      if (content) this.content = content;
      if (heading) this.heading = heading;
      if (kind) this.kind = kind;
      if (okText) this.okText = okText;
      this.renderNow();
    }
    container.open = true;
  }

  render(): tsx.JSX.Element {
    const { container, content, heading, kind, okText } = this;
    return (
      <calcite-dialog heading={heading} kind={kind ? kind : null} modal="" width-scale="s">
        {content}
        <calcite-button
          slot="footer-end"
          onclick={(): void => {
            container.open = false;
            this.emit('alerted');
          }}
        >
          {okText}
        </calcite-button>
      </calcite-dialog>
    );
  }
}
