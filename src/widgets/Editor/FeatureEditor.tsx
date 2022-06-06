export interface FeatureEditorProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
  geometryEditor?: GeometryEditor;
  attributeEditor?: AttributeEditor;
  photoAttachments?: PhotoAttachments;
}

import { watch } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import AttributeEditor from './AttributeEditor';
import GeometryEditor from './GeometryEditor';
import GeometryInfo from './GeometryInfo';
import PhotoAttachments from './PhotoAttachments';

const CSS = {
  base: 'cov-editor__feature-editor',
};

@subclass('Editor.FeatureEditor')
export default class FeatureEditor extends Widget {
  constructor(properties: FeatureEditorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { layer, attributeEditor, geometryEditor, geometryInfo, photoAttachments, _hasAttachments } = this;

    // await layer.when();

    if (!attributeEditor)
      this.attributeEditor = new AttributeEditor({
        layer,
      });

    if (!geometryEditor)
      this.geometryEditor = new GeometryEditor({
        layer,
      });

    if (!geometryInfo)
      this.geometryInfo = new GeometryInfo({
        layer,
      });

    if (!photoAttachments && _hasAttachments)
      this.photoAttachments = new PhotoAttachments({
        layer,
      });

    watch(this, 'feature', this._feature.bind(this));
  }

  layer!: esri.FeatureLayer;

  @property()
  attributeEditor!: AttributeEditor;

  @property()
  geometryEditor!: GeometryEditor;

  @property()
  geometryInfo!: GeometryInfo;

  @property()
  photoAttachments!: PhotoAttachments;

  @property()
  feature: esri.Graphic | null = null;

  @property({
    aliasOf: 'layer.capabilities.data.supportsAttachment',
  })
  private _hasAttachments!: boolean;

  private _feature(feature: esri.Graphic | null): void {
    if (!feature) return;

    const { geometryEditor, attributeEditor, geometryInfo, photoAttachments } = this;

    // needs feature null
    attributeEditor.feature = feature;

    geometryEditor.feature = feature;

    geometryInfo.feature = feature;

    if (photoAttachments) photoAttachments.feature = feature;
  }

  render(): tsx.JSX.Element {
    const { attributeEditor, geometryEditor, geometryInfo, photoAttachments, _hasAttachments } = this;

    return (
      <div class={CSS.base}>
        <calcite-block heading="Edit attributes" collapsible="" open="">
          <calcite-icon scale="s" slot="icon" icon="edit-attributes"></calcite-icon>
          <div afterCreate={this._widgetContainer.bind(this, attributeEditor)}></div>
        </calcite-block>

        <calcite-block heading="Edit geometry" collapsible="" open="">
          <calcite-icon scale="s" slot="icon" icon="pencil"></calcite-icon>
          <div afterCreate={this._widgetContainer.bind(this, geometryEditor)}></div>
        </calcite-block>

        <calcite-block heading="Geometry info" collapsible="">
          <calcite-icon scale="s" slot="icon" icon="information"></calcite-icon>
          <div afterCreate={this._widgetContainer.bind(this, geometryInfo)}></div>
        </calcite-block>

        {photoAttachments && _hasAttachments ? (
          <calcite-block heading="Photos" collapsible="">
            <calcite-icon scale="s" slot="icon" icon="image"></calcite-icon>
            <div afterCreate={this._widgetContainer.bind(this, photoAttachments)}></div>
          </calcite-block>
        ) : null}
      </div>
    );
  }

  private _widgetContainer(widget: esri.Widget, container: HTMLDivElement): void {
    widget.container = container;
  }
}
