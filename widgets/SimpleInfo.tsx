/**
 * Simple info widget for displaying text.
 */

// namespaces and types
import esri = __esri;

// constructor properties
export interface SimpleInfoProperties extends esri.WidgetProperties {
  /**
   * Head text.
   */
  heading?: string;
  /**
   * Array of strings of HTML paragraph element innerHTML.
   */
  paragraphs?: string[];
}

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './SimpleInfo/styles/SimpleInfo.scss';
const CSS = {
  base: 'cov-simple-info',
  scroll: 'cov-simple-info--scroll',
};

// class export
@subclass('cov.widgets.SimpleInfo')
export default class SimpleInfo extends Widget {
  @property()
  heading = 'Heading';

  @property()
  paragraphs: string[] = ["I'm a paragraph.", "I'm another paragraph."];

  constructor(properties?: SimpleInfoProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const { heading, paragraphs } = this;

    return (
      <div class={CSS.base}>
        <div class={CSS.scroll}>
          <h3>{heading}</h3>
          {paragraphs.map((paragraph: string, key: number): tsx.JSX.Element => {
            return (
              <p
                key={key}
                afterCreate={(p: HTMLParagraphElement) => {
                  p.innerHTML = paragraph;
                }}
              ></p>
            );
          })}
        </div>
      </div>
    );
  }
}
