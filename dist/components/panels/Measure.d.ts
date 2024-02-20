import esri = __esri;
export interface MeasureConstructorProperties extends esri.WidgetProperties {
    units?: Units;
    /**
     * Map view to measure.
     */
    view: esri.MapView;
}
export interface UnitsDropdownConstructorProperties extends esri.WidgetProperties {
    /**
     * Link text.
     */
    text: string;
    /**
     * Unit type.
     */
    type: 'area' | 'elevation' | 'latitudeLongitude' | 'length';
    /**
     * Units instance.
     */
    units: Units;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Units from './../../support/Units';
export declare const setMeasureColors: (primary: [number, number, number], secondary: [number, number, number]) => void;
/**
 * Panel component for measuring in a map.
 */
declare class Measure extends Widget {
    constructor(properties: MeasureConstructorProperties);
    postInitialize(): Promise<void>;
    view: esri.MapView;
    protected loaded: boolean;
    /**
     * Units instance and units.
     */
    units: Units;
    protected areaUnit: string;
    protected latitudeLongitudeUnit: string;
    protected elevationUnit: string;
    protected lengthUnit: string;
    /**
     * Abort controller for cursor elevation queries.
     */
    private _cursorElevationAbortController;
    /**
     * Point with latitude, longitude and z of the cursor.
     */
    private _cursor;
    /**
     * Ground instance for elevations.
     */
    private _ground;
    private _measureState;
    private _selectedFeature?;
    private _popupVisible;
    /**
     * SketchViewModel, layers, and symbols.
     */
    private _sketch;
    private _sketchHandle;
    private _sketchCoordinatesHandle;
    private _labels;
    private _layer;
    private _pointSymbol;
    private _polylineSymbol;
    private _polygonSymbol;
    private _textSymbol;
    private _snappingSources;
    private _snapping;
    private _guides;
    private _elevationProfile;
    private _elevationProfileLineGround;
    private _uniformChartScaling;
    private _profileStatistics?;
    private _addSnappingLayer;
    private _createCursorEvents;
    /**
     * Wire measure button event.
     * @param type
     * @param button
     */
    private _buttonMeasureEvent;
    private _unitsChangeEvent;
    private _area;
    private _areaEvent;
    private _coordinates;
    private _coordinatesEvent;
    private _elevationEvent;
    private _length;
    private _lengthEvent;
    private _profileEvent;
    /**
     * Initiate measuring.
     * @param type
     */
    private _measure;
    private _reset;
    /**
     * Update `_measureState`.
     * @param state
     */
    private _updateMeasureState;
    private _measureSelectedFeature;
    /**
     * Add additional graphics when complete.
     * @param geometry
     */
    private _addGraphics;
    private _addLabels;
    private _createPolylineLabels;
    /**
     *
     * @param options
     * @returns
     */
    private _createTextSymbol;
    /**
     * Return formatted latitude, longitude and elevation of the cursor.
     * @returns
     */
    private _cursorInfo;
    private _formatElevation;
    private _formatLatitudeLongitude;
    private _measureInfo;
    private _profileStatisticsInfo;
    /**
     * Round a number.
     * @param value Number to round
     * @param digits Number of significant digits
     * @returns number
     */
    private _round;
    render(): tsx.JSX.Element;
    /**
     * Create a UnitsDropdown.
     * @param type
     * @param text
     * @param container
     */
    _createUnitsDropdown(type: 'area' | 'elevation' | 'latitudeLongitude' | 'length', text: string, container: HTMLDivElement): void;
    /**
     * Set tooltip or popover `referenceElement` property.
     * @param element HTMLCalciteTooltipElement | HTMLCalcitePopoverElement
     */
    private _referenceElement;
    private _renderMeasureSelectedFeatureButton;
}
/**
 * Link triggered unit selecting dropdown.
 */
export declare class UnitsDropdown extends Widget {
    constructor(properties: UnitsDropdownConstructorProperties);
    postInitialize(): void;
    text: string;
    type: 'area' | 'elevation' | 'latitudeLongitude' | 'length';
    units: Units;
    protected areaUnit: esri.AreaUnit;
    protected elevationUnit: esri.LengthUnit;
    protected latitudeLongitudeUnit: 'decimal' | 'dms';
    protected lengthUnit: esri.LengthUnit;
    private _items;
    private _titles;
    render(): tsx.JSX.Element;
}
export default Measure;
