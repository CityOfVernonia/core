import esri = __esri;

import type { tsx } from '@arcgis/core/widgets/support/widget';

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

  export interface OAuthViewModelProperties extends Object {
    /**
     * esri.portal.Portal instance to sign into.
     */
    portal: esri.Portal;
    /**
     * esri.identity.OAuthInfo instance to perform authentication against.
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
    locationSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    lengthSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    areaSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
    elevationSelect(name?: null | string, title?: null | string): tsx.JSX.Element;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Widgets
  ////////////////////////////////////////////////////////////////////////////////

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

declare module '@vernonia/core/viewModels/OAuthViewModel' {
  import OAuthViewModel = __cov.OAuthViewModel;
  export = OAuthViewModel;
}

////////////////////////////////////////////////////////////////////////////////
// Widgets
////////////////////////////////////////////////////////////////////////////////
declare module '@vernonia/core/widgets/LayerListLegend' {
  import LayerListLegend = __cov.LayerListLegend;
  export = LayerListLegend;
}
