declare global {
  interface Window {
    PouchDB: any;
  }
}

import esri = __esri;

interface MarkupSave extends Object {
  _id: string;
  _rev?: string;
  updated: number;
  title: string;
  description: string;
  text: esri.GraphicProperties[];
  point: esri.GraphicProperties[];
  polyline: esri.GraphicProperties[];
  polygon: esri.GraphicProperties[];
}

import { whenOnce } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import { Point } from '@arcgis/core/geometry';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import Color from '@arcgis/core/Color';
import { geodesicBuffer, offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';
import ConfirmationModal from './ConfirmationModal';
import MessageModal from './MessageModal';

const CSS = {
  // markup
  base: 'cov-markup',
  content: 'cov-markup--content',
  flexRow: 'cov-markup--flex-row',
  popover: 'cov-markup--popover',
  // symbol editor
  symbolEditor: 'cov-markup--symbol-editor',
  editorRow: 'cov-markup--symbol-editor--row',
  sliderLabels: 'cov-markup--symbol-editor--slider-labels',
  // color picker
  colorPicker: 'cov-markup--color-picker',
  colorPickerColor: 'cov-markup--color-picker--color',
  colorPickerColorSelected: 'cov-markup--color-picker--color--selected',
};

let KEY = 0;

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

const SAVES_DB_NAME = 'markup_widget_saves';

@subclass('cov.widgets.Markup')
export default class Markup extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Map view.
       */
      view: esri.MapView;
    },
  ) {
    super(properties);
    // load pouchdb
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/pouchdb@${this.pouchdbVersion}/dist/pouchdb.min.js`;
    document.body.append(script);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      sketch,
      pointSymbol,
      point,
      polyline,
      polygon,
      text,
      layers,
      _confirmationModal,
      _messageModal,
    } = this;

    // serviceable view
    await view.when();

    // initialize sketch
    sketch.view = view;

    // enable layer snapping
    view.map.layers.forEach(this._addSnappingLayer.bind(this));

    // enable layer snapping when new layers are added
    const addLayerSnapping = view.map.layers.on('after-add', (event: { item: esri.Layer }): void => {
      this._addSnappingLayer(event.item);
    });

    // enable snapping for markup layers
    [point, polyline, polygon, text].forEach((markupLayer: esri.GraphicsLayer): void => {
      sketch.snappingOptions.featureSources.add(
        new FeatureSnappingLayerSource({
          //@ts-ignore
          layer: markupLayer,
        }),
      );
    });

    // set sketch symbols
    // @ts-ignore
    sketch.activeLineSymbol = new CIMSymbol({
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
    // @ts-ignore
    sketch.activeVertexSymbol = new SimpleMarkerSymbol({
      style: 'circle',
      size: 6,
      color: COLORS.yellow,
      outline: {
        color: COLORS.red,
        width: 1,
      },
    });
    // @ts-ignore
    sketch.vertexSymbol = new SimpleMarkerSymbol({
      style: 'circle',
      size: 6,
      color: COLORS.white,
      outline: {
        color: COLORS.red,
        width: 1,
      },
    });
    sketch.activeFillSymbol = new SimpleFillSymbol({
      color: [...COLORS.yellow, 0.125],
      outline: {
        color: COLORS.red,
        width: 2,
      },
    });

    // add layers
    layers.addMany([polygon, polyline, point, text, sketch.layer]);
    map.add(layers);

    // load projection
    projection.load();

    // add modals
    document.body.append(_confirmationModal.container);
    document.body.append(_messageModal.container);

    // set selected markup and feature
    const setSelected = this.watch(['view.popup.visible', 'view.popup.selectedFeature'], (): void => {
      const {
        popup: { visible, selectedFeature },
      } = view;

      this._selectedFeature = null;

      this._selectedMarkup = null;

      if (!visible || !selectedFeature) return;

      const { layer } = selectedFeature;

      const isMarkup = layer === text || layer === point || layer === polyline || layer === polygon ? true : false;

      this._selectedFeature = visible && !isMarkup ? selectedFeature : null;

      this._selectedMarkup = visible && isMarkup ? selectedFeature : null;
    });

    const watchSelected = this.watch(['_selectedFeature', '_selectedMarkup'], (): void => {
      if (
        !this._selectedFeature &&
        !this._selectedMarkup &&
        (this.viewState === 'buffer' || this.viewState === 'offset')
      )
        this.viewState = 'markup';
    });

    // create event
    const createEvent = sketch.on('create', this._createEvent.bind(this));

    // update event
    const updateEvent = sketch.on('update', this._updateEvent.bind(this));

    // set point symbol between marker and text
    const _pointSymbol = pointSymbol.clone();
    const textSymbol = this.watch('state', (state: string): void => {
      if (state === 'text') {
        this.pointSymbol = this.textSymbol.clone();
      } else {
        this.pointSymbol = _pointSymbol.clone();
      }
    });

    // load projects
    const savesDb = whenOnce(this, '_savesDb', this._initSaves.bind(this));
    this._initSavesDB();

    // own handles
    this.own([addLayerSnapping, setSelected, watchSelected, createEvent, updateEvent, textSymbol, savesDb]);
  }

  view!: esri.MapView;

  @property()
  lengthUnit = 'feet';

  lengthUnits = {
    meters: 'Meters',
    feet: 'Feet',
    kilometers: 'Kilometers',
    miles: 'Miles',
  };

  length = 250;

  offset = 30;

  offsetDirection: 'both' | 'left' | 'right' = 'both';

  offsetProjectionWkid = 102970;

  pouchdbVersion = '7.2.1';

  ////////////////////////////////////////////////////////////////
  // Internal properties
  ///////////////////////////////////////////////////////////////
  /**
   * Sketch VM for draw operations.
   */
  protected sketch = new SketchViewModel({
    layer: new GraphicsLayer({
      id: 'markup_sketch_layer',
      listMode: 'hide',
    }),
    snappingOptions: {
      enabled: true,
      featureEnabled: true,
      selfEnabled: true,
    },
    updateOnGraphicClick: false,
  });

  @property({ aliasOf: 'sketch.pointSymbol' })
  protected pointSymbol: SimpleMarkerSymbol | TextSymbol = new SimpleMarkerSymbol({
    style: 'circle',
    size: 8,
    color: COLORS.yellow,
    outline: {
      width: 1,
      color: COLORS.red,
    },
  });

  @property({ aliasOf: 'sketch.polylineSymbol' })
  protected polylineSymbol = new SimpleLineSymbol({
    color: COLORS.red,
    width: 2,
  });

  @property({ aliasOf: 'sketch.polygonSymbol' })
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

  protected point = new GraphicsLayer({
    id: 'markup_point_layer',
    title: 'markup_point_layer',
    listMode: 'hide',
  });

  protected polyline = new GraphicsLayer({
    id: 'markup_polyline_layer',
    title: 'markup_polyline_layer',
    listMode: 'hide',
  });

  protected polygon = new GraphicsLayer({
    id: 'markup_polygon_layer',
    title: 'markup_polygon_layer',
    listMode: 'hide',
  });

  protected text = new GraphicsLayer({
    id: 'markup_text_layer',
    title: 'markup_text_layer',
    listMode: 'hide',
  });

  protected layers = new GroupLayer({
    id: 'markup_layers',
    title: 'Markup',
    listMode: 'hide',
  });

  @property()
  protected state: 'ready' | 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text' = 'ready';

  @property()
  protected viewState: 'markup' | 'buffer' | 'offset' | 'save' = 'markup';

  @property()
  protected saveViewState: 'default' | 'new' = 'default';

  @property()
  private _selectedFeature: esri.Graphic | null = null;

  @property()
  private _selectedMarkup: esri.Graphic | null = null;

  private _savesLoadCount = 0;

  @property()
  private _savesDb!: any;

  @property()
  private _saves: Collection<MarkupSave> = new Collection();

  @property()
  private _save!: MarkupSave | null;

  private _confirmationModal = new ConfirmationModal({
    container: document.createElement('calcite-modal'),
  });

  private _messageModal = new MessageModal({
    container: document.createElement('calcite-modal'),
  });

  /**
   * Convenience method for widget control widgets.
   */
  onHide(): void {
    this._reset();
  }

  /**
   * Add layer as snapping source.
   * @param layer
   */
  private _addSnappingLayer(layer: esri.Layer): void {
    const {
      sketch: { snappingOptions },
    } = this;

    if (layer.type === 'group') {
      (layer as GroupLayer).layers.forEach((_layer: esri.Layer): void => {
        this._addSnappingLayer(_layer);
      });
      return;
    }

    if (layer.listMode === 'hide' || layer.title === undefined || layer.title === null) return;
    // @ts-ignore
    if (layer.internal === true) return;

    snappingOptions.featureSources.add(
      new FeatureSnappingLayerSource({
        //@ts-ignore
        layer: layer,
      }),
    );
  }

  private _markupEvent(
    type: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text',
    action: HTMLCalciteActionElement,
  ): void {
    action.addEventListener('click', this._markup.bind(this, type));
  }

  private _reset(): void {
    const {
      view: { popup },
      sketch,
    } = this;
    // clear popup
    popup.close();
    popup.clear();
    // cancel sketch
    sketch.cancel();
    // set state
    this.state = 'ready';
    this.viewState = 'markup';
  }

  private _markup(type: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'text'): void {
    const { sketch } = this;
    // reset to clear
    this._reset();
    // set state
    this.state = type;
    // start create
    sketch.create(type === 'text' ? 'point' : type);
  }

  private _createEvent(event: esri.SketchViewModelCreateEvent): void {
    const { state: sketchState, graphic } = event;
    // reset on cancel
    if (sketchState === 'cancel') {
      this._reset();
      return;
    }
    // handle completed create
    if (sketchState === 'complete') {
      this._addMarkup(graphic.geometry);
    }
  }

  private _addMarkup(geometry: esri.Geometry): void {
    const {
      state,
      sketch: { layer },
      textSymbol,
      text,
    } = this;

    const type = geometry.type as 'point' | 'polyline' | 'polygon';

    // create graphic
    const _graphic = new Graphic({
      geometry,
      symbol: state === 'text' ? textSymbol.clone() : this[`${type as 'point' | 'polyline' | 'polygon'}Symbol`].clone(),
      popupTemplate: new PopupTemplate({
        title: `Markup ${(state === 'text') === true ? 'text' : type}`,
        returnGeometry: true,
        content: [
          new CustomContent({
            creator: (): Widget => {
              const symbolEditor = new SymbolEditor({
                graphic: _graphic,
              });
              this.own(symbolEditor.on('set-symbol-property', this._updateSave.bind(this)));
              return symbolEditor;
            },
          }),
        ],
      }),
    });
    // add to layer based on type
    (state === 'text') === true ? text.add(_graphic) : this[type].add(_graphic);
    // remove sketch graphic
    layer.removeAll();
    // set state
    this.state = 'ready';

    this._updateSave();
  }

  private _edit(): void {
    const {
      view: { popup },
      sketch,
      sketch: { layer },
      _selectedMarkup: graphic,
    } = this;
    // ensure graphic
    if (!graphic) return;
    // clear popup and delete graphic
    popup.close();
    popup.clear();

    (graphic.layer as esri.GraphicsLayer).remove(graphic);

    layer.add(graphic);

    sketch.update(graphic);
  }

  private _updateEvent(event: esri.SketchViewModelUpdateEvent): void {
    // console.log(event);
    const {
      sketch: { layer },
      text,
    } = this;
    const { state, graphics } = event;

    if (state !== 'complete') return;
    const graphic = graphics[0];
    const geometryType = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
    const symbolType = graphic.symbol.type;

    layer.removeAll();

    symbolType === 'text' ? text.add(graphic) : this[geometryType].add(graphic);

    this._updateSave();
  }

  private _delete(): void {
    const {
      view: { popup },
      _selectedMarkup: graphic,
    } = this;
    // ensure graphic
    if (!graphic) return;
    // clear popup and delete graphic
    popup.close();
    popup.clear();
    (graphic.layer as GraphicsLayer).remove(graphic);
  }

  private _move(move: 'up' | 'down'): void {
    const { _selectedMarkup: graphic } = this;
    // ensure graphic
    if (!graphic) return;
    // get graphics and index
    const graphics = graphic.get('layer.graphics') as esri.Collection<esri.Graphic>;
    const idx = graphics.indexOf(graphic);
    // move up or down
    if (move === 'up') {
      if (idx < graphics.length - 1) {
        graphics.reorder(graphic, idx + 1);
      }
    } else {
      if (idx > 0) {
        graphics.reorder(graphic, idx - 1);
      }
    }

    this._updateSave();
  }

  private async _addFeature(): Promise<void> {
    const { _selectedFeature: graphic } = this;

    if (!graphic) return;

    const { layer } = graphic;

    let geometry = graphic.geometry;

    if (!geometry && layer.type === 'feature')
      geometry = await this._queryFeatureGeometry(layer as esri.FeatureLayer, graphic);

    if (!geometry) return;

    this._addMarkup(geometry);
  }

  private async _addVertices(): Promise<void> {
    const {
      view: { spatialReference },
      _selectedMarkup,
      _selectedFeature,
    } = this;

    const graphic = _selectedMarkup || _selectedFeature;

    if (!graphic) return;

    const { layer } = graphic;

    let geometry = graphic.geometry;

    if (!geometry && layer.type === 'feature')
      geometry = await this._queryFeatureGeometry(layer as esri.FeatureLayer, graphic);

    if (!geometry) return;

    const {
      type,
      spatialReference: { wkid },
    } = geometry;

    if ((type !== 'polyline' && type !== 'polygon') || spatialReference.wkid !== wkid) return;

    if (geometry.type === 'polyline') {
      (geometry as esri.Polyline).paths.forEach((path: number[][]): void => {
        path.forEach((vertex: number[]): void => {
          this._addMarkup(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
        });
      });
    }

    if (geometry.type === 'polygon') {
      (geometry as esri.Polygon).rings.forEach((ring: number[][]): void => {
        ring.forEach((vertex: number[], index: number): void => {
          if (index + 1 < ring.length) {
            this._addMarkup(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
          }
        });
      });
    }
  }

  private async _buffer(): Promise<void> {
    const {
      view: { spatialReference },
      lengthUnit,
      length,
      _selectedMarkup,
      _selectedFeature,
    } = this;

    const graphic = _selectedMarkup || _selectedFeature;

    if (!graphic) return;

    const { layer } = graphic;

    let geometry = graphic.geometry;

    if (!geometry && layer.type === 'feature')
      geometry = await this._queryFeatureGeometry(layer as esri.FeatureLayer, graphic);

    if (!geometry) return;

    const {
      spatialReference: { wkid },
    } = geometry;

    if (spatialReference.wkid !== wkid) return;

    this._addMarkup(geodesicBuffer(geometry, length, lengthUnit as esri.LinearUnits) as esri.Geometry);

    this.viewState = 'markup';
  }

  private async _offset(): Promise<void> {
    const {
      view: { spatialReference },
      lengthUnit,
      offset: _offset,
      offsetDirection,
      offsetProjectionWkid,
      _selectedMarkup,
      _selectedFeature,
    } = this;

    const graphic = _selectedMarkup || _selectedFeature;

    if (!graphic) return;

    const { layer } = graphic;

    let geometry = graphic.geometry;

    if (!geometry && layer.type === 'feature')
      geometry = await this._queryFeatureGeometry(layer as esri.FeatureLayer, graphic);

    if (!geometry) return;

    const {
      type,
      spatialReference: { wkid },
    } = geometry;

    if (type !== 'polyline' || spatialReference.wkid !== wkid) return;

    geometry = projection.project(geometry, { wkid: offsetProjectionWkid }) as esri.Geometry;

    if (offsetDirection === 'both' || offsetDirection === 'left') {
      this._addMarkup(
        projection.project(
          offset(geometry, _offset, lengthUnit as esri.LinearUnits),
          spatialReference,
        ) as esri.Geometry,
      );
    }

    if (offsetDirection === 'both' || offsetDirection === 'right') {
      this._addMarkup(
        projection.project(
          offset(geometry, _offset * -1, lengthUnit as esri.LinearUnits),
          spatialReference,
        ) as esri.Geometry,
      );
    }

    this.viewState = 'markup';
  }

  private _queryFeatureGeometry(layer: esri.FeatureLayer, graphic: Graphic): Promise<esri.Geometry> {
    const {
      view: { spatialReference },
    } = this;
    const { objectIdField } = layer;

    return new Promise((resolve, reject) => {
      layer
        .queryFeatures({
          where: `${objectIdField} = ${graphic.attributes[objectIdField]}`,
          returnGeometry: true,
          outSpatialReference: spatialReference,
        })
        .then((results: esri.FeatureSet): void => {
          resolve(results.features[0].geometry);
        });
    });
  }

  private _initSavesDB(): void {
    const { _savesDb, _savesLoadCount } = this;
    if (_savesDb || _savesLoadCount > 10) return;
    if (window.PouchDB) {
      this._savesDb = new window.PouchDB(SAVES_DB_NAME);
    } else {
      this._savesLoadCount++;
      setTimeout(this._initSavesDB.bind(this), 100);
    }
  }

  private _initSaves(): void {
    const { _savesDb, _saves } = this;

    _savesDb
      .allDocs({
        include_docs: true,
      })
      .then((result: any) => {
        const saves = result.rows.map((row: any): MarkupSave => {
          return row.doc;
        });

        _saves.addMany(saves);

        _saves.sort((a: MarkupSave, b: MarkupSave): number => {
          return a.updated > b.updated ? -1 : 1;
        });

        // console.log(this._saves);
      });
  }

  private _createSave(event: Event): void {
    event.preventDefault();

    const { _savesDb, _saves, _messageModal } = this;

    if (this._getGraphicCount() === 0) {
      _messageModal.show({
        title: 'Markup',
        message: 'No markup graphics to save.',
      });
      return;
    }

    const form = event.target as HTMLFormElement;

    const titleInput = form.querySelector('[name="TITLE"]') as HTMLCalciteInputElement;
    const descriptionInput = form.querySelector('[name="DESCRIPTION"]') as HTMLCalciteInputElement;

    if (!titleInput.value) {
      titleInput.setFocus();
      return;
    }

    const time = new Date().getTime();

    const save: MarkupSave = {
      _id: time.toString(),
      updated: time,
      title: titleInput.value,
      description: descriptionInput.value || '',
      ...this._getGraphics(),
    };

    _savesDb.put(save).then((result: any): void => {
      if (!result.ok) return;

      _savesDb.get(result.id).then((doc: any): void => {
        // console.log(doc);

        save._rev = doc._rev;

        this._save = save;

        _saves.add(save);

        this.viewState = 'markup';

        this.saveViewState = 'default';
      });
    });
  }

  private _confirmLoadSave(save: MarkupSave): void {
    const { _save, _confirmationModal } = this;

    if (!_save && this._getGraphicCount() > 0) {
      _confirmationModal.show({
        title: 'Load markup?',
        message: 'Existing markup will be deleted. Load markup anyway?',
        confirm: this._loadSave.bind(this, save),
      });
    } else {
      this._loadSave(save);
    }
  }

  private _loadSave(save: MarkupSave): void {
    const {
      view,
      view: { popup },
    } = this;

    popup.clear();
    popup.close();

    this._save = save;

    this.viewState = 'markup';

    const graphics: Graphic[] = [];

    // @ts-ignore
    // array of strings doesn't self type itself?!?!
    ['polygon', 'polyline', 'point', 'text'].forEach((type: 'polygon' | 'polyline' | 'point' | 'text'): void => {
      const layer = this[type];

      layer.removeAll();

      save[type].forEach((properties: esri.GraphicProperties): void => {
        const graphic = Graphic.fromJSON(properties);

        graphic.popupTemplate = new PopupTemplate({
          title: `Markup ${type}`,
          returnGeometry: true,
          content: [
            new CustomContent({
              creator: (): Widget => {
                const symbolEditor = new SymbolEditor({
                  graphic,
                });
                this.own(symbolEditor.on('set-symbol-property', this._updateSave.bind(this)));
                return symbolEditor;
              },
            }),
          ],
        });
        graphics.push(graphic);
        layer.add(graphic);
      });
    });

    view.goTo(graphics);
  }

  private _updateSave(): void {
    const { _savesDb, _saves, _save } = this;

    if (!_save) return;

    const index = _saves.findIndex((save: MarkupSave): boolean => {
      return _save._id === save._id;
    });

    const save: MarkupSave = {
      ..._save,
      updated: new Date().getTime(),
      ...this._getGraphics(),
    };

    _savesDb.put(save).then((result: any) => {
      if (!result.ok) return;

      _savesDb.get(result.id).then((doc: any) => {
        this._save = doc as MarkupSave;

        _saves.splice(index, 1, doc as MarkupSave);
      });
    });
  }

  private _confirmDeleteSave(save: MarkupSave): void {
    const { _confirmationModal } = this;

    _confirmationModal.show({
      title: 'Delete markup?',
      message: 'Deleted saved markup?',
      confirm: this._deleteSave.bind(this, save),
    });
  }

  private _deleteSave(save: MarkupSave): void {
    const { _savesDb, _saves } = this;
    _savesDb.remove(save as any).then((result: any) => {
      if (!result.ok) return;
      _saves.remove(save);
    });
  }

  private _closeSave(): void {
    this._save = null;

    // @ts-ignore
    // array of strings doesn't self type itself?!?!
    ['polygon', 'polyline', 'point', 'text'].forEach((type: 'polygon' | 'polyline' | 'point' | 'text'): void => {
      this[type].removeAll();
    });
  }

  /**
   * Get all markup graphics by type.
   * @returns
   */
  private _getGraphics(): any {
    const { text, point, polyline, polygon } = this;
    return {
      text: text.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      point: point.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      polyline: polyline.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      polygon: polygon.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
    };
  }

  private _getGraphicCount(): number {
    const { text, point, polyline, polygon } = this;
    return text.graphics.length + point.graphics.length + polyline.graphics.length + polygon.graphics.length;
  }

  render(): tsx.JSX.Element {
    const { id, state, viewState, saveViewState, _selectedMarkup, _selectedFeature, _saves } = this;

    // const isPoint =
    //   _selectedMarkup?.geometry?.type === 'point' ||
    //   (_selectedFeature?.layer &&
    //     _selectedFeature.layer.type === 'feature' &&
    //     (_selectedFeature.layer as esri.FeatureLayer).geometryType === 'point');

    const isPolyline =
      _selectedMarkup?.geometry?.type === 'polyline' ||
      (_selectedFeature?.layer &&
        _selectedFeature.layer.type === 'feature' &&
        (_selectedFeature.layer as esri.FeatureLayer).geometryType === 'polyline');

    const isPolygon =
      _selectedMarkup?.geometry?.type === 'polygon' ||
      (_selectedFeature?.layer &&
        _selectedFeature.layer.type === 'feature' &&
        (_selectedFeature.layer as esri.FeatureLayer).geometryType === 'polygon');

    // const isText = _selectedMarkup?.symbol?.type === 'text';

    const tooltips = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((num: number): string => {
      return `tooltip_${id}_${num}_${KEY++}`;
    });

    return (
      <calcite-panel class={CSS.base} heading="Markup">
        {/* header actions */}
        <calcite-tooltip-manager slot="header-actions-end">
          <calcite-action
            id={tooltips[15]}
            active={viewState === 'save'}
            icon="save"
            onclick={(): void => {
              if (viewState === 'save') return;
              this.viewState = 'save';
            }}
          ></calcite-action>
          <calcite-tooltip reference-element={tooltips[15]} overlay-positioning="fixed" placement="bottom">
            Save
          </calcite-tooltip>
        </calcite-tooltip-manager>
        {/* markup view */}
        <div class={CSS.content} hidden={viewState !== 'markup'}>
          {/* create actions */}
          <div class={CSS.flexRow}>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[1]}
                scale="s"
                appearance="clear"
                active={state === 'point'}
                icon="point"
                afterCreate={this._markupEvent.bind(this, 'point')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[1]} overlay-positioning="fixed" placement="bottom">
                Draw point
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[2]}
                scale="s"
                appearance="clear"
                active={state === 'polyline'}
                icon="line"
                afterCreate={this._markupEvent.bind(this, 'polyline')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[2]} overlay-positioning="fixed" placement="bottom">
                Draw polyline
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[3]}
                scale="s"
                appearance="clear"
                active={state === 'polygon'}
                icon="polygon-vertices"
                afterCreate={this._markupEvent.bind(this, 'polygon')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[3]} overlay-positioning="fixed" placement="bottom">
                Draw polygon
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[4]}
                scale="s"
                appearance="clear"
                active={state === 'rectangle'}
                icon="rectangle"
                afterCreate={this._markupEvent.bind(this, 'rectangle')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[4]} overlay-positioning="fixed" placement="bottom">
                Draw rectangle
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[5]}
                scale="s"
                appearance="clear"
                active={state === 'circle'}
                icon="circle"
                afterCreate={this._markupEvent.bind(this, 'circle')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[5]} overlay-positioning="fixed" placement="bottom">
                Draw circle
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[6]}
                scale="s"
                appearance="clear"
                active={state === 'text'}
                icon="text-large"
                afterCreate={this._markupEvent.bind(this, 'text')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[6]} overlay-positioning="fixed" placement="bottom">
                Add text
              </calcite-tooltip>
            </calcite-tooltip-manager>
          </div>
          {/* edit actions */}
          <div class={CSS.flexRow}>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[7]}
                scale="s"
                appearance="clear"
                disabled={!_selectedMarkup}
                icon="pencil"
                onclick={this._edit.bind(this)}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[7]} overlay-positioning="fixed" placement="bottom">
                Edit geometry
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[8]}
                scale="s"
                appearance="clear"
                disabled={!_selectedMarkup}
                icon="trash"
                onclick={this._delete.bind(this)}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[8]} overlay-positioning="fixed" placement="bottom">
                Delete markup
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[9]}
                scale="s"
                appearance="clear"
                disabled={!_selectedMarkup}
                icon="chevron-up"
                onclick={this._move.bind(this, 'up')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[9]} overlay-positioning="fixed" placement="bottom">
                Move up
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[10]}
                scale="s"
                appearance="clear"
                disabled={!_selectedMarkup}
                icon="chevron-down"
                onclick={this._move.bind(this, 'down')}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[10]} overlay-positioning="fixed" placement="bottom">
                Move down
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-popover-manager auto-close="">
              <calcite-popover reference-element={`settings-popover-${id}`} overlay-positioning="fixed">
                <div class={CSS.popover}>
                  <calcite-label alignment="start" layout="inline">
                    <calcite-switch
                      afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                        const {
                          sketch: { snappingOptions },
                        } = this;
                        _switch.checked = snappingOptions.featureEnabled;
                        _switch.addEventListener('calciteSwitchChange', (): void => {
                          snappingOptions.featureEnabled = _switch.checked;
                        });
                      }}
                    ></calcite-switch>
                    Feature snapping
                  </calcite-label>
                  <calcite-label alignment="start" layout="inline">
                    <calcite-switch
                      afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                        const {
                          sketch: { snappingOptions },
                        } = this;
                        _switch.checked = snappingOptions.selfEnabled;
                        _switch.addEventListener('calciteSwitchChange', (): void => {
                          snappingOptions.selfEnabled = _switch.checked;
                        });
                      }}
                    ></calcite-switch>
                    Sketch guides
                  </calcite-label>
                </div>
              </calcite-popover>
              <calcite-action id={`settings-popover-${id}`} scale="s" appearance="clear" icon="gear"></calcite-action>
            </calcite-popover-manager>
          </div>

          {/* tool actions */}
          <div class={CSS.flexRow}>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[11]}
                scale="s"
                appearance="clear"
                disabled={!_selectedFeature}
                icon="add-layer"
                onclick={this._addFeature.bind(this)}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[11]} overlay-positioning="fixed" placement="bottom">
                Add feature
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[12]}
                scale="s"
                appearance="clear"
                disabled={!(isPolyline || isPolygon)}
                icon="vertex-plus"
                onclick={this._addVertices.bind(this)}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[12]} overlay-positioning="fixed" placement="bottom">
                Add vertices points
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                id={tooltips[13]}
                scale="s"
                appearance="clear"
                disabled={!_selectedMarkup && !_selectedFeature}
                icon="rings"
                onclick={(): void => {
                  this.viewState = 'buffer';
                }}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[13]} overlay-positioning="fixed" placement="bottom">
                Buffer
              </calcite-tooltip>
            </calcite-tooltip-manager>
            <calcite-tooltip-manager>
              <calcite-action
                style="transform: rotate(90deg);"
                id={tooltips[16]}
                scale="s"
                appearance="clear"
                disabled={!isPolyline}
                icon="hamburger"
                onclick={(): void => {
                  this.viewState = 'offset';
                }}
              ></calcite-action>
              <calcite-tooltip reference-element={tooltips[16]} overlay-positioning="fixed" placement="bottom">
                Offset
              </calcite-tooltip>
            </calcite-tooltip-manager>
          </div>
        </div>
        {/* buffer view */}
        <div class={CSS.content} hidden={viewState !== 'buffer'}>
          <calcite-label>
            Distance
            <calcite-input
              type="number"
              afterCreate={(input: HTMLCalciteInputElement): void => {
                input.value = `${this.length}`;
                input.addEventListener('calciteInputInput', (): void => {
                  this.length = parseFloat(input.value);
                });
              }}
            ></calcite-input>
          </calcite-label>
          <calcite-label>
            Unit
            <calcite-select
              afterCreate={(select: HTMLCalciteSelectElement): void => {
                select.addEventListener('calciteSelectChange', () => {
                  this.lengthUnit = select.selectedOption.value;
                });
              }}
            >
              {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
            </calcite-select>
          </calcite-label>
          <div>
            <calcite-button width="half" onclick={this._buffer.bind(this)}>
              Buffer
            </calcite-button>
            <calcite-button
              width="half"
              appearance="outline"
              onclick={(): void => {
                this.viewState = 'markup';
              }}
            >
              Cancel
            </calcite-button>
          </div>
        </div>
        {/* offset view */}
        <div class={CSS.content} hidden={viewState !== 'offset'}>
          <calcite-label>
            Distance
            <calcite-input
              type="number"
              afterCreate={(input: HTMLCalciteInputElement): void => {
                input.value = `${this.offset}`;
                input.addEventListener('calciteInputInput', (): void => {
                  this.offset = parseFloat(input.value);
                });
              }}
            ></calcite-input>
          </calcite-label>
          <calcite-label>
            Unit
            <calcite-select
              afterCreate={(select: HTMLCalciteSelectElement): void => {
                select.addEventListener('calciteSelectChange', () => {
                  this.lengthUnit = select.selectedOption.value;
                });
              }}
            >
              {this._renderUnitOptions(this.lengthUnits, this.lengthUnit)}
            </calcite-select>
          </calcite-label>
          <calcite-label>
            Direction
            <calcite-radio-button-group name="">
              <calcite-label
                layout="inline"
                onclick={(): void => {
                  this.offsetDirection = 'both';
                }}
              >
                <calcite-radio-button checked=""></calcite-radio-button>Both
              </calcite-label>
              <calcite-label
                layout="inline"
                onclick={(): void => {
                  this.offsetDirection = 'left';
                }}
              >
                <calcite-radio-button></calcite-radio-button>Left
              </calcite-label>
              <calcite-label
                layout="inline"
                onclick={(): void => {
                  this.offsetDirection = 'right';
                }}
              >
                <calcite-radio-button></calcite-radio-button>Right
              </calcite-label>
            </calcite-radio-button-group>
          </calcite-label>
          <div>
            <calcite-button width="half" onclick={this._offset.bind(this)}>
              Offset
            </calcite-button>
            <calcite-button
              width="half"
              appearance="outline"
              onclick={(): void => {
                this.viewState = 'markup';
              }}
            >
              Cancel
            </calcite-button>
          </div>
        </div>
        {/* save view */}
        <div class={CSS.content} hidden={viewState !== 'save'}>
          <div hidden={saveViewState !== 'default'}>
            <calcite-button
              width="half"
              onclick={(): void => {
                this.saveViewState = 'new';
              }}
            >
              New
            </calcite-button>
            <calcite-button
              width="half"
              appearance="outline"
              onclick={(): void => {
                this.viewState = 'markup';
              }}
            >
              Done
            </calcite-button>
          </div>
          <calcite-list hidden={_saves.length === 0 || saveViewState === 'new'}>{this._renderSaves()}</calcite-list>
          <form
            hidden={saveViewState !== 'new'}
            afterCreate={(form: HTMLFormElement): void => {
              form.addEventListener('submit', this._createSave.bind(this));
            }}
          >
            <calcite-label>
              Title
              <calcite-input type="text" name="TITLE" required="" value="My markup"></calcite-input>
            </calcite-label>
            <calcite-label>
              Description
              <calcite-input type="text" name="DESCRIPTION"></calcite-input>
            </calcite-label>
            <calcite-button width="half" type="submit">
              Save
            </calcite-button>
            <calcite-button
              width="half"
              appearance="outline"
              type="button"
              onclick={(): void => {
                this.saveViewState = 'default';
              }}
            >
              Cancel
            </calcite-button>
          </form>
        </div>
      </calcite-panel>
    );
  }

  ////////////////////////////////////////////////////////////////
  // Rendering methods
  ///////////////////////////////////////////////////////////////
  /**
   * Render unit select options.
   * @param units
   * @param defaultUnit
   * @returns
   */
  private _renderUnitOptions(units: { [key: string]: string }, defaultUnit: string): tsx.JSX.Element[] {
    const options: tsx.JSX.Element[] = [];
    for (const unit in units) {
      options.push(
        <calcite-option key={KEY++} label={units[unit]} value={unit} selected={unit === defaultUnit}></calcite-option>,
      );
    }
    return options;
  }

  private _renderSaves(): tsx.JSX.Element[] {
    const { _saves, _save } = this;
    const items: tsx.JSX.Element[] = [];
    _saves.forEach((save: MarkupSave): void => {
      (_save && _save._id !== save._id) || !_save
        ? items.push(
            <calcite-list-item key={KEY++} label={save.title} description={save.description} non-interactive="">
              <calcite-action
                slot="actions-end"
                scale="s"
                icon="folder-open"
                afterCreate={(action: HTMLCalciteActionElement): void => {
                  action.addEventListener('click', this._confirmLoadSave.bind(this, save));
                }}
              ></calcite-action>
              <calcite-action
                slot="actions-end"
                scale="s"
                icon="trash"
                afterCreate={(action: HTMLCalciteActionElement): void => {
                  action.addEventListener('click', this._confirmDeleteSave.bind(this, save));
                }}
              ></calcite-action>
            </calcite-list-item>,
          )
        : items.push(
            <calcite-list-item key={KEY++} label={save.title} description={save.description} non-interactive="">
              <calcite-action
                slot="actions-end"
                scale="s"
                icon="x"
                onclick={this._closeSave.bind(this)}
              ></calcite-action>
            </calcite-list-item>,
          );
    });
    return items;
  }
}

/**
 * Edit simple symbols editor widget.
 */
@subclass('SymbolEditor')
class SymbolEditor extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      /**
       * Graphic of interest.
       */
      graphic: Graphic;
    },
  ) {
    super(properties);
  }

  /**
   * Graphic of interest.
   */
  graphic!: Graphic;

  /**
   * Graphic's symbol.
   */
  @property({ aliasOf: 'graphic.symbol' })
  protected symbol!: SimpleMarkerSymbol | SimpleLineSymbol | SimpleFillSymbol | TextSymbol;

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
    this.own(
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
      <div class={CSS.symbolEditor}>
        {/* row one */}
        <div class={CSS.editorRow}>
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
              <calcite-option selected={style === 'circle'} value="circle">
                Circle
              </calcite-option>
              <calcite-option selected={style === 'square'} value="square">
                Square
              </calcite-option>
              <calcite-option selected={style === 'diamond'} value="diamond">
                Diamond
              </calcite-option>
            </calcite-select>
          </calcite-label>
        </div>
        {/* row two */}
        <div class={CSS.editorRow}>
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
        </div>
        {/* row three */}
        <div class={CSS.editorRow}>
          <calcite-label>
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
          <calcite-label></calcite-label>
        </div>
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
      <div class={CSS.symbolEditor}>
        <div class={CSS.editorRow}>
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
              <calcite-option selected={style === 'solid'} value="solid">
                Solid
              </calcite-option>
              <calcite-option selected={style === 'dash'} value="dash">
                Dash
              </calcite-option>
              <calcite-option selected={style === 'dot'} value="dot">
                Dot
              </calcite-option>
              <calcite-option selected={style === 'dash-dot'} value="dash-dot">
                Dash Dot
              </calcite-option>
            </calcite-select>
          </calcite-label>
        </div>
        <div class={CSS.editorRow}>
          <calcite-label>
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
          <calcite-label></calcite-label>
        </div>
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
      <div class={CSS.symbolEditor}>
        <div class={CSS.editorRow}>
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
              <calcite-option selected={style === 'solid'} value="solid">
                Solid
              </calcite-option>
              <calcite-option selected={style === 'dash'} value="dash">
                Dash
              </calcite-option>
              <calcite-option selected={style === 'dot'} value="dot">
                Dot
              </calcite-option>
              <calcite-option selected={style === 'dash-dot'} value="dash-dot">
                Dash Dot
              </calcite-option>
            </calcite-select>
          </calcite-label>
        </div>
        <div class={CSS.editorRow}>
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
        </div>
        <div class={CSS.editorRow}>
          <calcite-label>
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
          <calcite-label></calcite-label>
        </div>
      </div>
    );
  }

  /**
   * Text symbol editor.
   * @param symbol
   */
  private _textSymbol(symbol: esri.TextSymbol): tsx.JSX.Element {
    return (
      <div class={CSS.symbolEditor}>
        <div class={CSS.editorRow}>
          <calcite-label>
            Text
            <calcite-input
              type="text"
              value={symbol.text}
              afterCreate={(calciteInput: HTMLCalciteInputElement) => {
                calciteInput.addEventListener('calciteInputInput', () => {
                  this._setProperty('text', calciteInput.value || 'New Text');
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
        </div>
        <div class={CSS.editorRow}>
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
          <calcite-label>
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
      </div>
    );
  }
}

@subclass('ColorPicker')
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
  protected colors: { [key: string]: number[] } = {
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
