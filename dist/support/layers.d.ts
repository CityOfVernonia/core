import esri = __esri;
import CSVLayer from '@arcgis/core/layers/CSVLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
/**
 * Set basic attributes popup to a layer.
 * @param layer
 */
export declare const attributePopup: (layer: esri.FeatureLayer | esri.MapImageLayer | esri.GeoJSONLayer) => Promise<void>;
/**
 * Create and return a CSVLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @returns esri.CSVLayer
 */
export declare const csvLayerFromJSON: (url: string) => Promise<esri.CSVLayer>;
/**
 * Create and return a GeoJSONLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @returns esri.CSVLayer
 */
export declare const geojsonLayerFromJSON: (url: string) => Promise<esri.GeoJSONLayer>;
/**
 * Disable popups for all sublayers of a map image layer.
 * @param layer esri.MapImageLayer
 */
export declare const mapImageNoPopups: (layer: esri.MapImageLayer) => Promise<void>;
