import esri = __esri;

/**
 * Options for configuring loader.
 */
export interface LoaderOptions extends Object {
  /**
   * Application title.
   * @default 'Web Map'
   */
  title?: string;

  /**
   * Copyright by who.
   * @default 'City of Vernonia'
   */
  copyright?: string;

  /**
   * Where made with love and coffee.
   * @default 'Vernonia Oregon'
   */
  where?: string;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const CSS = {
  base: 'cov-loader',
  loaderTitle: 'cov-loader--title',
  loaderInfo: 'cov-loader--info',
  loaderHeart: 'cov-loader--heart',
  loaderCoffee: 'cov-loader--coffee',
};

/**
 * Loader widget.
 */
@subclass('cov.widgets.Loader')
export default class Loader extends Widget {
  constructor(properties: esri.WidgetProperties & LoaderOptions) {
    super(properties);

    document.body.append(this.container);
  }

  container = document.createElement('div');

  title = 'Web Map';

  copyright = 'City of Vernonia';

  where = 'Vernonia, Oregon';

  private _heart =
    'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z';

  private _coffee =
    'M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z';

  end(): void {
    const { container } = this;
    setTimeout((): void => {
      container.style.opacity = '0';
    }, 3000);
    setTimeout((): void => {
      this.destroy();
    }, 4000);
  }

  render(): tsx.JSX.Element {
    const { title, copyright, where, _heart, _coffee } = this;

    return (
      <div class={CSS.base}>
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
              <path fill="currentColor" d={_heart}></path>
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
              <path fill="currentColor" d={_coffee}></path>
            </svg>
            <span>in {where}</span>
          </div>
        </div>
      </div>
    );
  }
}
