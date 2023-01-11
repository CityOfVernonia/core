import { __awaiter, __decorate } from "tslib";
import { watch } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import request from '@arcgis/core/request';
import PhotoModal from './PhotoModal';
import DeleteModal from './DeleteModal';
const CSS = {
    base: 'cov-editor__photo-attachments',
    attachment: 'cov-editor__photo-attachments--attachment',
    modalImage: 'cov-editor__photo-attachments--modal-image',
};
let KEY = 0;
let PhotoAttachments = class PhotoAttachments extends Widget {
    constructor(properties) {
        super(properties);
        this.addEnabled = true;
        this.deleteEnabled = true;
        this.feature = null;
        this._attachments = new Collection();
        this._photoModal = new PhotoModal();
        this._deleteModal = new DeleteModal();
    }
    postInitialize() {
        watch(this, 'feature', (feature) => {
            // no scoped callback
            this._queryAttachments(feature);
        });
    }
    _queryAttachments(feature, attachmentObjectId) {
        const { layer, _attachments } = this;
        if (!attachmentObjectId)
            _attachments.removeAll();
        if (!feature || feature.layer !== layer)
            return;
        const objectId = feature.attributes[layer.objectIdField];
        layer
            .queryAttachments(Object.assign(Object.assign({ objectIds: [objectId] }, (attachmentObjectId
            ? {
                attachmentsWhere: `ATTACHMENTID = ${attachmentObjectId}`,
            }
            : {})), (layer.capabilities.attachment.supportsContentType === true ? { attachmentTypes: ['image/jpeg'] } : {})))
            .then((result) => {
            if (result[objectId] && result[objectId].length) {
                result[objectId].forEach((attachment) => {
                    this._createAttachment(attachment);
                });
            }
        })
            .catch((error) => {
            console.log(error);
        });
    }
    _createAttachment(attachment) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _attachments, _photoModal, _deleteModal } = this;
            const { contentType, id, name, url } = attachment;
            if (contentType !== 'image/jpeg')
                return;
            yield request(url, {
                responseType: 'blob',
            })
                .then((value) => {
                const imageUrl = URL.createObjectURL(value.data);
                const element = (tsx("div", { key: KEY++, class: CSS.attachment },
                    tsx("div", { style: `background-image: url(${imageUrl});`, title: `View ${name}`, afterCreate: (div) => {
                            div.addEventListener('click', () => {
                                _photoModal.show(name, imageUrl);
                            });
                        } }),
                    tsx("calcite-action", { title: "Download photo", appearance: "transparent", icon: "download", afterCreate: (calciteAction) => {
                            calciteAction.addEventListener('click', this._downloadAttachment.bind(this, imageUrl, name));
                        } }),
                    tsx("calcite-action", { title: "Delete photo", appearance: "transparent", icon: "trash", afterCreate: (calciteAction) => {
                            calciteAction.addEventListener('click', () => {
                                _deleteModal.show(this._deleteAttachment.bind(this, id));
                            });
                        } })));
                _attachments.add({
                    id,
                    name,
                    url,
                    imageUrl,
                    element,
                });
            })
                .catch();
        });
    }
    /**
     * Add attachment.
     * @param file
     */
    _addAttachment(file) {
        const { feature, layer, _button } = this;
        if (!feature || feature.layer !== layer)
            return;
        const fileName = `${layer.title.replaceAll(' ', '_')}_${feature.attributes[layer.objectIdField]}.jpg`;
        const formData = new FormData();
        formData.append('attachment', new File([file], fileName, {
            type: file.type,
            lastModified: file.lastModified,
        }));
        formData.append('f', 'json');
        layer
            .addAttachment(feature, formData)
            .then((result) => {
            _button.loading = false;
            if (result.error) {
                this._showNotice('Failed to add photo.');
            }
            else {
                this._queryAttachments(feature, result.objectId);
            }
        })
            .catch((error) => {
            console.log(error);
            _button.loading = false;
            this._showNotice('Failed to add photo.');
        });
    }
    /**
     * Delete attachment.
     * @param id
     */
    _deleteAttachment(id) {
        const { layer, feature, _attachments } = this;
        if (!feature)
            return;
        layer
            .deleteAttachments(feature, [id])
            .then((result) => {
            if (result[0].error) {
                this._showNotice('Failed to delete photo.');
            }
            else {
                _attachments.remove(_attachments.find((attachment) => {
                    return id === attachment.id;
                }));
            }
        })
            .catch((error) => {
            console.log(error);
            this._showNotice('Failed to delete photo.');
        });
    }
    /**
     * Download attachment.
     * @param url
     */
    _downloadAttachment(url, name) {
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', name);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    /**
     * Show error notice.
     * @param message
     */
    _showNotice(message) {
        const { _notice } = this;
        this._noticeMessage = message;
        _notice.hidden = true;
        setTimeout(() => {
            _notice.hidden = false;
        }, 2000);
    }
    /**
     * Initiate file input.
     */
    _addButtonClick() {
        const { _input } = this;
        _input.click();
    }
    /**
     * File input change event.
     * @param event
     */
    _fileInputChange(event) {
        const { _button, _input } = this;
        const files = event.target.files;
        _button.loading = true;
        if (files && files[0]) {
            this._addAttachment(files[0]);
            _input.value = '';
        }
        else {
            _button.loading = false;
        }
    }
    render() {
        const { addEnabled, _attachments, _noticeMessage } = this;
        return (tsx("div", { class: CSS.base },
            tsx("calcite-notice", { color: "red", scale: "s", dismissible: "", afterCreate: storeNode.bind(this), "data-node-ref": "_notice" },
                tsx("div", { slot: "message" }, _noticeMessage)),
            tsx("div", { hidden: addEnabled ? false : true },
                tsx("calcite-button", { appearance: "transparent", "icon-start": "image-plus", afterCreate: (calciteButton) => {
                        this._button = calciteButton;
                        calciteButton.addEventListener('click', this._addButtonClick.bind(this));
                    } }, "Add Photo"),
                tsx("input", { hidden: "", type: "file", capture: "environment", accept: "image/jpeg", afterCreate: (input) => {
                        this._input = input;
                        input.addEventListener('change', this._fileInputChange.bind(this));
                    } })),
            _attachments.toArray().map((attachment) => {
                return attachment.element;
            })));
    }
};
__decorate([
    property()
], PhotoAttachments.prototype, "feature", void 0);
__decorate([
    property()
], PhotoAttachments.prototype, "_attachments", void 0);
PhotoAttachments = __decorate([
    subclass('PhotoAttachments')
], PhotoAttachments);
export default PhotoAttachments;
