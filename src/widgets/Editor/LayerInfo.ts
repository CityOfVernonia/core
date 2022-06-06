export interface LayerInfoProperties extends Object {
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

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';

@subclass('Editor.LayerInfo')
export default class LayerInfo extends Accessor {
  constructor(properties: LayerInfoProperties) {
    super(properties);
  }

  layer!: esri.FeatureLayer;

  view!: esri.FeatureLayerView;

  highlight!: esri.Handle;

  features!: esri.Graphic[] | null;

  createFeatureSelector!: CreateFeatureSelector;

  featureEditor!: FeatureEditor;

  @property({
    aliasOf: 'featureEditor.geometryEditor',
  })
  geometryEditor!: GeometryEditor;

  @property({
    aliasOf: 'featureEditor.attributeEditor',
  })
  attributeEditor!: AttributeEditor;

  @property({
    aliasOf: 'featureEditor.photoAttachments',
  })
  photoAttachments!: PhotoAttachments;

  @property({
    aliasOf: 'featureEditor.geometryInfo',
  })
  geometryInfo!: GeometryInfo;
}
