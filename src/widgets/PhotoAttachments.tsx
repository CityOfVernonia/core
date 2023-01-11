import esri = __esri;

// Constructor properties
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
@subclass('@vernonia.PhotoAttachments')
export default class PhotoAttachments extends Widget {
  //-----------------------------
  //  Lifecycle
  //-----------------------------

  constructor(properties: PhotoAttachmentsProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { view, layer, mode, _attachmentItems } = this;

    // assure view and layer are ready
    await view.when();
    await layer.when();

    // check layer attachment capabilities and disable editing if not
    if (layer.capabilities.operations.supportsEditing !== true || layer.capabilities.data.supportsAttachment !== true) {
      this.addEnabled = false;
      this.deleteEnabled = false;
    }

    // auto mode
    if (mode === 'auto') {
      // create layer view
      view.whenLayerView(layer).then((layerView: esri.FeatureLayerView): void => {
        this._layerView = layerView;
      });

      // hit test on click
      view.on('click', (point: esri.ScreenPoint): void => {
        view
          .hitTest(point, {
            include: layer,
          })
          .then((hitTestResult: esri.HitTestResult) => {
            const { _layerView, feature, _highlightHandle } = this;
            const { results } = hitTestResult;

            // clear highlight, feature and items
            if (_highlightHandle) _highlightHandle.remove();
            if (feature) {
              this.feature = null;
              _attachmentItems.removeAll();
            }

            // return no hit test results
            if (!results.length) return;

            // filter for first feature of layer
            const filter = results.filter((value: esri.ViewHit): boolean => {
              return value.layer === layer;
            })[0];

            // set and highlight feature
            if (filter && (filter as esri.GraphicHit).graphic) {
              this.feature = (filter as esri.GraphicHit).graphic;
              this._highlightHandle = _layerView.highlight(this.feature);
            }
          });
      });
    }

    // popup mode
    if (mode === 'popup') {
      const { popup } = view;

      // watch selected feature
      watch(popup, 'selectedFeature', (selectedFeature: esri.Graphic): void => {
        // set feature or clear feature and items
        if (popup.visible && selectedFeature && selectedFeature.layer === layer) {
          this.feature = selectedFeature;
        } else {
          this.feature = null;
          _attachmentItems.removeAll();
        }
      });
    }

    // watch feature and query attachments for all modes
    watch(this, 'feature', this._queryAttachments.bind(this));
  }

  //-----------------------------
  //  Properties
  //-----------------------------

  /**
   * Add photo attachments enabled.
   */
  @property({
    constructOnly: true,
  })
  addEnabled = true;

  /**
   * Delete photo attachments enabled.
   */
  @property({
    constructOnly: true,
  })
  deleteEnabled = true;

  /**
   * Feature of interest.
   */
  @property()
  feature: esri.Graphic | null = null;

  /**
   * Heading for panel. Empty string disables panel heading. Requires widget container to be `calcite-panel`.
   * @default 'Photos'
   */
  @property({
    constructOnly: true,
  })
  heading = 'Photos';

  /**
   * Feature layer of interest.
   */
  @property({
    constructOnly: true,
  })
  layer!: esri.FeatureLayer;

  /**
   * Mode of operation.
   * `auto` selects and highlights feature from layer on view click.
   * `manual` set `feature` property manually
   * `popup` sets feature when popup is visible and popup `selectedFeature` is a feature of the layer.
   * @default 'auto'
   */
  @property({
    constructOnly: true,
  })
  mode: 'auto' | 'manual' | 'popup' = 'auto';

  /**
   * Message to show when no feature is selected.
   * @default 'Select a feature in the map.'
   */
  @property()
  noFeatureMessage = 'Select a feature in the map.';

  /**
   * Map view.
   */
  @property({
    constructOnly: true,
  })
  view!: esri.MapView;

  //-----------------------------
  //  Variables
  //-----------------------------

  /**
   * Collection of attachment items.
   */
  private _attachmentItems: esri.Collection<tsx.JSX.Element> = new Collection();

  /**
   * Add button element.
   */
  private _button!: HTMLCalciteButtonElement;

  /**
   * Confirm delete modal element.
   */
  private _confirm!: HTMLCalciteModalElement;

  /**
   * Layer view highlight handle for auto mode.
   */
  private _highlightHandle!: esri.Handle;

  /**
   * File input element.
   */
  private _input!: HTMLInputElement;

  /**
   * Feature layer view for auto mode.
   */
  protected _layerView!: esri.FeatureLayerView;

  /**
   * Modal element.
   */
  private _modal!: HTMLCalciteModalElement;

  /**
   * Modal options.
   */
  private _modalOptions: {
    name: string;
    url: string;
  } = {
    name: '',
    url: '',
  };

  /**
   * Error notice element.
   */
  private _notice!: HTMLCalciteNoticeElement;

