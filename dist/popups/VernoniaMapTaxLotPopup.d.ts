import esri = __esri;
import PopupTemplate from '@arcgis/core/PopupTemplate';
/**
 * Vernonia map tax lot popup.
 */
export default class VernoniaMapTaxLotPopup extends PopupTemplate {
    constructor(properties: esri.PopupTemplateProperties & {
        zoning: esri.FeatureLayer;
        floodZones: esri.FeatureLayer;
    });
    zoning: esri.FeatureLayer;
    floodZones: esri.FeatureLayer;
    outFields: string[];
    title: string;
    content: (event: {
        graphic: esri.Graphic;
    }) => HTMLElement;
}
