import esri = __esri;

import CSVLayer from '@arcgis/core/layers/CSVLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

const _fetchLayerJSON = async (url: string): Promise<object> => {
  return await (await fetch(url, { cache: 'reload' })).json();
};

/**
 * Set basic attributes popup to a layer.
 * @param layer
 */
export const attributePopup = async (
  layer: esri.FeatureLayer | esri.MapImageLayer | esri.GeoJSONLayer,
): Promise<void> => {
  await layer.when();
  const popupTemplate = (await import('../popups/Popup')).default;
  if (layer.type === 'map-image') {
    (layer as esri.MapImageLayer).sublayers.forEach((sublayer: esri.Sublayer): void => {
      sublayer.popupEnabled = true;
      sublayer.popupTemplate = popupTemplate;
    });
  } else {
    layer.popupEnabled = true;
    layer.popupTemplate = popupTemplate;
  }
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
  layer.sublayers.forEach((sublayer: esri.Sublayer): void => {
    sublayer.popupEnabled = false;
  });
};
