import { __decorate } from "tslib";
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
let LayerInfo = class LayerInfo extends Accessor {
    constructor(properties) {
        super(properties);
    }
};
__decorate([
    property({
        aliasOf: 'featureEditor.geometryEditor',
    })
], LayerInfo.prototype, "geometryEditor", void 0);
__decorate([
    property({
        aliasOf: 'featureEditor.attributeEditor',
    })
], LayerInfo.prototype, "attributeEditor", void 0);
__decorate([
    property({
        aliasOf: 'featureEditor.photoAttachments',
    })
], LayerInfo.prototype, "photoAttachments", void 0);
__decorate([
    property({
        aliasOf: 'featureEditor.geometryInfo',
    })
], LayerInfo.prototype, "geometryInfo", void 0);
LayerInfo = __decorate([
    subclass('Editor.LayerInfo')
], LayerInfo);
export default LayerInfo;
