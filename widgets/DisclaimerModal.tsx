/**
 * Simple info widget for displaying text.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import Cookies from 'js-cookie';

const COOKIE_NAME = 'cov_disclaimer_widget_accepted';
const COOKIE_VALUE = 'accepted';

// class export
@subclass('cov.widgets.DisclaimerModal')
export default class DisclaimerModal extends Widget {
  @property()
  title = 'Disclaimer';

  @property()
  text = `The purpose of this application is to support City business. Any information herein is for reference only. The City of Vernonia makes every effort to keep this information current and accurate. However, the City is not responsible for errors, misuse, omissions, or misinterpretations. There are no warranties, expressed or implied, including the warranty of merchantability or fitness for a particular purpose, accompanying this application.`;

  @property()
  container = document.createElement('div');

  @property()
  private _active = true;

  @property()
  private _checkbox!: HTMLCalciteCheckboxElement;

  constructor(properties?: cov.DisclaimerModalProperties) {
    super(properties);
    document.body.append(this.container);
  }

  /**
   * Check if disclaimer had been previously accepted.
   * @returns boolean
   */
  static isAccepted(): boolean {
    const cookie = Cookies.get(COOKIE_NAME);
    return cookie && cookie === COOKIE_VALUE ? true : false;
  }

  render(): tsx.JSX.Element {
    const { title, text, _active } = this;

    return (
      <div>
        <calcite-modal
          active={_active}
          width="s"
          scale="s"
          disable-escape=""
          disable-close-button=""
          disable-outside-close=""
        >
          <h3 slot="header">{title}</h3>
          <div slot="content">{text}</div>
          <calcite-label slot="back" layout="inline" alignment="end">
            <calcite-checkbox afterCreate={(checkbox: HTMLCalciteCheckboxElement) => {
              this._checkbox = checkbox;
            }}></calcite-checkbox>
            Don't show me this again
          </calcite-label>
          <calcite-button slot="primary" width="full" onclick={this._accept.bind(this)}>
            Accept
          </calcite-button>
        </calcite-modal>
      </div>
    );
  }

  private _accept(): void {
    if (this._checkbox.checked) {
      Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: 30 });
    }
    this._active = false;
    setTimeout(() => {
      this.destroy();
    }, 2000);
  }
}
