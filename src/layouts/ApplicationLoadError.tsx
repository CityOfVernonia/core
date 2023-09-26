//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Application load error widget properties.
 */
interface ApplicationLoadErrorProperties extends esri.WidgetProperties {
  /**
   * Error notice link options.
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

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * Application load error widget.
 */
@subclass('cov.layouts.ApplicationLoadError')
export default class ApplicationLoadError extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  constructor(properties?: ApplicationLoadErrorProperties) {
    super(properties);
    document.body.append(this.container);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  link!: ApplicationLoadErrorProperties['link'];

  message = 'Application was unable to load. Try refreshing the page.';

  title = 'Oh snap!';

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { link, message, title } = this;
    return (
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 500px;">
          <calcite-notice icon="frown" kind="danger" open="" scale="l">
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
