////////////////////////////////////////////
// types
////////////////////////////////////////////

import esri = __esri;
import type { LayoutProperties } from './Layout';

////////////////////////////////////////////
// modules
////////////////////////////////////////////

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layout, { CSS } from './Layout';

/**
 * Application layout with shell panel.
 */
@subclass('cov.layouts.ShellPanelLayout')
export default class ShellPanelLayout extends Layout {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(
    properties: esri.WidgetProperties &
      LayoutProperties & {
        /**
         * Shell panel widget.
         * Note: Must return `calcite-shell-panel` root node and `container` property must not be set.
         */
        shellPanel: esri.Widget;

        /**
         * Shell panel position.
         * Defaults to 'start' if not provided by shell panel widget or here.
         */
        position?: 'start' | 'end';
      },
  ) {
    super(properties);
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  shellPanel!: esri.Widget;

  position?: 'start' | 'end';

  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { view, header, footer, shellPanel, position } = this;
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
        {/* shell panel */}
        <calcite-shell-panel
          slot="primary-panel"
          afterCreate={(container: HTMLCalciteShellPanelElement) => {
            if (!container.position) {
              container.position = position || 'start';
            }
            shellPanel.container = container;
          }}
        ></calcite-shell-panel>
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
