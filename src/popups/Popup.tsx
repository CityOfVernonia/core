import esri = __esri;

import type PhotoModal from './../modals/PhotoModal';

import type { DateTimeFormatOptions } from 'luxon';

export interface PopupOptions {
  title: string;
  outFields?: string[];
  fieldInfos?: FieldInfo[];
  expressions?: { [key: string]: string };
  photosUrl?: string;
}

export interface FieldInfo {
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
   * Use coded domain values.
   * @default true
   */
  codedDomainValues?: boolean;

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
  anchorText?: string | ((value: string | number, graphic: esri.Graphic) => string);

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

interface RowInfo {
  label: string;
  value: any;
  isUrl: boolean;
  anchorText: string;
}

import { createArcadeExecutor } from '@arcgis/core/arcade';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
import Collection from '@arcgis/core/core/Collection';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import request from '@arcgis/core/request';
import { DateTime } from 'luxon';

/**
 * Is a string a URL?
 * @param value string to evaluate
 * @returns boolean
 */
const url = (value: string): boolean => {
  return typeof value === 'string' &&
    value.match(
      new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/),
    )
    ? true
    : false;
};

/**
 * Table of fields.
 */
@subclass('Fields')
class Fields extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
      fieldInfos: FieldInfo[];
      expressions?: { [key: string]: string };
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      graphic,
      graphic: { attributes },
      fieldInfos,
      expressions,
      executors,
    } = this;

    //@ts-ignore
    const layer = (graphic.sourceLayer as esri.Sublayer) || (graphic.layer as esri.FeatureLayer);

    // create arcade executors
    for (const expression in expressions) {
      executors[`expression/${expression}`] = await createArcadeExecutor(expressions[expression], {
        variables: [
          {
            name: '$feature',
            type: 'feature',
          },
          {
            name: '$layer',
            type: 'featureSet',
          },
        ],
      });
    }

    fieldInfos.forEach((fieldInfo: FieldInfo): void => {
      const {
        fieldName,
        label,
        codedDomainValues,
        prefix,
        suffix,
        anchorText,
        omitNull,
        replaceNull,
        dateFormat,
        timeZone,
        formatter,
      } = fieldInfo;

      let value;
      let _anchorText;

      // execute expressions
      const executor = executors[`expression/${fieldName}`];
      if (executor) {
        value = executor.execute({
          $feature: graphic,
          $layer: layer,
        });
        if (anchorText && typeof anchorText === 'function') _anchorText = anchorText(value, graphic);
        this.createRow({
          label: label || fieldName,
          value,
          isUrl: url(value),
          anchorText: _anchorText || 'View',
        });
        return;
      }

      // field
      const field = layer.fields.find((field: esri.Field): boolean => {
        return field.name === fieldName;
      });
      if (!field) return;
      const { alias, domain, type } = field;

      // value
      value = attributes[fieldName];

      // replace null
      if ((value === null || value === '') && replaceNull !== undefined) {
        value = replaceNull;
      }

      // omit null value row
      if ((value === null || value === '') && (omitNull === undefined ? true : omitNull)) return;

      if (anchorText && typeof anchorText === 'function') _anchorText = anchorText(value, graphic);

      const rowInfo: RowInfo = {
        label: label || alias || fieldName,
        value,
        isUrl: url(value),
        anchorText: _anchorText || 'View',
      };

      // call formatter
      if (formatter && typeof formatter === 'function') {
        rowInfo.value = formatter(value, fieldName, graphic, domain);
        // rowInfo.isUrl = url(rowInfo.value);
        this.createRow(rowInfo);
        return;
      }

      // domain
      if (codedDomainValues !== false && domain && domain.type === 'coded-value') {
        rowInfo.value = domain.codedValues.find((codedValue: esri.CodedValue): boolean => {
          return codedValue.code === rowInfo.value;
        })?.name;
      }

      // dates
      if (type === 'date') {
        const dateTime = timeZone
          ? DateTime.fromMillis(rowInfo.value).setZone(timeZone)
          : DateTime.fromMillis(rowInfo.value).toUTC();
        rowInfo.value = dateTime.toLocaleString(dateFormat || DateTime.DATETIME_FULL);
      }

      // prefix and suffix
      // don't apply to urls
      rowInfo.value = !rowInfo.isUrl ? `${prefix || ''}${rowInfo.value}${suffix || ''}` : rowInfo.value;

      this.createRow(rowInfo);
    });
  }

  graphic!: esri.Graphic;

  fieldInfos!: FieldInfo[];

  expressions!: { [key: string]: string };

  executors: { [key: string]: esri.ArcadeExecutor } = {};

  @property()
  rows: Collection<tsx.JSX.Element> = new Collection();

  render(): tsx.JSX.Element {
    return <table class="esri-widget__table">{this.rows.toArray()}</table>;
  }

  createRow(rowInfo: RowInfo): void {
    const { rows } = this;
    const { label, value, isUrl, anchorText } = rowInfo;

    const link = isUrl ? (
      <calcite-link href={value} target="_blank" rel="noopener">
        {anchorText || 'View'}
      </calcite-link>
    ) : null;

    rows.add(
      <tr>
        <th>{label}</th>
        {link ? (
          <td>{link}</td>
        ) : (
          <td
            afterCreate={(td: HTMLTableCellElement): void => {
              td.innerHTML = value;
            }}
          ></td>
        )}
      </tr>,
    );
  }
}

