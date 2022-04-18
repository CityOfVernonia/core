import esri = __esri;
import type OAuth from './../support/OAuth';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Account control widget.
 */
export default class AccountControl extends Widget {
    constructor(properties: esri.WidgetProperties & {
        oAuth: OAuth;
    });
    oAuth: OAuth;
    render(): tsx.JSX.Element;
}
