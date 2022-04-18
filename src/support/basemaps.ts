/**
 * Methods to return Vernonia hillshade and hybrid basemaps.
 */

import esri = __esri;

import Basemap from '@arcgis/core/Basemap';
import BingMapsLayer from '@arcgis/core/layers/BingMapsLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';

export const hillshadeBasemap = (): esri.Basemap => {
  return new Basemap({
    portalItem: {
      id: 'f36cd213cc934d2391f58f389fc9eaec',
    },
  });
};

export const hybridBasemap = (key: string): esri.Basemap => {
  return new Basemap({
    baseLayers: [
      new BingMapsLayer({
        style: 'aerial',
        key,
      }),
      new VectorTileLayer({
        portalItem: {
          id: 'f9a5da71cd61480680e456f0a3d4e1ce',
        },
      }),
    ],
    thumbnailUrl:
      'https://gisportal.vernonia-or.gov/portal/sharing/rest/content/items/b6130a13beb74026b89960fbd424021f/info/thumbnail/thumbnail1579125721359.png?f=json',
  });
};
