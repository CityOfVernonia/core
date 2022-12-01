import { __awaiter, __decorate } from "tslib";
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
let Locator = class Locator extends _E {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Properties
        //////////////////////////////////////
        this.accuracySymbol = SYMBOLS.accuracySymbol;
        this.accuracyUnits = 'meters';
        this.locationSymbol = SYMBOLS.locationSymbol;
        this.textSymbol = SYMBOLS.textSymbol;
        this.trackState = 'disabled';
        // track view model
        this._track = new Track({
            geolocationOptions: {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 7500,
            },
        });
        // is tracking on
        this._tracking = false;
        this.init(properties.view);
    }
    /**
     * Create graphics and wire events.
     * @param view esri.MapView
     */
    init(view) {
        return __awaiter(this, void 0, void 0, function* () {
            yield view.when();
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
        });
    }
    //////////////////////////////////////
    // Static methods
    //////////////////////////////////////
    /**
     * Get default symbols.
     * @returns `{ accuracySymbol: SimpleFillSymbol; locationSymbol: SimpleMarkerSymbol; textSymbol: TextSymbol; }`
     */
    static getSymbols() {
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
    getLocation() {
        const { _position } = this;
        if (!_position)
            return null;
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
    startTracking() {
        this._track.start();
    }
    /**
     * Stop tracking user's location.
     */
    stopTracking() {
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
    _trackEventHandler(event) {
        const { accuracyUnits, view, _graphics, _tracking, _locationGraphic, _accuracyGraphic, _accuracyTextGraphic } = this;
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
        _accuracyTextGraphic.symbol.text = `${accuracyValue} ${accuracyUnits}`;
        // will we zoom
        let zoomTo = false;
        // set tracking and add graphics
        if (!_tracking) {
            _graphics.addMany([_accuracyTextGraphic, _accuracyGraphic, _locationGraphic]);
            this._tracking = true;
            zoomTo = true;
        }
        // check if updated position has moved too much
        if (geodesicDistance(new Point({ latitude: view.center.latitude, longitude: view.center.longitude }), point, 'meters').distance ||
            0 > accuracy * 5)
            zoomTo = true;
        // zoom to
        if (zoomTo)
            view.goTo(_accuracyGraphic.geometry.extent.expand(1.5));
    }
};
__decorate([
    property({ aliasOf: '_track.state' })
], Locator.prototype, "trackState", void 0);
__decorate([
    property({ aliasOf: 'view.graphics' })
], Locator.prototype, "_graphics", void 0);
__decorate([
    property()
], Locator.prototype, "_position", void 0);
Locator = __decorate([
    subclass('cov.support.Locator')
], Locator);
export default Locator;
