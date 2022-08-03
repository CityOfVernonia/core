////////////////////////////////////////////
// types
////////////////////////////////////////////

import esri = __esri;
import type { LoaderOptions } from '../widgets/Loader';
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl';

////////////////////////////////////////////
// interfaces
////////////////////////////////////////////

/**
 * Options for configuring heading.
 */
interface HeadingOptions extends Object {
  /**
   * URL to image or svg to display in heading.
   * Height set to 24px.
   */
  iconUrl?: string;

  /**
   * Heading title.
   */
  title?: string;

  /**
   * Saerch configuration for heading search.
   */
  searchViewModel?: esri.SearchViewModel;

  /**
   * Menu widget to be added to menu panel.
   * Note: Must return `div` root node and `container` property must not be set.
   */
  menuWidget?: esri.Widget;

  /**
   *
   */
  menuHeading?: string;
}

/**
 * Base properties for all layouts.
 */
export interface LayoutProperties extends esri.WidgetProperties {
  /**
   * Map or scene view.
   */
  view: esri.MapView | esri.SceneView;

  /**
   * Options for configuring loader.
   */
  loaderOptions?: LoaderOptions;

  /**
   * Include disclaimer.
   * @default false
   */
  includeDisclaimer?: boolean;

  /**
   * Options for configuring disclaimer.
   */
  disclaimerOptions?: DisclaimerOptions;

  /**
   * Include heading.
   * @default false
   */
  includeHeading?: boolean;

  /**
   * Options for configuring heading.
   */
  headingOptions?: HeadingOptions;

  /**
   * Options for configuring view control.
   */
  viewControlOptions?: ViewControlOptions;

  /**
   * `nextBasemap` for BasemapToggle.
   */
  nextBasemap?: esri.Basemap;

  /**
   * Shell header widget.
   * Note: Must return `div` root node and `container` property must not be set.
   */
  header?: esri.Widget;

  /**
   * Shell footer widget.
   * Note: Must return `div` root node and `container` property must not be set.
   */
  footer?: esri.Widget;
}

////////////////////////////////////////////
// modules
////////////////////////////////////////////

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Loader from '../widgets/Loader';
import Disclaimer from '../widgets/Disclaimer';
import ViewControl from '../widgets/ViewControl';

////////////////////////////////////////////
// classes for all layouts
////////////////////////////////////////////

export const CSS = {
  view: 'cov-layout--view',
  actionBar: 'cov-layout--action-bar',

  // heading
  heading: 'cov-layout--heading',
  headingMenuIcon: 'cov-layout--heading-menu-icon',
  headingIcon: 'cov-layout--heading-icon',
  headingTitle: 'cov-layout--heading-title',
  headingSearch: 'cov-layout--heading-search',

  // menu
  menu: 'cov-layout--heading-menu',
  menuOpen: 'cov-layout--heading-menu-open',
  menuBackground: 'cov-layout--menu-background',

  // action pad panels
  actionPadPanels: 'cov-layout--action-pad-panels',
};

/**
 * A base shell layout class for all layouts.
 * Note: this is just the base layout class. Do not use as a layout widget.
 */
@subclass('cov.layouts.Layout')
export default class Layout extends Widget {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(properties: esri.WidgetProperties & LayoutProperties) {
    super(properties);

    // append container
    document.body.append(this.container);

    const {
      view,
      loaderOptions,
      includeDisclaimer,
      disclaimerOptions,
      includeHeading,
      headingOptions,
      viewControlOptions,
      nextBasemap,
    } = properties;

    // initialize loader
    const loader = new Loader(loaderOptions || {});

    // end and destroy loader when view loaded
    view.when((): void => {
      loader.end();
    });

    // initialize disclaimer
    if (includeDisclaimer && !Disclaimer.isAccepted()) {
      new Disclaimer({
        ...(disclaimerOptions || {}),
      });
    }

    // initialize heading
    if (includeHeading) {
      new Heading({
        ...(headingOptions ? headingOptions : {}),
        ...(headingOptions && headingOptions.searchViewModel ? { view } : {}),
      });
    }

    // clear default zoom
    view.ui.empty('top-left');

    // add view control
    view.ui.add(
      new ViewControl({
        ...(viewControlOptions || {}),
        // TODO: update ViewControl to handle 3d
        // @ts-ignore
        view,
        fullscreenElement: document.body,
      }),
      'bottom-right',
    );

