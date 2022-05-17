import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const CSS = {
    base: 'cov-share',
};
/**
 * A widget to share an app via facebook and twitter.
 */
let Share = class Share extends Widget {
    postInitialize() {
        var _a;
        const id = 'facebook-jssdk';
        const fjs = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        if (document.getElementById(id))
            return;
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0';
        (_a = fjs.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(js, fjs);
    }
    render() {
        return (tsx("div", { class: CSS.base },
            tsx("div", { id: "fb-root" }),
            tsx("div", { class: "fb-share-button", "data-href": window.location.href, "data-layout": "button_count" }),
            tsx("a", { href: "https://twitter.com/share", class: "twitter-share-button" }, "Tweet"),
            tsx("script", { async: true, src: "//platform.twitter.com/widgets.js", charset: "utf-8" })));
    }
};
Share = __decorate([
    subclass('cov.widgets.Share')
], Share);
export default Share;
