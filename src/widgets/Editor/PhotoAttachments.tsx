import esri = __esri;

export interface PhotoAttachmentsProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

interface Attachment {
  id: number;
  name: string;
  url: string;
  imageUrl: string;
  element: tsx.JSX.Element;
}

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

@subclass('PhotoAttachments')
export default class PhotoAttachments extends Widget {
  constructor(properties: PhotoAttachmentsProperties) {
    super(properties);
  }

  postInitialize(): void {
    watch(this, 'feature', (feature: esri.Graphic | null): void => {
      // no scoped callback
      this._queryAttachments(feature);
    });
  }

  layer!: esri.FeatureLayer;

  addEnabled = true;

  deleteEnabled = true;

  @property()
  feature: esri.Graphic | null = null;

  @property()
  private _attachments: Collection<Attachment> = new Collection();

  private _button!: HTMLCalciteButtonElement;

  private _input!: HTMLInputElement;

  private _notice!: HTMLCalciteNoticeElement;

  private _noticeMessage!: string;

  private _photoModal = new PhotoModal();

  private _deleteModal = new DeleteModal();

  private _queryAttachments(feature: esri.Graphic | null, attachmentObjectId?: number): void {
    const { layer, _attachments } = this;

    if (!attachmentObjectId) _attachments.removeAll();

    if (!feature || feature.layer !== layer) return;

    const objectId = feature.attributes[layer.objectIdField];

    layer
      .queryAttachments({
        objectIds: [objectId],
        ...(attachmentObjectId
          ? {
              attachmentsWhere: `ATTACHMENTID = ${attachmentObjectId}`,
            }
          : {}),
        ...(layer.capabilities.attachment.supportsContentType === true ? { attachmentTypes: ['image/jpeg'] } : {}),
      })
      .then((result: any): void => {
        if (result[objectId] && result[objectId].length) {
          result[objectId].forEach((attachment: esri.AttachmentInfo): void => {
            this._createAttachment(attachment);
          });
        }
      })
      .catch((error: esri.Error) => {
        console.log(error);
      });
  }

  private async _createAttachment(attachment: esri.AttachmentInfo): Promise<void> {
    const { _attachments, _photoModal, _deleteModal } = this;
    const { contentType, id, name, url } = attachment;

    if (contentType !== 'image/jpeg') return;

    await request(url, {
      responseType: 'blob',
    })
      .then((value: esri.RequestResponse) => {
        const imageUrl = URL.createObjectURL(value.data);

        const element = (
          <div key={KEY++} class={CSS.attachment}>
            <div
              style={`background-image: url(${imageUrl});`}
              title={`View ${name}`}
              afterCreate={(div: HTMLDivElement): void => {
                div.addEventListener('click', (): void => {
                  _photoModal.show(name, imageUrl);
                });
              }}
            ></div>
            <calcite-action
              title="Download photo"
              appearance="transparent"
              icon="download"
              afterCreate={(calciteAction: HTMLCalciteActionElement): void => {
                calciteAction.addEventListener('click', this._downloadAttachment.bind(this, imageUrl, name));
              }}
            ></calcite-action>
            <calcite-action
              title="Delete photo"
              appearance="transparent"
              icon="trash"
              afterCreate={(calciteAction: HTMLCalciteActionElement): void => {
                calciteAction.addEventListener('click', (): void => {
                  _deleteModal.show(this._deleteAttachment.bind(this, id));
                });
              }}
            ></calcite-action>
          </div>
        );

        _attachments.add({
          id,
          name,
          url,
          imageUrl,
          element,
        });
      })
      .catch();
  }

  /**
   * Add attachment.
   * @param file
   */
  private _addAttachment(file: File): void {
    const { feature, layer, _button } = this;

    if (!feature || feature.layer !== layer) return;

    const fileName = `${layer.title.replaceAll(' ', '_')}_${feature.attributes[layer.objectIdField]}.jpg`;

    const formData = new FormData();
    formData.append(
      'attachment',
      new File([file], fileName, {
        type: file.type,
        lastModified: file.lastModified,
      }),
    );
    formData.append('f', 'json');

    layer
      .addAttachment(feature, formData)
      .then((result: esri.FeatureEditResult): void => {
        _button.loading = false;

        if (result.error) {
          this._showNotice('Failed to add photo.');
        } else {
          this._queryAttachments(feature, result.objectId);
        }
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        _button.loading = false;
        this._showNotice('Failed to add photo.');
      });
  }

  /**
   * Delete attachment.
   * @param id
   */
  private _deleteAttachment(id: number): void {
    const { layer, feature, _attachments } = this;

    if (!feature) return;

    layer
      .deleteAttachments(feature, [id])
      .then((result: any): void => {
        if (result[0].error) {
          this._showNotice('Failed to delete photo.');
        } else {
          _attachments.remove(
            _attachments.find((attachment: Attachment): boolean => {
              return id === attachment.id;
            }),
          );
        }
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        this._showNotice('Failed to delete photo.');
      });
  }

  /**
   * Download attachment.
   * @param url
   */
  private _downloadAttachment(url: string, name: string): void {
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
  private _showNotice(message: string): void {
    const { _notice } = this;

    this._noticeMessage = message;

    _notice.hidden = true;

    setTimeout((): void => {
      _notice.hidden = false;
    }, 2000);
  }

  /**
   * Initiate file input.
   */
  private _addButtonClick(): void {
    const { _input } = this;
    _input.click();
  }

  /**
   * File input change event.
   * @param event
   */
  private _fileInputChange(event: Event): void {
    const { _button, _input } = this;

    const files = (event.target as HTMLInputElement).files;

    _button.loading = true;

    if (files && files[0]) {
      this._addAttachment(files[0]);
      _input.value = '';
    } else {
      _button.loading = false;
    }
  }

  render(): tsx.JSX.Element {
    const { addEnabled, _attachments, _noticeMessage } = this;

    return (
      <div class={CSS.base}>
        {/* error notice */}
        <calcite-notice color="red" scale="s" dismissible="" afterCreate={storeNode.bind(this)} data-node-ref="_notice">
          <div slot="message">{_noticeMessage}</div>
        </calcite-notice>
        {/* add button */}
        <div hidden={addEnabled ? false : true}>
          <calcite-button
            appearance="transparent"
            icon-start="image-plus"
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              this._button = calciteButton;
              calciteButton.addEventListener('click', this._addButtonClick.bind(this));
            }}
          >
            Add Photo
          </calcite-button>
          <input
            hidden=""
            type="file"
            capture="environment"
            accept="image/jpeg"
            afterCreate={(input: HTMLInputElement): void => {
              this._input = input;
              input.addEventListener('change', this._fileInputChange.bind(this));
            }}
          ></input>
        </div>
        {/* attachments */}
        {_attachments.toArray().map((attachment: Attachment): tsx.JSX.Element => {
          return attachment.element;
        })}
      </div>
    );
  }
}
