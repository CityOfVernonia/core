import esri = __esri;
/**
 * Set basic attributes popup to a layer.
 * @param layer
 */
export declare const attributePopup: (layer: esri.FeatureLayer | esri.MapImageLayer | esri.GeoJSONLayer) => Promise<void>;
/**
 * Disable popups for all sublayers of a map image layer.
 * @param layer esri.MapImageLayer
 */
export declare const mapImageNoPopups: (layer: esri.MapImageLayer) => Promise<void>;
