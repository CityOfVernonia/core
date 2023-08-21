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
import type { DisclaimerOptions } from '../widgets/Disclaimer';
import type { ViewControlOptions } from '../widgets/ViewControl2D';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { LoaderOptions } from '../widgets/Loader';
/**
 * Full page map layout.
 */
export default class FullPageMap extends Widget {
    container: HTMLDivElement;
    constructor(properties: FullPageMapProperties);
    postInitialize(): Promise<void>;
    disclaimerOptions: DisclaimerOptions;
    includeDisclaimer: boolean;
    loaderOptions: LoaderOptions;
    nextBasemap: esri.Basemap;
    view: esri.MapView | esri.SceneView;
    viewControlOptions: ViewControlOptions;
    render(): tsx.JSX.Element;
}
