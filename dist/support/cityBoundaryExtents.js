/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as t}from"tslib";export default e=>t(void 0,void 0,void 0,(function*(){const t=new((yield import("@arcgis/core/layers/FeatureLayer")).default)({portalItem:{id:e}});yield t.load();const o=t.fullExtent.clone();return{cityLimits:t,extent:o,constraintExtent:o.clone().expand(3)}}));