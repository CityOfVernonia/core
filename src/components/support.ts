// @ts-expect-error not typed
import { escapeRegExpString } from '@arcgis/core/core/string';

const URL_REG_EXP = new RegExp(
  /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
);

/**
 * Check if a string is a url.
 * @param url string to check
 * @returns boolean
 */
export const isUrl = (url: string): boolean => {
  return url.match(URL_REG_EXP) ? true : false;
};

/**
 * Set tooltip or popover `referenceElement` property being previous sibling.
 * @param element HTMLCalciteTooltipElement | HTMLCalcitePopoverElement
 */
export const referenceElement = (element: HTMLCalciteTooltipElement | HTMLCalcitePopoverElement): void => {
  const reference = element.previousElementSibling;

  if (reference) element.referenceElement = reference;
};

/**
 * Wrap specific value in text with html tags.
 * @param text the text string
 * @param value value to wrap in html tags
 * @param tag html tag (default `strong`)
 * @param cssClass optional css class
 * @returns string
 */
export const wrapValuesInHtml = (
  text: string,
  value: string,
  tag?: 'div' | 'span' | 'strong',
  cssClass?: string,
): string => {
  tag = tag || 'strong';

  return text.replace(
    new RegExp(`(${escapeRegExpString(value).split(/\s/).join('|')})`, 'gi'),
    (fragment): string => `<${tag} class="${cssClass}">${fragment}</${tag}>`,
  );
};
