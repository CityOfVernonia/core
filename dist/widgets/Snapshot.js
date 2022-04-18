import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
const CSS = {
    // styles
    content: 'padding: 0.75rem;',
    button: 'margin: 0.5rem 0 0.25rem;',
    // classes
    result: 'snapshot-widget--result',
    resultView: 'snapshot-widget--result--view',
};
let KEY = 0;
let Snapshot = class Snapshot extends Widget {
    constructor(properties) {
        super(properties);
        this.title = 'Map Snapshot';
        this._photoModal = new PhotoModal();
        this._snapshotResults = new Collection();
        this._title = 'Map Snapshot';
        this._format = 'jpg';
    }
    _snapshot() {
        const { view, title, _title, _format: format, _snapshotResults, _photoModal } = this;
        view
            .takeScreenshot({
            format,
        })
            .then((screenshot) => {
            let titleText = _title || title;
            titleText = titleText.replace(' ', '_');
            const data = screenshot.data;
            // canvas and context
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = data.width;
            canvas.height = data.height;
            // add image
            context.putImageData(data, 0, 0);
            // add text
            context.font = 'bold 20px Arial';
            context.strokeStyle = '#fff';
            context.strokeText(`${titleText}`, 5, data.height - 5, data.width - 5);
            context.font = 'bold 20px Arial';
            context.fillStyle = '#000';
            context.fillText(`${titleText}`, 5, data.height - 5, data.width - 5);
            // new image
            const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
            _snapshotResults.add(tsx("div", { key: KEY++, class: CSS.result, style: `background-image: url(${dataUrl});` },
                tsx("div", { class: CSS.resultView, title: "View image", afterCreate: (div) => {
                        div.addEventListener('click', _photoModal.show.bind(_photoModal, `${titleText}.${format}`, dataUrl));
                    } }),
                tsx("calcite-action", { title: "Download image", appearance: "transparent", icon: "download", afterCreate: (action) => {
                        action.addEventListener('click', this._download.bind(this, dataUrl, titleText));
                    } })));
        });
    }
    _download(url, fileName) {
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', fileName);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    render() {
        const { _snapshotResults } = this;
        const results = _snapshotResults.toArray();
        return (tsx("calcite-panel", { heading: "Snapshot" },
            tsx("div", { style: CSS.content },
                tsx("calcite-label", null,
                    "Title",
                    tsx("calcite-input", { type: "text", afterCreate: (input) => {
                            input.value = this.title;
                            input.addEventListener('calciteInputInput', () => {
                                this._title = input.value;
                            });
                        } })),
                tsx("calcite-label", null,
                    "Format",
                    tsx("calcite-radio-group", { afterCreate: (radioGroup) => {
                            radioGroup.addEventListener('calciteRadioGroupChange', () => {
                                this._format = radioGroup.selectedItem.value;
                            });
                        } },
                        tsx("calcite-radio-group-item", { value: "jpg", checked: "" }, "JPG"),
                        tsx("calcite-radio-group-item", { value: "png" }, "PNG"))),
                tsx("calcite-button", { style: CSS.button, width: "full", afterCreate: (button) => {
                        button.addEventListener('click', this._snapshot.bind(this));
                    } }, "Snapshot"),
                results)));
    }
};
Snapshot = __decorate([
    subclass('Snapshot')
], Snapshot);
export default Snapshot;
let PhotoModal = class PhotoModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        this._title = 'Photo';
        this._url = '';
        document.body.append(this.container);
    }
    show(title, url) {
        const { _modal } = this;
        this._title = title;
        this._url = url;
        _modal.active = true;
    }
    render() {
        const { _title, _url } = this;
        return (tsx("calcite-modal", { afterCreate: storeNode.bind(this), "data-node-ref": "_modal" },
            tsx("div", { slot: "header" }, _title),
            tsx("div", { slot: "content" },
                tsx("img", { style: "width: 100%;", src: _url })),
            tsx("calcite-button", { slot: "primary", afterCreate: (calciteButton) => {
                    calciteButton.addEventListener('click', () => {
                        this._modal.active = false;
                    });
                } }, "Close")));
    }
};
__decorate([
    property()
], PhotoModal.prototype, "_title", void 0);
__decorate([
    property()
], PhotoModal.prototype, "_url", void 0);
PhotoModal = __decorate([
    subclass('Snapshot.PhotoModal')
], PhotoModal);
