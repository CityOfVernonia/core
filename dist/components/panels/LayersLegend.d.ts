import esri = __esri;
/**
 * LayersLegend panel constructor properties.
 */
export interface LayersLegendConstructorProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A panel component to display layer list and legend.
 */
declare class LayersLegend extends Widget {
    constructor(properties: LayersLegendConstructorProperties);
    postInitialize(): void;
    view: esri.MapView;
    private _viewState;
    render(): tsx.JSX.Element;
    /**
     * Create LayerList.
     * @param container HTMLDivElement
     */
    private _createLayerList;
    /**
     * Create Legend.
     * @param container HTMLDivElement
     */
    private _createLegend;
}
export default LayersLegend;
