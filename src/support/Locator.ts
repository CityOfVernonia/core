/**
 * Location information emitted by `location` event.
 */
interface LocationInfo {
  /**
   * Latitude of location.
   */
  latitude: number;
  /**
   * Longitude of location.
   */
  longitude: number;
  /**
   * Accuracy in meters.
   */
  accuracy: number;
}
import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Evented from '@arcgis/core/core/Evented';
import Track from '@arcgis/core/widgets/Track/TrackViewModel';
import Graphic from '@arcgis/core/Graphic';
import { Point } from '@arcgis/core/geometry';
import Circle from '@arcgis/core/geometry/Circle';
import { SimpleMarkerSymbol, SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';
import { geodesicDistance } from '@arcgis/core/geometry/support/geodesicUtils';

// @ts-ignore
const _E = Evented.EventedAccessor;

const SYMBOLS = {
  accuracySymbol: new SimpleFillSymbol({
    color: [0, 0, 255, 0.05],
    outline: {
      color: [255, 255, 255],
      width: 1,
    },
  }),
  locationSymbol: new SimpleMarkerSymbol({
    color: [0, 0, 255],
    size: 8,
    outline: {
      color: [255, 255, 255],
      width: 1,
    },
  }),
  textSymbol: new TextSymbol({
    text: '0',
    color: [255, 255, 255],
    font: {
      size: 9,
    },
    haloColor: [0, 0, 255, 0.5],
    haloSize: 1.25,
    horizontalAlignment: 'left',
    verticalAlignment: 'middle',
    xoffset: 6,
  }),
};

/**
 * Tracking support for editing operations.
 */
@subclass('cov.support.Locator')
export default class Locator extends _E {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  // type evented methods
  on!: (type: string | string[], listener: esri.EventHandler) => IHandle;
  emit!: (type: string, event?: any) => boolean;
  // type `own` b/c it would be typed
  // NOTE: type `addHandles`, etc when typed
  own!: (handle: IHandle) => boolean;

  constructor(properties: {
    /**
     * Symbol for accuracy circle graphic.
     */
    accuracySymbol?: SimpleFillSymbol | esri.CIMSymbol;
    /**
     * Units to display accuracy.
     * @default 'meters'
     */
    accuracyUnits?: 'feet' | 'meters';
    /**
     * Symbol for location point graphic.
     */
    locationSymbol?: SimpleMarkerSymbol | esri.MarkerSymbol | esri.CIMSymbol;
    /**
     * Symbol for display accuracy text graphic.
     */
    textSymbol?: TextSymbol | esri.CIMSymbol;
    /**
     * Map view.
     */
    view: esri.MapView;
  }) {
    super(properties);
    this.init(properties.view);
  }

  /**
   * Create graphics and wire events.
   * @param view esri.MapView
   */
  async init(view: esri.MapView): Promise<void> {
    await view.when();
    const { accuracySymbol, locationSymbol, textSymbol, _track } = this;
    this._locationGraphic = new Graphic({
      symbol: locationSymbol,
    });
    this._accuracyGraphic = new Graphic({
      symbol: accuracySymbol,
    });
    this._accuracyTextGraphic = new Graphic({
      symbol: textSymbol,
    });
    this.own(_track.on('track', this._trackEventHandler.bind(this)));
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  accuracySymbol = SYMBOLS.accuracySymbol;

  accuracyUnits: 'feet' | 'meters' = 'meters';

  locationSymbol = SYMBOLS.locationSymbol;

  textSymbol = SYMBOLS.textSymbol;

  view!: esri.MapView;

  @property({ aliasOf: '_track.state' })
  trackState: 'disabled' | 'ready' | 'tracking' | 'waiting' = 'disabled';

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  // accuracy circle graphic
  private _accuracyGraphic!: Graphic;

  // accuracy text graphic
  private _accuracyTextGraphic!: Graphic;

  // view graphics layer
  @property({ aliasOf: 'view.graphics' })
  private _graphics!: esri.GraphicsLayer;

  // location point graphic
  private _locationGraphic!: Graphic;

  // geolocation graphic
  @property()
  private _position?: GeolocationPosition;

  // track view model
  private _track = new Track({
    geolocationOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 7500,
    },
  });

  // is tracking on
  private _tracking = false;

  //////////////////////////////////////
  // Static methods
  //////////////////////////////////////
  /**
   * Get default symbols.
   * @returns `{ accuracySymbol: SimpleFillSymbol; locationSymbol: SimpleMarkerSymbol; textSymbol: TextSymbol; }`
   */
  static getSymbols(): {
    accuracySymbol: SimpleFillSymbol;
    locationSymbol: SimpleMarkerSymbol;
    textSymbol: TextSymbol;
  } {
    return {
      accuracySymbol: SYMBOLS.accuracySymbol.clone(),
      locationSymbol: SYMBOLS.locationSymbol.clone(),
      textSymbol: SYMBOLS.textSymbol.clone(),
    };
  }

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Get latitude/longitude and accuracy of current location.
   * @returns `{ latitude: number, longitude: number, accuracy: number }` | `null`
   */
  getLocation(): LocationInfo | null {
    const { _position } = this;
    if (!_position) return null;
    const { latitude, longitude, accuracy } = _position.coords;
    return {
      latitude,
      longitude,
      accuracy,
    };
  }

  /**
   * Start tracking user's location.
   */
  startTracking(): void {
    this._track.start();
  }

  /**
   * Stop tracking user's location.
   */
  stopTracking(): void {
    const { _graphics, _track, _locationGraphic, _accuracyGraphic, _accuracyTextGraphic } = this;
    _track.stop();
    this._tracking = false;
    this._position = undefined;
    _graphics.removeMany([_accuracyTextGraphic, _accuracyGraphic, _locationGraphic]);
  }

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Handle track events.
   * @param event
   */
  private _trackEventHandler(event: esri.TrackViewModelTrackEvent): void {
    const { accuracyUnits, view, _graphics, _tracking, _locationGraphic, _accuracyGraphic, _accuracyTextGraphic } =
      this;
    const { latitude, longitude, accuracy } = event.position.coords;
    // set position and emit location
    this._position = event.position;
    this.emit('location', {
      latitude,
      location,
      accuracy,
    });
    // create point and set location and accuracy geometries
    const point = new Point({
      latitude,
      longitude,
    });
    _locationGraphic.geometry = point;
    _accuracyGraphic.geometry = new Circle({
      center: point.clone(),
      geodesic: true,
      numberOfPoints: 100,
      radius: accuracy,
      radiusUnit: 'meters',
    });
    _accuracyTextGraphic.geometry = point;
    const accuracyValue = (accuracyUnits === 'feet' ? accuracy * 3.28084 : accuracy).toFixed(2);
    (_accuracyTextGraphic.symbol as TextSymbol).text = `${accuracyValue} ${accuracyUnits}`;
    // will we zoom
    let zoomTo = false;
    // set tracking and add graphics
    if (!_tracking) {
      _graphics.addMany([_accuracyTextGraphic, _accuracyGraphic, _locationGraphic]);
      this._tracking = true;
      zoomTo = true;
    }
    // check if updated position has moved too much
    if (
      (geodesicDistance(
        new Point({ latitude: view.center.latitude, longitude: view.center.longitude }),
        point,
        'meters',
      ).distance as number) ||
      0 > accuracy * 5
    )
      zoomTo = true;
    // zoom to
    if (zoomTo) view.goTo((_accuracyGraphic.geometry as esri.Polygon).extent.expand(1.5));
  }
}
