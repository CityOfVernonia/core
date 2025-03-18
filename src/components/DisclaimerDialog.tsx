//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Options for configuring Disclaimer dialog component.
 */
export interface DisclaimerOptions {
  /**
   * Disclaimer modal text.
   * @default 'The purpose of this application...'
   */
  disclaimer?: string;
  /**
   * Disclaimer modal title.
   * @default 'Disclaimer'
   */
  title?: string;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Cookies from 'js-cookie';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const DISCLAIMER_COOKIE_NAME = '_disclaimer_accepted';

const DISCLAIMER_COOKIE_VALUE = 'accepted';

const DISCLAIMER_TEXT = `The purpose of this application is to support City business. Any information herein is for reference only. 
The City of Vernonia makes every effort to keep this information current and accurate. However, the City is not responsible for 
errors, misuse, omissions, or misinterpretations. There are no warranties, expressed or implied, including the warranty of 
merchantability or fitness for a particular purpose, accompanying this application.`;

/**
 * Disclaimer dialog component.
 */
@subclass('cov.components.DisclaimerDialog')
export default class DisclaimerDialog extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties & DisclaimerOptions) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  //////////////////////////////////////
  // Static methods
  //////////////////////////////////////
  /**
   * Return default disclaimer text.
   * @returns string
   */
  static getDisclaimer(): string {
    return DISCLAIMER_TEXT;
  }

  /**
   * Check if disclaimer had been previously accepted.
   * @returns boolean
   */
  static isAccepted(): boolean {
    const cookie = Cookies.get(DISCLAIMER_COOKIE_NAME);

    return cookie && cookie === DISCLAIMER_COOKIE_VALUE ? true : false;
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  disclaimer = DISCLAIMER_TEXT;

  title = 'Disclaimer';

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Handle accept click and set cookie.
   */
  private _accept(): void {
    const { container } = this;

    const checkbox = container.querySelector('calcite-checkbox') as HTMLCalciteCheckboxElement;

    if (checkbox.checked) Cookies.set(DISCLAIMER_COOKIE_NAME, DISCLAIMER_COOKIE_VALUE, { expires: 30 });

    container.open = false;

    setTimeout(() => {
      this.destroy();
    }, 2000);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { title, disclaimer } = this;
    return (
      <calcite-dialog
        open
        close-disabled=""
        escape-disabled=""
        heading={title}
        modal
        outside-close-disabled=""
        width-scale="s"
      >
        <div
          afterCreate={(div: HTMLDivElement): void => {
            div.innerHTML = disclaimer;
          }}
        ></div>
        <calcite-label slot="footer-start" layout="inline" alignment="end">
          <calcite-checkbox></calcite-checkbox>
          Don't show me this again
        </calcite-label>
        <calcite-button slot="footer-end" onclick={this._accept.bind(this)}>
          Accept
        </calcite-button>
      </calcite-dialog>
    );
  }
}
