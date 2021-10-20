/**
 * Calcite alert widget.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';

// class export
@subclass('cov.widgets.Alert')
export default class Alert extends Widget {
  @property()
  container = document.createElement('calcite-alert');

  @property()
  subscribe = false;

  @property()
  message = 'SHOW_ALERT';

  @property()
  readonly alert!: HTMLCalciteAlertElement;

  @property()
  protected options: cov.AlertShowOptions = {
    message: '',
  };

  @property()
  protected stack: cov.AlertShowOptions[] = [];

  constructor(properties?: cov.AlertProperties) {
    super(properties);

    // append container
    document.body.append(this.container);
  }

  postInitialize(): void {
    const { subscribe, message } = this;

    // create pubsub subscription
    if (subscribe && message) {
      import('pubsub-js').then((PubSub) => {
        PubSub.subscribe(message, (_message: string, options: cov.AlertShowOptions) => {
          this.show(options);
        });
      });
    }
  }

  /**
   * Show alert.
   * @param options
   */
  show(options: cov.AlertShowOptions): void {
    const { alert, stack } = this;
    const { duration } = options;

    // push options to stack if active
    if (alert.active) {
      stack.push(options);
      return;
    }

    // set options and show alert
    this.options = options;
    alert.active = true;

    // hide alert
    setTimeout(() => {
      alert.active = false;
      // get next options from stack if exists
      if (stack.length) this.show(stack.shift() as cov.AlertShowOptions);
    }, duration || 3000);
  }

  render(): tsx.JSX.Element {
    const { title, message, color } = this.options;

    return (
      <calcite-alert color={color || 'blue'} afterCreate={storeNode.bind(this)} data-node-ref="alert">
        {title ? <div slot="title">{title}</div> : null}
        <div slot="message">{message}</div>
      </calcite-alert>
    );
  }
}
