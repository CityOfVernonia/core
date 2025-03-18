import esri = __esri;

import CSVLayer from '@arcgis/core/layers/CSVLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';

const _fetchLayerJSON = async (url: string): Promise<object> => {
  return await (await fetch(url, { cache: 'reload' })).json();
};

export let APPLICATION_GRAPHICS_LAYER: esri.GroupLayer | null = null;

export const applicationGraphicsLayer = async (view: esri.MapView | esri.SceneView): Promise<void> => {
  await view.when();

  if (APPLICATION_GRAPHICS_LAYER) return;

  const layers = view.map.layers;

  APPLICATION_GRAPHICS_LAYER = new GroupLayer({ listMode: 'hide' });

  layers.add(APPLICATION_GRAPHICS_LAYER);

  layers.on('after-add', (): void => {
    // @ts-expect-error APPLICATION_GRAPHICS_LAYER will not be null here
    layers.reorder(APPLICATION_GRAPHICS_LAYER, layers.length - 1);
  });
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
      ...(await _fetchLayerJSON(url)),
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
      ...(await _fetchLayerJSON(url)),
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
