import esri = __esri;

import { watch, whenOnce } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SnappingOptions from '@arcgis/core/views/interactive/snapping/SnappingOptions';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { CIMSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';

import { APPLICATION_SKETCH_LAYER } from '../../support/layerUtils';

// arcgis `Candy Shop` plus black, white and grey
export const COLORS: { [key: string]: number[] } = {
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

const ACTIVE_LINE_SYMBOL = new CIMSymbol({
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
              offsetAlongLine: 0,
            },
          ],
          enable: true,
          capStyle: 'Butt',
          joinStyle: 'Round',
          width: 2.25,
          color: [...COLORS.white, 255],
        },
        {
          type: 'CIMSolidStroke',
          enable: true,
          capStyle: 'Butt',
          joinStyle: 'Round',
          width: 2.25,
          color: [...COLORS.red, 255],
        },
      ],
    },
  },
});

const ACTIVE_VERTEX_SYMBOL = new SimpleMarkerSymbol({
  style: 'circle',
  size: 6,
  color: COLORS.yellow,
  outline: {
    width: 1,
    color: COLORS.red,
  },
});

const HANDLE_KEY = 'sketch-custom-handles';

export const POINT_SYMBOL = new SimpleMarkerSymbol({
  style: 'circle',
  size: 8,
  color: COLORS.yellow,
  outline: {
    width: 1,
    color: COLORS.red,
  },
});

const POLYGON_SYMBOL = new SimpleFillSymbol({
  color: [...COLORS.yellow, 0.125],
  outline: {
    color: COLORS.red,
    width: 2,
  },
});

const POLYLINE_SYMBOL = new SimpleLineSymbol({
  color: COLORS.red,
  width: 2,
});

const VERTEX_SYMBOL = new SimpleMarkerSymbol({
  style: 'circle',
  size: 6,
  color: COLORS.white,
  outline: {
    width: 1,
    color: COLORS.red,
  },
});

const SNAPPING_OPTIONS = new SnappingOptions({
  enabled: true,
  featureEnabled: true,
  selfEnabled: true,
});

export const TEXT_SYMBOL = new TextSymbol({
  color: COLORS.red,
  haloColor: COLORS.white,
  haloSize: 2,
  horizontalAlignment: 'center',
  text: 'New Text',
  verticalAlignment: 'middle',
  font: {
    size: 12,
  },
});

/**
 * Extended sketch view model for sketch.
 */
@subclass('cov.components.Sketch.Sketch')
export default class Sketch extends SketchViewModel {
  constructor(properties?: esri.SketchViewModelProperties) {
    super(properties);

    // set symbols
    this.activeFillSymbol = POLYGON_SYMBOL;

    // @ts-expect-error not typed
    this.activeLineSymbol = ACTIVE_LINE_SYMBOL;

    // @ts-expect-error not typed
    this.activeVertexSymbol = ACTIVE_VERTEX_SYMBOL;

    this.pointSymbol = POINT_SYMBOL;

    this.polygonSymbol = POLYGON_SYMBOL;

    this.polylineSymbol = POLYLINE_SYMBOL;

    this.snappingOptions = SNAPPING_OPTIONS;

    // @ts-expect-error not typed
    this.vertexSymbol = VERTEX_SYMBOL;

    const sketchLayers = [this.polygon, this.polyline, this.point, this.text];

    // layers
    this.layers.addMany([...sketchLayers, this.layer]);

    whenOnce((): esri.MapView | esri.SceneView | nullish => this.view).then(
      async (view: esri.MapView | esri.SceneView): Promise<void> => {
        await view.when();

        if (APPLICATION_SKETCH_LAYER) {
          APPLICATION_SKETCH_LAYER.add(this.layers);
        } else {
          view.map.add(this.layers);
        }

        const _layers = view.map.layers;

        sketchLayers.forEach(this._addSnappingLayer.bind(this));

        _layers.forEach(this._addSnappingLayer.bind(this));

        this.addHandles(
          _layers.on('after-add', (event: { item: esri.Layer }): void => {
            this._addSnappingLayer(event.item);
          }),
          HANDLE_KEY,
        );

        this.pointView = await view.whenLayerView(this.point);

        this.polygonView = await view.whenLayerView(this.polygon);

        this.polylineView = await view.whenLayerView(this.polyline);

        this.textView = await view.whenLayerView(this.text);
      },
    );

    this.addHandles(
      sketchLayers.map((layer: esri.GraphicsLayer): IHandle => {
        return watch(
          (): number => layer.graphics.length,
          (): void => {
            this.graphicsCount =
              this.polygon.graphics.length +
              this.polyline.graphics.length +
              this.point.graphics.length +
              this.text.graphics.length;
          },
        );
      }),
      HANDLE_KEY,
    );
  }

