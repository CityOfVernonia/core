declare global {
    interface Window {
        PouchDB: any;
    }
}
import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
export default class Markup extends Widget {
    constructor(properties: esri.WidgetProperties & {
        /**
         * Map view.
         */
        view: esri.MapView;
    });
    postInitialize(): Promise<void>;
    view: esri.MapView;
    lengthUnit: string;
    lengthUnits: {
        meters: string;
        feet: string;
        kilometers: string;
        miles: string;
    };
    length: number;
    offset: number;
    offsetDirection: 'both' | 'left' | 'right';
    offsetProjectionWkid: number;
    pouchdbVersion: string;
    /**
     * Sketch VM for draw operations.
     */
    protected sketch: esri.SketchViewModel;
    protected pointSymbol: SimpleMarkerSymbol | TextSymbol;
    protected polylineSymbol: esri.SimpleLineSymbol;
    protected polygonSymbol: esri.SimpleFillSymbol;
    protected textSymbol: esri.TextSymbol;
    protected point: esri.GraphicsLayer;
    protected polyline: esri.GraphicsLayer;
    protected polygon: esri.GraphicsLayer;
    protected text: esri.GraphicsLayer;
    protected layers: esri.GroupLayer;
    protected state: 'ready' | 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text';
    protected viewState: 'markup' | 'buffer' | 'offset' | 'save';
    protected saveViewState: 'default' | 'new';
    private _selectedFeature;
    private _selectedMarkup;
    private _savesLoadCount;
    private _savesDb;
    private _saves;
    private _save;
    private _confirmationModal;
    private _messageModal;
    /**
     * Convenience method for widget control widgets.
     */
    onHide(): void;
    /**
     * Add layer as snapping source.
     * @param layer
     */
    private _addSnappingLayer;
    private _markupEvent;
    private _reset;
    private _markup;
    private _createEvent;
    private _addMarkup;
    private _edit;
    private _updateEvent;
    private _delete;
    private _move;
    private _addFeature;
    private _addVertices;
    private _buffer;
    private _offset;
    private _queryFeatureGeometry;
    private _initSavesDB;
    private _initSaves;
    private _createSave;
    private _confirmLoadSave;
    private _loadSave;
    private _updateSave;
    private _confirmDeleteSave;
    private _deleteSave;
    private _closeSave;
    /**
     * Get all markup graphics by type.
     * @returns
     */
    private _getGraphics;
    private _getGraphicCount;
    render(): tsx.JSX.Element;
    /**
     * Render unit select options.
     * @param units
     * @param defaultUnit
     * @returns
     */
    private _renderUnitOptions;
    private _renderSaves;
}
