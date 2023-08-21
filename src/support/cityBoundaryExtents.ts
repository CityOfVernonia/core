//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

/**
 * Return City Limits feature layer and extents for initializing view.
 * @param id City Limits portal item id
 */
const cityBoundaryExtents = async (
  id: string,
): Promise<{
  cityLimits: esri.FeatureLayer;
  extent: esri.Extent;
  constraintExtent: esri.Extent;
}> => {
  const cityLimits = new FeatureLayer({
    portalItem: {
      id,
    },
  });

  await cityLimits.load();

  const extent = cityLimits.fullExtent.clone();

  return {
    cityLimits,
    extent,
    constraintExtent: extent.clone().expand(3),
  };
};

export default cityBoundaryExtents;