  @property()
  protected graphicsCount = 0;

  override layer = new GraphicsLayer();

  public layers = new GroupLayer({ listMode: 'hide' });

  public point = new GraphicsLayer({ title: 'point' });

  public pointView!: esri.GraphicsLayerView;

  public polygon = new GraphicsLayer({ title: 'polygon' });

  public polygonView!: esri.GraphicsLayerView;

  public polyline = new GraphicsLayer({ title: 'polyline' });

  public polylineView!: esri.GraphicsLayerView;

  public text = new GraphicsLayer({ title: 'text' });

  public textView!: esri.GraphicsLayerView;

  public textSymbol = TEXT_SYMBOL;

  override updateOnGraphicClick = false;

  public addGeometry(geometry: esri.Geometry): esri.Graphic | nullish {
    const { type } = geometry;

    if (type !== 'point' && type !== 'polygon' && type !== 'polyline') return;

    const graphic = new Graphic({ geometry, symbol: this[`${type}Symbol`] });

    this[type].add(graphic);

    return graphic;
  }

  public addJSON(featureJSON: object): esri.Graphic | nullish {
    const graphic = Graphic.fromJSON(featureJSON);

    const { geometry, symbol } = graphic;

    if (!symbol) return this.addGeometry(geometry);

    const symbolType = graphic.symbol.type;

    const geometryType = graphic.geometry.type;

    if (geometryType !== 'point' && geometryType !== 'polygon' && geometryType !== 'polyline') return;

    if (symbolType === 'text') {
      this.text.add(graphic);
    } else {
      this[geometryType as 'point' | 'polygon' | 'polyline'].add(graphic);
    }

    return graphic;
  }

  public deleteAll(): void {
    const {
      layers: { layers },
    } = this;

    layers.forEach((layer: esri.Layer): void => {
      (layer as esri.GraphicsLayer).removeAll();
    });
  }

  public featureJSON(): { features: object[] } {
    const { point, polygon, polyline, text } = this;

    const features: object[] = [];

    [point, polyline, polygon, text].forEach((layer: esri.GraphicsLayer): void => {
      layer.graphics.forEach((graphic: esri.Graphic): void => {
        features.push(graphic.toJSON());
      });
    });

    return { features };
  }

  private _addSnappingLayer(layer: esri.Layer) {
    const {
      snappingOptions: { featureSources },
    } = this;

    const { listMode, title, type } = layer;

    if (type === 'group') {
      (layer as esri.GroupLayer).layers.forEach(this._addSnappingLayer.bind(this));

      return;
    }

    // @ts-expect-error not typed
    if (layer.internal === true) return;

    if (listMode === 'hide' || !title) return;

    if (type !== 'graphics' && type !== 'csv' && type !== 'feature' && type !== 'geojson') return;

    const _layer = layer as esri.GraphicsLayer | esri.CSVLayer | esri.FeatureLayer | esri.GeoJSONLayer;

    featureSources.add(
      new FeatureSnappingLayerSource({
        layer: _layer,
      }),
    );
  }
}
