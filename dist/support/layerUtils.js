/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e}from"tslib";import o from"@arcgis/core/layers/CSVLayer";import t from"@arcgis/core/layers/GeoJSONLayer";const r=o=>e(void 0,void 0,void 0,(function*(){return yield(yield fetch(o,{cache:"reload"})).json()}));export const attributePopup=o=>e(void 0,void 0,void 0,(function*(){yield o.when();const e=(yield import("../popups/Popup")).default;"map-image"===o.type?o.sublayers.forEach((o=>{o.popupEnabled=!0,o.popupTemplate=e})):(o.popupEnabled=!0,o.popupTemplate=e)}));export const csvLayerFromJSON=(t,i)=>e(void 0,void 0,void 0,(function*(){try{const e=Object.assign(Object.assign(Object.assign({},yield r(t)),{customParameters:{d:(new Date).getTime()}}),i||{});return new o(e)}catch(e){return console.log(e),new o}}));export const geojsonLayerFromJSON=(o,i)=>e(void 0,void 0,void 0,(function*(){try{const e=Object.assign(Object.assign(Object.assign({},yield r(o)),{customParameters:{d:(new Date).getTime()}}),i||{});return new t(e)}catch(e){return console.log(e),new t}}));export const mapImageNoPopups=o=>e(void 0,void 0,void 0,(function*(){yield o.when(),o.sublayers.forEach((e=>{e.popupEnabled=!1}))}));