let photoModal: PhotoModal;

@subclass('Photos')
class Photos extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
      url: string;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { graphic, url, photos } = this;

    if (!photoModal) photoModal = new (await import('./../modals/PhotoModal')).default();

    //@ts-ignore
    const layer = (graphic.sourceLayer as esri.Sublayer) || (graphic.layer as esri.FeatureLayer);

    const q = await request(`${url}/query`, {
      responseType: 'json',
      query: {
        f: 'json',
        //@ts-ignore
        where: `facility_id = '${graphic.attributes[layer.globalIdField]}'`,
        outFields: ['*'],
      },
    });

    const feature = q.data.features[0];

    if (!feature) return;

    const a = await request(`${url}/${feature.attributes.objectid}/attachments`, {
      responseType: 'json',
      query: {
        f: 'json',
      },
    });

    const attachments = a.data.attachmentInfos as esri.AttachmentInfo[];

    attachments.forEach((attachment: esri.AttachmentInfo, index: number): void => {
      const { contentType, id } = attachment;
      if (contentType !== 'image/jpeg') return;
      const name = `Photo ${index + 1}`;
      photos.add(
        <calcite-link
          onclick={(): void => {
            photoModal.show(`${name}.jpg`, `${url}/${feature.attributes.objectid}/attachments/${id}`);
          }}
        >
          {name}
        </calcite-link>,
      );
    });
  }

  graphic!: esri.Graphic;

  url!: string;

  @property()
  photos: Collection<tsx.JSX.Element> = new Collection();

  render(): tsx.JSX.Element {
    const { photos } = this;
    if (!photos.length) return <div></div>;
    return (
      <div style="display: flex; flex-flow: row; gap: 0.75rem; margin: 0.25rem; font-size: var(--calcite-font-size--2)">
        {photos.toArray()}
      </div>
    );
  }
}

const popup = (options: PopupOptions): PopupTemplate => {
  const { title, outFields, fieldInfos, expressions, photosUrl } = options;

  const content: esri.ContentProperties[] = [];

  if (fieldInfos)
    content.push(
      new CustomContent({
        creator: (event?: { graphic: esri.Graphic }): Widget | string => {
          if (!event) return 'Something has gone wrong...';
          return new Fields({
            graphic: event.graphic,
            fieldInfos,
            expressions,
          });
        },
      }),
    );

  if (photosUrl) {
    content.push(
      new CustomContent({
        creator: (event?: { graphic: esri.Graphic }): Widget | string => {
          if (!event) return 'Something has gone wrong...';
          return new Photos({
            graphic: event.graphic,
            url: photosUrl,
          });
        },
      }),
    );
  }

  const popupTemplate = new PopupTemplate({
    title,
    outFields: outFields || ['*'],
    content,
    returnGeometry: true,
  });

  return popupTemplate;
};

export default popup;
