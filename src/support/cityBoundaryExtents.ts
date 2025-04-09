//////////////////////////////////////
// Interfaces
//////////////////////////////////////
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
const cityBoundaryExtents = async (
  id: string,
  geometryOutSpatialReference?: esri.SpatialReference | esri.SpatialReferenceProperties,
): Promise<I> => {
  const cityLimits = new (await import('@arcgis/core/layers/FeatureLayer')).default({
    portalItem: {
      id,
    },
  });

  await cityLimits.load();

  const geometry = (
    await cityLimits.queryFeatures({
      outSpatialReference: geometryOutSpatialReference || { wkid: 4326 },
      returnGeometry: true,
      where: '1 = 1',
    })
  ).features[0].geometry as esri.Polygon;

  const extent = (cityLimits.fullExtent as esri.Extent).clone();

  return { cityLimits, constraintExtent: extent.clone().expand(3), extent, geometry };
};

export default cityBoundaryExtents;
