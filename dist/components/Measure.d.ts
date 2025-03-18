import esri = __esri;
/**
 * Measure properties.
 */
export interface MeasureProperties extends esri.WidgetProperties {
    /**
     * Map view to measure.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Measure area, length, coordinates and elevation in a map.
 */
export default class Measure extends Widget {
    constructor(properties: MeasureProperties);
    postInitialize(): Promise<void>;
    readonly view: esri.MapView;
    private _cursor;
    private _cursorAbortController;
    private _ground;
    private _state;
    private _units;
    private _sketch;
    private _labels;
    private _areaEvent;
    private _coordinatesEvent;
    private _cursorEvents;
    private _elevationEvent;
    private _formatters;
    private _lengthEvent;
    private _measure;
    private _reset;
    private _setState;
    private _unitsChanged;
    render(): tsx.JSX.Element;
    private _renderArea;
    private _renderCancelClearButton;
    private _renderCoordinates;
    private _renderCursor;
    private _renderElevation;
    private _renderLength;
    private _renderUnitsDropDown;
}
