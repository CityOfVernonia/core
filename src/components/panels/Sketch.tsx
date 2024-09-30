import esri = __esri;

export interface SketchConstructorProperties extends esri.WidgetProperties {
  /**
   * View to sketch on.
   */
  view: esri.MapView;
  /**
   * Projection to use for offset.
   */
  offsetProjectionWkid: number;
}

interface I {
  layers: 'point' | 'polyline' | 'polygon' | 'text';
  tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text';
  viewState: 'sketch' | 'text' | 'graphics' | 'graphic' | 'buffer' | 'offset' | 'save' | 'load';
  offset: 'both' | 'left' | 'right';
  featureJson: {
    geometry: object;
    symbol: object;
  };
}

import type DeleteConfirmModal from './../dialogs/Confirm';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import Collection from '@arcgis/core/core/Collection';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import { queryFeatureGeometry, polylineVertices, polygonVertices, buffer, offset } from './../../support/geometryUtils';

const CSS = {
  buttonRow: 'cov-panel--sketch_button-row',
  content: 'cov-panel--sketch_content',
  loadNotice: 'cov-panel--sketch_load-notice',
  offsetButton: 'cov-panel--sketch_offset-button',
  options: 'cov-panel--sketch_options',
  sketchContent: 'cov-panel--sketch_sketch-content',
  selectionNotice: 'cov-panel--sketch_selection-notice',
  //
  symbolEditor: 'cov-panel--sketch_symbol-editor',
  sliderLabels: 'cov-panel--sketch_symbol-editor--slider-labels',
  //
  colorPicker: 'cov-panel--sketch_color-picker',
  colorPickerColor: 'cov-panel--sketch_color-picker--color',
  colorPickerColorSelected: 'cov-panel--sketch_color-picker--color--selected',
};

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

let KEY = 0;

@subclass('cov.components.panels.Sketch')
export default class Sketch extends Widget {
  container!: HTMLCalcitePanelElement;

  constructor(properties: SketchConstructorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      _sketch,
      _sketch: {
        snappingOptions: { featureSources },
      },
      pointSymbol,
      textSymbol,
      point,
      polyline,
      polygon,
      text,
      layers,
    } = this;

    // initialize sketch
    _sketch.view = view;

    // add layers
    layers.addMany([polygon, polyline, point, text, _sketch.layer]);
    map.add(layers);

    // has graphics
    [polygon, polyline, point, text].forEach((layer: esri.GraphicsLayer): void => {
      this.addHandles(
        layer.watch('graphics.length', (): void => {
          this._hasGraphics =
            text.graphics.length + point.graphics.length + polyline.graphics.length + polygon.graphics.length > 0;
        }),
      );
    });

    // set displayed point symbol between point and text
    const _pointSymbol = pointSymbol.clone();
    this.addHandles(
      this.watch('_drawState', (_drawState: string): void => {
        if (_drawState === 'text') this.pointSymbol = textSymbol.clone();
        if (_drawState === 'point') this.pointSymbol = _pointSymbol.clone();
      }),
    );

    // create event
    this.addHandles(_sketch.on('create', this._createEvent.bind(this)));

    // update event
    this.addHandles(_sketch.on('update', this._updateEvent.bind(this)));

    // undo/redo events
    const undoRedo = (): void => {
      this._canUndo = _sketch.canUndo();
      this._canRedo = _sketch.canRedo();
    };
    this.addHandles([
      _sketch.on('create', undoRedo),
      _sketch.on('update', undoRedo),
      _sketch.on('redo', undoRedo),
      _sketch.on('undo', undoRedo),
    ]);

    // reset on component not visible
    this.addHandles(
      this.watch('visible', (visible: boolean): void => {
        if (!visible) this._reset();
      }),
    );

    // everything which needs a serviceable view
    await view.when();

    // create layer views
    this._pointView = await view.whenLayerView(point);
    this._polylineView = await view.whenLayerView(polyline);
    this._polygonView = await view.whenLayerView(polygon);
    this._textView = await view.whenLayerView(text);

    // popup feature
    whenOnce((): boolean => view.popup?.visible).then((): void => {
      const { popup } = view;
      this.addHandles(
        popup.watch(['selectedFeature', 'visible'], (): void => {
          const { selectedFeature, visible } = popup;
          this._popupFeature = selectedFeature && visible ? selectedFeature : null;
        }),
      );
    });

    // add snapping layers
    const snappingLayer = (layer: esri.Layer): void => {
      const { type } = layer;
      if (type === 'group') {
        (layer as GroupLayer).layers.forEach((_layer: esri.Layer): void => {
          snappingLayer(_layer);
        });
        return;
      }
      if (type !== 'csv' && type !== 'feature' && type !== 'geojson' && type !== 'wfs') return;
      featureSources.add(
        new FeatureSnappingLayerSource({
          //@ts-expect-error `layer` property poorly typed
          layer: layer,
        }),
      );
    };
    map.layers.forEach(snappingLayer.bind(this));
    [polygon, polyline, point, text].forEach((layer: esri.GraphicsLayer): void => {
      featureSources.add(
        new FeatureSnappingLayerSource({
          layer: layer,
        }),
      );
    });
    this.addHandles(
      map.layers.on('after-add', (event: { item: esri.Layer }): void => {
        snappingLayer(event.item);
      }),
    );

