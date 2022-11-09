import { __decorate } from "tslib";
//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Modal widget for viewing and downloading images.
 */
let PhotoModal = class PhotoModal extends Widget {
    constructor() {
        super();
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('calcite-modal');
        //////////////////////////////////////
        // Variables
        //////////////////////////////////////
        this._fileName = '';
        this._url = '';
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
        const a = Object.assign(document.createElement('a'), {
            href: url,
            download: fileName,
            style: 'display: none;',
        });
        document.body.append(a);
        a.click();
        document.body.removeChild(a);
    }
    /**
     * Show image in modal.
     * @param fileName File name of image
     * @param url Data url
     */
    show(fileName, url) {
        this._fileName = fileName;
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
        const { _fileName, _url } = this;
        return (tsx("calcite-modal", null,
            tsx("div", { slot: "header" }, _fileName),
            tsx("div", { slot: "content" },
                tsx("img", { style: "width: 100%;", src: _url })),
            tsx("calcite-button", { appearance: "outline", slot: "secondary", width: "full", onclick: this.download.bind(this, _fileName, _url) }, "Download"),
            tsx("calcite-button", { slot: "primary", width: "full", onclick: this._close.bind(this) }, "Close")));
    }
};
__decorate([
    property()
], PhotoModal.prototype, "_fileName", void 0);
__decorate([
    property()
], PhotoModal.prototype, "_url", void 0);
PhotoModal = __decorate([
    subclass('cov.modals.PhotoModal')
], PhotoModal);
export default PhotoModal;
