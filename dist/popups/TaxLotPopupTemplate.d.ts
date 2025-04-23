import esri = __esri;
interface TaxLotInfoTableInfoLayers {
    flood: esri.FeatureLayer;
    zoning: esri.FeatureLayer;
    wetlands: {
        lwi: esri.FeatureLayer;
        nwi: esri.FeatureLayer;
        mow: esri.FeatureLayer;
    };
}
export interface TaxLotPopupTemplateProperties extends esri.PopupTemplateProperties {
    infoLayers: TaxLotInfoTableInfoLayers;
}
import PopupTemplate from '@arcgis/core/PopupTemplate';
export default class TaxLotPopupTemplate extends PopupTemplate {
    constructor(properties: TaxLotPopupTemplateProperties);
    infoLayers: TaxLotInfoTableInfoLayers;
    outFields: string[];
    title: string;
    content: (event: {
        graphic: esri.Graphic;
    }) => HTMLElement;
}
export {};
