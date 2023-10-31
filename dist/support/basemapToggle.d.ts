import esri = __esri;
/**
 * Create and place BasemapToggle in view ui with calcite-tooltip.
 * @param view
 * @param nextBasemap
 * @param position
 */
declare const basemapToggle: (view: esri.MapView | esri.SceneView, nextBasemap: esri.Basemap, position: string) => Promise<void>;
export default basemapToggle;
