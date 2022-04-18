import esri = __esri;

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

@subclass('Snapshot')
export default class Snapshot extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view to print.
       */
      view: esri.MapView;
      /**
       * Default map title.
       * @default 'Map Snapshot'
       */
      title?: string;
    },
  ) {
    super(properties);
  }

  view!: esri.MapView;

  title = 'Map Snapshot';

  private _photoModal = new PhotoModal();

  private _snapshot(): void {
    const { view, title, _title, _format: format, _snapshotResults, _photoModal } = this;

    view
      .takeScreenshot({
        format,
      })
      .then((screenshot: esri.Screenshot): void => {
        let titleText = _title || title;

        titleText = titleText.replace(' ', '_');

        const data = screenshot.data;

        // canvas and context
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
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
        const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png') as string;

        _snapshotResults.add(
          <div key={KEY++} class={CSS.result} style={`background-image: url(${dataUrl});`}>
            <div
              class={CSS.resultView}
              title="View image"
              afterCreate={(div: HTMLDivElement): void => {
                div.addEventListener('click', _photoModal.show.bind(_photoModal, `${titleText}.${format}`, dataUrl));
              }}
            ></div>
            <calcite-action
              title="Download image"
              appearance="transparent"
              icon="download"
              afterCreate={(action: HTMLCalciteActionElement): void => {
                action.addEventListener('click', this._download.bind(this, dataUrl, titleText));
              }}
            ></calcite-action>
          </div>,
        );
      });
  }

  private _download(url: string, fileName: string): void {
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render(): tsx.JSX.Element {
    const { _snapshotResults } = this;

    const results = _snapshotResults.toArray();

    return (
      <calcite-panel heading="Snapshot">
        <div style={CSS.content}>
          <calcite-label>
            Title
            <calcite-input
              type="text"
              afterCreate={(input: HTMLCalciteInputElement): void => {
                input.value = this.title;
                input.addEventListener('calciteInputInput', (): void => {
                  this._title = input.value;
                });
              }}
            ></calcite-input>
          </calcite-label>
          <calcite-label>
            Format
            <calcite-radio-group
              afterCreate={(radioGroup: HTMLCalciteRadioGroupElement): void => {
                radioGroup.addEventListener('calciteRadioGroupChange', (): void => {
                  this._format = radioGroup.selectedItem.value;
                });
              }}
            >
              <calcite-radio-group-item value="jpg" checked="">
                JPG
              </calcite-radio-group-item>
              <calcite-radio-group-item value="png">PNG</calcite-radio-group-item>
            </calcite-radio-group>
          </calcite-label>
          <calcite-button
            style={CSS.button}
            width="full"
            afterCreate={(button: HTMLCalciteButtonElement): void => {
              button.addEventListener('click', this._snapshot.bind(this));
            }}
          >
            Snapshot
          </calcite-button>
          {results}
        </div>
      </calcite-panel>
    );
  }

  private _snapshotResults: Collection<tsx.JSX.Element> = new Collection();

  private _title = 'Map Snapshot';

  private _format: 'jpg' | 'png' = 'jpg';
}

@subclass('Snapshot.PhotoModal')
class PhotoModal extends Widget {
  constructor(properties?: esri.WidgetProperties) {
    super(properties);
    document.body.append(this.container);
  }

  container = document.createElement('calcite-modal');

  private _modal!: HTMLCalciteModalElement;

  @property()
  private _title = 'Photo';

  @property()
  private _url = '';

  show(title: string, url: string): void {
    const { _modal } = this;
    this._title = title;
    this._url = url;
    _modal.active = true;
  }

  render(): tsx.JSX.Element {
    const { _title, _url } = this;

    return (
      <calcite-modal afterCreate={storeNode.bind(this)} data-node-ref="_modal">
        <div slot="header">{_title}</div>
        <div slot="content">
          <img style="width: 100%;" src={_url}></img>
        </div>
        <calcite-button
          slot="primary"
          afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
            calciteButton.addEventListener('click', (): void => {
              this._modal.active = false;
            });
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
