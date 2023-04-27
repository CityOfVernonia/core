import esri = __esri;

interface I {
  layers: 'point' | 'polyline' | 'polygon' | 'text';
  tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text';
  offset: 'both' | 'left' | 'right';
}

import type ConfirmLoadModal from './Markup/ConfirmLoadModal';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import SymbolEditor from './Markup/SymbolEditor';
import { queryFeatureGeometry, polylineVertices, polygonVertices, buffer, offset } from './Markup/geometry';

const CSS = {
  base: 'cov-markup',
  content: 'cov-markup--content',
  rowHeading: 'cov-markup--row-heading',
  buttonRow: 'cov-markup--button-row',
  offsetButton: 'cov-markup--offset-button',
  selectionNotice: 'cov-markup--selection-notice',
  topMargin: 'cov-markup--top-margin',
  tabs: 'cov-markup--tabs',
};

let KEY = 0;

let TT_ID = '';
let TT_KEY = 0;

// arcgis `Candy Shop` plus black, white and grey
const COLORS: { [key: string]: number[] } = {
  white: [255, 255, 255],
  black: [0, 0, 0],
  grey: [128, 128, 128],
  red: [237, 81, 81],
  blue: [20, 158, 206],
  green: [167, 198, 54],
  purple: [158, 85, 156],
  orange: [252, 146, 31],
  yellow: [255, 222, 62],
};

const HANDLES = {
  SELECTED: 'selected-highlights',
};

