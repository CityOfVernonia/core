import { __decorate } from "tslib";
import esriRequest from '@arcgis/core/request';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import Collection from '@arcgis/core/core/Collection';
// @ts-ignore
import { createCompiledExpressions } from '@arcgis/core/widgets/Feature/support/arcadeFeatureUtils';
import { DateTime } from 'luxon';
const CSS = {
    table: 'esri-widget__table',
    th: 'esri-feature__field-header',
    td: 'esri-feature__field-data',
};
const STYLES = {
    attachments: 'margin-top: 0.5rem;',
};
let KEY = 0;
let Content = class Content extends Widget {
    constructor(properties) {
        super(properties);
        /**
         * Expression infos.
         */
        this.expressionInfos = [];
        /**
         * Display infos.
         */
        this.displayInfos = [];
        /**
         * Include attachments.
         */
        this.attachments = true;
        /**
         * Collection of info objects to create table rows.
         */
        this._displayInfos = new Collection();
        /**
         * Collection of attachment infos.
         */
        this._attachments = new Collection();
    }
    postInitialize() {
        const { graphic, expressionInfos, displayInfos, attachments, _layer } = this;
        if (displayInfos.length)
            // run expression infos
            createCompiledExpressions({
                expressionInfos,
                graphic,
            }).then((expressions) => {
                displayInfos.forEach((displayInfo) => {
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
     * Handle expressions.
     * @param value
     * @param displayInfo
     */
    _addExpressionInfo(value, displayInfo) {
        var _a;
        const { expressionInfos, _displayInfos } = this;
        const { fieldName, label } = displayInfo;
        // get expression info title
        const title = (_a = expressionInfos.find((expressionInfo) => {
            return expressionInfo.name === fieldName.replace('expression/', '');
        })) === null || _a === void 0 ? void 0 : _a.title;
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
    _addFieldInfo(displayInfo) {
        var _a;
        const { graphic, graphic: { attributes }, _fields, _displayInfos, } = this;
        const { fieldName, label, prefix, suffix, anchorText, replaceNull, dateFormat, timeZone, formatter } = displayInfo;
        // get field
        const field = _fields.find((field) => {
            return field.name === fieldName;
        });
        // abort if no field
        if (!field)
            return;
        const { alias, domain, type } = field;
        // field's value
        const value = attributes[fieldName];
        // omit null value row
        if ((value === null || value === '') && (displayInfo.omitNull === undefined ? true : displayInfo.omitNull))
            return;
        // display info
        const info = {
            label: label || alias || fieldName,
            value: value,
            isUrl: typeof value === 'string' &&
                value.match(new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
                ? true
                : false,
            anchorText: anchorText || 'View',
        };
        // formatter always takes precedent
        if (formatter && typeof formatter === 'function') {
            info.value = formatter(info.value, fieldName, graphic, field.domain);
        }
        else {
            // domain
            if (domain && domain.type === 'coded-value') {
                info.value = (_a = domain.codedValues.find((codedValue) => {
                    return codedValue.code === info.value;
                })) === null || _a === void 0 ? void 0 : _a.name;
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
    _queryAttachments(graphic, layer) {
        const { _attachments } = this;
        const objectId = graphic.attributes[layer.objectIdField];
        layer
            .queryAttachments({
            objectIds: [objectId],
        })
            .then((results) => {
            const attachments = results[objectId];
            if (attachments)
                _attachments.addMany(attachments);
        })
            .catch((error) => {
            console.log(error);
        });
    }
    _downloadAttachment(url, name) {
        esriRequest(url, {
            responseType: 'blob',
        }).then((response) => {
            const a = document.createElement('a');
            a.setAttribute('href', URL.createObjectURL(response.data));
            a.setAttribute('download', name);
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }
    render() {
        return (tsx("div", null,
            tsx("table", { class: CSS.table }, this._renderTableRows()),
            this._renderAttachments()));
    }
    /**
     * Create table rows.
     */
    _renderTableRows() {
        const { _displayInfos } = this;
        return _displayInfos
            .map((info) => {
            const { label, value, isUrl, anchorText } = info;
            return (tsx("tr", { key: KEY++ },
                tsx("th", { class: CSS.th }, label),
                tsx("td", { class: CSS.td, afterCreate: (td) => {
                        td.innerHTML = isUrl
                            ? `<calcite-link href="${value}" target="_blank" rel="noopener">${anchorText}</calcite-link>`
                            : value;
                    } })));
        })
            .toArray();
    }
    /**
     * Create attachments.
     */
    _renderAttachments() {
        const { _attachments } = this;
        return (tsx("div", { key: KEY++, style: STYLES.attachments }, _attachments
            .map((attachment) => {
            const { name, contentType, url } = attachment;
            return (tsx("calcite-list-item", { key: KEY++, "non-interactive": "", label: name },
                contentType.includes('image/') ? (tsx("calcite-action", { slot: "actions-end", scale: "s", icon: "image", afterCreate: (action) => {
                        action.addEventListener('click', () => {
                            this._photoModal.show(name, url);
                        });
                    } })) : null,
                tsx("calcite-action", { slot: "actions-end", scale: "s", icon: "download", afterCreate: (action) => {
                        action.addEventListener('click', () => {
                            this._downloadAttachment(url, name);
                        });
                    } })));
        })
            .toArray()));
    }
};
__decorate([
    property({
        aliasOf: 'graphic.layer',
    })
], Content.prototype, "_layer", void 0);
__decorate([
    property({
        aliasOf: 'graphic.layer.fields',
    })
], Content.prototype, "_fields", void 0);
Content = __decorate([
    subclass('FeaturePopup.Content')
], Content);
let PhotoModal = class PhotoModal extends Widget {
    constructor(properties) {
        super(properties);
        this.container = document.createElement('calcite-modal');
        this._title = 'Photo';
        this._url = '';
        document.body.append(this.container);
    }
    show(title, url) {
        const { _modal } = this;
        this._title = title;
        this._url = url;
        _modal.active = true;
    }
    render() {
        const { _title, _url } = this;
        return (tsx("calcite-modal", { afterCreate: storeNode.bind(this), "data-node-ref": "_modal" },
            tsx("div", { slot: "header" }, _title),
            tsx("div", { slot: "content" },
                tsx("img", { style: "width: 100%;", src: _url })),
            tsx("calcite-button", { slot: "primary", afterCreate: (calciteButton) => {
                    calciteButton.addEventListener('click', () => {
                        this._modal.active = false;
                    });
                } }, "Close")));
    }
};
__decorate([
    property()
], PhotoModal.prototype, "_title", void 0);
__decorate([
    property()
], PhotoModal.prototype, "_url", void 0);
PhotoModal = __decorate([
    subclass('FeaturePopup.PhotoModal')
], PhotoModal);
let FeaturePopup = class FeaturePopup extends PopupTemplate {
    constructor(properties) {
        super(properties);
        this.title = 'Feature';
        this.outFields = ['*'];
        this.attachments = true;
        this.customContent = new CustomContent({
            creator: (event) => {
                const { expressionInfos, displayInfos, attachments } = this;
                return new Content({
                    graphic: event.graphic,
                    expressionInfos,
                    displayInfos,
                    attachments,
                });
            },
        });
        this.content = [this.customContent];
    }
};
FeaturePopup = __decorate([
    subclass('FeaturePopup')
], FeaturePopup);
export default FeaturePopup;
