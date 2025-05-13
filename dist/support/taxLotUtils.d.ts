import esri = __esri;
export declare const TAX_LOT_HILLSHADE_COLOR: esri.Color;
export declare const TAX_LOT_IMAGERY_COLOR: esri.Color;
/**
 * Change tax lot color imagery basemaps.
 * @param imagery esri.Basemap
 * @param layer esri.FeatureLayer
 * @param view esri.MapView
 */
export declare const taxLotColor: (imagery: esri.Basemap, layer: esri.FeatureLayer, view: esri.MapView) => Promise<void>;
/**
 * Create property info URL.
 * @param accountId number | string representing tax account number
 * @returns property info url string
 */
export declare const propertyInfoUrl: (accountId: number | string) => string;
/**
 * Create tax map url.
 * @param mapId
 * @returns tax map url string
 */
export declare const taxMapUrl: (mapId: string) => string;
export declare const accelaUrl: (parcel: string) => string;
export declare const ePermittingUrl: () => string;
