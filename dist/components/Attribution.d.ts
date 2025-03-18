import esri = __esri;
/**
 * Attribution constructor properties.
 */
export interface AttributionProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Attribution component to replace default ArcGIS attribution.
 */
export default class Attribution extends Widget {
    constructor(properties: AttributionProperties);
    readonly view: esri.MapView;
    private _vm;
    private _items?;
    render(): tsx.JSX.Element;
}
