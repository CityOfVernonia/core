import esri = __esri;

/**
 * Start namespace.
 */
declare namespace __cov {
  ////////////////////////////////////////////////////////////////////////////////
  // Generic interfaces
  ////////////////////////////////////////////////////////////////////////////////
  export interface CollectionElement extends Object {
    element: esri.widget.tsx.JSX.Element;
  }

  /**
   * Common widget info for adding widgets to UIWidgetSwitcher and Calcite shell panels.
   */
  export interface WidgetInfo extends Object {
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

  ////////////////////////////////////////////////////////////////////////////////
  // Popups
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Properties for custom content widgets in popups.
   */
  export interface ContentProperties extends esri.WidgetProperties {
    graphic: esri.Graphic;
  }

  /**
   * cov/popups/TaxLotPopup
   * Standard popup for tax lots in COV apps.
   */
  export class TaxLotPopup extends esri.PopupTemplate {}

  /**
   * cov/popups/CenterlinesPopup
   * Standard popup for centerline feature service in COV apps.
   */
  export class CenterlinesPopup extends esri.PopupTemplate {}

  ////////////////////////////////////////////////////////////////////////////////
  // Support
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * cov/support/cogo
   * Coordinate geometry helpers.
   */
  export interface cogo {
    distance(point1: esri.Point | { x: number; y: number }, point2: esri.Point | { x: number; y: number }): number;
    linearInterpolation(point1: esri.Point, point2: esri.Point, linearDistance: number): esri.Point;
    midpoint(polyline: esri.Polyline): esri.Point;
  }

  /**
   * cov/support/colors
   * City of Vernonia colors in hex and rgb.
   */
  export interface colors {
    hexColors: HashMap<string>;
    rgbColors: HashMap<[number, number, number]>;
  }

  export interface featureLabeling {
    labelSegmentLengths(
      geometry: esri.Polyline | esri.Polygon,
      unit: esri.LinearUnits,
      includeUnit: boolean,
      textSymbol: esri.TextSymbol,
      layer: esri.GraphicsLayer,
      popupTemplate?: esri.PopupTemplate,
    ): void;
    labelPolygonArea(
      polygon: esri.Polygon,
      unit: esri.ArealUnits,
      includeUnit: boolean,
      textSymbol: esri.TextSymbol,
      layer: esri.GraphicsLayer,
      popupTemplate?: esri.PopupTemplate,
    ): void;
  }

  /**
   * cov/support/linearReferencing
   * Linear referencing helpers.
   */
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

  /**
   * cov/viewModels/OAuthViewModel
   * A view model for handling OAuth and signing in and out of applications.
   */
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

  /**
   * cov/viewModels/UnitsViewModel
   * A view model for managing location, length, area and elevation units and providing utility methods for returning unit <select>s.
   */
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
    calciteLocationSelect(
      name?: null | string,
      title?: null | string,
      theme?: null | 'light' | 'dark',
      scale?: 's' | 'm' | 'l',
    ): esri.widget.tsx.JSX.Element;
    lengthSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    calciteLengthSelect(
      name?: null | string,
      title?: null | string,
      theme?: null | 'light' | 'dark',
      scale?: 's' | 'm' | 'l',
    ): esri.widget.tsx.JSX.Element;
    areaSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    calciteAreaSelect(
      name?: null | string,
      title?: null | string,
      theme?: null | 'light' | 'dark',
      scale?: 's' | 'm' | 'l',
    ): esri.widget.tsx.JSX.Element;
    elevationSelect(name?: null | string, title?: null | string): esri.widget.tsx.JSX.Element;
    calciteElevationSelect(
      name?: null | string,
      title?: null | string,
      theme?: null | 'light' | 'dark',
      scale?: 's' | 'm' | 'l',
    ): esri.widget.tsx.JSX.Element;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Widgets
  ////////////////////////////////////////////////////////////////////////////////

