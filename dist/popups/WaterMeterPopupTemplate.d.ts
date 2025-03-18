import esri = __esri;
import PopupTemplate from '@arcgis/core/PopupTemplate';
export default class TaxLotPopupTemplate extends PopupTemplate {
    outFields: string[];
    title: string;
    content: (event: {
        graphic: esri.Graphic;
    }) => HTMLElement;
}
