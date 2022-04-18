import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const DEFAULTS = {
  width: 300,
  title: 'Message',
  message: 'Are you awesome!',
};

/**
 * Message modal to inform the user user.
 */
@subclass('cov.widgets.MessageModal')
export default class MessageModal extends Widget {
  @property()
  protected active = false;

  protected width: 's' | 'm' | 'l' | number = DEFAULTS.width;

  protected title = DEFAULTS.title;

  protected message = DEFAULTS.message;

  show(params: { width?: 's' | 'm' | 'l' | number; title?: string; message?: string }): void {
    // set properties
    const { width, title, message } = params;
    this.width = width || this.width;
    this.title = title || this.title;
    this.message = message || this.message;
    // open modal
    this.active = true;
  }

  render(): tsx.JSX.Element {
    const { active, width, title, message } = this;
    return (
      <calcite-modal active={active} width={width} disable-close-button="" disable-escape="" disable-outside-close="">
        <div slot="header">{title}</div>
        <div slot="content">{message}</div>
        <calcite-button
          slot="primary"
          onclick={(): void => {
            this.active = false;
          }}
        >
          OK
        </calcite-button>
      </calcite-modal>
    );
  }
}
