//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const URL_REG_EXP = new RegExp(
  /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
);

/**
 * Modal widget for viewing and downloading images.
 */
@subclass('cov.modals.PhotoModal')
export default class PhotoModal extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-modal');

  constructor(
    properties?: esri.WidgetProperties & {
      /**
       * Show download button.
       * @default true
       */
      showDownload?: boolean;
    },
  ) {
    super(properties);
    document.body.append(this.container);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  showDownload = true;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Download an image (or any data url file).
   * @param fileName File name to be downloaded
   * @param url Data url
   */
  async download(fileName: string, url: string): Promise<void> {
    let _url = url;
    if (url.match(URL_REG_EXP)) {
      const blob = await (await fetch(url)).blob();
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
  }

  /**
   * Show image in modal.
   * @param fileName File name of image
   * @param url Data url
   */
  show(fileName: string, url: string): void {
    this._fileName = fileName;
    this._url = url;
    this._loading = true;
    this.container.open = true;
  }

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _fileName = '';

  @property()
  private _url = '';

  @property()
  private _loading = false;

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
    const { showDownload, _fileName, _url, _loading } = this;
    return (
      <calcite-modal style="--calcite-modal-content-padding: 0;">
        <div slot="header">{_fileName}</div>
        <div slot="content">
          <calcite-scrim hidden={!_loading} loading=""></calcite-scrim>
          <img
            style="width: 100%; min-height: 300px;"
            src={_url}
            afterCreate={(img: HTMLImageElement): void => {
              img.addEventListener('load', (): void => {
                this._loading = false;
              });
            }}
          ></img>
        </div>
        {showDownload ? (
          <calcite-button
            appearance="outline"
            slot="secondary"
            width="full"
            onclick={this.download.bind(this, _fileName, _url)}
          >
            Download
          </calcite-button>
        ) : null}
        <calcite-button slot="primary" width="full" onclick={this._close.bind(this)}>
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
