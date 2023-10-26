import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Header with 100% width search for use in apps primarily consumed on mobile.
 */
export default class Header extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Search view model to back Search component.
         */
        searchViewModel: esri.SearchViewModel;
    });
    searchViewModel: esri.SearchViewModel;
    render(): tsx.JSX.Element;
}
