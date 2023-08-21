/// <reference types="@esri/calcite-components" />
import esri = __esri;
export interface AddWebLayersModalProperties extends esri.WidgetProperties {
    /**
     * Map or scene view to add layers.
     */
    view: esri.MapView | esri.SceneView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Modal widget for adding layers from web resources.
 */
export default class AddWebLayersModal extends Widget {
    container: HTMLCalciteModalElement;
    constructor(properties: AddWebLayersModalProperties);
    view: esri.MapView | esri.SceneView;
    private _add;
    render(): tsx.JSX.Element;
}
