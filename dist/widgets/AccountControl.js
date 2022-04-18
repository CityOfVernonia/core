import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const CSS = {
    base: 'cov-account-control',
    info: 'cov-account-control--info',
    links: 'cov-account-control--links',
};
/**
 * Account control widget.
 */
let AccountControl = class AccountControl extends Widget {
    constructor(properties) {
        super(properties);
    }
    render() {
        const { oAuth } = this;
        return oAuth.signedIn ? (tsx("div", { class: CSS.base },
            tsx("div", { class: CSS.info },
                tsx("calcite-avatar", { scale: "l", username: oAuth.username, "full-name": oAuth.name, thumbnail: oAuth.user && oAuth.user.thumbnailUrl ? oAuth.user.thumbnailUrl : '' }),
                tsx("div", null,
                    tsx("div", null, oAuth.name),
                    tsx("div", null, oAuth.username))),
            tsx("div", { class: CSS.links },
                tsx("calcite-link", { href: `${oAuth.portal.url}/home/content.html`, target: "_blank" }, "My Content"),
                tsx("calcite-link", { href: `${oAuth.portal.url}/home/user.html`, target: "_blank" }, "My Profile")),
            tsx("calcite-button", { width: "full", appearance: "outline", "icon-start": "sign-out", onclick: oAuth.signOut.bind(oAuth) }, "Sign Out"))) : (tsx("div", { class: CSS.base },
            tsx("calcite-button", { width: "full", onclick: oAuth.signIn.bind(oAuth) }, "Sign In")));
    }
};
AccountControl = __decorate([
    subclass('cov.widgets.AccountControl')
], AccountControl);
export default AccountControl;
