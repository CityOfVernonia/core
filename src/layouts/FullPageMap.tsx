//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * FullPageMap widget constructor properties.
 */
export interface FullPageMapProperties extends esri.WidgetProperties {
  /**
   * Disclaimer options.
   */
  disclaimerOptions?: DisclaimerOptions;
  /**
   * Include disclaimer.
   * @default true
   */
  includeDisclaimer?: boolean;
  /**
   * Loader options.
   */
  loaderOptions?: LoaderOptions;
  /**
   * Next basemap for basemap toggle.
   */
  nextBasemap?: esri.Basemap;
  /**
   * Map or scene to display.
   */
  view: esri.MapView | esri.SceneView;
  /**
   * View control options.
   */
  viewControlOptions?: ViewControlOptions;
}

//////////////////////////////////////
// Types
//////////////////////////////////////
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl2D';

//////////////////////////////////////
// Modules
//////////////////////////////////////
import esriConfig from '@arcgis/core/config';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Loader, { LoaderOptions } from '../widgets/Loader';
import Disclaimer from '../widgets/Disclaimer';
import ViewControl2D from '../widgets/ViewControl2D';
import basemapToggle from '../support/basemapToggle';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  view: 'cov-layouts--full-page-map_view',
};

/**
 * Full page map layout.
 */
@subclass('cov.layouts.FullPageMap')
export default class FullPageMap extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  constructor(properties: FullPageMapProperties) {
    super(properties);
    const { container } = this;
    document.body.append(container);
    properties.view.container = container;
  }

  async postInitialize(): Promise<void> {
    const {
      disclaimerOptions,
      loaderOptions,
      nextBasemap,
      view,
      view: { ui },
      viewControlOptions,
    } = this;
    const loader = new Loader(loaderOptions);

    ui.remove('zoom');
    if (view.type === '2d') {
      ui.add(new ViewControl2D({ view, ...viewControlOptions }), 'top-left');
    } else {
      // TODO: add view control 3D
    }

    if (nextBasemap) basemapToggle(view, nextBasemap, 'bottom-right');

    let { includeDisclaimer } = this;
    try {
      if (await IdentityManager.checkSignInStatus(esriConfig.portalUrl)) includeDisclaimer = false;
    } catch (error) {
      includeDisclaimer = true;
    }
    if (includeDisclaimer && !Disclaimer.isAccepted()) new Disclaimer(disclaimerOptions);

    await view.when();
    loader.end();
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  disclaimerOptions: DisclaimerOptions = {};

  includeDisclaimer = true;

  loaderOptions: LoaderOptions = {};

  nextBasemap!: esri.Basemap;

  view!: esri.MapView | esri.SceneView;

  viewControlOptions: ViewControlOptions = {};

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    return <div class={CSS.view}></div>;
  }
}