  export interface PortalItemToAddProperties extends Object {
    /**
     * Portal item id.
     */
    id: string;
    /**
     * Override portal item title.
     */
    title?: string;
    /**
     * Override portal item snippet.
     */
    snippet?: string;
    /**
     * Layer index.
     */
    index?: number;
    /**
     * Additional layer properties.
     */
    layerProperties?: esri.LayerProperties | any;
    /**
     * Called when layer added.
     */
    add?: (layer: esri.Layer) => void;
  }
  export interface AddLayersProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Layers available to add.
     */
    layers?: PortalItemToAddProperties[];
  }
  export class AddLayers extends esri.Widget {
    constructor(properties: AddLayersProperties);
    view: esri.MapView;
    layers: esri.Collection<PortalItemToAddProperties>;
  }

  export interface ColorPickerProperties extends esri.WidgetProperties {
    /**
     * Hex value of selected color.
     */
    value?: string;
    /**
     * Array of two arrays of hex colors to display as color chips.
     */
    colors?: [
      [string, string, string, string, string, string, string, string],
      [string, string, string, string, string, string, string, string],
    ];
  }

  export class ColorPicker extends esri.Widget {
    constructor(properties?: ColorPickerProperties);
    value: string;
    on(name: 'color-change', listener: EventListener): IHandle;
  }

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

  /**
   * cov/widgets/HeaderAccountControl
   * A widget to display sign in button or user account control in the header of layouts.
   */
  export interface HeaderAccountControlProperties extends esri.WidgetProperties {
    oAuthViewModel: OAuthViewModel;
  }
  export class HeaderAccountControl extends esri.Widget {
    constructor(properties: HeaderAccountControlProperties);
    oAuthViewModel: OAuthViewModel;
  }

