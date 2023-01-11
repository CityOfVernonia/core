import esri = __esri;

interface DisplayInfo extends Object {
  /**
   * Field name or expression name.
   */
  fieldName: string;

  /**
   * Label for the field.
   * Defaults to field alias and then field name.
   */
  label?: string;

  /**
   * Prefix added to attribute value.
   * NOTE: not applied to values which are URLs.
   */
  prefix?: string;

  /**
   * Suffix added to attribute value.
   * NOTE: not applied to values which are URLs.
   */
  suffix?: string;

  /**
   * Anchor text for values which are URLs.
   * @default 'View'
   */
  anchorText?: string;

  /**
   * Omits fields which are `null` or empty strings.
   * NOTE: has no effect on expression info fields.
   * @default true
   */
  omitNull?: boolean;

  /**
   * Replaces attributes which are `null` or empty strings when provided.
   */
  replaceNull?: string;

  /**
   * Luxon datetime format constant for date fields.
   */
  dateFormat?: DateTimeFormatOptions;

  /**
   * Luxon timezone string used when formatting date fields.
   */
  timeZone?: string;

  /**
   * Function to return string to display.
   * NOTE: use of `formatter` function takes precedent over other options.
   * @returns string
   */
  formatter?: (
    /**
     * Value of the field.
     */
    value: string | number,

    /**
     * Field name.
     */
    fieldName: string,

    /**
     * The graphic in question.
     */
    graphic: esri.Graphic,

    /**
     * Field's coded value domain if it exists.
     */
    domain?: esri.CodedValueDomain | esri.RangeDomain | esri.InheritedDomain,
  ) => string;
}

interface _DisplayInfo extends Object {
  label: string;
  value: any;
  isUrl?: boolean;
  anchorText?: string;
}

import esriRequest from '@arcgis/core/request';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import Collection from '@arcgis/core/core/Collection';
// @ts-ignore
import { createCompiledExpressions } from '@arcgis/core/widgets/Feature/support/arcadeFeatureUtils';
import { DateTime, DateTimeFormatOptions } from 'luxon';

