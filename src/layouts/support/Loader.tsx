//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Options for configuring Loader.
 */
export interface LoaderOptions {
  /**
   * Application title.
   * @default 'Vernonia'
   */
  title?: string;
  /**
   * Copyright text.
   * @default 'City of Vernonia'
   */
  copyright?: string;
  /**
   * Logo base64 encoded svg.
   * Set `false` for no logo.
   * @default 'Vernonia 3 Trees'
   */
  logo?: string | false;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import logoSvg, { coffeePath, heartPath } from './logo';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  loader: 'cov-layouts-support--loader',
  loaderTitle: 'cov-layouts-support--loader_title',
  loaderInfo: 'cov-layouts-support--loader_info',
  loaderHeart: 'cov-layouts-support--loader_heart',
  loaderCoffee: 'cov-layouts-support--loader_coffee',
};

/**
 * Application loader widget.
 */
@subclass('cov.layouts.support.Loader')
export default class Loader extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  constructor(properties?: esri.WidgetProperties & LoaderOptions) {
    super(properties);
    document.body.append(this.container);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  title = 'Vernonia';

  copyright = 'City of Vernonia';

  logo: string | false = logoSvg;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * End and destroy loader.
   */
  end(): void {
    const { container } = this;
    setTimeout((): void => {
      container.style.opacity = '0';
    }, 2500);
    setTimeout((): void => {
      this.destroy();
    }, 3500);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { title, copyright, logo } = this;
    return (
      <div class={CSS.loader}>
        <div class={CSS.loaderTitle}>
          <div>{title}</div>
          <calcite-progress type="indeterminate"></calcite-progress>
        </div>
        <div class={CSS.loaderInfo}>
          <div>
            Copyright &copy; {new Date().getFullYear()} {copyright}
          </div>
          <div>
            <span>Made with</span>
            <svg
              class={CSS.loaderHeart}
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path fill="currentColor" d={heartPath}></path>
            </svg>
            <span>and</span>
            <svg
              class={CSS.loaderCoffee}
              aria-hidden="true"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path fill="currentColor" d={coffeePath}></path>
            </svg>
            <span>in Vernonia, Oregon</span>
          </div>
        </div>
        {logo ? <img src={logo} alt={copyright} /> : null}
      </div>
    );
  }
}
