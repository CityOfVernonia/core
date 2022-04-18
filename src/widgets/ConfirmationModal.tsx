import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const DEFAULTS = {
  width: 300,
  title: 'Confirm',
  message: 'Are you awesome?',
  confirm: (): void => {
    alert('You are awesome!');
  },
};

/**
 * Confirmation modal for confirming actions by the user.
 */
@subclass('cov.widgets.ConfirmationModal')
export default class ConfirmationModal extends Widget {
  @property()
  protected active = false;

  protected width: 's' | 'm' | 'l' | number = DEFAULTS.width;

  protected title = DEFAULTS.title;

  protected message = DEFAULTS.message;

  protected confirm = DEFAULTS.confirm;

  show(params: { width?: 's' | 'm' | 'l' | number; title?: string; message?: string; confirm?: () => void }): void {
    // set properties
    const { width, title, message, confirm } = params;
    this.width = width || this.width;
    this.title = title || this.title;
    this.message = message || this.message;
    this.confirm = confirm || this.confirm;
    // open modal
    this.active = true;
  }

  private _confirm(): void {
    // call confirm function
    this.confirm();
    // close modal
    this.active = false;
    // reset properties
    const { width, title, message, confirm } = DEFAULTS;
    this.width = width;
    this.title = title;
    this.message = message;
    this.confirm = confirm;
  }

  render(): tsx.JSX.Element {
    const { active, width, title, message } = this;
    return (
      <calcite-modal active={active} width={width} disable-close-button="" disable-escape="" disable-outside-close="">
        <div slot="header">{title}</div>
        <div slot="content">{message}</div>
        <calcite-button slot="primary" onclick={this._confirm.bind(this)}>
          Confirm
        </calcite-button>
        <calcite-button
          slot="secondary"
          appearance="outline"
          onclick={(): void => {
            this.active = false;
          }}
        >
          Cancel
        </calcite-button>
      </calcite-modal>
    );
  }
}
