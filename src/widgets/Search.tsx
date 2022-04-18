import esri = __esri;

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import _Search from '@arcgis/core/widgets/Search';

const CSS = {
  base: 'cov-search',
};

@subclass('cov.widgets.Search')
export default class Search extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      view: esri.MapView;
      searchViewModel?: esri.SearchViewModel;
    },
  ) {
    super(properties);

    const { view, searchViewModel } = properties;

    if (searchViewModel) {
      searchViewModel.view = view;
      this.search = new _Search({
        viewModel: searchViewModel,
      });
    } else {
      this.search = new _Search({
        view,
      });
    }
  }

  searchViewModel!: esri.SearchViewModel;

  protected search!: _Search;

  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div
          afterCreate={(div: HTMLDivElement): void => {
            this.search.container = div;
          }}
        ></div>
      </div>
    );
  }
}