@subclass('cov.widgets.Markup')
export default class Markup extends Widget {
  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Lifecycle
  /////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view to mark up.
       */
      view: esri.MapView;
      /**
       * Default length unit.
       * Should probably be a `lengthUnits` key.
       */
      lengthUnit?: string;
      /**
       * Available length units.
       * Should probably be `esri.LinearUnits`.
       */
      lengthUnits?: { [key: string]: string };
      /**
       * Default buffer distance.
       */
      bufferDistance?: number;
      /**
       * Default offset distance.
       */
      offsetDistance?: number;
      /**
       * Default offset direction.
       */
      offsetDirection?: I['offset'];
      /**
       * Projection to use for offset.
       */
      offsetProjectionWkid: number;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      _sketch,
      pointSymbol,
      point,
      polyline,
      polygon,
      text,
      layers,
    } = this;

    // set first tooltip id
    this._ttr();

    // initialize sketch
    _sketch.view = view;

    // add layers
    layers.addMany([polygon, polyline, point, text, _sketch.layer]);
    map.add(layers);

    // graphics count
    [polygon, polyline, point, text].forEach((layer: esri.GraphicsLayer): void => {
      this.addHandles(layer.watch('graphics.length', this._countGraphics.bind(this)));
    });

    // set displayed point symbol between point and text
    const _pointSymbol = pointSymbol.clone();
    this.addHandles(
      this.watch('_drawState', (_drawState: string): void => {
        if (_drawState === 'text') {
          this.pointSymbol = this.textSymbol.clone();
        } else {
          this.pointSymbol = _pointSymbol.clone();
        }
      }),
    );

    // create event
    this.addHandles(_sketch.on('create', this._createEvent.bind(this)));

    // update event
    this.addHandles(_sketch.on('update', this._updateEvent.bind(this)));

    // undo/redo events
    this.addHandles([
      _sketch.on('create', this._undoRedo.bind(this)),
      _sketch.on('update', this._undoRedo.bind(this)),
      _sketch.on('redo', this._undoRedo.bind(this)),
      _sketch.on('undo', this._undoRedo.bind(this)),
    ]);

    // selected popup feature
    this.addHandles(
      this.watch(['view.popup.visible', 'view.popup.selectedFeature'], (): void => {
        const {
          popup: { visible, selectedFeature },
        } = view;
        this._selectedPopupFeature = !visible || !selectedFeature ? null : selectedFeature;
        if (!this._selectedPopupFeature) this._viewState = 'markup';
      }),
    );

    /**
     * All async last.
     */
    // create layer views
    this._pointView = await view.whenLayerView(point);
    this._polylineView = await view.whenLayerView(polyline);
    this._polygonView = await view.whenLayerView(polygon);
    this._textView = await view.whenLayerView(text);
    const sketchLayerView = await view.whenLayerView(_sketch.layer);

    // set highlight
    [this._pointView, this._polylineView, this._polygonView, this._textView, sketchLayerView].forEach(
      async (layerView: esri.GraphicsLayerView): Promise<void> => {
        await layerView.when();
        layerView.highlightOptions = {
          color: new Color('yellow'),
          haloOpacity: 0.75,
          fillOpacity: 0.1,
        };
      },
    );

    // everything which needs assured a view
    await view.when();

    // add snapping layers
    map.layers.forEach(this._addSnappingLayer.bind(this));
    this.addHandles(
      map.layers.on('after-add', (event: { item: esri.Layer }): void => {
        this._addSnappingLayer(event.item);
      }),
    );

    // keep markup group layer on top
    // bad bad things can happen with this if initializing before view is loaded
    this.addHandles(
      this.watch('view.map.layers.length', (): void => {
        map.layers.reorder(layers, map.layers.length - 1);
      }),
    );
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Properties
  /////////////////////////////////////////////////////////////////////////////////////////////////
  view!: esri.MapView;

  lengthUnit = 'feet';

  lengthUnits = {
    meters: 'Meters',
    feet: 'Feet',
    kilometers: 'Kilometers',
    miles: 'Miles',
  };

  bufferDistance = 250;

  offsetDistance = 30;

  offsetDirection: I['offset'] = 'both';

  offsetProjectionWkid!: number;

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Public methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  onHide(): void {
    this._reset();
    this._viewState = 'markup';
    this._selectedGraphicsItems = new Collection();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Sketch view model, symbols and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _sketch = new SketchViewModel({
    layer: new GraphicsLayer(),
    snappingOptions: {
      enabled: true,
      featureEnabled: true,
      selfEnabled: true,
    },
    updateOnGraphicClick: false,
  });
  // markup symbols
  @property({ aliasOf: '_sketch.pointSymbol' })
  protected pointSymbol: SimpleMarkerSymbol | TextSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 8,
    color: COLORS.yellow,
    outline: {
      width: 1,
      color: COLORS.red,
    },
  });
  @property({ aliasOf: '_sketch.polylineSymbol' })
  protected polylineSymbol = new SimpleLineSymbol({
    color: COLORS.red,
    width: 2,
  });
  @property({ aliasOf: '_sketch.polygonSymbol' })
  protected polygonSymbol = new SimpleFillSymbol({
    color: [...COLORS.yellow, 0.125],
    outline: {
      color: COLORS.red,
      width: 2,
    },
  });
  protected textSymbol = new TextSymbol({
    text: 'New text',
    color: COLORS.red,
    haloColor: COLORS.white,
    haloSize: 1,
    horizontalAlignment: 'center',
    verticalAlignment: 'middle',
    font: {
      size: 12,
    },
  });
  // sketch symbols
  @property({ aliasOf: '_sketch.activeLineSymbol' })
  private _activeLineSymbol = new CIMSymbol({
    data: {
      type: 'CIMSymbolReference',
      symbol: {
        type: 'CIMLineSymbol',
        symbolLayers: [
          {
            type: 'CIMSolidStroke',
            effects: [
              {
                type: 'CIMGeometricEffectDashes',
                dashTemplate: [4.75, 4.75],
                lineDashEnding: 'HalfPattern',
                // controlPointEnding: 'NoConstraint',
                offsetAlongLine: 0, // test this
              },
            ],
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            // miterLimit: 10,
            width: 2,
            color: [...COLORS.white, 255],
          },
          {
            type: 'CIMSolidStroke',
            enable: true,
            capStyle: 'Butt',
            joinStyle: 'Round',
            // miterLimit: 10,
            width: 2,
            color: [...COLORS.red, 255],
          },
        ],
      },
    },
  });
  @property({ aliasOf: '_sketch.activeVertexSymbol' })
  private _activeVertexSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 6,
    color: COLORS.yellow,
    outline: {
      color: COLORS.red,
      width: 1,
    },
  });
  @property({ aliasOf: '_sketch.vertexSymbol' })
  private _vertexSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 6,
    color: COLORS.white,
    outline: {
      color: COLORS.red,
      width: 1,
    },
  });
  @property({ aliasOf: '_sketch.activeFillSymbol' })
  private _activeFillSymbol = new SimpleFillSymbol({
    color: [...COLORS.yellow, 0.125],
    outline: {
      color: COLORS.red,
      width: 2,
    },
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Snapping variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property({ aliasOf: '_sketch.snappingOptions.featureEnabled' })
  private _featureSnapping!: boolean;

  @property({ aliasOf: '_sketch.snappingOptions.selfEnabled' })
  private _drawingGuides!: boolean;

  /**
   * Add layer as snapping source.
   * @param layer
   */
  private _addSnappingLayer(layer: esri.Layer): void {
    const {
      _sketch: { snappingOptions },
    } = this;
    if (layer.type === 'group') {
      (layer as GroupLayer).layers.forEach((_layer: esri.Layer): void => {
        this._addSnappingLayer(_layer);
      });
      return;
    }
    // @ts-ignore
    if (layer.listMode === 'hide' || layer.title === undefined || layer.title === null || layer.internal === true)
      return;
    snappingOptions.featureSources.add(
      new FeatureSnappingLayerSource({
        //@ts-ignore
        layer: layer,
      }),
    );
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Layers and layer views
  /////////////////////////////////////////////////////////////////////////////////////////////////
  protected point = new GraphicsLayer({ title: 'point' });
  protected polyline = new GraphicsLayer({ title: 'polyline' });
  protected polygon = new GraphicsLayer({ title: 'polygon' });
  protected text = new GraphicsLayer({ title: 'text' });
  protected layers = new GroupLayer({ listMode: 'hide' });
  private _pointView!: esri.GraphicsLayerView;
  private _polylineView!: esri.GraphicsLayerView;
  private _polygonView!: esri.GraphicsLayerView;
  private _textView!: esri.GraphicsLayerView;

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Draw variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  private _drawState: 'ready' | I['tool'] = 'ready';

  private _newTextInput!: HTMLCalciteInputElement;

  private _newTextGraphic!: esri.Graphic;

  private _reset(): void {
    const {
      view: { popup },
      _sketch,
    } = this;
    popup.close();
    popup.clear();
    _sketch.cancel();
    this._drawState = 'ready';
    this._selectReset();
  }

  private _draw(tool: I['tool']): void {
    const { _sketch } = this;
    this._reset();
    this._drawState = tool;
    _sketch.create(tool === 'text' ? 'point' : tool);
  }

  private _createEvent(event: esri.SketchViewModelCreateEvent): void {
    const {
      _drawState,
      _sketch: { layer },
      text,
      _newTextInput,
    } = this;
    const { state: sketchState, graphic } = event;
    if (sketchState === 'cancel') {
      this._reset();
      return;
    }
    if (sketchState !== 'complete') return;
    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
    layer.remove(graphic);
    (_drawState === 'text') === true ? text.add(graphic) : this[type].add(graphic);
    if (_drawState === 'text') {
      this._viewState = 'text';
      setTimeout((): void => {
        _newTextInput.selectText();
      }, 100);
      this._newTextGraphic = graphic;
    }
    this._drawState = 'ready';
  }

  private _newText(event: Event): void {
    event.preventDefault();
    this._viewState = 'markup';
    this._newTextInput.value = 'New text';
  }

  private _addGeometry(geometry: esri.Geometry): void {
    const type = geometry.type as 'point' | 'polyline' | 'polygon';
    this[type].add(
      new Graphic({
        geometry,
        symbol: this[`${type}Symbol`],
      }),
    );
  }

  private _editGeometry(graphic: esri.Graphic): void {
    const {
      _sketch,
      _sketch: { layer },
    } = this;
    (graphic.layer as esri.GraphicsLayer).remove(graphic);
    layer.add(graphic);
    _sketch.update(graphic);
  }

  private _updateEvent(event: esri.SketchViewModelUpdateEvent): void {
    const {
      _sketch: { layer },
      text,
    } = this;
    const { state, graphics } = event;
    if (state !== 'complete') return;
    const graphic = graphics[0];
    const geometryType = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
    const symbolType = graphic.symbol.type;
    layer.removeAll();
    symbolType === 'text' ? text.add(graphic) : this[geometryType].add(graphic);
    this._selectReset();
    this._viewState = 'markup';
  }

  private _delete(): void {
    const { _sketch, _selectedGraphic } = this;
    if (!_selectedGraphic) return;
    _sketch.complete();
    (_selectedGraphic.layer as esri.GraphicsLayer).remove(_selectedGraphic);
    this._viewState = 'markup';
    this._selectReset();
  }

  private _symbolEditorContainer!: HTMLDivElement;

  private _symbolEditor!: SymbolEditor;

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Select variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  private _selectState = false;

  private _selectHandle: IHandle | null = null;

  @property()
  private _selectedGraphic: esri.Graphic | null = null;

  private _selectedGraphicsItems: esri.Collection<tsx.JSX.Element> = new Collection();

  private _selectReset(): void {
    const { _selectHandle } = this;
    if (_selectHandle) {
      _selectHandle.remove();
      this._selectHandle = null;
    }
    this._textClearSelection();
    this._selectedGraphic = null;
    this._selectState = false;
    if (this.hasHandles(HANDLES.SELECTED)) this.removeHandles(HANDLES.SELECTED);
  }

  private _clearSelection(): void {
    this._textClearSelection();
    this._reset();
    this._viewState = 'markup';
  }

  private _textClearSelection(): void {
    const { _selectedGraphic } = this;
    if (
      _selectedGraphic &&
      _selectedGraphic.symbol.type === 'text' &&
      !(_selectedGraphic.symbol as esri.TextSymbol).text
    ) {
      const symbol = (_selectedGraphic.symbol as esri.TextSymbol).clone();
      symbol.text = 'New Text';
      _selectedGraphic.symbol = symbol;
    }
  }

  private _select(): void {
    const {
      view,
      view: { popup },
      point,
      polyline,
      polygon,
      text,
      _selectState,
    } = this;
    this._selectState = !_selectState;
    if (!this._selectState) {
      this._reset();
      return;
    }
    popup.close();
    popup.clear();
    this._selectHandle = view.on('click', async (event: esri.ViewClickEvent): Promise<void> => {
      event.stopPropagation();
      if (this.hasHandles(HANDLES.SELECTED)) this.removeHandles(HANDLES.SELECTED);
      const results = (await view.hitTest(event, { include: [point, polyline, polygon, text] }))
        .results as esri.GraphicHit[];
      if (!results.length) {
        this._viewState = 'markup';
        this._selectedGraphicsItems = new Collection();
        return;
      }
      if (results.length === 1) {
        this._selectGraphic(results[0].graphic);
      } else {
        this._selectedGraphicsItems = new Collection(
          results.map((graphicHit: esri.GraphicHit): tsx.JSX.Element => {
            const {
              graphic,
              graphic: {
                geometry: { type: geometryType },
                symbol: { type: symbolType },
              },
              layer: { title },
            } = graphicHit;
            this.addHandles(this[`_${title as I['layers']}View`].highlight(graphic), HANDLES.SELECTED);
            const icon =
              symbolType === 'text'
                ? 'text-large'
                : geometryType === 'point'
                ? 'point'
                : geometryType === 'polyline'
                ? 'line'
                : 'polygon-vertices';
            return (
              <calcite-list-item
                key={KEY++}
                label={title.charAt(0).toUpperCase() + title.slice(1)}
                onclick={this._selectGraphic.bind(this, graphic)}
                onmouseenter={this._highlightSelected.bind(this, graphic)}
                onmouseleave={this._unhighlightSelected.bind(this, graphic)}
              >
                <calcite-icon icon={icon} scale="s" slot="content-end"></calcite-icon>
              </calcite-list-item>
            );
          }),
        );
        this._viewState = 'features';
        this.scheduleRender();
      }
    });
  }

  private _selectGraphic(graphic: esri.Graphic): void {
    const { _symbolEditorContainer, _symbolEditor } = this;
    if (this.hasHandles(HANDLES.SELECTED)) this.removeHandles(HANDLES.SELECTED);
    this._selectedGraphic = graphic;
    this._editGeometry(graphic);
    if (_symbolEditor) this._symbolEditor.destroy();
    this._symbolEditor = new SymbolEditor({
      graphic,
      container: document.createElement('div'),
    });
    _symbolEditorContainer.append(this._symbolEditor.container);
    this._viewState = 'feature';
    this._selectState = false;
  }

  private _highlightedGraphic: esri.Graphic | null = null;

  private _highlightSelected(graphic: esri.Graphic): void {
    const {
      _sketch: { layer },
    } = this;
    const { geometry, symbol } = graphic;
    const color = new Color([0, 255, 0]);
    const fill = new Color([0, 255, 0, 0.75]);
    const _symbol = (
      symbol as esri.SimpleMarkerSymbol | esri.SimpleLineSymbol | esri.SimpleFillSymbol | esri.TextSymbol
    ).clone();
    switch (_symbol.type) {
      case 'simple-marker':
        Object.assign(_symbol, {
          color: fill,
          outline: {
            color,
          },
        });
        break;
      case 'simple-line':
        Object.assign(_symbol, {
          color: fill,
        });
        break;
      case 'simple-fill':
        Object.assign(_symbol, {
          color: fill,
          outline: {
            color,
          },
        });
        break;
      case 'text':
        Object.assign(_symbol, {
          color,
        });
        break;
    }
    this._highlightedGraphic = new Graphic({
      geometry,
      symbol: _symbol,
    });
    layer.add(this._highlightedGraphic);
  }

  private _unhighlightSelected(): void {
    const {
      _sketch: { layer },
      _highlightedGraphic,
    } = this;
    if (!_highlightedGraphic) return;
    layer.remove(_highlightedGraphic);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Buffer and offset methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private async _buffer(): Promise<void> {
    const {
      view: { spatialReference },
      bufferDistance,
      lengthUnit,
      _selectedGraphic,
      _selectedPopupFeature,
    } = this;
    const graphic = _selectedGraphic || _selectedPopupFeature;
    if (!graphic) return;
    // @ts-ignore
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;
    let geometry = graphic.geometry;
    if (geometry && geometry.type === 'point') {
      this._addGeometry(buffer(geometry, bufferDistance, lengthUnit as esri.LinearUnits));
      this._cancelBufferOffset();
      return;
    }
    if (!layer) return; // fail safe
    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });
    this._addGeometry(buffer(geometry, bufferDistance, lengthUnit as esri.LinearUnits));
    this._cancelBufferOffset();
  }

  private _cancelBufferOffset(): void {
    const { _selectedGraphic } = this;
    this._viewState = _selectedGraphic ? 'feature' : 'markup';
  }

  private async _offset(): Promise<void> {
    const {
      view: { spatialReference },
      offsetDistance,
      offsetDirection,
      offsetProjectionWkid,
      lengthUnit,
      _selectedGraphic,
      _selectedPopupFeature,
    } = this;
    const graphic = _selectedGraphic || _selectedPopupFeature;
    if (!graphic) return;
    // @ts-ignore
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;
    let geometry = graphic.geometry;
    if (!layer || geometry.type !== 'polyline') return;
    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });
    const results = await offset(
      geometry as esri.Polyline,
      offsetDistance,
      lengthUnit as esri.LinearUnits,
      offsetDirection,
      offsetProjectionWkid,
      spatialReference,
    );
    results.forEach(this._addGeometry.bind(this));
    this._cancelBufferOffset();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Selected popup features in map variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  private _selectedPopupFeature: esri.Graphic | null = null;

  private async _addSelectedPopupFeature(): Promise<void> {
    const {
      view: { popup, spatialReference },
    } = this;
    if (!popup.selectedFeature) return; // fail safe
    const graphic = popup.selectedFeature;
    // @ts-ignore
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer;
    let geometry = graphic.geometry;
    if (geometry && geometry.type === 'point') {
      this._addGeometry(geometry);
      return;
    }
    if (!layer) return; // fail safe
    geometry = await queryFeatureGeometry({
      layer,
      graphic,
      outSpatialReference: spatialReference,
    });
    this._addGeometry(geometry);
  }

  private async _addVertices(): Promise<void> {
    const {
      view: { spatialReference },
      _selectedGraphic,
      _selectedPopupFeature,
    } = this;
    const graphic = _selectedGraphic || _selectedPopupFeature;
    if (!graphic) return;
    // @ts-ignore
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;
    if (!layer) return; // fail safe
    let geometry = graphic.geometry;
    if (!geometry || geometry.type === 'point') return;
    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });
    if (geometry.type === 'polyline')
      polylineVertices(geometry as esri.Polyline, spatialReference).forEach((point: esri.Point): void => {
        this._addGeometry(point);
      });
    if (geometry.type === 'polygon')
      polygonVertices(geometry as esri.Polygon, spatialReference).forEach((point: esri.Point): void => {
        this._addGeometry(point);
      });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Save/load variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _confirmLoadModal!: ConfirmLoadModal;

  private _confirmLoadModalHandle!: IHandle;

  private _save(event: Event): void {
    event.preventDefault();
    const fileName = `${(event.target as HTMLFormElement).querySelector('calcite-input')?.value || 'my-markup'}.mjson`;
    const json = JSON.stringify({
      graphics: this._allGraphicsJson(),
    });
    const a = document.createElement('a');
    a.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(json)}`);
    a.setAttribute('download', fileName);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this._viewState = 'markup';
  }

  private _allGraphicsJson(): any[] {
    const { text, point, polyline, polygon } = this;
    return [
      ...this._layerGraphicsJson(text),
      ...this._layerGraphicsJson(point),
      ...this._layerGraphicsJson(polyline),
      ...this._layerGraphicsJson(polygon),
    ];
  }

  private _layerGraphicsJson(layer: esri.GraphicsLayer): any[] {
    return layer.graphics.toArray().map((graphic: esri.Graphic): any => {
      return graphic.toJSON();
    });
  }

  private async _load(event: Event): Promise<void> {
    event.preventDefault();
    const { _graphicsCount, _confirmLoadModal, _confirmLoadModalHandle } = this;
    const input = (event.target as HTMLFormElement).querySelector('calcite-input') as HTMLCalciteInputElement;
    input.status = 'idle';
    if (!input.files) {
      input.status = 'invalid';
      input.setFocus();
      return;
    }
    if (_graphicsCount && !_confirmLoadModal) {
      this._confirmLoadModal = new (await import('./Markup/ConfirmLoadModal')).default();
    }
    if (_graphicsCount) {
      this._confirmLoadModal.container.open = true;

      if (_confirmLoadModalHandle) _confirmLoadModalHandle.remove();

      this._confirmLoadModalHandle = this._confirmLoadModal.on('confirmed', (confirmed: boolean): void => {
        confirmed ? this._loadGraphics(input) : (this._confirmLoadModal.container.open = false);
      });
      return;
    }
    this._loadGraphics(input);
  }

  private async _loadGraphics(input: HTMLCalciteInputElement): Promise<void> {
    const { view, text, point, polyline, polygon } = this;
    if (!input.files) return;
    const graphics: esri.Graphic[] = [];
    const file = await input.files[0].text();
    const json = JSON.parse(file) as { graphics: any[] };
    text.graphics.removeAll();
    point.graphics.removeAll();
    polyline.graphics.removeAll();
    polygon.graphics.removeAll();
    json.graphics.forEach((graphicJson: any): void => {
      const graphic = Graphic.fromJSON(graphicJson);
      graphics.push(graphic);
      if (graphic.symbol.type === 'text') {
        text.add(graphic);
      } else {
        const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
        this[type].add(graphic);
      }
    });
    this._viewState = 'markup';
    view.goTo(graphics);
    input.files = undefined;
    input.value = '';
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // View state variables and methods for rendering
  /////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Number of markup graphics
   */
  @property()
  private _graphicsCount = 0;

  /**
   * Set `_graphicsCount` property
   */
  private _countGraphics(): void {
    const { text, point, polyline, polygon } = this;
    this._graphicsCount =
      text.graphics.length + point.graphics.length + polyline.graphics.length + polygon.graphics.length;
  }

  /**
   * Can sketch view model undo
   */
  @property()
  _canUndo = false;

  /**
   * Can sketch view model redo
   */
  @property()
  _canRedo = false;

  /**
   * Set `_canUndo` and `_canRedo` properties
   */
  private _undoRedo(): void {
    const { _sketch } = this;
    this._canUndo = _sketch.canUndo();
    this._canRedo = _sketch.canRedo();
  }

  /**
   * For displaying content and buttons; and otherwise controlling various UI components
   */
  @property()
  private _viewState: 'markup' | 'text' | 'features' | 'feature' | 'buffer' | 'offset' | 'save' = 'markup';

  render(): tsx.JSX.Element {
    const {
      id,
      _sketch,
      _graphicsCount,
      _canUndo,
      _canRedo,
      _featureSnapping,
      _drawingGuides,
      _drawState,
      _selectState,
      _selectedGraphic,
      _selectedPopupFeature,
      _selectedGraphicsItems,
      _viewState,
    } = this;

    const newTextId = `new_text_${id}`;

    return (
      <calcite-panel heading="Markup">
        <calcite-action
          hidden={_viewState !== 'markup'}
          icon="save"
          slot={_viewState === 'markup' ? 'header-actions-end' : ''}
          text="Save/Load"
          onclick={(): void => {
            this._viewState = 'save';
          }}
        >
          <calcite-tooltip close-on-click="" placement="bottom" slot="tooltip">
            Save/Load
          </calcite-tooltip>
        </calcite-action>

        {/* markup view state */}
        <div hidden={_viewState !== 'markup'} class={CSS.content}>
          {/* draw buttons */}
          <div class={CSS.buttonRow}>
            <calcite-button
              id={this._tt()}
              appearance={_selectState ? '' : 'transparent'}
              disabled={_graphicsCount === 0}
              icon-start="cursor"
              onclick={this._select.bind(this)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Select markup
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'point' ? '' : 'transparent'}
              icon-start="point"
              onclick={this._draw.bind(this, 'point')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw point
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'polyline' ? '' : 'transparent'}
              icon-start="line"
              onclick={this._draw.bind(this, 'polyline')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw polyline
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'polygon' ? '' : 'transparent'}
              icon-start="polygon-vertices"
              onclick={this._draw.bind(this, 'polygon')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw polygon
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'rectangle' ? '' : 'transparent'}
              icon-start="rectangle"
              onclick={this._draw.bind(this, 'rectangle')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw rectangle
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'circle' ? '' : 'transparent'}
              icon-start="circle"
              onclick={this._draw.bind(this, 'circle')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw circle
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance={_drawState === 'text' ? '' : 'transparent'}
              icon-start="text-large"
              onclick={this._draw.bind(this, 'text')}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Draw text
            </calcite-tooltip>
          </div>
          {/* active draw controls */}
          <div class={CSS.topMargin} hidden={_viewState === 'markup' && _drawState === 'ready'}>
            <div class={CSS.buttonRow}>
              <calcite-button
                id={this._tt()}
                disabled={!_canUndo}
                appearance="transparent"
                icon-start="undo"
                onclick={_sketch.undo.bind(_sketch)}
              ></calcite-button>
              <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
                Undo
              </calcite-tooltip>
              <calcite-button
                id={this._tt()}
                disabled={!_canRedo}
                appearance="transparent"
                icon-start="redo"
                onclick={_sketch.redo.bind(_sketch)}
              ></calcite-button>
              <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
                Redo
              </calcite-tooltip>
              {/* <calcite-button id={this._tt()} appearance="transparent" icon-start="x" onclick={this._reset.bind(this)}>
                Cancel
              </calcite-button>
              <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
                Cancel draw
              </calcite-tooltip> */}
            </div>
            <calcite-label class={CSS.topMargin} layout="inline">
              <calcite-switch
                checked={_featureSnapping}
                afterCreate={this._featureSnappingAfterCreate.bind(this)}
              ></calcite-switch>
              Feature snapping
            </calcite-label>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                checked={_drawingGuides}
                afterCreate={this._drawingGuidesAfterCreate.bind(this)}
              ></calcite-switch>
              Drawing guides
            </calcite-label>
          </div>
          {/* selected feature buttons */}
          <div hidden={!_selectedPopupFeature} class={CSS.rowHeading}>
            Selected feature options
          </div>
          <div hidden={!_selectedPopupFeature} class={CSS.buttonRow}>
            <calcite-button
              id={this._tt()}
              appearance="transparent"
              icon-start="add-layer"
              onclick={this._addSelectedPopupFeature.bind(this)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Add feature
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              hidden={_selectedPopupFeature?.geometry.type === 'point'}
              appearance="transparent"
              icon-start="vertex-plus"
              onclick={this._addVertices.bind(this)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Add vertices
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance="transparent"
              icon-start="rings"
              onclick={(): void => {
                this._viewState = 'buffer';
              }}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Buffer
            </calcite-tooltip>
            <calcite-button
              class={CSS.offsetButton}
              id={this._tt()}
              hidden={_selectedPopupFeature?.geometry.type !== 'polyline'}
              appearance="transparent"
              icon-start="hamburger"
              onclick={(): void => {
                this._viewState = 'offset';
              }}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Offset
            </calcite-tooltip>
          </div>
        </div>

        {/* text view state */}
        <div hidden={_viewState !== 'text'} class={CSS.content}>
          <form id={newTextId} onsubmit={this._newText.bind(this)}>
            <calcite-label>
              Add text
              <calcite-input
                type="text"
                value="New text"
                afterCreate={this._newTextAfterCreate.bind(this)}
              ></calcite-input>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          form={newTextId}
          hidden={_viewState !== 'text'}
          slot={_viewState === 'text' ? 'footer-actions' : null}
          type="submit"
          width="full"
        >
          Done
        </calcite-button>

        {/* features view state */}
        <div hidden={_viewState !== 'features'}>
          <calcite-notice class={CSS.selectionNotice} open="" scale="s">
            <div slot="message">{_selectedGraphicsItems.length} markup selected</div>
            <calcite-link slot="link" onclick={this._clearSelection.bind(this)}>
              Clear selection
            </calcite-link>
          </calcite-notice>
          <calcite-list>{_selectedGraphicsItems.toArray()}</calcite-list>
        </div>

        {/* feature view state */}
        <div hidden={_viewState !== 'feature'} class={CSS.content}>
          <div class={CSS.buttonRow}>
            <calcite-button
              id={this._tt()}
              disabled={!_canUndo}
              appearance="transparent"
              icon-start="undo"
              onclick={_sketch.undo.bind(_sketch)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Undo
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              disabled={!_canRedo}
              appearance="transparent"
              icon-start="redo"
              onclick={_sketch.redo.bind(_sketch)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Redo
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance="transparent"
              icon-start="trash"
              onclick={this._delete.bind(this)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Delete
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              hidden={_selectedGraphic?.geometry.type === 'point'}
              appearance="transparent"
              icon-start="vertex-plus"
              onclick={this._addVertices.bind(this)}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Add vertices
            </calcite-tooltip>
            <calcite-button
              id={this._tt()}
              appearance="transparent"
              icon-start="rings"
              onclick={(): void => {
                this._viewState = 'buffer';
              }}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Buffer
            </calcite-tooltip>
            <calcite-button
              class={CSS.offsetButton}
              id={this._tt()}
              hidden={_selectedGraphic?.geometry.type !== 'polyline'}
              appearance="transparent"
              icon-start="hamburger"
              onclick={(): void => {
                this._viewState = 'offset';
              }}
            ></calcite-button>
            <calcite-tooltip close-on-click="" placement="bottom" reference-element={this._ttr()}>
              Offset
            </calcite-tooltip>
          </div>
          {/* symbol editor */}
          <div
            afterCreate={(div: HTMLDivElement): void => {
              this._symbolEditorContainer = div;
            }}
          ></div>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'feature'}
          slot={_viewState === 'feature' ? 'footer-actions' : null}
          width="full"
          onclick={this._clearSelection.bind(this)}
        >
          Done
        </calcite-button>

        {/* buffer view state */}
        <div hidden={_viewState !== 'buffer'} class={CSS.content}>
          <calcite-label>
            Distance
            <calcite-input type="number" afterCreate={this._bufferDistanceAfterCreate.bind(this)}></calcite-input>
          </calcite-label>
          <calcite-label>
            Unit
            <calcite-select afterCreate={this._unitSelectAfterCreate.bind(this)}>
              {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
            </calcite-select>
          </calcite-label>
        </div>
        <calcite-button
          hidden={_viewState !== 'buffer'}
          slot={_viewState === 'buffer' ? 'footer-actions' : null}
          width="full"
          onclick={this._buffer.bind(this)}
        >
          Buffer
        </calcite-button>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'buffer'}
          slot={_viewState === 'buffer' ? 'footer-actions' : null}
          width="full"
          onclick={this._cancelBufferOffset.bind(this)}
        >
          Cancel
        </calcite-button>

        {/* offset view state */}
        <div hidden={_viewState !== 'offset'} class={CSS.content}>
          <calcite-label>
            Distance
            <calcite-input type="number" afterCreate={this._offsetDistanceAfterCreate.bind(this)}></calcite-input>
          </calcite-label>
          <calcite-label>
            Unit
            <calcite-select afterCreate={this._unitSelectAfterCreate.bind(this)}>
              {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Direction
            <calcite-segmented-control afterCreate={this._offsetDirectionAfterCreate.bind(this)}>
              <calcite-segmented-control-item value="both">Both</calcite-segmented-control-item>
              <calcite-segmented-control-item value="left">Left</calcite-segmented-control-item>
              <calcite-segmented-control-item value="right">Right</calcite-segmented-control-item>
            </calcite-segmented-control>
          </calcite-label>
        </div>
        <calcite-button
          hidden={_viewState !== 'offset'}
          slot={_viewState === 'offset' ? 'footer-actions' : null}
          width="full"
          onclick={this._offset.bind(this)}
        >
          Offset
        </calcite-button>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'offset'}
          slot={_viewState === 'offset' ? 'footer-actions' : null}
          width="full"
          onclick={this._cancelBufferOffset.bind(this)}
        >
          Cancel
        </calcite-button>

        {/* save/load view state */}
        <div hidden={_viewState !== 'save'}>
          <calcite-tabs class={CSS.tabs}>
            <calcite-tab-nav slot="title-group">
              <calcite-tab-title selected="">Save</calcite-tab-title>
              <calcite-tab-title>Load</calcite-tab-title>
            </calcite-tab-nav>
            <calcite-tab selected="">
              <form onsubmit={this._save.bind(this)}>
                <calcite-label>
                  File name
                  <calcite-input
                    disabled={_graphicsCount === 0}
                    type="text"
                    suffix-text=".mjson"
                    value="my-markup"
                  ></calcite-input>
                </calcite-label>
                <calcite-button disabled={_graphicsCount === 0} type="submit">
                  Save Markup
                </calcite-button>
              </form>
            </calcite-tab>
            <calcite-tab>
              <form onsubmit={this._load.bind(this)}>
                <calcite-label>
                  .mjson file
                  <calcite-input type="file" accept=".mjson"></calcite-input>
                </calcite-label>
                <calcite-button type="submit">Load Markup</calcite-button>
              </form>
            </calcite-tab>
          </calcite-tabs>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'save'}
          slot={_viewState === 'save' ? 'footer-actions' : null}
          width="full"
          onclick={(): void => {
            this._viewState = 'markup';
          }}
        >
          Done
        </calcite-button>
      </calcite-panel>
    );
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Render support methods
  /////////////////////////////////////////////////////////////////////////////////////////////////

  private _newTextAfterCreate(input: HTMLCalciteInputElement): void {
    this._newTextInput = input;
    input.addEventListener('calciteInputInput', (): void => {
      const { _newTextGraphic } = this;
      if (!_newTextGraphic) return;
      const symbol = (_newTextGraphic.symbol as esri.TextSymbol).clone();
      symbol.text = input.value;
      _newTextGraphic.symbol = symbol;
    });
    this.addHandles(
      this.watch('_viewState', (value: string, oldValue: string): void => {
        const { _newTextGraphic } = this;
        if (!_newTextGraphic) return;
        const symbol = (_newTextGraphic.symbol as esri.TextSymbol).clone();
        if (oldValue === 'text' && !symbol.text) {
          symbol.text = 'New Text';
          _newTextGraphic.symbol = symbol;
        }
      }),
    );
  }

  private _featureSnappingAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    _switch.addEventListener('calciteSwitchChange', (): void => {
      this._featureSnapping = _switch.checked;
    });
  }

  private _drawingGuidesAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    _switch.addEventListener('calciteSwitchChange', (): void => {
      this._drawingGuides = _switch.checked;
    });
  }

  private _bufferDistanceAfterCreate(input: HTMLCalciteInputElement): void {
    input.value = this.bufferDistance.toString();
    input.addEventListener('calciteInputInput', (): void => {
      this.bufferDistance = parseFloat(input.value);
    });
  }

  private _offsetDistanceAfterCreate(input: HTMLCalciteInputElement): void {
    input.value = this.offsetDistance.toString();
    input.addEventListener('calciteInputInput', (): void => {
      this.offsetDistance = parseFloat(input.value);
    });
  }

  private _offsetDirectionAfterCreate(segmentedControl: HTMLCalciteSegmentedControlElement): void {
    // segmentedControl.value = this.offsetDirection;
    segmentedControl
      .querySelectorAll('calcite-segmented-control-item')
      .forEach((segmentedControlItem: HTMLCalciteSegmentedControlItemElement): void => {
        if (segmentedControlItem.value === this.offsetDirection) segmentedControlItem.checked = true;
      });
    segmentedControl.addEventListener('calciteSegmentedControlChange', (): void => {
      this.offsetDirection = segmentedControl.selectedItem.value;
    });
  }

  private _unitSelectAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', () => {
      this.lengthUnit = select.selectedOption.value;
    });
  }

  private _renderUnitOptions(units: { [key: string]: string }, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <calcite-option key={KEY++} label={units[unit]} value={unit} selected={unit === defaultUnit}></calcite-option>,
      );
    }
    return options;
  }

  /**
   * Return tooltip target id
   */
  private _tt(): string {
    const _id = TT_ID;
    return _id;
  }

  /**
   * Return tooltip reference id
   */
  private _ttr(): string {
    const { id } = this;
    const _id = TT_ID;
    TT_ID = `tt_${id}_${TT_KEY++}`;
    return _id;
  }
}
