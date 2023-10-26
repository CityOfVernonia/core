//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Search from '@arcgis/core/widgets/Search';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  base: 'cov-layouts--shell-application-map_header',
  search: 'cov-layouts--shell-application-map_header--search',
};

const STYLES = {
  search: 'width: 100%; min-width: auto; max-width: 100%;',
};

/**
 * Header with 100% width search for use in apps primarily consumed on mobile.
 */
@subclass('cov.layouts.SearchHeader')
export default class Header extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Search view model to back Search component.
       */
      searchViewModel: esri.SearchViewModel;
    },
  ) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  searchViewModel!: esri.SearchViewModel;

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    return (
      <div class={CSS.base}>
        <div
          class={CSS.search}
          style={STYLES.search}
          afterCreate={(container: HTMLDivElement): void => {
            const { searchViewModel: viewModel } = this;
            new Search({
              container,
              viewModel,
            });
          }}
        ></div>
      </div>
    );
  }
}
