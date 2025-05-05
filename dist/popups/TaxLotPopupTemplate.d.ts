import esri = __esri;
import type { TaxLotInfoTableInfoLayers } from '../components/TaxLotInfoTable';
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
