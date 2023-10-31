import esri = __esri;
interface MeasureProperties extends esri.WidgetProperties {
    /**
     * Map view to measure in.
     */
    view: esri.MapView;
    /**
     * Default length unit.
     */
    lengthUnit?: string;
    /**
     * Length units to include.
     * <UNIT>:<NAME> e.g. {feet: 'Feet'}
     */
    lengthUnits?: {
        [key: string]: string;
    };
    /**
     * Default area unit.
     */
    areaUnit?: string;
    /**
     * Area units to include.
     * <UNIT>:<NAME> e.g. {'square-feet': 'Feet'}
     */
    areaUnits?: {
        [key: string]: string;
    };
    /**
     * Default location unit.
     */
    locationUnit?: string;
    /**
     * Length units to include.
     */
    locationUnits?: {
        [key: string]: string;
    };
    /**
     * Default elevation unit.
     */
    elevationUnit?: string;
    /**
     * Length units to include.
     */
    elevationUnits?: {
        [key: string]: string;
    };
    /**
     * Labels visible.
     * @default true
     */
    labelsVisible?: boolean;
    /**
     * Add units to labels.
     * @default false
     */
    labelUnits?: boolean;
    /**
     * Length, area and elevation precision.
     * @default 2
     */
    unitsPrecision?: number;
    /**
     * Decimal degrees precision.
     * @default 6
     */
    degreesPrecision?: number;
    /**
     * Format numbers, e.i. thousand separated, etc.
     * @default true
     */
    localeFormat?: boolean;
}
interface MeasureState {
    /**
     * Operational state of the widget.
     */
    operation: 'ready' | 'measure-length' | 'length' | 'measure-area' | 'area' | 'measure-location' | 'location' | 'measure-elevation' | 'elevation' | 'measure-profile' | 'profile';
    /**
     * Longitude of cursor.
     */
    x: number | string;
    /**
     * Latitude of cursor.
     */
    y: number | string;
    /**
     * Elevation of cursor.
     */
    z: number;
    /**
     * Length or perimeter value.
     */
    length: number;
    /**
     * Area value.
     */
    area: number;
    /**
     * Location longitude.
     */
    locationX: number | string;
    /**
     * Location latitude.
     */
    locationY: number | string;
    /**
     * Elevation value.
     */
    elevation: number;
    /**
     * Current length polyline.
     */
    lengthGeometry: Polyline | null;
    /**
     * Current area polygon.
     */
    areaGeometry: esri.Polygon | null;
    /**
     * Current location point.
     */
    locationGeometry: esri.Point | null;
    /**
     * Current elevation point.
     */
    elevationGeometry: esri.Point | null;
    /**
     * Current profile polyline.
     */
    profileGeometry: Polyline | null;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { Polyline } from '@arcgis/core/geometry';
/**
 * Measure widget for ArcGIS JS API including length, area, location, elevation and ground profiles.
 */
export default class Measure extends Widget {
    constructor(properties: MeasureProperties);
    postInitialize(): Promise<void>;
    /**
     * Map view to measure in.
     */
    view: esri.MapView;
    lengthUnit: string;
    lengthUnits: {
        meters: string;
        feet: string;
        kilometers: string;
        miles: string;
        'nautical-miles': string;
    };
    areaUnit: string;
    areaUnits: {
        acres: string;
        'square-feet': string;
        'square-meters': string;
        'square-kilometers': string;
        'square-miles': string;
    };
    locationUnit: string;
    locationUnits: {
        dec: string;
        dms: string;
    };
    elevationUnit: string;
    elevationUnits: {
        feet: string;
        meters: string;
    };
    /**
     * Labels visible.
     */
    labelsVisible: boolean;
    /**
     * Add units to labels.
     */
    labelUnits: boolean;
    /**
     * Length, area and elevation precision.
     */
    unitsPrecision: number;
    /**
     * Decimal degrees precision.
     */
    degreesPrecision: number;
    /**
     * Format numbers, e.i. thousand separated, etc.
     */
    localeFormat: boolean;
    /**
     * Graphics color.
     */
    protected color: number[];
    /**
     * Sketch VM for draw operations.
     */
    protected sketch: esri.SketchViewModel;
    protected pointSymbol: esri.SimpleMarkerSymbol;
    protected polylineSymbol: esri.CIMSymbol;
    protected polygonSymbol: esri.SimpleFillSymbol;
    protected textSymbol: esri.TextSymbol;
    protected elevationProfile: esri.ElevationProfile;
    protected elevationProfileLineGround: esri.ElevationProfileLineGround;
    protected layers: esri.GroupLayer;
    protected labels: esri.GraphicsLayer;
    /**
     * Widget state and measurement values.
     */
    protected state: MeasureState;
    protected optionsVisible: boolean;
    /**
     * Handle for sketch create.
     */
    private _sketchHandle;
    /**
     * Convenience method for widget control classes.
     */
    onHide(): void;
    /**
     * Handle unit changes.
     */
    private _unitsChange;
    /**
     * Load settings from local storage.
     */
    private _loadSettings;
    /**
     * Update settings local storage.
     */
    private _updateSettings;
    /**
     * Set symbol and profile colors.
     * @param color
     */
    private _setColors;
    /**
     * Add layer as snapping source.
     * @param layer
     */
    private _addSnappingLayer;
    /**
     * Reset the widget.
     */
    private _reset;
    /**
     * Round a number.
     * @param value
     * @param digits
     * @returns number
     */
    private _round;
    /**
     * Format measurement and units for display and labels.
     * @param measurement
     * @param unit
     * @param label
     * @returns string
     */
    private _format;
    /**
     * Wire unit select event.
     * @param type
     * @param select
     */
    private _unitChangeEvent;
    /**
     * Wire measure button event.
     * @param type
     * @param button
     */
    private _measureEvent;
    /**
     * Wire clear button event.
     * @param button
     */
    private _clearEvent;
    /**
     * Initiate measuring.
     * @param type
     */
    private _measure;
    /**
     * Handle length event.
     * @param event
     */
    private _lengthEvent;
    /**
     * Measure length and set state.
     * @param polyline
     */
    private _length;
    /**
     * Handle area event.
     * @param event
     */
    private _areaEvent;
    /**
     * Measure area and set state.
     * @param polygon
     */
    private _area;
    /**
     * Handle location event and set state.
     * @param event
     */
    private _locationEvent;
    /**
     * Location coordinates.
     * @param point
     * @returns
     */
    private _location;
    /**
     * Handle elevation event and set state.
     * @param event
     * @returns
     */
    private _elevationEvent;
    /**
     * Query elevation.
     * @param point
     * @returns
     */
    private _elevation;
    private _profileEvent;
    /**
     * Add additional graphics when complete.
     * @param geometry
     */
    private _addGraphics;
    /**
     * Add outline to area polygon.
     * As of 4.22 api's sketch polyline symbol only shows CIM on active polygon sketch segment.
     * @param geometry
     * @param layer
     */
    private _addPolygonOutline;
    /**
     * Add label graphics.
     * @param geometry
     */
    private _addLabels;
    /**
     * Create and return new text symbol.
     * @param text
     * @param point
     * @returns
     */
    private _createTextSymbol;
    private _polylineLabels;
    /**
     * Return midpoint of polyline.
     * @param polyline Polyline
     * @returns esri.Point
     */
    private _midpoint;
    /**
     * Text symbol angle between two sets of points.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns
     */
    private _textSymbolAngle;
    render(): tsx.JSX.Element;
    /**
     * Render unit select options.
     * @param units
     * @param defaultUnit
     * @returns
     */
    private _renderUnitOptions;
    /**
     * Render color tiles to select color.
     * @returns
     */
    private _renderColorSelector;
}
export {};