  /**
   * cov/widgets/LayerListLegend
   * LayerList, Legend, and add layers widgets tabbed.
   */
  export interface LayerListLegendImageryLayer extends Object {
    title: string;
    layer: esri.TileLayer | esri.ImageryLayer | esri.ImageryTileLayer | esri.BingMapsLayer;
  }
  export interface LayerListLegendProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
    /**
     * Add layers.
     */
    addLayers?: PortalItemToAddProperties[] | esri.Collection<PortalItemToAddProperties>;
    /**
     * Include add from web button.
     * @default true
     */
    addFromWeb?: boolean;
    /**
     * Portals to add layers from.
     * Defaults to single option of app's portal.
     */
    addFromPortals?: esri.Portal[];
    /**
     * Basemap to select select imagery for.
     */
    imageryBasemap?: esri.Basemap;
    /**
     * Imagery layers to select from.
     */
    imageryLayers?: LayerListLegendImageryLayer[] | esri.Collection<LayerListLegendImageryLayer>;
    /**
     * BasemapToggle to toggle basemap.
     */
    basemapToggle?: esri.BasemapToggle;
  }
  export class LayerListLegend extends esri.Widget {
    constructor(properties: LayerListLegendProperties);
    view: esri.MapView | esri.SceneView;
    addLayers: esri.Collection<PortalItemToAddProperties>;
    addFromWeb: boolean;
    basemap: esri.Basemap;
    imageryLayers: esri.Collection<LayerListLegendImageryLayer>;
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

  export interface MarkupProject extends Object {
    id: string;
    doc: {
      _id: string;
      readonly _rev: string;
      created: number;
      updated: number;
      title: string;
      description: string;
      text: esri.GraphicProperties[];
      point: esri.GraphicProperties[];
      polyline: esri.GraphicProperties[];
      polygon: esri.GraphicProperties[];
    };
    listItem?: esri.widget.tsx.JSX.Element;
    activeListItem?: esri.widget.tsx.JSX.Element;
  }

  export interface MarkupProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    offsetProjectionWkid?: number;
  }

  export class Markup extends esri.Widget {
    constructor(properties: MarkupProperties);
    view: esri.MapView;
    offsetProjectionWkid: number;
    markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'): void;
    addFeature(graphic: esri.Graphic): void;
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

  /**
   * cov/widgets/Print
   * Simple print and snapshot widget.
   */
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

  /**
   * cov/widgets/Share
   * A widget to display sign in button when auth is required.
   */
  export class Share extends esri.Widget {}

  /**
   * cov/widgets/SignInScreen
   * A widget to share an app via facebook and twitter.
   */
  export interface SignInScreenProperties extends esri.WidgetProperties {
    /**
     * OAuthViewModel instance.
     */
    oAuthViewModel: OAuthViewModel;
    /**
     * Message to display.
     */
    message?: string;
  }
  export class SignInScreen extends esri.Widget {
    constructor(properties: SignInScreenProperties);
    oAuthViewModel: OAuthViewModel;
    message: string;
  }

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

  export interface SimpleSymbolEditorProperties extends esri.WidgetProperties {
    /**
     * Graphic to edit
     */
    graphic?: esri.Graphic;
  }
  export class SimpleSymbolEditor extends esri.Widget {
    graphic: esri.Graphic | null;
    symbol: esri.Symbol2D3D;
  }

  /**
   * cov/widgets/TaxLotBuffer
   * Widget for buffering tax lots.
   */
  export interface TaxLotBufferProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Tax lot feature layer.
     */
    layer: esri.FeatureLayer;
  }
  export class TaxLotBuffer extends esri.Widget {
    constructor(properties: TaxLotBufferProperties);
    view: esri.MapView;
    layer: esri.FeatureLayer;
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

  /**
   * cov/widgets/TransportationLayers
   * A widget for controlling the display of transportation network layers.
   */
  export interface TransportationLayersProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Transportation map image layer.
     */
    layer: esri.MapImageLayer;
  }
  export class TransportationLayers extends esri.Widget {
    constructor(properties: TransportationLayersProperties);
    layer: esri.MapImageLayer;
  }

  /**
   * cov/widgets/UIWidgetSwitcher
   * A widget switcher for use in the view's UI.
   */
  export interface UIWidgetSwitcherProperties extends esri.WidgetProperties {
    /**
     * Widgets to add to switcher.
     */
    widgetInfos: WidgetInfo[] | esri.Collection<WidgetInfo>;
    /**
     * Layout orientation of action pad.
     * @default 'vertical'
     */
    layout?: 'vertical' | 'horizontal';
    /**
     * Position of the panels in relation to the action pad.
     * If the widget position is 'top-left' in the UI the panel position should be 'right'.
     * @default 'right'
     */
    panelPosition?: 'right' | 'left';
    /**
     * Width scale applied to panels.
     * @default 'm'
     */
    panelWidthScale?: 's' | 'm' | 'l';
    /**
     * Height scale applied to panels.
     * @default 'l'
     */
    panelHeightScale?: 's' | 'm' | 'l';
  }
  export class UIWidgetSwitcher extends esri.Widget {
    constructor(properties: UIWidgetSwitcherProperties);
    widgetInfos: esri.Collection<WidgetInfo>;
    layout: 'vertical' | 'horizontal';
    panelPosition: 'right' | 'left';
    panelWidthScale: 's' | 'm' | 'l';
    panelHeightScale: 's' | 'm' | 'l';
    add(widgetInfo: WidgetInfo): void;
  }

  /**
   * cov/widgets/ViewControl
   * A view control widget to replace default zoom widget with home, locate, fullscreen, compass and markup create actions.
   */
  export interface ViewControlProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Include home action.
     */
    includeHome?: boolean;
    /**
     * Include compass action.
     * Defaults true if view rotation enabled.
     */
    includeCompass?: boolean;
    /**
     * Include locate action.
     */
    includeLocate?: boolean;
    /**
     * Include fullscreen toggle action.
     */
    includeFullscreen?: boolean;
    /**
     * Fullscreen element.
     */
    fullscreenElement?: HTMLElement;
    /**
     * Markup instance to use for markup actions.
     */
    markup?: Markup;
  }
  export class ViewControl extends esri.Widget {
    constructor(properties: ViewControlProperties);
    view: esri.MapView;
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

  ////////////////////////////////////////////////////////////////////////////////
  // Layouts
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * cov/layouts/Viewer
   * Web map application layout with header and optional menu for most applications.
   */
  export interface ViewerProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
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
     * Optional search view model to back header search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * OAuth view model to back header account control.
     */
    oAuthViewModel?: OAuthViewModel;
    /**
     * Widgets to add to menu.
     */
    menuWidgets?: WidgetInfo[] | esri.Collection<WidgetInfo>;
  }
  export class Viewer extends esri.Widget {
    constructor(properties: ViewerProperties);
    view: esri.MapView | esri.SceneView;
    title: string;
    includeSearch: boolean;
    searchViewModel: esri.SearchViewModel;
    oAuthViewModel: OAuthViewModel;
    menuWidgets: esri.Collection<WidgetInfo>;
  }

  /**
   * cov/layouts/ShellApp
   * A calcite shell layout.
   */
  export interface ShellAppProperties extends esri.WidgetProperties {
    /**
     * Map or scene view.
     */
    view: esri.MapView | esri.SceneView;
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
     * Panel collapsed on load.
     * @default false
     */
    panelCollapsed?: boolean;
    /**
     * Place panel at start or end of shell.
     * @default 'start'
     */
    panelPosition?: 'start' | 'end';
    /**
     * Width scale of shell panel.
     */
    widthScale?: 's' | 'm' | 'l';
    /**
     * Action widgets.
     */
    actionWidgets?: WidgetInfo[];
    /**
     * Include markup actions in view control.
     */
    markup?: Markup;
    /**
     * OAuth view model.
     */
    oAuthViewModel?: OAuthViewModel;
  }
  export class ShellApp extends esri.Widget {
    constructor(properties: ShellAppProperties);
    view: esri.MapView | esri.SceneView;
    title: string;
    includeSearch: boolean;
    searchViewModel: esri.SearchViewModel;
    panelCollapsed: boolean;
    panelPosition: 'start' | 'end';
    widthScale: 's' | 'm' | 'l';
    actionWidgets: WidgetInfo[];
    markup: Markup;
    oAuthViewModel: OAuthViewModel;
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

declare module '@vernonia/core/popups/CenterlinesPopup' {
  import CenterlinesPopup = __cov.CenterlinesPopup;
  export = CenterlinesPopup;
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
declare module '@vernonia/core/widgets/AddLayers' {
  import AddLayers = __cov.AddLayers;
  export = AddLayers;
}

declare module '@vernonia/core/widgets/ColorPicker' {
  import ColorPicker = __cov.ColorPicker;
  export = ColorPicker;
}

declare module '@vernonia/core/widgets/DisclaimerModal' {
  import DisclaimerModal = __cov.DisclaimerModal;
  export = DisclaimerModal;
}

declare module '@vernonia/core/widgets/HeaderAccountControl' {
  import HeaderAccountControl = __cov.HeaderAccountControl;
  export = HeaderAccountControl;
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

declare module '@vernonia/core/widgets/SimpleSymbolEditor' {
  import SimpleSymbolEditor = __cov.SimpleSymbolEditor;
  export = SimpleSymbolEditor;
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

declare module '@vernonia/core/widgets/SignInScreen' {
  import SignInScreen = __cov.SignInScreen;
  export = SignInScreen;
}

declare module '@vernonia/core/widgets/SimpleInfo' {
  import SimpleInfo = __cov.SimpleInfo;
  export = SimpleInfo;
}

declare module '@vernonia/core/widgets/TaxLotBuffer' {
  import TaxLotBuffer = __cov.TaxLotBuffer;
  export = TaxLotBuffer;
}

declare module '@vernonia/core/widgets/TaxLotSurveys' {
  import TaxLotSurveys = __cov.TaxLotSurveys;
  export = TaxLotSurveys;
}

declare module '@vernonia/core/widgets/TaxMaps' {
  import TaxMaps = __cov.TaxMaps;
  export = TaxMaps;
}

declare module '@vernonia/core/widgets/TransportationLayers' {
  import TransportationLayers = __cov.TransportationLayers;
  export = TransportationLayers;
}

declare module '@vernonia/core/widgets/UIWidgetSwitcher' {
  import UIWidgetSwitcher = __cov.UIWidgetSwitcher;
  export = UIWidgetSwitcher;
}

declare module '@vernonia/core/widgets/ViewControl' {
  import ViewControl = __cov.ViewControl;
  export = ViewControl;
}

declare module '@vernonia/core/widgets/WaterMeters' {
  import WaterMeters = __cov.WaterMeters;
  export = WaterMeters;
}

////////////////////////////////////////////////////////////////////////////////
// Layouts
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/layouts/Viewer' {
  import Viewer = __cov.Viewer;
  export = Viewer;
}

declare module '@vernonia/core/layouts/ShellApp' {
  import ShellApp = __cov.ShellApp;
  export = ShellApp;
}
