import { __awaiter, __decorate } from "tslib";
// Module imports
import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
// Style constants
const CSS = {
    base: 'photo-attachments-widget',
    content: 'photo-attachments-widget--content',
    attachment: 'photo-attachments-widget--attachment',
    modalImage: 'photo-attachments-widget--modal-image',
};
// Key for uniqueness
let KEY = 0;
/**
 * A widget for viewing, adding, deleting and downloading feature layer photo attachments.
 */
let PhotoAttachments = class PhotoAttachments extends Widget {
    //-----------------------------
    //  Lifecycle
    //-----------------------------
    constructor(properties) {
        super(properties);
        //-----------------------------
        //  Properties
        //-----------------------------
        /**
         * Add photo attachments enabled.
         */
        this.addEnabled = true;
        /**
         * Delete photo attachments enabled.
         */
        this.deleteEnabled = true;
        /**
         * Feature of interest.
         */
        this.feature = null;
        /**
         * Heading for panel. Empty string disables panel heading. Requires widget container to be `calcite-panel`.
         * @default 'Photos'
         */
        this.heading = 'Photos';
        /**
         * Mode of operation.
         * `auto` selects and highlights feature from layer on view click.
         * `manual` set `feature` property manually
         * `popup` sets feature when popup is visible and popup `selectedFeature` is a feature of the layer.
         * @default 'auto'
         */
        this.mode = 'auto';
        /**
         * Message to show when no feature is selected.
         * @default 'Select a feature in the map.'
         */
        this.noFeatureMessage = 'Select a feature in the map.';
        //-----------------------------
        //  Variables
        //-----------------------------
        /**
         * Collection of attachment items.
         */
        this._attachmentItems = new Collection();
        /**
         * Modal options.
         */
        this._modalOptions = {
            name: '',
            url: '',
        };
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, layer, mode, _attachmentItems } = this;
            // assure view and layer are ready
            yield view.when();
            yield layer.when();
            // check layer attachment capabilities and disable editing if not
            if (layer.capabilities.operations.supportsEditing !== true || layer.capabilities.data.supportsAttachment !== true) {
                this.addEnabled = false;
                this.deleteEnabled = false;
            }
            // auto mode
            if (mode === 'auto') {
                // create layer view
                view.whenLayerView(layer).then((layerView) => {
                    this._layerView = layerView;
                });
                // hit test on click
                view.on('click', (point) => {
                    view
                        .hitTest(point, {
                        include: layer,
                    })
                        .then((hitTestResult) => {
                        const { _layerView, feature, _highlightHandle } = this;
                        const { results } = hitTestResult;
                        // clear highlight, feature and items
                        if (_highlightHandle)
                            _highlightHandle.remove();
                        if (feature) {
                            this.feature = null;
                            _attachmentItems.removeAll();
                        }
                        // return no hit test results
                        if (!results.length)
                            return;
                        // filter for first feature of layer
                        const filter = results.filter((value) => {
                            return value.layer === layer;
                        })[0];
                        // set and highlight feature
                        if (filter && filter.graphic) {
                            this.feature = filter.graphic;
                            this._highlightHandle = _layerView.highlight(this.feature);
                        }
                    });
                });
            }
            // popup mode
            if (mode === 'popup') {
                const { popup } = view;
                // watch selected feature
                watch(popup, 'selectedFeature', (selectedFeature) => {
                    // set feature or clear feature and items
                    if (popup.visible && selectedFeature && selectedFeature.layer === layer) {
                        this.feature = selectedFeature;
                    }
                    else {
                        this.feature = null;
                        _attachmentItems.removeAll();
                    }
                });
            }
            // watch feature and query attachments for all modes
            watch(this, 'feature', this._queryAttachments.bind(this));
        });
    }
    //-----------------------------
    //  Public methods
    //-----------------------------
    //-----------------------------
    //  Private methods
    //-----------------------------
    /**
     * Query attachments and create attachment items.
     * @param feature
     */
    _queryAttachments(feature) {
        const { deleteEnabled, layer, _attachmentItems } = this;
        if (!feature || feature.layer !== layer)
            return;
        const objectId = feature.attributes[layer.objectIdField];
        layer
            .queryAttachments(Object.assign({ objectIds: [objectId] }, (layer.capabilities.attachment.supportsContentType === true ? { attachmentTypes: ['image/jpeg'] } : {})))
            .then((result) => {
            _attachmentItems.removeAll();
            if (result[objectId] && result[objectId].length) {
                _attachmentItems.addMany(result[objectId].map((attachment) => {
                    const { contentType, id, url } = attachment;
                    return contentType === 'image/jpeg' ? (tsx("div", { key: KEY++, class: CSS.attachment },
                        tsx("div", { style: `background-image: url(${url})`, onclick: this._showAttachment.bind(this, attachment) }),
                        tsx("calcite-action", { icon: "download", onclick: this._downloadAttachment.bind(this, url) }),
                        deleteEnabled ? (tsx("calcite-action", { icon: "trash", onclick: this._confirmDeleteAttachment.bind(this, id) })) : null)) : null;
                }));
            }
        })
            .catch((error) => {
            console.log(error);
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
        const formData = new FormData();
        formData.append('attachment', new File([file], `${layer.title.replaceAll(' ', '_')}_${feature.attributes[layer.objectIdField]}.jpg`, {
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
                this._queryAttachments(feature);
            }
        })
            .catch((error) => {
            console.log(error);
            _button.loading = false;
            this._showNotice('Failed to add photo.');
        });
    }
    /**
     * Show confirm delete attachment modal.
     * @param id
     */
    _confirmDeleteAttachment(id) {
        const { _confirm } = this;
        _confirm.active = true;
        const handle = this.on('confirm-delete', (confirm) => {
            if (confirm) {
                this._deleteAttachment(id);
            }
            handle.remove();
            _confirm.active = false;
        });
    }
    /**
     * Delete attachment.
     * @param id
     */
    _deleteAttachment(id) {
        const { layer, feature } = this;
        if (!feature)
            return;
        layer
            .deleteAttachments(feature, [id])
            .then((result) => {
            if (result[0].error) {
                this._showNotice('Failed to delete photo.');
            }
            else {
                this._queryAttachments(feature);
            }
        })
            .catch((error) => {
            console.log(error);
            this._showNotice('Failed to delete photo.');
        });
    }
    /**
     * Set options and show modal.
     * @param attachment
     */
    _showAttachment(attachment) {
        const { _modal } = this;
        const { name, url } = attachment;
        this._modalOptions = {
            name,
            url,
        };
        _modal.active = true;
    }
    /**
     * Download attachment.
     * @param url
     */
    _downloadAttachment(url) {
        const a = document.createElement('a');
        a.setAttribute('href', url);
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
        _notice.active = true;
        setTimeout(() => {
            _notice.active = false;
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
        const { _button } = this;
        const files = event.target.files;
        _button.loading = true;
        if (files && files[0]) {
            this._addAttachment(files[0]);
        }
        else {
            _button.loading = false;
        }
    }
    render() {
        const { addEnabled, heading, feature, noFeatureMessage, _attachmentItems, _modalOptions, _noticeMessage } = this;
        return (tsx("calcite-panel", { heading: heading, "width-scale": "m", "height-scale": "l", class: CSS.base },
            tsx("div", { class: CSS.content },
                tsx("div", { hidden: feature ? true : false }, noFeatureMessage),
                _attachmentItems.toArray(),
                tsx("div", { hidden: feature && addEnabled ? false : true },
                    tsx("calcite-button", { appearance: "outline", width: "full", "icon-start": "image-plus", afterCreate: storeNode.bind(this), "data-node-ref": "_button", onclick: this._addButtonClick.bind(this) }, "Add Photo"),
                    tsx("input", { hidden: "", type: "file", capture: "environment", accept: "image/jpeg", afterCreate: storeNode.bind(this), "data-node-ref": "_input", onchange: this._fileInputChange.bind(this) })),
                tsx("calcite-notice", { color: "red", scale: "s", dismissible: "", afterCreate: storeNode.bind(this), "data-node-ref": "_notice" },
                    tsx("div", { slot: "message" }, _noticeMessage))),
            tsx("calcite-modal", { afterCreate: storeNode.bind(this), "data-node-ref": "_modal" },
                tsx("div", { slot: "header" }, _modalOptions.name),
                tsx("div", { slot: "content" },
                    tsx("img", { class: CSS.modalImage, src: _modalOptions.url })),
                tsx("calcite-button", { slot: "secondary", width: "full", appearance: "outline", onclick: this._downloadAttachment.bind(this, _modalOptions.url) }, "Download"),
                tsx("calcite-button", { slot: "primary", width: "full", onclick: () => {
                        this._modal.active = false;
                    } }, "Close")),
            tsx("calcite-modal", { scale: "s", width: "220", "disable-close-button": "", "disable-escape": "", "disable-outside-close": "", afterCreate: storeNode.bind(this), "data-node-ref": "_confirm" },
                tsx("div", { slot: "header" }, "Confirm"),
                tsx("div", { slot: "content" }, "Delete photo?"),
                tsx("calcite-button", { slot: "secondary", width: "full", appearance: "outline", onclick: () => {
                        this.emit('confirm-delete', false);
                    } }, "Cancel"),
                tsx("calcite-button", { slot: "primary", width: "full", onclick: () => {
                        this.emit('confirm-delete', true);
                    } }, "Delete"))));
    }
};
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "addEnabled", void 0);
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "deleteEnabled", void 0);
__decorate([
    property()
], PhotoAttachments.prototype, "feature", void 0);
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "heading", void 0);
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "layer", void 0);
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "mode", void 0);
__decorate([
    property()
], PhotoAttachments.prototype, "noFeatureMessage", void 0);
__decorate([
    property({
        constructOnly: true,
    })
], PhotoAttachments.prototype, "view", void 0);
PhotoAttachments = __decorate([
    subclass('@vernonia.PhotoAttachments')
], PhotoAttachments);
export default PhotoAttachments;
