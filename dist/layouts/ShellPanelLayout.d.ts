import esri = __esri;
import type { LayoutProperties } from './Layout';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Layout from './Layout';
/**
 * Application layout with shell panel.
 */
export default class ShellPanelLayout extends Layout {
    constructor(properties: esri.WidgetProperties & LayoutProperties & {
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
    });
    shellPanel: esri.Widget;
    position?: 'start' | 'end';
    render(): tsx.JSX.Element;
}
