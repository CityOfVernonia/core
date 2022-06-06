import esri = __esri;
export interface GeometryEditorProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Graphic from '@arcgis/core/Graphic';
export default class GeometryEditor extends Widget {
    constructor(properties: GeometryEditorProperties);
    layer: esri.FeatureLayer;
    feature: Graphic | null;
    render(): tsx.JSX.Element;
}
