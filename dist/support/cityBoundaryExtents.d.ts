import esri = __esri;
interface I {
    cityLimits: esri.FeatureLayer;
    extent: esri.Extent;
    constraintExtent: esri.Extent;
    geometry: esri.Polygon;
}
/**
 * Return City Limits feature layer and extents for initializing view.
 * @param id Portal item id
 * @param geometryOutSpatialReference Spatial reference of City Limits geometry (defaults to 4326)
 */
declare const cityBoundaryExtents: (id: string, geometryOutSpatialReference?: esri.SpatialReference | esri.SpatialReferenceProperties) => Promise<I>;
export default cityBoundaryExtents;
