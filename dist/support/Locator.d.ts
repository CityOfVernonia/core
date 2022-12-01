/**
 * Location information emitted by `location` event.
 */
export interface LocationInfo {
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
    /**
     * Accuracy text string including units.
     */
    accuracyText: string;
}
import esri = __esri;
import { SimpleMarkerSymbol, SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';
declare const _E: any;
/**
 * Tracking support for editing operations.
 */
export default class Locator extends _E {
    on: (type: string | string[], listener: esri.EventHandler) => IHandle;
    emit: (type: string, event?: any) => boolean;
    own: (handle: IHandle) => boolean;
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
    });
    /**
     * Create graphics and wire events.
     * @param view esri.MapView
     */
    init(view: esri.MapView): Promise<void>;
    accuracySymbol: esri.SimpleFillSymbol;
    accuracyUnits: 'feet' | 'meters';
    locationSymbol: esri.SimpleMarkerSymbol;
    textSymbol: esri.TextSymbol;
    view: esri.MapView;
    trackState: 'disabled' | 'ready' | 'tracking' | 'waiting';
    private _accuracyGraphic;
    private _accuracyTextGraphic;
    private _graphics;
    private _locationGraphic;
    private _position?;
    private _track;
    private _tracking;
    /**
     * Get default symbols.
     * @returns `{ accuracySymbol: SimpleFillSymbol; locationSymbol: SimpleMarkerSymbol; textSymbol: TextSymbol; }`
     */
    static getSymbols(): {
        accuracySymbol: SimpleFillSymbol;
        locationSymbol: SimpleMarkerSymbol;
        textSymbol: TextSymbol;
    };
    /**
     * Get latitude/longitude and accuracy of current location.
     * @returns `{ latitude: number, longitude: number, accuracy: number }` | `null`
     */
    getLocation(): LocationInfo | null;
    /**
     * Start tracking user's location.
     */
    startTracking(): void;
    /**
     * Stop tracking user's location.
     */
    stopTracking(): void;
    /**
     * Handle track events.
     * @param event
     */
    private _trackEventHandler;
}
export {};
