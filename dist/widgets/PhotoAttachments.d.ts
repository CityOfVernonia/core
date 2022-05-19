import esri = __esri;
export interface PhotoAttachmentsProperties extends esri.WidgetProperties {
    /**
     * Add photo attachments enabled.
     */
    addEnabled?: boolean;
    /**
     * Delete photo attachments enabled.
     */
    deleteEnabled?: boolean;
    /**
     * Heading for panel. Empty string disables panel heading. Requires widget container to be `calcite-panel`.
     * @default 'Photos'
     */
    heading?: string;
    /**
     * Feature layer of interest.
     */
    layer: esri.FeatureLayer;
    /**
     * Mode of operation.
     * `auto` selects and highlights feature from layer on view click.
     * `manual` set `feature` property manually
     * `popup` sets feature when popup is visible and popup `selectedFeature` is a feature of the layer.
     * @default 'auto'
     */
    mode?: 'auto' | 'manual' | 'popup';
    /**
     * Message to show when no feature is selected.
     * @default 'Select a feature in the map.'
     */
    noFeatureMessage?: string;
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget for viewing, adding, deleting and downloading feature layer photo attachments.
 */
export default class PhotoAttachments extends Widget {
    constructor(properties: PhotoAttachmentsProperties);
    postInitialize(): Promise<void>;
    /**
     * Add photo attachments enabled.
     */
    addEnabled: boolean;
    /**
     * Delete photo attachments enabled.
     */
    deleteEnabled: boolean;
    /**
     * Feature of interest.
     */
    feature: esri.Graphic | null;
    /**
     * Heading for panel. Empty string disables panel heading. Requires widget container to be `calcite-panel`.
     * @default 'Photos'
     */
    heading: string;
    /**
     * Feature layer of interest.
     */
    layer: esri.FeatureLayer;
    /**
     * Mode of operation.
     * `auto` selects and highlights feature from layer on view click.
     * `manual` set `feature` property manually
     * `popup` sets feature when popup is visible and popup `selectedFeature` is a feature of the layer.
     * @default 'auto'
     */
    mode: 'auto' | 'manual' | 'popup';
    /**
     * Message to show when no feature is selected.
     * @default 'Select a feature in the map.'
     */
    noFeatureMessage: string;
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Collection of attachment items.
     */
    private _attachmentItems;
    /**
     * Add button element.
     */
    private _button;
    /**
     * Confirm delete modal element.
     */
    private _confirm;
    /**
     * Layer view highlight handle for auto mode.
     */
    private _highlightHandle;
    /**
     * File input element.
     */
    private _input;
    /**
     * Feature layer view for auto mode.
     */
    protected _layerView: esri.FeatureLayerView;
    /**
     * Modal element.
     */
    private _modal;
    /**
     * Modal options.
     */
    private _modalOptions;
    /**
     * Error notice element.
     */
    private _notice;
    /**
     * Notice message.
     */
    private _noticeMessage;
    /**
     * Query attachments and create attachment items.
     * @param feature
     */
    private _queryAttachments;
    /**
     * Add attachment.
     * @param file
     */
    private _addAttachment;
    /**
     * Show confirm delete attachment modal.
     * @param id
     */
    private _confirmDeleteAttachment;
    /**
     * Delete attachment.
     * @param id
     */
    private _deleteAttachment;
    /**
     * Set options and show modal.
     * @param attachment
     */
    private _showAttachment;
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
