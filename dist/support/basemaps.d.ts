/**
 * Methods to return Vernonia hillshade and hybrid basemaps.
 */
import esri = __esri;
import Basemap from '@arcgis/core/Basemap';
export declare const hillshadeBasemap: () => esri.Basemap;
export declare const hybridBasemap: (key: string) => esri.Basemap;
