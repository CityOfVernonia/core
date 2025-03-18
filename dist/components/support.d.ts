/**
 * Check if a string is a url.
 * @param url string to check
 * @returns boolean
 */
export declare const isUrl: (url: string) => boolean;
/**
 * Set tooltip or popover `referenceElement` property being previous sibling.
 * @param element HTMLCalciteTooltipElement | HTMLCalcitePopoverElement
 */
export declare const referenceElement: (element: HTMLCalciteTooltipElement | HTMLCalcitePopoverElement) => void;
/**
 * Wrap specific value in text with html tags.
 * @param text the text string
 * @param value value to wrap in html tags
 * @param tag html tag (default `strong`)
 * @param cssClass optional css class
 * @returns string
 */
export declare const wrapValuesInHtml: (text: string, value: string, tag?: "div" | "span" | "strong", cssClass?: string) => string;
