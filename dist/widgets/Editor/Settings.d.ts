import esri = __esri;
export interface SettingsProperties extends esri.WidgetProperties {
    snappingOptions: esri.SnappingOptions;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class Settings extends Widget {
    constructor(properties: SettingsProperties);
    postInitialize(): void;
    snappingOptions: esri.SnappingOptions;
    enabled: boolean;
    featureEnabled: boolean;
    selfEnabled: boolean;
    private _layers;
    private _addFeatureSource;
    createSnappingOptionsBlock(): tsx.JSX.Element;
    render(): tsx.JSX.Element;
}
