import esri = __esri;

/**
 * Start namespace.
 */
declare namespace __cov {
  ////////////////////////////////////////////////////////////////////////////////
  // Popups
  ////////////////////////////////////////////////////////////////////////////////

  export class TaxLotPopup extends esri.PopupTemplate {}

  ////////////////////////////////////////////////////////////////////////////////
  // Support
  ////////////////////////////////////////////////////////////////////////////////

  export interface cogo {
    distance(point1: esri.Point | { x: number; y: number }, point2: esri.Point | { x: number; y: number }): number;
    linearInterpolation(point1: esri.Point, point2: esri.Point, linearDistance: number): esri.Point;
    midpoint(polyline: esri.Polyline): esri.Point;
  }

  export interface colors {
    hexColors: HashMap<string>;
    rgbColors: HashMap<[number, number, number]>;
  }

  export interface linearReferencing {
    addMValues(polyline: esri.Polyline, startM?: number): { polyline: esri.Polyline; distance: number };
    addZValues(
      polyline: esri.Polyline,
      imageServiceUrl: string,
    ): Promise<{ polyline: esri.Polyline; startZ: number; endZ: number } | esri.Error>;
    noZValueIds(features: esri.Graphic[], idField: string): string[];
    noMValueIds(features: esri.Graphic[], idField: string): string[];
  }

  ////////////////////////////////////////////////////////////////////////////////
  // View models
  ////////////////////////////////////////////////////////////////////////////////

  export class MarkupViewModel extends esri.SketchViewModel {
    constructor(properties?: esri.SketchViewModelProperties);
    point: esri.GraphicsLayer;
    polyline: esri.GraphicsLayer;
    polygon: esri.GraphicsLayer;
    layers: esri.GroupLayer;
    // TODO
    // snappingOptionsModal = new SnappingOptionsModal();
    showSnappingOptionsModal(): void;
    markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'): void;
  }

  export interface OAuthViewModelProperties extends Object {
    /**
     * Portal instance to sign into.
     */
    portal: esri.Portal;
    /**
     * OAuthInfo instance to perform authentication against.
     */
    oAuthInfo: esri.OAuthInfo;
    /**
     * Alternate sign in url.
     *
     * Overrides default `${portal.url}/sharing/rest`.
     */
    signInUrl?: string;
  }
  export class OAuthViewModel extends esri.Accessor {
    constructor(properties: OAuthViewModelProperties);
    portal: esri.Portal;
    oAuthInfo: esri.OAuthInfo;
    signInUrl: string;
    credential: esri.Credential;
    user: esri.PortalUser;
    name: string;
    username: string;
    signedIn: boolean;
    load(): Promise<boolean>;
    signIn(): void;
    signOut(): void;
  }

  export interface UnitsViewModelProperties extends Object {
    /**
     * CSS class string for <select>s.
     *
     * @default 'esri-select'
     */
    selectClass?: string;
    /**
     * Current location unit.
     */
    locationUnit?: string;
    /**
     * Available location unit and display text key/value pairs.
     */
    locationUnits?: HashMap<string>;
    /**
     * Current length unit.
     */
    lengthUnit?: esri.LinearUnits;
    /**
     * Available length unit and display text key/value pairs.
     */
    lengthUnits?: HashMap<string>;
    /**
     * Current area unit.
     */
    areaUnit?: esri.ArealUnits;
    /**
     * Available area unit and display text key/value pairs.
     */
    areaUnits?: HashMap<string>;
    /**
     * Current elevation unit.
     */
    elevationUnit?: string;
    /**
     * Available elevation unit and display text key/value pairs.
     */
    elevationUnits?: HashMap<string>;
  }
  export class UnitsViewModel extends esri.Accessor {
    constructor(properties?: UnitsViewModelProperties);
    selectClass: string;
    locationUnit: string;
    locationUnits: HashMap<string>;
    lengthUnit: esri.LinearUnits;
    lengthUnits: HashMap<string>;
    areaUnit: esri.ArealUnits;
    areaUnits: HashMap<string>;
    elevationUnit: string;
    elevationUnits: HashMap<string>;
    locationSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    lengthSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    calciteLengthSelect(
      name?: null | string,
      title?: null | string,
      theme?: null | 'light' | 'dark',
      scale?: 's' | 'm' | 'l',
    ): esri.widget.tsx.JSX.Element;
    areaSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    elevationSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Widgets
  ////////////////////////////////////////////////////////////////////////////////

