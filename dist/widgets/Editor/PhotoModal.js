import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
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
    subclass('Editor.PhotoModal')
], PhotoModal);
export default PhotoModal;
