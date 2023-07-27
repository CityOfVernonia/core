import { __awaiter, __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
const URL_REG_EXP = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/);
/**
 * Modal widget for viewing and downloading images.
 */
let PhotoModal = class PhotoModal extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('calcite-modal');
        //////////////////////////////////////
        // Properties
        //////////////////////////////////////
        this.showDownload = true;
        //////////////////////////////////////
        // Variables
        //////////////////////////////////////
        this._fileName = '';
        this._url = '';
        this._loading = false;
        document.body.append(this.container);
    }
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    /**
     * Download an image (or any data url file).
     * @param fileName File name to be downloaded
     * @param url Data url
     */
    download(fileName, url) {
        return __awaiter(this, void 0, void 0, function* () {
            let _url = url;
            if (url.match(URL_REG_EXP)) {
                const blob = yield (yield fetch(url)).blob();
                _url = URL.createObjectURL(blob);
            }
            const a = Object.assign(document.createElement('a'), {
                href: _url,
                download: fileName,
                style: 'display: none;',
            });
            document.body.append(a);
            a.click();
            document.body.removeChild(a);
        });
    }
    /**
     * Show image in modal.
     * @param fileName File name of image
     * @param url Data url
     */
    show(fileName, url) {
        this._fileName = fileName;
        if (this._url !== url)
            this._loading = true;
        this._url = url;
        this.container.open = true;
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    /**
     * Close modal.
     */
    _close() {
        this.container.open = false;
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { showDownload, _fileName, _url, _loading } = this;
        return (tsx("calcite-modal", { style: "--calcite-modal-content-padding: 0;" },
            tsx("div", { slot: "header" }, _fileName),
            tsx("div", { slot: "content" },
                tsx("calcite-scrim", { hidden: !_loading, loading: "" }),
                tsx("img", { style: "width: 100%; min-height: 300px;", src: _url, afterCreate: (img) => {
                        img.addEventListener('load', () => {
                            this._loading = false;
                        });
                    } })),
            showDownload ? (tsx("calcite-button", { appearance: "outline", slot: "secondary", width: "full", onclick: this.download.bind(this, _fileName, _url) }, "Download")) : null,
            tsx("calcite-button", { slot: "primary", width: "full", onclick: this._close.bind(this) }, "Close")));
    }
};
__decorate([
    property()
], PhotoModal.prototype, "_fileName", void 0);
__decorate([
    property()
], PhotoModal.prototype, "_url", void 0);
__decorate([
    property()
], PhotoModal.prototype, "_loading", void 0);
PhotoModal = __decorate([
    subclass('cov.modals.PhotoModal')
], PhotoModal);
export default PhotoModal;
