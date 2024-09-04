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
 * Modal dialog for viewing and downloading images.
 */
@subclass('cov.components.dialogs.Photo')
export default class Photo extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-dialog');

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
    this.container.addEventListener('calciteDialogClose', (): void => {
      this._url = '';
    });
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
    } else {
      return;
    }

    const a = Object.assign(document.createElement('a'), {
      href: _url,
      download: fileName,
      style: 'display: none;',
      click: (): void => {
        URL.revokeObjectURL(_url);
      },
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
    if (this._url !== url) this._loading = true;
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

  @property()
  private _loading = false;

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Close dialog.
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
      <calcite-dialog heading={_fileName} loading={_loading} modal="" style="--calcite-dialog-content-space:0;">
        <img
          style="width:100%; min-height:300px;"
          src={_url}
          afterCreate={(img: HTMLImageElement): void => {
            img.addEventListener('load', (): void => {
              this._loading = false;
            });
          }}
        ></img>
        {showDownload ? (
          <calcite-button appearance="outline" slot="footer-end" onclick={this.download.bind(this, _fileName, _url)}>
            Download
          </calcite-button>
        ) : null}
        <calcite-button slot="footer-end" onclick={this._close.bind(this)}>
          Close
        </calcite-button>
      </calcite-dialog>
    );
  }
}