    // add basemap toggle
    if (nextBasemap) {
      import('@arcgis/core/widgets/BasemapToggle').then((module: any) => {
        view.ui.add(
          new (module.default as esri.BasemapToggleConstructor)({
            view,
            nextBasemap,
          }),
          'bottom-right',
        );
      });
    }
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  container = document.createElement('calcite-shell');

  view!: esri.MapView;

  header!: esri.Widget;

  footer!: esri.Widget;
}

/**
 * Vernonia style heading widget.
 */
@subclass('Heading')
class Heading extends Widget {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(
    properties: esri.WidgetProperties &
      HeadingOptions & {
        view?: esri.MapView | esri.SceneView;
      },
  ) {
    super(properties);

    // append container
    document.body.append(this.container);

    const { title, menuWidget } = properties;

    // initailize menu
    if (menuWidget) {
      this.menu = new Menu({
        title: title || this.title,
        widget: menuWidget,
      });
    }
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  container = document.createElement('div');

  iconUrl!: string;

  title!: string;

  searchViewModel!: esri.SearchViewModel;

  menu!: Menu;

  view!: esri.MapView | esri.SceneView;

  ////////////////////////////////////////////
  // private methods
  ////////////////////////////////////////////

  /**
   * Create search widget.
   * @param container
   */
  private _createSeach(container: HTMLDivElement): void {
    const { searchViewModel, view } = this;

    if (!searchViewModel.view) searchViewModel.view = view;

    import('@arcgis/core/widgets/Search').then((module: any) => {
      new (module.default as any)({
        viewModel: searchViewModel,
        container,
      });
    });
  }

  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { id, iconUrl, title, searchViewModel, menu } = this;

    const tooltip = `tooltip_${id}`;

    return (
      <div class={CSS.heading}>
        {/* menu icon and tooltip */}
        {menu ? (
          <calcite-icon
            class={CSS.headingMenuIcon}
            id={tooltip}
            icon="hamburger"
            afterCreate={(icon: HTMLCalciteIconElement): void => {
              icon.addEventListener('click', (): void => {
                this.menu.open = true;
              });
            }}
          ></calcite-icon>
        ) : null}
        {menu ? (
          <calcite-tooltip reference-element={tooltip} placement="bottom" close-on-click="">
            Menu
          </calcite-tooltip>
        ) : null}
        {/* icon logo */}
        {iconUrl ? <img class={CSS.headingIcon} src={iconUrl}></img> : null}
        {/* heading */}
        {title ? <div class={CSS.headingTitle}>{title}</div> : null}
        {/* search */}
        {searchViewModel ? <div class={CSS.headingSearch} afterCreate={this._createSeach.bind(this)}></div> : null}
      </div>
    );
  }
}

/**
 * Menu widget.
 */
@subclass('Menu')
class Menu extends Widget {
  ////////////////////////////////////////////
  // lifecycle
  ////////////////////////////////////////////

  constructor(
    properties?: esri.WidgetProperties & {
      title: string;
      widget: esri.Widget;
    },
  ) {
    super(properties);

    // append container
    document.body.append(this.container);

    // close menu on escape keydown
    document.addEventListener('keydown', (event: KeyboardEvent): void => {
      if (this.open && event.key === 'Escape') this.open = false;
    });
  }

  ////////////////////////////////////////////
  // properties
  ////////////////////////////////////////////

  container = document.createElement('div');

  title = 'Menu';

  widget!: esri.Widget;

  @property()
  open = false;

  ////////////////////////////////////////////
  // render and rendering specific methods
  ////////////////////////////////////////////

  render(): tsx.JSX.Element {
    const { id, title, widget, open } = this;

    const tooltip = `tooltip_${id}`;

    return (
      <div class={CSS.menu} hidden={!open}>
        {/* menu panel */}
        <calcite-panel class={open ? CSS.menuOpen : ''} heading={title}>
          {/* close button */}
          <calcite-action
            id={tooltip}
            slot="header-actions-end"
            icon="x"
            afterCreate={(action: HTMLCalciteActionElement): void => {
              action.addEventListener('click', (): void => {
                this.open = false;
              });
            }}
          ></calcite-action>
          <calcite-tooltip reference-element={tooltip} placement="bottom" close-on-click="">
            Close
          </calcite-tooltip>
          {/* menu widget element */}
          <div
            afterCreate={(container: HTMLDivElement): void => {
              widget.container = container;
            }}
          ></div>
        </calcite-panel>
        {/* background */}
        <div
          class={CSS.menuBackground}
          afterCreate={(div: HTMLDivElement): void => {
            div.addEventListener('click', (): void => {
              this.open = false;
            });
          }}
        ></div>
      </div>
    );
  }
}
