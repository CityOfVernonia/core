import esri = __esri;

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
