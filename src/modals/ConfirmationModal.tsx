import esri = __esri;

interface ConfirmationModalProperties {
  /**
   * Modal width.
   * @default 's'
   */
  width?: 's' | 'm';
  /**
   * Modal kind.
   * @default ''
   */
  kind?: '' | 'danger' | 'warning';
  /**
   * Modal title.
   * @default 'Confirm'
   */
  title?: string;
  /**
   * Modal message.
   */
  message?: string;
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * Confirmation modal for confirming actions by the user.
 */
@subclass('cov.modals.ConfirmationModal')
export default class ConfirmationModal extends Widget {
  container = document.createElement('calcite-modal');

  constructor(properties?: esri.WidgetProperties & ConfirmationModalProperties) {
    super(properties);
    document.body.append(this.container);
  }

  @property()
  width: ConfirmationModalProperties['width'] = 's';

  @property()
  kind: ConfirmationModalProperties['kind'] = '';

  @property()
  title = 'Confirm';

  @property()
  message = 'Are you awesome?';

  show(): void {
    const { container } = this;
    container.open = true;
  }

  private _confirmed(confirmed: boolean): void {
    const { container } = this;
    this.emit('confirmed', confirmed);
    container.open = false;
  }

  render(): tsx.JSX.Element {
    const { width, kind, title, message } = this;
    return (
      <calcite-modal disable-close-button="" disable-escape="" disable-outside-close="" kind={kind} width={width}>
        <div slot="header">{title}</div>
        <div slot="content">{message}</div>
        <calcite-button slot="primary" onclick={this._confirmed.bind(this, true)}>
          Ok
        </calcite-button>
        <calcite-button slot="secondary" appearance="outline" onclick={this._confirmed.bind(this, false)}>
          Cancel
        </calcite-button>
      </calcite-modal>
    );
  }
}
