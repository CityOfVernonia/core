/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e}from"tslib";export default(t,i,o)=>e(void 0,void 0,void 0,(function*(){const e=(yield import("uuid")).v4,n=(yield import("@arcgis/core/widgets/BasemapToggle")).default,a=`bt_${e()}`,r=new n({view:t,nextBasemap:i});t.ui.add(r,o);const l=r.container;l.id=a;const c=new MutationObserver((()=>{l.removeAttribute("title"),c.disconnect()}));c.observe(l,{attributes:!0,attributeFilter:["title"]});const s=Object.assign(document.createElement("calcite-tooltip"),{referenceElement:a,overlayPositioning:"fixed",closeOnClick:!0,label:"Toggle basemap",innerHTML:"Toggle basemap"});document.body.append(s)}));