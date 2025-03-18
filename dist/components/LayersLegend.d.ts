import esri = __esri;
/**
 * LayersLegend properties.
 */
export interface LayersLegendProperties extends esri.WidgetProperties {
    /**
     * Map view.
     */
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import '@arcgis/map-components/components/arcgis-legend';
import '@arcgis/map-components/components/arcgis-layer-list';
/**
 * A panel with layer controls and and legend.
 */
export default class LayersLegend extends Widget {
    constructor(properties: LayersLegendProperties);
    postInitialize(): void;
    view: esri.MapView;
    private _viewState;
    render(): tsx.JSX.Element;
    private _layers;
    private _legend;
}
