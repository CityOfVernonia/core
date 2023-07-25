import esri = __esri;
export interface LayerInfoProperties {
    /**
     * Editable feature layer.
     */
    layer: esri.FeatureLayer;
}
import type CreateFeatureSelector from './CreateFeatureSelector';
import type FeatureEditor from './FeatureEditor';
import type GeometryEditor from './GeometryEditor';
import type GeometryInfo from './GeometryInfo';
import type AttributeEditor from './AttributeEditor';
import type PhotoAttachments from './PhotoAttachments';
import Accessor from '@arcgis/core/core/Accessor';
export default class LayerInfo extends Accessor {
    constructor(properties: LayerInfoProperties);
    layer: esri.FeatureLayer;
    view: esri.FeatureLayerView;
    highlight: esri.Handle;
    features: esri.Graphic[] | null;
    createFeatureSelector: CreateFeatureSelector;
    featureEditor: FeatureEditor;
    geometryEditor: GeometryEditor;
    attributeEditor: AttributeEditor;
    photoAttachments: PhotoAttachments;
    geometryInfo: GeometryInfo;
}
