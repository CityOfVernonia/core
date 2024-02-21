import esri = __esri;
/**
 * AddLayersModal constructor properties.
 */
export interface AddLayersModalProperties extends esri.WidgetProperties {
    /**
     * View to add layers to.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal for adding layers to a map.
 */
declare class AddLayersModal extends Widget {
    constructor(properties: AddLayersModalProperties);
    render(): tsx.JSX.Element;
}
export default AddLayersModal;
