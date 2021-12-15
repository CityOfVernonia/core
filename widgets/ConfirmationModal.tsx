/**
 * cov/widgets/ConfirmationModal
 * A modal widget for confirming user actions.
 */

import cov = __cov;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const CONFIRMATION_DETAIL = {
  title: 'Confirm',
  message: 'Are you an awesome person?',
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
};

@subclass('cov.widgets.ConfirmationModal')
export default class ConfirmationModal extends Widget {
  @property()
  container = document.createElement('calcite-modal');

  @property()
  private _active = false;

  @property()
  private _detail: cov.ConfirmationModalDetail = CONFIRMATION_DETAIL;

  constructor(properties?: esri.WidgetProperties) {
    super(properties);
    // appends its own container
    document.body.append(this.container);
  }

  /**
   * Set modal properties and show modal.
   * @param detail
   */
  show(detail?: cov.ConfirmationModalDetail): void {
    this._detail = {
      ...CONFIRMATION_DETAIL,
      ...(detail || {}),
    };
    this._active = true;
  }

  private _confirmation(confirmation: boolean): void {
    if (confirmation && this._detail.confirm && typeof this._detail.confirm === 'function') {
      this._detail.confirm();
    } else if (confirmation && this._detail.cancel && typeof this._detail.cancel === 'function') {
      this._detail.cancel();
    }

    this.emit('confirmation', {
      confirmation,
    });

    this._active = false;
  }

  render(): tsx.JSX.Element {
    const {
      id,
      _active,
      _detail: { title, message, confirmButtonText, cancelButtonText },
    } = this;

    const _id = `confirmation_modal_${id}`;

    return (
      <calcite-modal
        aria-labelledby={_id}
        active={_active}
        width="small"
        disable-close-button=""
        disable-escape=""
        disable-outside-close=""
      >
        <div slot="header" id={_id}>
          {title}
        </div>
        <div slot="content">{message}</div>
        <calcite-button slot="primary" width="full" onclick={this._confirmation.bind(this, true)}>
          {confirmButtonText}
        </calcite-button>
        <calcite-button
          slot="secondary"
          width="full"
          appearance="outline"
          onclick={this._confirmation.bind(this, false)}
        >
          {cancelButtonText}
        </calcite-button>
      </calcite-modal>
    );
  }
}
