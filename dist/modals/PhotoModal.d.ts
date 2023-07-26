/// <reference types="@esri/calcite-components" />
import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Modal widget for viewing and downloading images.
 */
export default class PhotoModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties & {
        /**
         * Show download button.
         * @default true
         */
        showDownload?: boolean;
    });
    showDownload: boolean;
    /**
     * Download an image (or any data url file).
     * @param fileName File name to be downloaded
     * @param url Data url
     */
    download(fileName: string, url: string): void;
    /**
     * Show image in modal.
     * @param fileName File name of image
     * @param url Data url
     */
    show(fileName: string, url: string): void;
    private _fileName;
    private _url;
    /**
     * Close modal.
     */
    private _close;
    render(): tsx.JSX.Element;
}