const CSS = {
  table: 'esri-widget__table',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

const STYLES = {
  attachments: 'margin-top: 0.5rem;',
};

let KEY = 0;

@subclass('FeaturePopup.Content')
class Content extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
      expressionInfos: esri.popupExpressionInfo[];
      displayInfos: DisplayInfo[];
      attachments?: boolean;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const { graphic, expressionInfos, displayInfos, attachments, _layer } = this;

    if (displayInfos.length)
      // run expression infos
      createCompiledExpressions({
        expressionInfos,
        graphic,
      }).then((expressions: { [key: string]: any }) => {
        displayInfos.forEach((displayInfo: DisplayInfo): void => {
          const value = expressions[displayInfo.fieldName];

          value ? this._addExpressionInfo(value, displayInfo) : this._addFieldInfo(displayInfo);
        });
      });

    if (attachments === true && _layer.capabilities.data.supportsAttachment === true) {
      this._queryAttachments(graphic, _layer);
      this._photoModal = new PhotoModal();
    }
  }

  /**
   * Graphic of interest.
   */
  graphic!: esri.Graphic;

  /**
   * Expression infos.
   */
  expressionInfos: esri.popupExpressionInfo[] = [];

  /**
   * Display infos.
   */
  displayInfos: DisplayInfo[] = [];

  /**
   * Include attachments.
   */
  attachments = true;

  /**
   * Layer of interest.
   */
  @property({
    aliasOf: 'graphic.layer',
  })
  private _layer!: esri.FeatureLayer;

  /**
   * Graphic's layer fields.
   */
  @property({
    aliasOf: 'graphic.layer.fields',
  })
  private _fields!: esri.Field[];

  /**
   * Collection of info objects to create table rows.
   */
  private _displayInfos: Collection<_DisplayInfo> = new Collection();

  /**
   * Collection of attachment infos.
   */
  private _attachments: Collection<esri.AttachmentInfo> = new Collection();

  private _photoModal!: PhotoModal;

  /**
   * Handle expressions.
   * @param value
   * @param displayInfo
   */
  private _addExpressionInfo(value: any, displayInfo: DisplayInfo): void {
    const { expressionInfos, _displayInfos } = this;
    const { fieldName, label } = displayInfo;

    // get expression info title
    const title = expressionInfos.find((expressionInfo: esri.popupExpressionInfo): boolean => {
      return expressionInfo.name === fieldName.replace('expression/', '');
    })?.title;

    // add display info
    _displayInfos.add({
      label: title || label || 'Field',
      value,
    });
  }

  /**
   * Handle attribute fields.
   * @param displayInfo
   */
  private _addFieldInfo(displayInfo: DisplayInfo): void {
    const {
      graphic,
      graphic: { attributes },
      _fields,
      _displayInfos,
    } = this;

    const { fieldName, label, prefix, suffix, anchorText, replaceNull, dateFormat, timeZone, formatter } = displayInfo;

    // get field
    const field = _fields.find((field: esri.Field): boolean => {
      return field.name === fieldName;
    });

    // abort if no field
    if (!field) return;

    const { alias, domain, type } = field;

    // field's value
    const value = attributes[fieldName];

    // omit null value row
    if ((value === null || value === '') && (displayInfo.omitNull === undefined ? true : displayInfo.omitNull)) return;

    // display info
    const info: _DisplayInfo = {
      label: label || alias || fieldName,
      value: value,
      isUrl:
        typeof value === 'string' &&
        value.match(
          new RegExp(
            /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
          ),
        )
          ? true
          : false,
      anchorText: anchorText || 'View',
    };

    // formatter always takes precedent
    if (formatter && typeof formatter === 'function') {
      info.value = formatter(info.value, fieldName, graphic, field.domain);
    } else {
      // domain
      if (domain && domain.type === 'coded-value') {
        info.value = domain.codedValues.find((codedValue: esri.CodedValue): boolean => {
          return codedValue.code === info.value;
        })?.name;
      }

      // dates
      if (type === 'date') {
        const dateTime = timeZone
          ? DateTime.fromMillis(info.value).setZone(timeZone)
          : DateTime.fromMillis(info.value).toUTC();

        info.value = dateTime.toLocaleString(dateFormat || DateTime.DATETIME_FULL);
      }

      // replace null
      if ((info.value === null || info.value === '') && replaceNull !== undefined) {
        info.value = replaceNull;
      }

      // prefix and suffix
      // don't apply to urls
      info.value = !info.isUrl ? `${prefix || ''}${info.value}${suffix || ''}` : info.value;
    }

    // add display info
    _displayInfos.add(info);
  }

  private _queryAttachments(graphic: esri.Graphic, layer: esri.FeatureLayer): void {
    const { _attachments } = this;

    const objectId = graphic.attributes[layer.objectIdField];

    layer
      .queryAttachments({
        objectIds: [objectId],
      })
      .then((results: any): void => {
        const attachments = results[objectId] as esri.AttachmentInfo[] | undefined;

        if (attachments) _attachments.addMany(attachments);
      })
      .catch((error: esri.Error): void => {
        console.log(error);
      });
  }

  private _downloadAttachment(url: string, name: string): void {
    esriRequest(url, {
      responseType: 'blob',
    }).then((response: esri.RequestResponse) => {
      const a = document.createElement('a');
      a.setAttribute('href', URL.createObjectURL(response.data as Blob));
      a.setAttribute('download', name);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  render(): tsx.JSX.Element {
    return (
      <div>
        <table class={CSS.table}>{this._renderTableRows()}</table>
        {this._renderAttachments()}
      </div>
    );
  }

  /**
   * Create table rows.
   */
  private _renderTableRows(): tsx.JSX.Element[] {
    const { _displayInfos } = this;

    return _displayInfos
      .map((info: _DisplayInfo): tsx.JSX.Element => {
        const { label, value, isUrl, anchorText } = info;

        return (
          <tr key={KEY++}>
            <th class={CSS.th}>{label}</th>
            <td
              class={CSS.td}
              afterCreate={(td: HTMLTableCellElement): void => {
                td.innerHTML = isUrl
                  ? `<calcite-link href="${value}" target="_blank" rel="noopener">${anchorText}</calcite-link>`
                  : value;
              }}
            ></td>
          </tr>
        );
      })
      .toArray();
  }

  /**
   * Create attachments.
   */
  private _renderAttachments(): tsx.JSX.Element {
    const { _attachments } = this;

    return (
      <div key={KEY++} style={STYLES.attachments}>
        {_attachments
          .map((attachment: esri.AttachmentInfo): tsx.JSX.Element => {
            const { name, contentType, url } = attachment;

            return (
              <calcite-list-item key={KEY++} non-interactive="" label={name}>
                {contentType.includes('image/') ? (
                  <calcite-action
                    slot="actions-end"
                    scale="s"
                    icon="image"
                    afterCreate={(action: HTMLCalciteActionElement): void => {
                      action.addEventListener('click', (): void => {
                        this._photoModal.show(name, url);
                      });
                    }}
                  ></calcite-action>
                ) : null}
                <calcite-action
                  slot="actions-end"
                  scale="s"
                  icon="download"
                  afterCreate={(action: HTMLCalciteActionElement): void => {
                    action.addEventListener('click', (): void => {
                      this._downloadAttachment(url, name);
                    });
                  }}
                ></calcite-action>
              </calcite-list-item>
            );
          })
          .toArray()}
      </div>
    );
  }
}

@subclass('FeaturePopup.PhotoModal')
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
    _modal.open = true;
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
              this._modal.open = false;
            });
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}

@subclass('FeaturePopup')
export default class FeaturePopup extends PopupTemplate {
  constructor(
    properties: esri.PopupTemplateProperties & {
      displayInfos?: DisplayInfo[];
      attachments?: boolean;
    },
  ) {
    super(properties);
  }

  title = 'Feature';

  outFields = ['*'];

  displayInfos!: DisplayInfo[];

  attachments = true;

  customContent = new CustomContent({
    creator: (event: any): Widget => {
      const { expressionInfos, displayInfos, attachments } = this;

      return new Content({
        graphic: event.graphic,
        expressionInfos,
        displayInfos,
        attachments,
      });
    },
  });

  content = [this.customContent];
}
