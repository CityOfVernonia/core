import esri = __esri;

import { watch } from '@arcgis/core/core/reactiveUtils';
import Color from '@arcgis/core/Color';

export const TAX_LOT_HILLSHADE_COLOR = new Color([152, 114, 11, 0.5]);

export const TAX_LOT_IMAGERY_COLOR = new Color([246, 213, 109, 0.5]);

/**
 * Change tax lot color imagery basemaps.
 * @param imagery esri.Basemap
 * @param layer esri.FeatureLayer
 * @param view esri.MapView
 */
export const taxLotColor = async (
  imagery: esri.Basemap,
  layer: esri.FeatureLayer,
  view: esri.MapView,
): Promise<void> => {
  await layer.when();

  const tlr = layer.renderer as esri.SimpleRenderer;

  const tls = tlr.symbol as esri.SimpleFillSymbol;

  watch(
    (): esri.Basemap | nullish => view.map?.basemap,
    (basemap: esri.Basemap | nullish): void => {
      if (basemap && tls && tls.outline)
        tls.outline.color = basemap === imagery ? TAX_LOT_IMAGERY_COLOR : TAX_LOT_HILLSHADE_COLOR;
    },
  );
};

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

export const accelaUrl = (parcel: string): string => {
  return `https://av-oregon.accela.com/portlets/parcel/refParcelForm.do?mode=view&refParcelNumber=${parcel}`;
};

export const ePermittingUrl = (/*parcel: string*/): string => {
  return `https://aca-oregon.accela.com/oregon/Default.aspx`;
};
