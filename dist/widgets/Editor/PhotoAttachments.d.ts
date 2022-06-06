import esri = __esri;
export interface PhotoAttachmentsProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class PhotoAttachments extends Widget {
    constructor(properties: PhotoAttachmentsProperties);
    postInitialize(): void;
    layer: esri.FeatureLayer;
    addEnabled: boolean;
    deleteEnabled: boolean;
    feature: esri.Graphic | null;
    private _attachments;
    private _button;
    private _input;
    private _notice;
    private _noticeMessage;
    private _photoModal;
    private _deleteModal;
    private _queryAttachments;
    private _createAttachment;
    /**
     * Add attachment.
     * @param file
     */
    private _addAttachment;
    /**
     * Delete attachment.
     * @param id
     */
    private _deleteAttachment;
    /**
     * Download attachment.
     * @param url
     */
    private _downloadAttachment;
    /**
     * Show error notice.
     * @param message
     */
    private _showNotice;
    /**
     * Initiate file input.
     */
    private _addButtonClick;
    /**
     * File input change event.
     * @param event
     */
    private _fileInputChange;
    render(): tsx.JSX.Element;
}
