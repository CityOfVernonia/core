import esri = __esri;

import CSVLayer from '@arcgis/core/layers/CSVLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';

/**
 * Fetch url and return JSON
 * @param url string
 * @returns JSON object
 */
const _fetchJSON = async (url: string): Promise<object> => {
  return await (await fetch(url, { cache: 'reload' })).json();
};

export let APPLICATION_GRAPHICS_LAYER: esri.GroupLayer | null = null;

export let APPLICATION_MEASURE_LAYER: esri.GroupLayer | null = null;

export let APPLICATION_SKETCH_LAYER: esri.GroupLayer | null = null;

/**
 * Create layer for components and keep it atop all layers.
 * @param view `esri.MapView` | `esri.SceneView`
 * @returns `esri.GroupLayer` | `undefined`
 */
export const applicationGraphicsLayer = (view: esri.MapView | esri.SceneView): esri.GroupLayer | nullish => {
  if (APPLICATION_GRAPHICS_LAYER || !view.map) return;

  const layers = view.map.layers;

  APPLICATION_MEASURE_LAYER = new GroupLayer({ listMode: 'hide' });

  APPLICATION_SKETCH_LAYER = new GroupLayer({ listMode: 'hide' });

  APPLICATION_GRAPHICS_LAYER = new GroupLayer({
    listMode: 'hide',
    layers: [APPLICATION_SKETCH_LAYER, APPLICATION_MEASURE_LAYER],
  });

  layers.add(APPLICATION_GRAPHICS_LAYER);

  layers.on('after-add', (): void => {
    // @ts-expect-error APPLICATION_GRAPHICS_LAYER will not be null here
    layers.reorder(APPLICATION_GRAPHICS_LAYER, layers.length - 1);
  });

  return APPLICATION_GRAPHICS_LAYER;
};

/**
 * Create and return a CSVLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @param layerProperties Optional CSVLayer properties
 * @returns esri.CSVLayer
 */
export const csvLayerFromJSON = async (
  url: string,
  layerProperties?: esri.CSVLayerProperties,
): Promise<esri.CSVLayer> => {
  try {
    const csvLayerProperties: esri.CSVLayerProperties = {
      ...(await _fetchJSON(url)),
      ...{
        customParameters: {
          d: new Date().getTime(),
        },
      },
      ...(layerProperties || {}),
    };
    return new CSVLayer(csvLayerProperties);
  } catch (error) {
    console.log(error);
    return new CSVLayer();
  }
};

/**
 * Create and return a GeoJSONLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @param layerProperties Optional GeoJSONLayer properties
 * @returns esri.CSVLayer
 */
export const geojsonLayerFromJSON = async (
  url: string,
  layerProperties?: esri.GeoJSONLayerProperties,
): Promise<esri.GeoJSONLayer> => {
  try {
    const geojsonLayerProperties: esri.GeoJSONLayerProperties = {
      ...(await _fetchJSON(url)),
      ...{
        customParameters: {
          d: new Date().getTime(),
        },
      },
      ...(layerProperties || {}),
    };
    return new GeoJSONLayer(geojsonLayerProperties);
  } catch (error) {
    console.log(error);
    return new GeoJSONLayer();
  }
};

/**
 * Disable popups for all sublayers of a map image layer.
 * @param layer esri.MapImageLayer
 */
export const mapImageNoPopups = async (layer: esri.MapImageLayer): Promise<void> => {
  await layer.when();

  layer.sublayers?.forEach((sublayer: esri.Sublayer): void => {
    sublayer.popupEnabled = false;
  });
};

export const queryFeatureGeometry = async (options: {
  layer: esri.FeatureLayer;
  graphic: esri.Graphic;
  outSpatialReference?: esri.SpatialReference;
}): Promise<esri.Geometry | nullish> => {
  const {
    layer,
    layer: { objectIdField },
    graphic,
    outSpatialReference,
  } = options;

  try {
    return (
      await layer.queryFeatures({
        where: `${objectIdField} = ${graphic.attributes[objectIdField]}`,
        returnGeometry: true,
        outSpatialReference: outSpatialReference || layer.spatialReference,
      })
    ).features[0].geometry;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create unique value renderer and matching label colors for utility plans layer by `title` attribute.
 * @param layer esri.FeatureLayer
 * @param colorRampName any valid esri color ramp name
 */
export const utilityPlansColors = async (layer: esri.FeatureLayer, colorRampName?: string): Promise<void> => {
  const Color = (await import('@arcgis/core/Color')).default;
  const SimpleFillSymbol = (await import('@arcgis/core/symbols/SimpleFillSymbol')).default;
  const UniqueValueInfo = (await import('@arcgis/core/renderers/support/UniqueValueInfo')).default;
  const UniqueValueRenderer = (await import('@arcgis/core/renderers/UniqueValueRenderer')).default;
  const byName = (await import('@arcgis/core/smartMapping/symbology/support/colorRamps')).byName;
  const isBright = (await import('@arcgis/core/applications/SceneViewer/colorUtils')).isBright;

  const colors = byName(colorRampName || 'Point Cloud 3')?.colors;

  if (!colors) return;

  let colorIndex = 0;

  await layer.load();

  const features = (
    await layer.queryFeatures({
      where: '1 = 1',
      outFields: ['title'],
      returnDistinctValues: true,
      orderByFields: ['title ASC'],
      returnGeometry: false,
    })
  ).features;

  const defaultSymbol = new SimpleFillSymbol({
    color: [255, 255, 255, 0],
    outline: {
      color: [255, 0, 0],
      width: 2,
    },
  });

  const labelingInfo: esri.LabelClass[] = [];

  // @ts-expect-error layer has labeling info
  const defaultLabelClass = layer.labelingInfo[0] as esri.LabelClass;

  const uniqueValueInfos = features
    .map((feature: esri.Graphic): string => {
      return feature.attributes.title;
    })
    .map((title: string): esri.UniqueValueInfo => {
      const symbol = defaultSymbol.clone();

      if (colorIndex === colors.length - 1) colorIndex = 0;

      const color = new Color(colors[colorIndex]);

      colorIndex++;

      if (symbol.outline) symbol.outline.color = color;

      const labelClass = defaultLabelClass.clone();

      (labelClass.symbol as esri.TextSymbol).color = color;

      (labelClass.symbol as esri.TextSymbol).font.size = 10;

      (labelClass.symbol as esri.TextSymbol).font.weight = 'bold';

      (labelClass.symbol as esri.TextSymbol).haloSize = 1.5;

      (labelClass.symbol as esri.TextSymbol).haloColor = isBright(color) ? new Color('black') : new Color('white');

      labelClass.where = `title = '${title}'`;

      labelingInfo.push(labelClass);

      return new UniqueValueInfo({
        value: title,
        symbol,
      });
    });

  layer.renderer = new UniqueValueRenderer({
    field: 'title',
    defaultSymbol,
    uniqueValueInfos,
  });

  layer.labelingInfo = labelingInfo;
};
