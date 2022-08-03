////////////////////////////////////////////
// modules
////////////////////////////////////////////

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layout, { CSS } from './Layout';

/**
 * Application layout with just a map.
 */
@subclass('cov.layouts.MapLayout')
export default class MapLayout extends Layout {
  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { view, header, footer } = this;
    return (
      <calcite-shell>
        {/* header */}
        {header ? (
          <div
            slot="header"
            afterCreate={(container: HTMLDivElement) => {
              header.container = container;
            }}
          ></div>
        ) : null}
        {/* view */}
        <div
          class={CSS.view}
          afterCreate={(container: HTMLDivElement) => {
            view.container = container;
          }}
        ></div>
        {/* footer */}
        {footer ? (
          <div
            slot="footer"
            afterCreate={(container: HTMLDivElement) => {
              footer.container = container;
            }}
          ></div>
        ) : null}
      </calcite-shell>
    );
  }
}