  /**
   * Notice message.
   */
  private _noticeMessage!: string;

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
  private _queryAttachments(feature: esri.Graphic): void {
    const { deleteEnabled, layer, _attachmentItems } = this;

    if (!feature || feature.layer !== layer) return;

    const objectId = feature.attributes[layer.objectIdField];

    layer
      .queryAttachments({
        objectIds: [objectId],
        ...(layer.capabilities.attachment.supportsContentType === true ? { attachmentTypes: ['image/jpeg'] } : {}),
      })
      .then((result: any): void => {
        _attachmentItems.removeAll();

        if (result[objectId] && result[objectId].length) {
          _attachmentItems.addMany(
            result[objectId].map((attachment: esri.AttachmentInfo): tsx.JSX.Element | null => {
              const { contentType, id, url } = attachment;

              return contentType === 'image/jpeg' ? (
                <div key={KEY++} class={CSS.attachment}>
                  <div
                    style={`background-image: url(${url})`}
                    onclick={this._showAttachment.bind(this, attachment)}
                  ></div>

                  <calcite-action icon="download" onclick={this._downloadAttachment.bind(this, url)}></calcite-action>

                  {deleteEnabled ? (
                    <calcite-action
                      icon="trash"
                      onclick={this._confirmDeleteAttachment.bind(this, id)}
                    ></calcite-action>
                  ) : null}
                </div>
              ) : null;
            }),
          );
        }
      })
      .catch((error: esri.Error) => {
        console.log(error);
      });
  }

  /**
   * Add attachment.
   * @param file
   */
  private _addAttachment(file: File): void {
    const { feature, layer, _button } = this;

    if (!feature || feature.layer !== layer) return;

    const formData = new FormData();
    formData.append(
      'attachment',
      new File([file], `${layer.title.replaceAll(' ', '_')}_${feature.attributes[layer.objectIdField]}.jpg`, {
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
          this._queryAttachments(feature);
        }
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        _button.loading = false;
        this._showNotice('Failed to add photo.');
      });
  }

  /**
   * Show confirm delete attachment modal.
   * @param id
   */
  private _confirmDeleteAttachment(id: number): void {
    const { _confirm } = this;

    _confirm.open = true;

    const handle = this.on('confirm-delete', (confirm: boolean) => {
      if (confirm) {
        this._deleteAttachment(id);
      }
      handle.remove();
      _confirm.open = false;
    });
  }

  /**
   * Delete attachment.
   * @param id
   */
  private _deleteAttachment(id: number): void {
    const { layer, feature } = this;

    if (!feature) return;

    layer
      .deleteAttachments(feature, [id])
      .then((result: any): void => {
        if (result[0].error) {
          this._showNotice('Failed to delete photo.');
        } else {
          this._queryAttachments(feature);
        }
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        this._showNotice('Failed to delete photo.');
      });
  }

  /**
   * Set options and show modal.
   * @param attachment
   */
  private _showAttachment(attachment: esri.AttachmentInfo): void {
    const { _modal } = this;

    const { name, url } = attachment;

    this._modalOptions = {
      name,
      url,
    };

    _modal.open = true;
  }

  /**
   * Download attachment.
   * @param url
   */
  private _downloadAttachment(url: string): void {
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
    const { _button } = this;

    const files = (event.target as HTMLInputElement).files;

    _button.loading = true;

    if (files && files[0]) {
      this._addAttachment(files[0]);
    } else {
      _button.loading = false;
    }
  }

  render(): tsx.JSX.Element {
    const { addEnabled, heading, feature, noFeatureMessage, _attachmentItems, _modalOptions, _noticeMessage } = this;

    return (
      <calcite-panel heading={heading} width-scale="m" height-scale="l" class={CSS.base}>
        <div class={CSS.content}>
          {/* display no feature message */}
          <div hidden={feature ? true : false}>{noFeatureMessage}</div>

          {/* render attachment items */}
          {_attachmentItems.toArray()}

          {/* display add button and hidden input */}
          <div hidden={feature && addEnabled ? false : true}>
            <calcite-button
              appearance="outline"
              width="full"
              icon-start="image-plus"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_button"
              onclick={this._addButtonClick.bind(this)}
            >
              Add Photo
            </calcite-button>
            <input
              hidden=""
              type="file"
              capture="environment"
              accept="image/jpeg"
              afterCreate={storeNode.bind(this)}
              data-node-ref="_input"
              onchange={this._fileInputChange.bind(this)}
            ></input>
          </div>

          <calcite-notice
            color="red"
            scale="s"
            dismissible=""
            afterCreate={storeNode.bind(this)}
            data-node-ref="_notice"
          >
            <div slot="message">{_noticeMessage}</div>
          </calcite-notice>
        </div>

        {/* image modal */}
        <calcite-modal afterCreate={storeNode.bind(this)} data-node-ref="_modal">
          <div slot="header">{_modalOptions.name}</div>
          <div slot="content">
            <img class={CSS.modalImage} src={_modalOptions.url}></img>
          </div>
          <calcite-button
            slot="secondary"
            width="full"
            appearance="outline"
            onclick={this._downloadAttachment.bind(this, _modalOptions.url)}
          >
            Download
          </calcite-button>
          <calcite-button
            slot="primary"
            width="full"
            onclick={() => {
              this._modal.open = false;
            }}
          >
            Close
          </calcite-button>
        </calcite-modal>

        {/* confirm delete modal */}
        <calcite-modal
          scale="s"
          width="220"
          disable-close-button=""
          disable-escape=""
          disable-outside-close=""
          afterCreate={storeNode.bind(this)}
          data-node-ref="_confirm"
        >
          <div slot="header">Confirm</div>
          <div slot="content">Delete photo?</div>
          <calcite-button
            slot="secondary"
            width="full"
            appearance="outline"
            onclick={() => {
              this.emit('confirm-delete', false);
            }}
          >
            Cancel
          </calcite-button>
          <calcite-button
            slot="primary"
            width="full"
            onclick={() => {
              this.emit('confirm-delete', true);
            }}
          >
            Delete
          </calcite-button>
        </calcite-modal>
      </calcite-panel>
    );
  }
}