  export interface DisclaimerModalProperties extends esri.WidgetProperties {
    /**
     * Modal title.
     * @default 'Disclaimer'
     */
    title?: string;
    /**
     * Disclaimer text.
     * @default 'The purpose of this application is to support...'
     */
    text?: string;
  }
  export class DisclaimerModal extends esri.Widget {
    constructor(properties: DisclaimerModalProperties);
    title: string;
    text: string;
    static isAccepted(): boolean;
  }

  export interface LayerListLegendProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
  }
  export class LayerListLegend extends esri.Widget {
    constructor(properties: LayerListLegendProperties);
    view: esri.MapView | esri.SceneView;
  }

  export interface LoadingScreenProperties extends esri.WidgetProperties {
    /**
     * Application title.
     */
    title?: string;
    /**
     * Delay in seconds to destroy after calling `end()`.
     * @default 4
     */
    delay?: number;
    /**
     * Fade transition in seconds and how long before destroy to begin fade.
     * @default 1
     */
    fadeDelay?: number;
  }
  export class LoadingScreen extends esri.Widget {
    constructor(properties?: LoadingScreenProperties);
    title: string;
    delay: number;
    fadeDelay: number;
    end(): void;
  }

  export interface MarkupProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Default point symbol.
     */
    pointSymbol?: esri.SimpleMarkerSymbol;
    /**
     * Default polyline symbol.
     */
    polylineSymbol?: esri.SimpleLineSymbol;
    /**
     * Default polygon symbol.
     */
    polygonSymbol?: esri.SimpleFillSymbol;
    /**
     * Spatial reference for offsetting polylines.
     */
    offsetProjectionWkid?: number;
    /**
     * Calcite theme.
     * @default 'light'
     */
    theme?: 'light' | 'dark';
    /**
     * Calcite scale.
     * @default 'm'
     */
    scale?: 's' | 'm' | 'l';
  }

  export class Markup extends esri.Widget {
    constructor(properties: MarkupProperties);
    view: esri.MapView;
    pointSymbol: esri.SimpleMarkerSymbol;
    polylineSymbol: esri.SimpleLineSymbol;
    polygonSymbol: esri.SimpleFillSymbol;
    offsetProjectionWkid: number;
    theme: 'light' | 'dark';
    scale: 's' | 'm' | 'l';
    protected sketchViewModel: esri.SketchViewModel;
    protected unitsViewModel: UnitsViewModel;
    protected symbolEditor: MarkupSymbolEditor;
    protected layer: esri.GraphicsLayer;
    protected text: esri.GraphicsLayer;
    protected point: esri.GraphicsLayer;
    protected polyline: esri.GraphicsLayer;
    protected polygon: esri.GraphicsLayer;
    protected layers: esri.GroupLayer;
    markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'): void;
  }

  export interface MarkupSymbolEditorProperties extends esri.Widget {
    /**
     * Graphic to edit
     */
    graphic?: esri.Graphic;
  }

  export class MarkupSymbolEditor extends esri.Widget {
    graphic: esri.Graphic | null;
    symbol: esri.Symbol2D3D;
  }

  export interface MeasureState {
    action:
      | 'ready'
      | 'measuringLength'
      | 'measuringArea'
      | 'length'
      | 'area'
      | 'queryingLocation'
      | 'location'
      | 'queryingElevation'
      | 'elevation';
    length: number;
    area: number;
    x: number | string;
    y: number | string;
    z: number;
    measureGeometry: esri.Geometry | null;
    locationPoint: esri.Point;
    elevationPoint: esri.Point;
  }

  export interface MeasureProperties extends esri.WidgetProperties {
    /**
     * The view to measure with.
     */
    view: esri.MapView;
  }
  export class Measure extends esri.Widget {
    constructor(properties: MeasureProperties);
    view: esri.MapView | esri.SceneView;
    protected state: MeasureState;
    protected units: UnitsViewModel;
    length(): void;
    area(): void;
    location(): void;
    elevation(): void;
    clear(): void;
  }

  export interface PrintProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView;
    /**
     * URL of REST Export Web Map Task.
     */
    printServiceUrl: string;
    /**
     * Default print title.
     * @default 'Map Print'
     */
    title?: string;
    /**
     * Key/value pairs of layouts and text for select.
     */
    layouts?: HashMap<string>;
  }
  export class Print extends esri.Widget {
    constructor(properties: PrintProperties);
    view: esri.MapView | esri.SceneView;
    printServiceUrl: string;
    title: string;
    layouts: HashMap<string>;
    printer: esri.PrintViewModel;
  }

  export class Share extends esri.Widget {}

  export interface SimpleInfoProperties extends esri.WidgetProperties {
    /**
     * Head text.
     */
    heading?: string;
    /**
     * Array of strings of HTML paragraph element innerHTML.
     */
    paragraphs?: string[];
  }
  export class SimpleInfo extends esri.Widget {
    constructor(properties?: SimpleInfoProperties);
    heading: string;
    paragraphs: string[];
  }

  export interface TaxLotSurveysProperties extends esri.WidgetProperties {
    view: esri.MapView;
    taxLotLayer: esri.FeatureLayer;
    surveysLayer: esri.FeatureLayer;
    symbol?: esri.SimpleFillSymbol;
    highlightSymbol?: esri.SimpleFillSymbol;
  }
  export class TaxLotSurveys extends esri.Widget {
    constructor(properties: TaxLotSurveysProperties);
    view: esri.MapView;
    taxLotLayer: esri.FeatureLayer;
    surveysLayer: esri.FeatureLayer;
    symbol: esri.SimpleFillSymbol;
    highlightSymbol: esri.SimpleFillSymbol;
    protected graphicsLayer: esri.GraphicsLayer;
  }

  export interface TaxMapsProperties extends esri.WidgetProperties {
    view: esri.MapView;
    featureLayer: esri.FeatureLayer;
    mapImageLayer: esri.MapImageLayer;
  }
  export class TaxMaps extends esri.Widget {
    constructor(properties: TaxMapsProperties);
    view: esri.MapView;
    featureLayer: esri.FeatureLayer;
    mapImageLayer: esri.MapImageLayer;
  }

  export interface ViewControlProperties extends esri.WidgetProperties {
    view?: esri.MapView;

    theme?: 'light' | 'dark';

    scale?: 's' | 'm' | 'l';

    includeHome?: boolean;

    includeCompass?: boolean;

    includeLocate?: boolean;

    includeFullscreen?: boolean;

    fullscreenElement?: HTMLElement;

    markup?: Markup;
  }
  export class ViewControl extends esri.Widget {
    constructor(properties?: ViewControlProperties);
    view: esri.MapView;
    theme: 'light' | 'dark';
    scale: 's' | 'm' | 'l';
    includeHome: boolean;
    includeCompass: boolean;
    includeLocate: boolean;
    includeFullscreen: boolean;
    fullscreenElement: HTMLElement;
    markup: Markup;
  }

  export interface WaterMetersProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Water meters feature layer.
     */
    waterMeters: esri.FeatureLayer;
    /**
     * Print service URL.
     */
    printServiceUrl: string;
  }
  export class WaterMeters extends esri.Widget {
    constructor(properties: WaterMetersProperties);
    protected search: esri.SearchViewModel;
    protected print: esri.PrintViewModel;
    view: esri.MapView;
    waterMeters: esri.FeatureLayer;
    printServiceUrl: string;
  }

  export interface SwitcherWidgetProperties extends Object {
    /**
     * Calcite action text/title.
     */
    text: string;
    /**
     * Calcite action icon.
     */
    icon: string;
    /**
     * The widget of your choosing.
     */
    widget: esri.Widget & { onShow?: () => void | undefined; onHide?: () => void | undefined };
  }
  export interface WidgetSwitcherProperties extends esri.WidgetProperties {
    /**
     * Array of SwitcherWidgetProperties to switch between.
     */
    widgets: SwitcherWidgetProperties[];
    /**
     * Calcite theme.
     */
    theme?: 'light' | 'dark';
    /**
     * Calcite scale.
     */
    scale?: 's' | 'm' | 'l';
  }
  export class WidgetSwitcher extends esri.Widget {
    constructor(properties: WidgetSwitcherProperties);
    widgets: SwitcherWidgetProperties[];
    theme: 'light' | 'dark';
    scale: 's' | 'm' | 'l';
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Viewer
  ////////////////////////////////////////////////////////////////////////////////

  export interface ViewerWidgetProperties extends Object {
    /**
     * Calcite action text.
     */
    text: string;
    /**
     * Calcite action icon.
     */
    icon: string;
    /**
     * The widget of your choosing.
     */
    widget: esri.Widget & { onShow?: () => void | undefined; onHide?: () => void | undefined };
  }

  export interface ViewerProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
    /**
     * Include header.
     * @default true
     */
    includeHeader?: boolean;
    /**
     * Application title.
     */
    title?: string;
    /**
     * Include search in header.
     * @default true
     */
    includeSearch?: boolean;
    /**
     * Optional search view model to back search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * Include markup actions in view control.
     */
    markup?: Markup;
    /**
     * OAuth view model.
     */
    oAuthViewModel?: OAuthViewModel;
    /**
     * Optional basemap toggle `nextBasemap` to include basemap toggle.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Widgets to add to menu.
     */
    menuWidgets?: ViewerWidgetProperties[] | esri.Collection<ViewerWidgetProperties>;
    /**
     * Widgets to add to ui.
     */
    uiWidgets?: ViewerWidgetProperties[] | esri.Collection<ViewerWidgetProperties>;
  }
  export class Viewer extends esri.Widget {
    constructor(properties: ViewerProperties);
    view: esri.MapView | esri.SceneView;
    includeHeader: boolean;
    title: string;
    includeSearch: boolean;
    searchViewModel: esri.SearchViewModel;
    markup: Markup;
    oAuthViewModel: OAuthViewModel;
    nextBasemap: esri.Basemap;
    menuWidgets: esri.Collection<ViewerWidgetProperties>;
    uiWidgets: esri.Collection<ViewerWidgetProperties>;
  }
}
/**
 * End namespace.
 */

