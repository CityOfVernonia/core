import esri = __esri;
import PopupTemplate from '@arcgis/core/PopupTemplate';
export default class FloodplainStructurePopupTemplate extends PopupTemplate {
    outFields: string[];
    title: string;
    content: (event: {
        graphic: esri.Graphic;
    }) => HTMLElement;
}
