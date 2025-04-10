import esri = __esri;
export interface TaxLotPopupInfoLayers {
    flood: esri.FeatureLayer;
    zoning: esri.FeatureLayer;
    wetlands: {
        lwi: esri.FeatureLayer;
        nwi: esri.FeatureLayer;
        mow: esri.FeatureLayer;
    };
}
export interface TaxLotPopupTemplateProperties extends esri.PopupTemplateProperties {
    infoLayers?: TaxLotPopupInfoLayers;
}
import PopupTemplate from '@arcgis/core/PopupTemplate';
export default class TaxLotPopupTemplate extends PopupTemplate {
    constructor(properties?: TaxLotPopupTemplateProperties);
    infoLayers?: TaxLotPopupInfoLayers;
    outFields: string[];
    title: string;
    content: (event: {
        graphic: esri.Graphic;
    }) => HTMLElement;
}
