import esri = __esri;

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
 * Disable popups for all sublayers of a map image layer.
 * @param layer esri.MapImageLayer
 */
export const mapImageNoPopups = async (layer: esri.MapImageLayer): Promise<void> => {
  await layer.when();
  layer.sublayers.forEach((sublayer: esri.Sublayer): void => {
    sublayer.popupEnabled = false;
  });
};