    // keep markup group layer on top
    // should keep the internal layer on top...but no guarantees if multiple sketch view model's have same `view`
    // bad bad things can happen with this if initializing before view is loaded
    this.addHandles(
      this.watch('view.map.allLayers.length', (): void => {
        let numberOfInternalLayers = 0;

        map.allLayers.forEach((layer: esri.Layer): void => {
          // @ts-expect-error no typed
          if (layer.internal) numberOfInternalLayers++;
        });

        map.allLayers.reorder(layers, map.allLayers.length - numberOfInternalLayers);

        // @ts-expect-error no typed
        map.allLayers.reorder(_sketch._internalGraphicsLayer, map.allLayers.length - (numberOfInternalLayers - 1));
      }),
    );
  }

  view!: esri.MapView;

  offsetProjectionWkid!: number;

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Sketch view model and symbols
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
  // States and watched properties
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  _canUndo = false;

  @property()
  _canRedo = false;

  @property()
  private _drawState: 'ready' | I['tool'] = 'ready';

  @property()
  private _hasGraphics = false;

  @property({ aliasOf: '_sketch.snappingOptions.featureEnabled' })
  private _snapping!: boolean;

  @property({ aliasOf: '_sketch.snappingOptions.selfEnabled' })
  private _guides!: boolean;

  @property()
  private _viewState: I['viewState'] = 'sketch';

  private _setViewState(state: I['viewState']): void {
    this._viewState = state;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Sketch methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _addGeometry(geometry: esri.Geometry): esri.Graphic {
    const type = geometry.type as 'point' | 'polyline' | 'polygon';
    const graphic = new Graphic({
      geometry,
      symbol: this[`${type}Symbol`],
    });
    this[type].add(graphic);
    return graphic;
  }

  private _delete(): void {
    const { _sketch, _selectedGraphic } = this;
    if (!_selectedGraphic) return;
    _sketch.complete();
    (_selectedGraphic.layer as esri.GraphicsLayer).remove(_selectedGraphic);
    this._setViewState('sketch');
    this._selectReset();
  }

  private _reset(): void {
    const { view, _sketch } = this;
    view.closePopup();
    _sketch.cancel();
    this._drawState = 'ready';
    this._selectReset();
  }

  private _create(tool: I['tool']): void {
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

    const { state, graphic } = event;

    if (state === 'cancel') {
      this._reset();
      return;
    }

    if (state !== 'complete') return;

    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';

    layer.remove(graphic);

    if (_drawState === 'text') {
      text.add(graphic);
    } else {
      this[type].add(graphic);
    }

    if (_drawState === 'text') {
      this._setViewState('text');

      setTimeout((): void => {
        _newTextInput.selectText();
      }, 100);
      this._newTextGraphic = graphic;
    }

    this._drawState = 'ready';
  }

  private _update(graphic: esri.Graphic): void {
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

    // symbolType === 'text' ? text.add(graphic) : this[geometryType].add(graphic);
    if (symbolType === 'text') {
      text.add(graphic);
    } else {
      this[geometryType].add(graphic);
    }

    this._setViewState('sketch');

    // delay reset to prevent popup when off-clicking selected graphic
    setTimeout(this._selectReset.bind(this), 500);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // New text properties and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _newTextInput!: HTMLCalciteInputElement;

  private _newTextGraphic!: esri.Graphic;

  private _newTextInputAfterCreate(input: HTMLCalciteInputElement): void {
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

  private _newTextSubmitEvent(event: Event): void {
    event.preventDefault();
    this._setViewState('sketch');
    this._newTextInput.value = 'New text';
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Delete all properties and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _deleteConfirmModal?: DeleteConfirmModal;

  private async _deleteAll(): Promise<void> {
    const { _deleteConfirmModal } = this;

    if (!_deleteConfirmModal) {
      this._deleteConfirmModal = new (await import('./../dialogs/Confirm')).default({
        content: 'Delete all sketch graphics?',
        kind: 'danger',
        okText: 'Delete',
        okButtonDanger: true,
      });

      this._deleteConfirmModal.on('confirmed', (confirm: boolean): void => {
        const { point, polyline, polygon, text } = this;
        if (confirm) {
          [point, polyline, polygon, text].forEach((layer: esri.GraphicsLayer): void => {
            layer.removeAll();
          });
        }
      });
    }

    this._deleteConfirmModal?.showConfirm();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Symbol editor
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _symbolEditorContainer!: HTMLDivElement;

  private _symbolEditor!: SymbolEditor;

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Select properties and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  private _selectState = false;

  private _selectHandle: IHandle | null = null;

  @property()
  private _selectedGraphic: esri.Graphic | null = null;

  private _highlightedSelectedGraphic: esri.Graphic | null = null;

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
    this._setViewState('sketch');
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
    const { view, point, polyline, polygon, text, _selectState } = this;

    this._selectState = !_selectState;
    if (!this._selectState) {
      this._reset();
      return;
    }

    view.closePopup();

    if (this.hasHandles(HANDLES.SELECTED)) this.removeHandles(HANDLES.SELECTED);

    this._selectHandle = view.on('click', async (event: esri.ViewClickEvent): Promise<void> => {
      event.stopPropagation();

      const results = (await view.hitTest(event, { include: [point, polyline, polygon, text] }))
        .results as esri.GraphicHit[];

      if (!results.length) {
        this._setViewState('sketch');
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
                onmouseleave={this._unhighlightSelected.bind(this)}
              >
                <calcite-icon icon={icon} scale="s" slot="content-end"></calcite-icon>
              </calcite-list-item>
            );
          }),
        );
        this._setViewState('graphics');
      }
    });
  }

  private _selectGraphic(graphic: esri.Graphic): void {
    const { _symbolEditorContainer, _symbolEditor } = this;

    if (this.hasHandles(HANDLES.SELECTED)) this.removeHandles(HANDLES.SELECTED);

    this._selectedGraphic = graphic;
    this._update(graphic);

    if (_symbolEditor) this._symbolEditor.destroy();
    this._symbolEditor = new SymbolEditor({
      graphic,
      container: document.createElement('div'),
    });
    _symbolEditorContainer.append(this._symbolEditor.container);

    this._setViewState('graphic');
    this._selectState = false;
  }

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
    this._highlightedSelectedGraphic = new Graphic({
      geometry,
      symbol: _symbol,
    });
    layer.add(this._highlightedSelectedGraphic);
  }

  private _unhighlightSelected(): void {
    const {
      _sketch: { layer },
      _highlightedSelectedGraphic,
    } = this;
    if (!_highlightedSelectedGraphic) return;
    layer.remove(_highlightedSelectedGraphic);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Popup feature properties and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  @property()
  private _popupFeature?: esri.Graphic | null;

  private async _addPopupFeature(): Promise<void> {
    const {
      view,
      view: { popup, spatialReference },
    } = this;
    if (!popup.selectedFeature) return; // fail safe
    const graphic = popup.selectedFeature;
    // @ts-expect-error not typed
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
    view.closePopup();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Add vertices methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private async _addVertices(): Promise<void> {
    const {
      view: { spatialReference },
      _selectedGraphic,
      _popupFeature,
    } = this;
    const graphic = _selectedGraphic || _popupFeature;

    if (!graphic) return;

    // @ts-expect-error not typed
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
  // Buffer variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _bufferInput!: HTMLCalciteInputNumberElement;

  private async _buffer(event: Event): Promise<void> {
    event.preventDefault();

    const {
      view: { spatialReference },
      _bufferInput: { value: _distance },
      _selectedGraphic,
      _popupFeature,
    } = this;

    const graphic = _selectedGraphic || _popupFeature;

    if (!graphic) return;

    // @ts-expect-error not typed
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;

    let geometry = graphic.geometry;

    const distance = _distance as unknown as number;

    if (geometry && geometry.type === 'point') {
      this._addGeometry(buffer(geometry, distance, 'feet'));
      this._bufferCancel();
      return;
    }

    if (!layer) return; // fail safe

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });

    this._addGeometry(buffer(geometry, distance, 'feet'));

    this._bufferCancel();
  }

  private _bufferCancel(): void {
    const { _selectedGraphic } = this;
    this._viewState = _selectedGraphic ? 'graphic' : 'sketch';
  }

  private _bufferInputAfterCreate(input: HTMLCalciteInputNumberElement): void {
    this._bufferInput = input;
    this.addHandles(
      this.watch('_viewState', (state: I['viewState']): void => {
        if (state === 'buffer') input.setFocus();
      }),
    );
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Offset variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _offsetInput!: HTMLCalciteInputNumberElement;

  private _offsetSegmentedControl!: HTMLCalciteSegmentedControlElement;

  private async _offset(event: Event): Promise<void> {
    event.preventDefault();

    const {
      view: { spatialReference },
      offsetProjectionWkid,
      _offsetInput: { value: _offsetDistance },
      _offsetSegmentedControl: {
        selectedItem: { value: _offsetDirection },
      },
      _selectedGraphic,
      _popupFeature,
    } = this;

    const graphic = _selectedGraphic || _popupFeature;

    if (!graphic) return;

    // @ts-expect-error not typed
    const layer = (graphic.layer || graphic.sourceLayer) as esri.FeatureLayer | esri.GraphicsLayer;

    let geometry = graphic.geometry;

    if (!layer || geometry.type !== 'polyline') return;

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });

    const offsetDistance = _offsetDistance as unknown as number;

    const offsetDirection = _offsetDirection as unknown as I['offset'];

    const results = await offset(
      geometry as esri.Polyline,
      offsetDistance,
      'feet',
      offsetDirection,
      offsetProjectionWkid,
      spatialReference,
    );

    results.forEach(this._addGeometry.bind(this));

    this._offsetCancel();
  }

  private _offsetCancel(): void {
    const { _selectedGraphic } = this;
    this._viewState = _selectedGraphic ? 'graphic' : 'sketch';
  }

  private _offsetInputAfterCreate(input: HTMLCalciteInputNumberElement): void {
    this._offsetInput = input;
    this.addHandles(
      this.watch('_viewState', (state: I['viewState']): void => {
        if (state === 'offset') input.setFocus();
      }),
    );
  }

  private _offsetSegmentedControlAfterCreate(segmentedControl: HTMLCalciteSegmentedControlElement): void {
    this._offsetSegmentedControl = segmentedControl;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Save variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _saveInput!: HTMLCalciteInputElement;

  private _save(event: Event): void {
    event.preventDefault();

    const {
      point,
      polyline,
      polygon,
      text,
      _saveInput: { value: filename },
    } = this;

    const features: object[] = [];

    [point, polyline, polygon, text].forEach((layer: esri.GraphicsLayer): void => {
      layer.graphics.forEach((graphic: esri.Graphic): void => {
        features.push(graphic.toJSON());
      });
    });

    const json = {
      features,
    };

    const a = Object.assign(document.createElement('a'), {
      href: `data:text/plain;charset=UTF-8,${encodeURIComponent(JSON.stringify(json))}`,
      download: `${filename || 'my_sketches'}.json`,
      style: {
        display: 'none',
      },
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this._setViewState('sketch');
  }

  private _saveInputAfterCreate(input: HTMLCalciteInputElement): void {
    this._saveInput = input;
    this.addHandles(
      this.watch('_viewState', (state: I['viewState']): void => {
        if (state === 'save') input.selectText();
      }),
    );
  }

  private _saveShow(): void {
    this._reset();
    this._viewState = 'save';
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // Load variables and methods
  /////////////////////////////////////////////////////////////////////////////////////////////////
  private _loadInput!: HTMLCalciteInputElement;

  private _reader?: FileReader;

  private _load(event: Event): void {
    event.preventDefault();

    const {
      _loadInput,
      _loadInput: { files },
    } = this;

    let { _reader } = this;

    if (!files || !files[0]) {
      _loadInput.setFocus();
      return;
    }

    if (!_reader) {
      _reader = this._reader = new FileReader();
      _reader.onload = this._readerLoad.bind(this);
      _reader.onerror = this._readerError.bind(this);
    }

    const file = files[0];

    _reader.readAsText(file);
  }

  private _loadInputAfterCreate(input: HTMLCalciteInputElement): void {
    this._loadInput = input;
  }

  private _loadShow(): void {
    this._reset();
    this._setViewState('load');
  }

  // @ts-expect-error generic error
  private _readerError(error): void {
    console.log(error);
    this._setViewState('sketch');
  }

  private _readerLoad(): void {
    const { point, polyline, polygon, text, view, _reader } = this;

    if (!_reader) return;

    [point, polyline, polygon, text].forEach((layer: esri.GraphicsLayer): void => {
      layer.removeAll();
    });

    const { features } = JSON.parse(_reader.result as string);

    if (!features || !features.length) {
      this._setViewState('sketch');
      return;
    }

    const graphics: esri.Graphic[] = [];

    features.forEach((feature: I['featureJson']): void => {
      const graphic = Graphic.fromJSON(feature);

      const { geometry, symbol } = graphic;

      if (!symbol) {
        graphics.push(this._addGeometry(geometry));
        return;
      }

      const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon' | 'text';

      if (type === 'text') {
        text.add(graphic);
      } else {
        this[type].add(graphic);
      }

      graphics.push(graphic);
    });

    view.goTo(graphics);

    this._setViewState('sketch');
  }

  render(): tsx.JSX.Element {
    const {
      id,
      _canRedo,
      _canUndo,
      _drawState,
      _selectedGraphic,
      _selectedGraphicsItems,
      _popupFeature,
      _selectState,
      _sketch,
      _hasGraphics,
      _viewState,
    } = this;

    // popup feature variables
    const popupFeatureType = _popupFeature ? _popupFeature.geometry.type : null;
    const popupFeatureVertices = popupFeatureType === 'polyline' || popupFeatureType === 'polygon';
    const popupFeatureOffset = popupFeatureType === 'polyline';

    // selected graphic variables
    const selectedGraphicType = _selectedGraphic ? _selectedGraphic.geometry.type : null;
    const selectedGraphicVertices = selectedGraphicType === 'polyline' || selectedGraphicType === 'polygon';
    const selectedGraphicOffset = selectedGraphicType === 'polyline';

    // form ids
    const newTextFormId = `new-text-form-${id}`;
    const bufferFormId = `buffer-form-${id}`;
    const offsetFormId = `offset-form-${id}`;
    const saveFormId = `save-form-${id}`;
    const loadFormId = `load-form-${id}`;

    return (
      <calcite-panel heading="Sketch">
        {/* options */}
        <calcite-action icon="gear" text="Options" slot="header-actions-end"></calcite-action>
        <calcite-popover
          auto-close=""
          closable=""
          heading="Options"
          overlay-positioning="fixed"
          placement="bottom-end"
          scale="s"
          afterCreate={(popover: HTMLCalcitePopoverElement): void => {
            const action = popover.previousElementSibling;
            if (!action) return;
            popover.referenceElement = action;
          }}
        >
          <div class={CSS.options}>
            <calcite-label layout="inline">
              <calcite-switch
                checked=""
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._snapping = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Snapping
            </calcite-label>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                checked=""
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._guides = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Guides
            </calcite-label>
          </div>
        </calcite-popover>

        {/* menu actions */}
        <calcite-action
          disabled={!_hasGraphics}
          icon="save"
          text-enabled=""
          text="Save"
          slot="header-menu-actions"
          onclick={this._saveShow.bind(this)}
        ></calcite-action>
        <calcite-action
          icon="folder-open"
          text-enabled=""
          text="Load"
          slot="header-menu-actions"
          onclick={this._loadShow.bind(this)}
        ></calcite-action>

        {/* sketch controls */}
        <div class={CSS.sketchContent} hidden={_viewState !== 'sketch'}>
          <div class={CSS.buttonRow}>
            <calcite-button
              appearance={_drawState === 'point' ? null : 'transparent'}
              icon-start="point"
              onclick={this._create.bind(this, 'point')}
            ></calcite-button>
            <calcite-button
              appearance={_drawState === 'polyline' ? null : 'transparent'}
              icon-start="line"
              onclick={this._create.bind(this, 'polyline')}
            ></calcite-button>
            <calcite-button
              appearance={_drawState === 'polygon' ? null : 'transparent'}
              icon-start="polygon-vertices"
              onclick={this._create.bind(this, 'polygon')}
            ></calcite-button>
            <calcite-button
              appearance={_drawState === 'rectangle' ? null : 'transparent'}
              icon-start="rectangle"
              onclick={this._create.bind(this, 'rectangle')}
            ></calcite-button>
            <calcite-button
              appearance={_drawState === 'circle' ? null : 'transparent'}
              icon-start="circle"
              onclick={this._create.bind(this, 'circle')}
            ></calcite-button>
            <calcite-button
              appearance={_drawState === 'text' ? null : 'transparent'}
              icon-start="text-large"
              onclick={this._create.bind(this, 'text')}
            ></calcite-button>
          </div>
          <div class={CSS.buttonRow}>
            <calcite-button
              disabled={!_hasGraphics}
              appearance={_selectState ? '' : 'transparent'}
              icon-start="cursor"
              onclick={this._select.bind(this)}
            ></calcite-button>
            <calcite-button
              disabled={!_canUndo}
              appearance="transparent"
              icon-start="undo"
              onclick={_sketch.undo.bind(_sketch)}
            ></calcite-button>
            <calcite-button
              disabled={!_canRedo}
              appearance="transparent"
              icon-start="redo"
              onclick={_sketch.redo.bind(_sketch)}
            ></calcite-button>
            <calcite-button
              disabled={!_hasGraphics}
              appearance="transparent"
              icon-start="trash"
              onclick={this._deleteAll.bind(this)}
            ></calcite-button>
          </div>
          <div class={CSS.buttonRow}>
            <calcite-button
              appearance="transparent"
              disabled={!_popupFeature}
              icon-start="add-layer"
              onclick={this._addPopupFeature.bind(this)}
            ></calcite-button>
            <calcite-button
              appearance="transparent"
              disabled={!popupFeatureVertices}
              icon-start="vertex-plus"
              onclick={this._addVertices.bind(this)}
            ></calcite-button>
            <calcite-button
              appearance="transparent"
              disabled={!_popupFeature}
              icon-start="rings"
              onclick={this._setViewState.bind(this, 'buffer')}
            ></calcite-button>
            <calcite-button
              class={CSS.offsetButton}
              appearance="transparent"
              disabled={!popupFeatureOffset}
              icon-start="hamburger"
              onclick={this._setViewState.bind(this, 'offset')}
            ></calcite-button>
          </div>
        </div>

        {/* new text */}
        <div class={CSS.sketchContent} hidden={_viewState !== 'text'}>
          <form id={newTextFormId} onsubmit={this._newTextSubmitEvent.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom:0;">
              Add text
              <calcite-input
                type="text"
                value="New text"
                afterCreate={this._newTextInputAfterCreate.bind(this)}
              ></calcite-input>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          form={newTextFormId}
          hidden={_viewState !== 'text'}
          slot={_viewState === 'text' ? 'footer' : null}
          type="submit"
          width="full"
        >
          Done
        </calcite-button>

        {/* multiple graphics selected */}
        <div hidden={_viewState !== 'graphics'}>
          <calcite-notice class={CSS.selectionNotice} open="" scale="s">
            <div slot="message">{_selectedGraphicsItems.length} sketch graphics selected</div>
            <calcite-link slot="link" onclick={this._clearSelection.bind(this)}>
              Clear selection
            </calcite-link>
          </calcite-notice>
          <calcite-list>{_selectedGraphicsItems.toArray()}</calcite-list>
        </div>

        {/* edit graphic */}
        <div class={CSS.content} hidden={_viewState !== 'graphic'}>
          <div class={CSS.buttonRow}>
            <calcite-button
              disabled={!_canUndo}
              appearance="transparent"
              icon-start="undo"
              onclick={_sketch.undo.bind(_sketch)}
            ></calcite-button>
            <calcite-button
              disabled={!_canRedo}
              appearance="transparent"
              icon-start="redo"
              onclick={_sketch.redo.bind(_sketch)}
            ></calcite-button>
            <calcite-button
              appearance="transparent"
              icon-start="trash"
              onclick={this._delete.bind(this)}
            ></calcite-button>
            <calcite-button
              appearance="transparent"
              disabled={!selectedGraphicVertices}
              icon-start="vertex-plus"
              onclick={this._addVertices.bind(this)}
            ></calcite-button>
            <calcite-button
              appearance="transparent"
              icon-start="rings"
              onclick={this._setViewState.bind(this, 'buffer')}
            ></calcite-button>
            <calcite-button
              class={CSS.offsetButton}
              appearance="transparent"
              disabled={!selectedGraphicOffset}
              icon-start="hamburger"
              onclick={this._setViewState.bind(this, 'offset')}
            ></calcite-button>
          </div>
          <div
            afterCreate={(div: HTMLDivElement): void => {
              this._symbolEditorContainer = div;
            }}
          ></div>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'graphic'}
          slot={_viewState === 'graphic' ? 'footer' : null}
          width="full"
          onclick={this._clearSelection.bind(this)}
        >
          Done
        </calcite-button>

        {/* buffer */}
        <div class={CSS.content} hidden={_viewState !== 'buffer'}>
          <form id={bufferFormId} onsubmit={this._buffer.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom:0;">
              Buffer distance
              <calcite-input-number
                max="1000"
                min="5"
                placeholder="Buffer distance"
                step="10"
                suffixText="feet"
                value="250"
                afterCreate={this._bufferInputAfterCreate.bind(this)}
              ></calcite-input-number>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'buffer'}
          slot={_viewState === 'buffer' ? 'footer' : null}
          width="half"
          onclick={this._bufferCancel.bind(this)}
        >
          Cancel
        </calcite-button>
        <calcite-button
          form={bufferFormId}
          hidden={_viewState !== 'buffer'}
          slot={_viewState === 'buffer' ? 'footer' : null}
          type="submit"
          width="half"
        >
          Buffer
        </calcite-button>

        {/* offset */}
        <div class={CSS.content} hidden={_viewState !== 'offset'}>
          <form id={offsetFormId} onsubmit={this._offset.bind(this)}>
            <calcite-label>
              Offset distance
              <calcite-input-number
                max="1000"
                min="5"
                placeholder="Offset distance"
                step="10"
                suffixText="feet"
                value="30"
                afterCreate={this._offsetInputAfterCreate.bind(this)}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label style="--calcite-label-margin-bottom:0;">
              <calcite-segmented-control afterCreate={this._offsetSegmentedControlAfterCreate.bind(this)}>
                <calcite-segmented-control-item checked="" value="both">
                  Both
                </calcite-segmented-control-item>
                <calcite-segmented-control-item value="left">Left</calcite-segmented-control-item>
                <calcite-segmented-control-item value="right">Right</calcite-segmented-control-item>
              </calcite-segmented-control>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'offset'}
          slot={_viewState === 'offset' ? 'footer' : null}
          width="half"
          onclick={this._offsetCancel.bind(this)}
        >
          Cancel
        </calcite-button>
        <calcite-button
          form={offsetFormId}
          hidden={_viewState !== 'offset'}
          slot={_viewState === 'offset' ? 'footer' : null}
          type="submit"
          width="half"
        >
          Offset
        </calcite-button>

        {/* save */}
        <div class={CSS.content} hidden={_viewState !== 'save'}>
          <form id={saveFormId} onsubmit={this._save.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom:0;">
              File name
              <calcite-input
                suffix-text=".json"
                value="my_sketches"
                afterCreate={this._saveInputAfterCreate.bind(this)}
              ></calcite-input>
            </calcite-label>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'save'}
          slot={_viewState === 'save' ? 'footer' : null}
          width="half"
          onclick={this._setViewState.bind(this, 'sketch')}
        >
          Cancel
        </calcite-button>
        <calcite-button
          form={saveFormId}
          hidden={_viewState !== 'save'}
          slot={_viewState === 'save' ? 'footer' : null}
          type="submit"
          width="half"
        >
          Save
        </calcite-button>

        {/* load */}
        <div class={CSS.content} hidden={_viewState !== 'load'}>
          <form id={loadFormId} onsubmit={this._load.bind(this)}>
            <calcite-label style="--calcite-label-margin-bottom:0;">
              ArcGIS JSON file
              <calcite-input
                accept=".json"
                type="file"
                afterCreate={this._loadInputAfterCreate.bind(this)}
              ></calcite-input>
            </calcite-label>
            <calcite-notice class={CSS.loadNotice} icon="lightbulb" kind="warning" scale="s" open="">
              <div slot="message">Existing sketch graphics will be deleted</div>
            </calcite-notice>
          </form>
        </div>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'load'}
          slot={_viewState === 'load' ? 'footer' : null}
          width="half"
          onclick={this._setViewState.bind(this, 'sketch')}
        >
          Cancel
        </calcite-button>
        <calcite-button
          form={loadFormId}
          hidden={_viewState !== 'load'}
          slot={_viewState === 'load' ? 'footer' : null}
          type="submit"
          width="half"
        >
          Load
        </calcite-button>
      </calcite-panel>
    );
  }
}

@subclass('cov.components.panels.Sketch.SymbolEditor')
class SymbolEditor extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Graphic of interest.
       */
      graphic?: esri.Graphic;
    },
  ) {
    super(properties);
  }

  /**
   * Graphic of interest.
   */
  @property()
  graphic!: esri.Graphic;

  /**
   * Graphic's symbol.
   */
  @property({ aliasOf: 'graphic.symbol' })
  protected symbol!: esri.SimpleMarkerSymbol | esri.SimpleLineSymbol | esri.SimpleFillSymbol | esri.TextSymbol;

  /**
   * Set symbol property with dot notation and value.
   * @param property
   * @param value
   */
  private _setProperty(property: string, value: string | number | Color): void {
    const { graphic, symbol: originalSymbol } = this;
    // clones symbol
    const symbol = originalSymbol.clone();
    // set the property
    symbol.set({
      [property]: value,
    });
    // set the symbol
    graphic.set({
      symbol: symbol,
    });

    this.emit('set-symbol-property', {
      originalSymbol,
      symbol,
      graphic,
    });
  }

  /**
   * Render widget.
   */
  render(): tsx.JSX.Element {
    const { symbol } = this;
    if (!symbol) return <div></div>;
    // select editor by symbol type
    switch (symbol.type) {
      case 'simple-marker':
        return this._simpleMarkerSymbol(symbol);
      case 'simple-line':
        return this._simpleLineSymbol(symbol);
      case 'simple-fill':
        return this._simpleFillSymbol(symbol);
      case 'text':
        return this._textSymbol(symbol);
      default:
        return <div></div>;
    }
  }

  /**
   * Create and wire color picker.
   * @param symbol
   * @param property
   * @param container
   */
  private _colorPicker(symbol: esri.Symbol, property: string, container: HTMLDivElement): void {
    // create color picker
    const colorPicker = new ColorPicker({
      color: symbol.get(property),
      container,
    });
    // set property
    this.addHandles(
      colorPicker.watch('color', (color: Color): void => {
        this._setProperty(property, color);
      }),
    );
  }

  /**
   * Simple marker symbol editor.
   * @param symbol
   */
  private _simpleMarkerSymbol(symbol: esri.SimpleMarkerSymbol): tsx.JSX.Element {
    const {
      style,
      size,
      outline: { width },
    } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'color')}></div>
        </calcite-label>
        <calcite-label>
          Style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'circle'} value="circle">
              Circle
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'square'} value="square">
              Square
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'diamond'} value="diamond">
              Diamond
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label>
          Size
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('size', calciteSlider.value as number);
              });
            }}
            min="6"
            max="18"
            value={size}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </calcite-label>
        <calcite-label>
          Outline color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'outline.color')}></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Outline width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('outline.width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="4"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Simple line symbol editor.
   * @param symbol
   */
  private _simpleLineSymbol(symbol: esri.SimpleLineSymbol): tsx.JSX.Element {
    const { style, width } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'color')}></div>
        </calcite-label>
        <calcite-label>
          Style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'solid'} value="solid">
              Solid
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash'} value="dash">
              Dash
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dot'} value="dot">
              Dot
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash-dot'} value="dash-dot">
              Dash Dot
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="6"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Simple fill symbol editor.
   * @param symbol
   */
  private _simpleFillSymbol(symbol: esri.SimpleFillSymbol): tsx.JSX.Element {
    const {
      outline: { style, width },
      color: { a },
    } = symbol;
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Line color
          <div afterCreate={this._colorPicker.bind(this, symbol, 'outline.color')}></div>
        </calcite-label>
        <calcite-label>
          Line style
          <calcite-select
            afterCreate={(calciteSelect: HTMLCalciteSelectElement) => {
              calciteSelect.addEventListener('calciteSelectChange', () => {
                this._setProperty('outline.style', calciteSelect.selectedOption.value);
              });
            }}
          >
            <calcite-option key={KEY++} selected={style === 'solid'} value="solid">
              Solid
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash'} value="dash">
              Dash
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dot'} value="dot">
              Dot
            </calcite-option>
            <calcite-option key={KEY++} selected={style === 'dash-dot'} value="dash-dot">
              Dash Dot
            </calcite-option>
          </calcite-select>
        </calcite-label>
        <calcite-label>
          Line width
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('outline.width', calciteSlider.value as number);
              });
            }}
            min="1"
            max="6"
            value={width}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </calcite-label>
        <calcite-label>
          Fill color
          <div
            afterCreate={(div: HTMLDivElement) => {
              // custom color picker for fill
              const colorPicker = new ColorPicker({
                color: symbol.color,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('color.r', color.r);
                this._setProperty('color.b', color.b);
                this._setProperty('color.g', color.g);
              });
            }}
          ></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Fill opacity
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('color.a', calciteSlider.value as number);
              });
            }}
            min="0"
            max="1"
            value={a}
            step="0.1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </calcite-label>
      </div>
    );
  }

  /**
   * Text symbol editor.
   * @param symbol
   */
  private _textSymbol(symbol: esri.TextSymbol): tsx.JSX.Element {
    return (
      <div key={KEY++} class={CSS.symbolEditor}>
        <calcite-label>
          Text
          <calcite-input
            type="text"
            value={symbol.text}
            afterCreate={(calciteInput: HTMLCalciteInputElement) => {
              calciteInput.addEventListener('calciteInputInput', () => {
                this._setProperty('text', calciteInput.value);
              });
            }}
          ></calcite-input>
        </calcite-label>
        <calcite-label>
          Size
          <calcite-slider
            afterCreate={(calciteSlider: HTMLCalciteSliderElement) => {
              calciteSlider.addEventListener('calciteSliderInput', () => {
                this._setProperty('font.size', calciteSlider.value as number);
              });
            }}
            min="10"
            max="18"
            value={symbol.font.size}
            step="1"
            snap=""
          ></calcite-slider>
          <div class={CSS.sliderLabels}>
            <span>Small</span>
            <span>Large</span>
          </div>
        </calcite-label>
        <calcite-label>
          Color
          <div
            afterCreate={(div: HTMLDivElement) => {
              const colorPicker = new ColorPicker({
                color: symbol.color,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('color', color);
              });
            }}
          ></div>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Halo color
          <div
            afterCreate={(div: HTMLDivElement) => {
              const colorPicker = new ColorPicker({
                color: symbol.haloColor,
                container: div,
              });
              colorPicker.watch('color', (color: Color): void => {
                this._setProperty('haloColor', color);
              });
            }}
          ></div>
        </calcite-label>
      </div>
    );
  }
}

