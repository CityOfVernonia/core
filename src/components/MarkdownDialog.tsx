import esri = __esri;

/**
 * MarkdownDialog properties.
 */
export interface MarkdownDialogProperties extends esri.WidgetProperties {
  cssClass?: string;
  closeText?: string;
  title: string;
  url: string;
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

    const parse = (await import('marked')).parse;

    (container.querySelector('div') as HTMLDivElement).innerHTML = await parse(markdown);
  }

  readonly cssClass?: string;

  @property()
  readonly closeText = 'Close';

  readonly title!: string;

  readonly url!: string;

  override render(): tsx.JSX.Element {
    const { cssClass, closeText, title } = this;
    return (
      <calcite-dialog heading={title} modal>
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
