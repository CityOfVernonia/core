// import esri = __esri;

// import { watch } from '@arcgis/core/core/reactiveUtils';
// import Color from '@arcgis/core/Color';

// const hillshadeColor = new Color([152, 114, 11, 0.5]);

// const imageryColor = new Color([246, 213, 109, 0.5]);

// export const taxlotColor = async (
//   basemap: esri.Basemap,
//   layer: esri.FeatureLayer,
//   view: esri.MapView,
// ): Promise<void> => {
//   await layer.when();

//   const tlr = layer.renderer as esri.SimpleRenderer;
//   const tls = tlr.symbol as esri.SimpleFillSymbol;

//   watch(
//     (): esri.Basemap | nullish => view.map.basemap,
//     (_basemap: esri.Basemap | nullish): void => {
//       if (_basemap && tls && tls.outline) tls.outline.color = _basemap === basemap ? imageryColor : hillshadeColor;
//     },
//   );
// };

/**
 * Create property info URL.
 * @param accountId number | string representing tax account number
 * @returns property info url string
 */
export const propertyInfoUrl = (accountId: number | string): string => {
  return `https://propertysearch.columbiacountyor.gov/PSO/detail/${accountId}/R`;
};

/**
 * Create tax map url.
 * @param mapId
 * @returns tax map url string
 */
export const taxMapUrl = (mapId: string): string => {
  return `https://gis.columbiacountymaps.com/TaxMaps/${mapId}.pdf`;
};
