import esri = __esri;

/**
 * ApplicationLoadError constructor properties.
 */
export interface ApplicationLoadErrorProperties extends esri.WidgetProperties {
  /**
   * Error notice link.
   */
  link?: {
    /**
     * Link URL.
     */
    href: string;
    /**
     * Link text.
     */
    text: string;
  };
  /**
   * Error notice message.
   * @default 'Application was unable to load. Try refreshing the page.'
   */
  message?: string;
  /**
   * Error notice title.
   * @default 'Oh snap!'
   */
  title?: string;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * Component to display error when an application has a loading error.
 */
@subclass('cov.components.ApplicationLoadError')
export default class ApplicationLoadError extends Widget {
  private _container = document.createElement('div');

  get container(): HTMLDivElement {
    return this._container;
  }

  set container(value: HTMLDivElement) {
    this._container = value;
  }

  constructor(properties?: ApplicationLoadErrorProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  link?: ApplicationLoadErrorProperties['link'];

  message = 'Application was unable to load. Try refreshing the page.';

  title = 'Oh snap!';

  override render(): tsx.JSX.Element {
    const { link, message, title } = this;
    return (
      <div style="width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background-color: var(--calcite-color-foreground-2);">
        <div style="max-width: 500px;">
          <calcite-notice icon="frown" kind="danger" open scale="l">
            <div slot="title">{title}</div>
            <div slot="message">{message}</div>
            {link ? (
              <calcite-link href={link.href} target="_blank">
                {link.text}
              </calcite-link>
            ) : null}
          </calcite-notice>
        </div>
      </div>
    );
  }
}
