import esri = __esri;

/**
 * Options for configuring disclaimer.
 */
export interface DisclaimerOptions extends Object {
  /**
   * Modal title.
   * @default 'Disclaimer'
   */
  title?: string;

  /**
   * Disclaimer text or HTML.
   * @default 'The purpose of this application is to support...'
   */
  text?: string;

  /**
   * Enable `Don't show me this again` checkbox.
   * @default true
   */
  enableDontShow?: boolean;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Cookies from 'js-cookie';

// disclaimer constants
const COOKIE_NAME = 'application_layout_disclaimer_accepted';

const COOKIE_VALUE = 'accepted';

const DISCLAIMER_TEXT = `The purpose of this application is to support City business. Any information herein is for reference only. The City of Vernonia makes every effort to keep this information current and accurate. However, the City is not responsible for errors, misuse, omissions, or misinterpretations. There are no warranties, expressed or implied, including the warranty of merchantability or fitness for a particular purpose, accompanying this application.`;

/**
 * Disclaimer widget.
 */
@subclass('cov.widgets.Disclaimer')
export default class Disclaimer extends Widget {
  constructor(properties?: esri.WidgetProperties & DisclaimerOptions) {
    super(properties);
    document.body.append(this.container);
  }

  container = document.createElement('calcite-modal');

  title = 'Disclaimer';

  text = DISCLAIMER_TEXT;

  enableDontShow = true;

  private _active = true;

  private _checkbox!: HTMLCalciteCheckboxElement;

  /**
   * Check if disclaimer had been previously accepted.
   * @returns boolean
   */
  static isAccepted(): boolean {
    const cookie = Cookies.get(COOKIE_NAME);
    return cookie && cookie === COOKIE_VALUE ? true : false;
  }

  /**
   * Get default disclaimer text.
   * @returns string
   */
  static getDefaultDisclaimer(): string {
    return DISCLAIMER_TEXT;
  }

  render(): tsx.JSX.Element {
    const { title, text, enableDontShow, _active } = this;

    return (
      <calcite-modal
        active={_active}
        width="s"
        scale="s"
        disable-escape=""
        disable-close-button=""
        disable-outside-close=""
      >
        <h3 slot="header">{title}</h3>
        <div
          slot="content"
          afterCreate={(div: HTMLDivElement) => {
            div.innerHTML = text;
          }}
        ></div>
        {enableDontShow ? (
          <calcite-label slot="back" layout="inline" alignment="end">
            <calcite-checkbox
              afterCreate={(checkbox: HTMLCalciteCheckboxElement) => {
                this._checkbox = checkbox;
              }}
            ></calcite-checkbox>
            Don't show me this again
          </calcite-label>
        ) : null}
        <calcite-button slot="primary" width="full" onclick={this._accept.bind(this)}>
          Accept
        </calcite-button>
      </calcite-modal>
    );
  }

  private _accept(): void {
    const { _checkbox } = this;
    if (_checkbox && _checkbox.checked) {
      Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: 30 });
    }
    this._active = false;
    setTimeout(() => {
      this.destroy();
    }, 2000);
  }
}
