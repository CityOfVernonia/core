import esri = __esri;

/**
 * MarkdownDialog properties.
 */
export interface MarkdownDialogProperties extends esri.WidgetProperties {
  cssClass?: string;
  closeText?: string;
  heading: string;
  url: string;
  width?: 's' | 'm' | 'l';
}

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * Information dialog for that parses markdown for content.
 */
@subclass('cov.components.MarkdownDialog')
export default class MarkdownDialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties: MarkdownDialogProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  override async postInitialize(): Promise<void> {
    const { container, url } = this;

    const markdown = await (await fetch(url, { cache: 'reload' })).text();

    const marked = await import('marked');

    marked.use({
      gfm: true,
      extensions: [
        {
          name: 'link',
          renderer: (token): string | false | undefined => {
            const { href, text } = token;

            const blank = '::_blank';

            if (text.includes(blank)) {
              return `<a href=${href} target="_blank">${text.replace(blank, '')}</a>`;
            } else {
              return `<a href=${href}>${text}</a>`;
            }
          },
        },
      ],
    });

    (container.querySelector('div') as HTMLDivElement).innerHTML = await marked.parse(markdown);
  }

  readonly cssClass = 'cov--markdown-dialog';

  @property()
  readonly closeText = 'Close';

  readonly heading!: string;

  readonly url!: string;

  readonly width: 's' | 'm' | 'l' = 'm';

  override render(): tsx.JSX.Element {
    const { cssClass, closeText, heading, width } = this;
    return (
      <calcite-dialog heading={heading} modal width={width}>
        <div class={cssClass}></div>
        <calcite-button
          slot="footer-end"
          onclick={(): void => {
            this.container.open = false;
          }}
        >
          {closeText}
        </calcite-button>
      </calcite-dialog>
    );
  }
}
