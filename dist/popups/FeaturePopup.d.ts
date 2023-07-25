import esri = __esri;
interface DisplayInfo {
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
    domain?: esri.CodedValueDomain | esri.RangeDomain | esri.InheritedDomain) => string;
}
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { DateTimeFormatOptions } from 'luxon';
export default class FeaturePopup extends PopupTemplate {
    constructor(properties: esri.PopupTemplateProperties & {
        displayInfos?: DisplayInfo[];
        attachments?: boolean;
    });
    title: string;
    outFields: string[];
    displayInfos: DisplayInfo[];
    attachments: boolean;
    customContent: esri.CustomContent;
    content: esri.CustomContent[];
}
export {};
