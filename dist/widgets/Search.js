import { __decorate } from "tslib";
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import _Search from '@arcgis/core/widgets/Search';
const CSS = {
    base: 'cov-search',
};
let Search = class Search extends Widget {
    constructor(properties) {
        super(properties);
        const { view, searchViewModel } = properties;
        if (searchViewModel) {
            searchViewModel.view = view;
            this.search = new _Search({
                viewModel: searchViewModel,
            });
        }
        else {
            this.search = new _Search({
                view,
            });
        }
    }
    render() {
        return (tsx("div", { class: CSS.base },
            tsx("div", { afterCreate: (div) => {
                    this.search.container = div;
                } })));
    }
};
Search = __decorate([
    subclass('cov.widgets.Search')
], Search);
export default Search;
