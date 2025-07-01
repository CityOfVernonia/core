import esri = __esri;

import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import SnappingOptions from '@arcgis/core/views/interactive/snapping/SnappingOptions';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';

import { APPLICATION_MEASURE_LAYER } from '../../support/layerUtils';

const COLORS = {
  PRIMARY: [237, 81, 81],
  SECONDARY: [255, 255, 255],
};

const HANDLE_KEY = 'sketch-custom-handles';

const CIM_STROKE = [
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
    color: [...COLORS.SECONDARY, 255],
  },
  {
    type: 'CIMSolidStroke',
    enable: true,
    capStyle: 'Butt',
    joinStyle: 'Round',
    width: 2.25,
    color: [...COLORS.PRIMARY, 255],
  },
];

const POINT_SYMBOL = new SimpleMarkerSymbol({
  style: 'circle',
  size: 6,
  color: COLORS.SECONDARY,
  outline: {
    width: 1,
    color: COLORS.PRIMARY,
  },
});

const POLYGON_SYMBOL = new CIMSymbol({
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPolygonSymbol',
      symbolLayers: [
        {
          type: 'CIMSolidFill',
          enable: true,
          color: [...COLORS.PRIMARY, 32],
        },
        // @ts-expect-error it's just fine
        ...CIM_STROKE,
      ],
    },
  },
});

const POLYLINE_SYMBOL = new CIMSymbol({
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMLineSymbol',
      // @ts-expect-error it's just fine
      symbolLayers: CIM_STROKE,
    },
  },
});

const SNAPPING_OPTIONS = new SnappingOptions({
  enabled: true,
  featureEnabled: true,
  selfEnabled: true,
});

const TEXT_SYMBOL = new TextSymbol({
  color: COLORS.PRIMARY,
  haloColor: COLORS.SECONDARY,
  haloSize: 2,
  horizontalAlignment: 'center',
  verticalAlignment: 'middle',
  font: {
    size: 10,
  },
});

/**
 * Extended sketch view model for measure.
 */
@subclass('cov.components.Measure.Sketch')
export default class Sketch extends SketchViewModel {
  constructor(properties?: esri.SketchViewModelProperties) {
    super(properties);

    // set symbols
    this.activeFillSymbol = POLYGON_SYMBOL;

    // @ts-expect-error not typed
    this.activeLineSymbol = POLYLINE_SYMBOL;

    // @ts-expect-error not typed
    this.activeVertexSymbol = POINT_SYMBOL;

    this.pointSymbol = POINT_SYMBOL;

    this.polygonSymbol = POLYGON_SYMBOL;

    this.polylineSymbol = POLYLINE_SYMBOL;

    this.snappingOptions = SNAPPING_OPTIONS;

    // @ts-expect-error not typed
    this.vertexSymbol = POINT_SYMBOL;

    // layers
    this.layers.addMany([this.layer, this.labels]);

    whenOnce((): esri.MapView | esri.SceneView | nullish => this.view).then(
      async (view: esri.MapView | esri.SceneView): Promise<void> => {
        if (!view || !view.map) return;

        await view.when();

        if (APPLICATION_MEASURE_LAYER) {
          APPLICATION_MEASURE_LAYER.add(this.layers);
        } else {
          view.map.add(this.layers);
        }

        const _layers = view.map.layers;

        _layers.forEach(this._addSnappingLayer.bind(this));

        this.addHandles(
          _layers.on('after-add', (event: { item: esri.Layer }): void => {
            this._addSnappingLayer(event.item);
          }),
          HANDLE_KEY,
        );
      },
    );

    // add completed vertices
    this.addHandles(this.on('create', this._addVertices.bind(this)), HANDLE_KEY);
  }

  public labels = new GraphicsLayer();

  override layer = new GraphicsLayer();

  public layers = new GroupLayer({ listMode: 'hide' });

  public textSymbol = TEXT_SYMBOL;

  override updateOnGraphicClick = false;

  private _initialized = false;

  public clearGraphics(type: 'all' | 'labels' | 'geometry'): void {
    const { labels, layer } = this;

    if (type === 'all' || type === 'labels') labels.removeAll();

    if (type === 'all' || type === 'geometry') layer.removeAll();
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

  private _addVertices(event: esri.SketchViewModelCreateEvent): void {
    const { layer, pointSymbol, view } = this;

    const {
      graphic: { geometry },
      state,
    } = event;

    if (!view || !geometry || state !== 'complete' || (geometry.type !== 'polygon' && geometry.type !== 'polyline'))
      return;

    const coordinates = geometry.type === 'polyline' ? geometry.paths[0] : geometry.rings[0];

    layer.addMany(
      coordinates.map((coordinate: number[]): esri.Graphic => {
        const [x, y] = coordinate;

        return new Graphic({
          geometry: new Point({ x, y, spatialReference: view.spatialReference }),
          symbol: pointSymbol,
        });
      }),
    );
  }
}
