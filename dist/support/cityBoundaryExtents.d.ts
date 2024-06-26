import esri = __esri;
/**
 * Return City Limits feature layer and extents for initializing view.
 * @param id City Limits portal item id
 */
declare const cityBoundaryExtents: (id: string) => Promise<{
    cityLimits: esri.FeatureLayer;
    extent: esri.Extent;
    constraintExtent: esri.Extent;
}>;
export default cityBoundaryExtents;
