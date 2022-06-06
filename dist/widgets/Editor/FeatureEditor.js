import { __awaiter, __decorate } from "tslib";
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
let FeatureEditor = class FeatureEditor extends Widget {
    constructor(properties) {
        super(properties);
        this.feature = null;
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    _feature(feature) {
        if (!feature)
            return;
        const { geometryEditor, attributeEditor, geometryInfo, photoAttachments } = this;
        // needs feature null
        attributeEditor.feature = feature;
        geometryEditor.feature = feature;
        geometryInfo.feature = feature;
        if (photoAttachments)
            photoAttachments.feature = feature;
    }
    render() {
        const { attributeEditor, geometryEditor, geometryInfo, photoAttachments, _hasAttachments } = this;
        return (tsx("div", { class: CSS.base },
            tsx("calcite-block", { heading: "Edit attributes", collapsible: "", open: "" },
                tsx("calcite-icon", { scale: "s", slot: "icon", icon: "edit-attributes" }),
                tsx("div", { afterCreate: this._widgetContainer.bind(this, attributeEditor) })),
            tsx("calcite-block", { heading: "Edit geometry", collapsible: "", open: "" },
                tsx("calcite-icon", { scale: "s", slot: "icon", icon: "pencil" }),
                tsx("div", { afterCreate: this._widgetContainer.bind(this, geometryEditor) })),
            tsx("calcite-block", { heading: "Geometry info", collapsible: "" },
                tsx("calcite-icon", { scale: "s", slot: "icon", icon: "information" }),
                tsx("div", { afterCreate: this._widgetContainer.bind(this, geometryInfo) })),
            photoAttachments && _hasAttachments ? (tsx("calcite-block", { heading: "Photos", collapsible: "" },
                tsx("calcite-icon", { scale: "s", slot: "icon", icon: "image" }),
                tsx("div", { afterCreate: this._widgetContainer.bind(this, photoAttachments) }))) : null));
    }
    _widgetContainer(widget, container) {
        widget.container = container;
    }
};
__decorate([
    property()
], FeatureEditor.prototype, "attributeEditor", void 0);
__decorate([
    property()
], FeatureEditor.prototype, "geometryEditor", void 0);
__decorate([
    property()
], FeatureEditor.prototype, "geometryInfo", void 0);
__decorate([
    property()
], FeatureEditor.prototype, "photoAttachments", void 0);
__decorate([
    property()
], FeatureEditor.prototype, "feature", void 0);
__decorate([
    property({
        aliasOf: 'layer.capabilities.data.supportsAttachment',
    })
], FeatureEditor.prototype, "_hasAttachments", void 0);
FeatureEditor = __decorate([
    subclass('Editor.FeatureEditor')
], FeatureEditor);
export default FeatureEditor;
