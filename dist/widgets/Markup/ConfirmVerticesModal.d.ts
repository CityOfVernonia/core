import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class ConfirmVerticesModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties?: esri.WidgetProperties);
    render(): tsx.JSX.Element;
}
