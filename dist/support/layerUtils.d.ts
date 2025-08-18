import esri = __esri;
export declare let APPLICATION_GRAPHICS_LAYER: esri.GroupLayer | null;
export declare let APPLICATION_MEASURE_LAYER: esri.GroupLayer | null;
export declare let APPLICATION_SKETCH_LAYER: esri.GroupLayer | null;
/**
 * Create layer for components and keep it atop all layers.
 * @param view `esri.MapView` | `esri.SceneView`
 * @returns `esri.GroupLayer` | `undefined`
 */
export declare const applicationGraphicsLayer: (view: esri.MapView | esri.SceneView) => esri.GroupLayer | nullish;
/**
 * Create and return a CSVLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @param layerProperties Optional CSVLayer properties
 * @returns esri.CSVLayer
 */
export declare const csvLayerFromJSON: (url: string, layerProperties?: esri.CSVLayerProperties) => Promise<esri.CSVLayer>;
/**
 * Create and return a GeoJSONLayer from URL of layer properties JSON.
 * @param url URL of layer properties JSON
 * @param layerProperties Optional GeoJSONLayer properties
 * @returns esri.CSVLayer
 */
export declare const geojsonLayerFromJSON: (url: string, layerProperties?: esri.GeoJSONLayerProperties) => Promise<esri.GeoJSONLayer>;
/**
 * Disable popups for all sublayers of a map image layer.
 * @param layer esri.MapImageLayer
 */
export declare const mapImageNoPopups: (layer: esri.MapImageLayer) => Promise<void>;
export declare const queryFeatureGeometry: (options: {
    layer: esri.FeatureLayer;
    graphic: esri.Graphic;
    outSpatialReference?: esri.SpatialReference;
}) => Promise<esri.Geometry | nullish>;
/**
 * Create unique value renderer and matching label colors for utility plans layer by `title` attribute.
 * @param layer esri.FeatureLayer
 * @param colorRampName any valid esri color ramp name
 */
export declare const utilityPlansColors: (layer: esri.FeatureLayer, colorRampName?: string) => Promise<void>;