////////////////////////////////////////////////////////////////////////////////
// Popups
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/popups/TaxLotPopup' {
  import TaxLotPopup = __cov.TaxLotPopup;
  export = TaxLotPopup;
}

////////////////////////////////////////////////////////////////////////////////
// Support
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/support/cogo' {
  import cogo = __cov.cogo;
  export = cogo;
}

declare module '@vernonia/core/support/colors' {
  import colors = __cov.colors;
  export = colors;
}

declare module '@vernonia/core/support/linearReferencing' {
  import linearReferencing = __cov.linearReferencing;
  export = linearReferencing;
}

////////////////////////////////////////////////////////////////////////////////
// View models
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/viewModels/MarkupViewModel' {
  import MarkupViewModel = __cov.MarkupViewModel;
  export = MarkupViewModel;
}

declare module '@vernonia/core/viewModels/OAuthViewModel' {
  import OAuthViewModel = __cov.OAuthViewModel;
  export = OAuthViewModel;
}

declare module '@vernonia/core/viewModels/UnitsViewModel' {
  import UnitsViewModel = __cov.UnitsViewModel;
  export = UnitsViewModel;
}

////////////////////////////////////////////////////////////////////////////////
// Widgets
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/widgets/DisclaimerModal' {
  import DisclaimerModal = __cov.DisclaimerModal;
  export = DisclaimerModal;
}

