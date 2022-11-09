//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * Modal widget for viewing and downloading images.
 */
@subclass('cov.modals.PhotoModal')
export default class PhotoModal extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-modal');

  constructor() {
    super();
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
  download(fileName: string, url: string): void {
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
  show(fileName: string, url: string): void {
    this._fileName = fileName;
    this._url = url;
    this.container.open = true;
  }

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _fileName = '';

  @property()
  private _url = '';

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Close modal.
   */
  private _close(): void {
    this.container.open = false;
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { _fileName, _url } = this;
    return (
      <calcite-modal>
        <div slot="header">{_fileName}</div>
        <div slot="content">
          <img style="width: 100%;" src={_url}></img>
        </div>
        <calcite-button
          appearance="outline"
          slot="secondary"
          width="full"
          onclick={this.download.bind(this, _fileName, _url)}
        >
          Download
        </calcite-button>
        <calcite-button slot="primary" width="full" onclick={this._close.bind(this)}>
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
