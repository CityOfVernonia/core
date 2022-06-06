import esri = __esri;
export interface AttributeEditorProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class AttributeEditor extends Widget {
    constructor(properties: AttributeEditorProperties);
    postInitialize(): void;
    layer: esri.FeatureLayer;
    fields: esri.Field[];
    feature: esri.Graphic;
    private form;
    private notice;
    private _feature;
    private _updateFeatureAttributes;
    private _toggleUpdating;
    private _createIntegerControl;
    private _createStringControl;
    private _createDateControl;
    render(): tsx.JSX.Element;
}