declare module '@vernonia/core/widgets/LayerListLegend' {
  import LayerListLegend = __cov.LayerListLegend;
  export = LayerListLegend;
}

declare module '@vernonia/core/widgets/LoadingScreen' {
  import LoadingScreen = __cov.LoadingScreen;
  export = LoadingScreen;
}

declare module '@vernonia/core/widgets/Markup' {
  import Markup = __cov.Markup;
  export = Markup;
}

declare module '@vernonia/core/widgets/MarkupSymbolEditor' {
  import MarkupSymbolEditor = __cov.MarkupSymbolEditor;
  export = MarkupSymbolEditor;
}

declare module '@vernonia/core/widgets/Measure' {
  import Measure = __cov.Measure;
  export = Measure;
}

declare module '@vernonia/core/widgets/Print' {
  import Print = __cov.Print;
  export = Print;
}

declare module '@vernonia/core/widgets/Share' {
  import Share = __cov.Share;
  export = Share;
}

declare module '@vernonia/core/widgets/SimpleInfo' {
  import SimpleInfo = __cov.SimpleInfo;
  export = SimpleInfo;
}

declare module '@vernonia/core/widgets/TaxLotSurveys' {
  import TaxLotSurveys = __cov.TaxLotSurveys;
  export = TaxLotSurveys;
}

declare module '@vernonia/core/widgets/TaxMaps' {
  import TaxMaps = __cov.TaxMaps;
  export = TaxMaps;
}
declare module '@vernonia/core/widgets/ViewControl' {
  import ViewControl = __cov.ViewControl;
  export = ViewControl;
}

declare module '@vernonia/core/widgets/WaterMeters' {
  import WaterMeters = __cov.WaterMeters;
  export = WaterMeters;
}

declare module '@vernonia/core/widgets/WidgetSwitcher' {
  import WidgetSwitcher = __cov.WidgetSwitcher;
  export = WidgetSwitcher;
}

////////////////////////////////////////////////////////////////////////////////
// Viewer
////////////////////////////////////////////////////////////////////////////////

declare module '@vernonia/core/layouts/Viewer' {
  import Viewer = __cov.Viewer;
  export = Viewer;
}