@subclass('cov.components.panels.Sketch.ColorPicker')
class ColorPicker extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Selected color.
       */
      color?: esri.Color;
      /**
       * Available colors.
       * arcgis `Candy Shop` plus black, white and grey
       */
      colors?: { [key: string]: number[] };
    },
  ) {
    super(properties);
  }

  /**
   * Available colors.
   * arcgis `Candy Shop` plus black, white and grey
   */
  colors: { [key: string]: number[] } = COLORS;

  @property()
  protected color!: esri.Color;

  @property({ aliasOf: 'color.r' })
  protected r!: number;

  @property({ aliasOf: 'color.g' })
  protected g!: number;

  @property({ aliasOf: 'color.b' })
  protected b!: number;

  @property({ aliasOf: 'color.a' })
  protected a!: number;

  render(): tsx.JSX.Element {
    return <div class={CSS.colorPicker}>{this._renderColorTiles()}</div>;
  }

  private _renderColorTiles(): tsx.JSX.Element[] {
    const { colors } = this;
    const tiles: tsx.JSX.Element[] = [];

    for (const color in colors) {
      const [r, g, b] = colors[color];

      const selected = this.color && r === this.r && g === this.g && b === this.b;

      tiles.push(
        <div
          class={this.classes(CSS.colorPickerColor, selected ? CSS.colorPickerColorSelected : '')}
          style={`background-color: rgba(${r}, ${g}, ${b}, 1);`}
          afterCreate={(div: HTMLDivElement): void => {
            div.addEventListener('click', (): void => {
              this.color = new Color({ r, g, b });
            });
          }}
        ></div>,
      );
    }

    return tiles;
  }
}
