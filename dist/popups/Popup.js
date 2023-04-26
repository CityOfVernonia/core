import { __awaiter, __decorate } from "tslib";
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
const url = (value) => {
    return typeof value === 'string' &&
        value.match(new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/))
        ? true
        : false;
};
/**
 * Table of fields.
 */
let Fields = class Fields extends Widget {
    constructor(properties) {
        super(properties);
        this.executors = {};
        this.rows = new Collection();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { graphic, graphic: { attributes }, fieldInfos, expressions, executors, } = this;
            //@ts-ignore
            const layer = graphic.sourceLayer || graphic.layer;
            // create arcade executors
            for (const expression in expressions) {
                executors[`expression/${expression}`] = yield createArcadeExecutor(expressions[expression], {
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
            fieldInfos.forEach((fieldInfo) => {
                var _a;
                const { fieldName, label, codedDomainValues, prefix, suffix, anchorText, omitNull, replaceNull, dateFormat, timeZone, formatter, } = fieldInfo;
                let value;
                let _anchorText;
                // execute expressions
                const executor = executors[`expression/${fieldName}`];
                if (executor) {
                    value = executor.execute({
                        $feature: graphic,
                        $layer: layer,
                    });
                    if (anchorText && typeof anchorText === 'function')
                        _anchorText = anchorText(value, graphic);
                    this.createRow({
                        label: label || fieldName,
                        value,
                        isUrl: url(value),
                        anchorText: _anchorText || 'View',
                    });
                    return;
                }
                // field
                const field = layer.fields.find((field) => {
                    return field.name === fieldName;
                });
                if (!field)
                    return;
                const { alias, domain, type } = field;
                // value
                value = attributes[fieldName];
                // replace null
                if ((value === null || value === '') && replaceNull !== undefined) {
                    value = replaceNull;
                }
                // omit null value row
                if ((value === null || value === '') && (omitNull === undefined ? true : omitNull))
                    return;
                if (anchorText && typeof anchorText === 'function')
                    _anchorText = anchorText(value, graphic);
                const rowInfo = {
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
                    rowInfo.value = (_a = domain.codedValues.find((codedValue) => {
                        return codedValue.code === rowInfo.value;
                    })) === null || _a === void 0 ? void 0 : _a.name;
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
        });
    }
    render() {
        return tsx("table", { class: "esri-widget__table" }, this.rows.toArray());
    }
    createRow(rowInfo) {
        const { rows } = this;
        const { label, value, isUrl, anchorText } = rowInfo;
        const link = isUrl ? (tsx("calcite-link", { href: value, target: "_blank", rel: "noopener" }, anchorText || 'View')) : null;
        rows.add(tsx("tr", null,
            tsx("th", null, label),
            link ? (tsx("td", null, link)) : (tsx("td", { afterCreate: (td) => {
                    td.innerHTML = value;
                } }))));
    }
};
__decorate([
    property()
], Fields.prototype, "rows", void 0);
Fields = __decorate([
    subclass('Fields')
], Fields);
let photoModal;
let Photos = class Photos extends Widget {
    constructor(properties) {
        super(properties);
        this.photos = new Collection();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { graphic, url, photos } = this;
            if (!photoModal)
                photoModal = new (yield import('./../modals/PhotoModal')).default();
            //@ts-ignore
            const layer = graphic.sourceLayer || graphic.layer;
            const q = yield request(`${url}/query`, {
                responseType: 'json',
                query: {
                    f: 'json',
                    //@ts-ignore
                    where: `facility_id = '${graphic.attributes[layer.globalIdField]}'`,
                    outFields: ['*'],
                },
            });
            const feature = q.data.features[0];
            if (!feature)
                return;
            const a = yield request(`${url}/${feature.attributes.objectid}/attachments`, {
                responseType: 'json',
                query: {
                    f: 'json',
                },
            });
            const attachments = a.data.attachmentInfos;
            attachments.forEach((attachment, index) => {
                const { contentType, id } = attachment;
                if (contentType !== 'image/jpeg')
                    return;
                const name = `Photo ${index + 1}`;
                photos.add(tsx("calcite-link", { onclick: () => {
                        photoModal.show(`${name}.jpg`, `${url}/${feature.attributes.objectid}/attachments/${id}`);
                    } }, name));
            });
        });
    }
    render() {
        const { photos } = this;
        if (!photos.length)
            return tsx("div", null);
        return (tsx("div", { style: "display: flex; flex-flow: row; gap: 0.75rem; margin: 0.25rem; font-size: var(--calcite-font-size--2)" }, photos.toArray()));
    }
};
__decorate([
    property()
], Photos.prototype, "photos", void 0);
Photos = __decorate([
    subclass('Photos')
], Photos);
const popup = (options) => {
    const { title, outFields, fieldInfos, expressions, photosUrl } = options;
    const content = [];
    if (fieldInfos)
        content.push(new CustomContent({
            creator: (event) => {
                if (!event)
                    return 'Something has gone wrong...';
                return new Fields({
                    graphic: event.graphic,
                    fieldInfos,
                    expressions,
                });
            },
        }));
    if (photosUrl) {
        content.push(new CustomContent({
            creator: (event) => {
                if (!event)
                    return 'Something has gone wrong...';
                return new Photos({
                    graphic: event.graphic,
                    url: photosUrl,
                });
            },
        }));
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
