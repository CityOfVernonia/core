import { __decorate } from "tslib";
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
let Disclaimer = class Disclaimer extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        this.title = 'Disclaimer';
        this.text = DISCLAIMER_TEXT;
        this.enableDontShow = true;
        this._active = true;
        document.body.append(this.container);
    }
    /**
     * Check if disclaimer had been previously accepted.
     * @returns boolean
     */
    static isAccepted() {
        const cookie = Cookies.get(COOKIE_NAME);
        return cookie && cookie === COOKIE_VALUE ? true : false;
    }
    /**
     * Get default disclaimer text.
     * @returns string
     */
    static getDefaultDisclaimer() {
        return DISCLAIMER_TEXT;
    }
    render() {
        const { title, text, enableDontShow, _active } = this;
        return (tsx("calcite-modal", { active: _active, width: "s", scale: "s", "disable-escape": "", "disable-close-button": "", "disable-outside-close": "" },
            tsx("h3", { slot: "header" }, title),
            tsx("div", { slot: "content", afterCreate: (div) => {
                    div.innerHTML = text;
                } }),
            enableDontShow ? (tsx("calcite-label", { slot: "back", layout: "inline", alignment: "end" },
                tsx("calcite-checkbox", { afterCreate: (checkbox) => {
                        this._checkbox = checkbox;
                    } }),
                "Don't show me this again")) : null,
            tsx("calcite-button", { slot: "primary", width: "full", onclick: this._accept.bind(this) }, "Accept")));
    }
    _accept() {
        const { _checkbox } = this;
        if (_checkbox && _checkbox.checked) {
            Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: 30 });
        }
        this._active = false;
        setTimeout(() => {
            this.destroy();
        }, 2000);
    }
};
Disclaimer = __decorate([
    subclass('cov.widgets.Disclaimer')
], Disclaimer);
export default Disclaimer;
