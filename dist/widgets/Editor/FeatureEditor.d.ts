import esri = __esri;
export interface FeatureEditorProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
    geometryEditor?: GeometryEditor;
    attributeEditor?: AttributeEditor;
    photoAttachments?: PhotoAttachments;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import AttributeEditor from './AttributeEditor';
import GeometryEditor from './GeometryEditor';
import GeometryInfo from './GeometryInfo';
import PhotoAttachments from './PhotoAttachments';
export default class FeatureEditor extends Widget {
    constructor(properties: FeatureEditorProperties);
    postInitialize(): Promise<void>;
    layer: esri.FeatureLayer;
    attributeEditor: AttributeEditor;
    geometryEditor: GeometryEditor;
    geometryInfo: GeometryInfo;
    photoAttachments: PhotoAttachments;
    feature: esri.Graphic | null;
    private _hasAttachments;
    private _feature;
    render(): tsx.JSX.Element;
    private _widgetContainer;
}
