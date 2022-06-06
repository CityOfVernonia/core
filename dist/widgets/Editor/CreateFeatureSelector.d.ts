import esri = __esri;
export interface CreateFeatureSelectorProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class CreateFeatureSelector extends Widget {
    constructor(properties: CreateFeatureSelectorProperties);
    postInitialize(): Promise<void>;
    layer: esri.FeatureLayer;
    title: string;
    selectors: esri.Collection<tsx.JSX.Element>;
    simpleRenderer(renderer: esri.SimpleRenderer): Promise<void>;
    uniqueValueRenderer(renderer: esri.UniqueValueRenderer): Promise<void>;
    render(): tsx.JSX.Element;
}
