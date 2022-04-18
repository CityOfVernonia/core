import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import _Search from '@arcgis/core/widgets/Search';
export default class Search extends Widget {
    constructor(properties: esri.WidgetProperties & {
        view: esri.MapView;
        searchViewModel?: esri.SearchViewModel;
    });
    searchViewModel: esri.SearchViewModel;
    protected search: _Search;
    render(): tsx.JSX.Element;
}
