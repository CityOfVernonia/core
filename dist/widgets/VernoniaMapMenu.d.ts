import esri = __esri;
import type Oauth from './../support/OAuth';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class VernoniaMapMenu extends Widget {
    constructor(properties: esri.WidgetProperties & {
        oAuth: Oauth;
    });
    protected oAuth: Oauth;
    private _heart;
    private _coffee;
    render(): tsx.JSX.Element;
}
