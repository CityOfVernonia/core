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
  }
  export interface MeasureViewModelProperties extends Object {
    /**
     * Map view.
     */
    view?: esri.MapView;
    /**
     * Show text graphic in view.
     * @default true
     */
    showText?: boolean;
    /**
     * Color for markers, lines, and text.
     * Any color the API recognizes https://developers.arcgis.com/javascript/latest/api-reference/esri-Color.html.
     * @default [230, 82, 64]
     */
    color?: any;
    /**
     * Color for fills.
     * Any color the API recognizes https://developers.arcgis.com/javascript/latest/api-reference/esri-Color.html.
     * @default [230, 82, 64, 0.15]
     */
    fillColor?: any;
  }
  export class MeasureViewModel extends esri.Accessor {
    constructor(properties: MeasureViewModelProperties);
    view: esri.MapView | esri.SceneView;
    showText: boolean;
    color: any;
    fillColor: any;
    protected hasGround: boolean;
    protected state: MeasureState;
    protected sketchViewModel: esri.SketchViewModel;
    protected units: UnitsViewModel;
    protected draw: esri.Draw;
    protected ground: esri.Ground;
    protected layer: esri.GraphicsLayer;
    length(): void;
    area(): void;
    location(): void;
    elevation(): void;
    clear(): void;
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

  export interface MeasureProperties extends esri.WidgetProperties {
    /**
     * The view to measure with.
     */
    view?: esri.MapView;
    /**
     * Show text with geometry in map when measuring.
     * @default false
     */
    showText?: boolean;
    /**
     * Color for markers, lines, and text.
     * Any color the API recognizes https://developers.arcgis.com/javascript/latest/api-reference/esri-Color.html.
     * @default [230, 82, 64]
     */
    color?: any;
    /**
     * Color for fills.
     * Any color the API recognizes https://developers.arcgis.com/javascript/latest/api-reference/esri-Color.html.
     * @default [230, 82, 64, 0.15]
     */
    fillColor?: any;
  }
  export class Measure extends esri.Widget {
    constructor(properties: MeasureProperties);
    view: esri.MapView | esri.SceneView;
    showText: boolean;
    color: any;
    fillColor: any;
    viewModel: MeasureViewModel;
    protected state: MeasureState;
    protected units: UnitsViewModel;
    protected hasGround: boolean;
    length(): void;
    area(): void;
    location(): void;
    elevation(): void;
    clear(): void;
    onHide(): void;
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
  export class Print extends esri.Widget {
    constructor(properties: PrintProperties);
    view: esri.MapView | esri.SceneView;
    printServiceUrl: string;
    title: string;
    layouts: HashMap<string>;
    theme: 'light' | 'dark';
    scale: 's' | 'm' | 'l';
    printer: esri.PrintViewModel;
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

declare module '@vernonia/core/viewModels/MeasureViewModel' {
  import MeasureViewModel = __cov.MeasureViewModel;
  export = MeasureViewModel;
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

declare module '@vernonia/core/widgets/Measure' {
  import Measure = __cov.Measure;
  export = Measure;
}

declare module '@vernonia/core/widgets/Print' {
  import Print = __cov.Print;
  export = Print;
}
