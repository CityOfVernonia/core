/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import{__awaiter as p}from"tslib";export const attributePopup=o=>p(void 0,void 0,void 0,(function*(){yield o.when();const p=(yield import("../popups/Popup")).default;"map-image"===o.type?o.sublayers.forEach((o=>{o.popupEnabled=!0,o.popupTemplate=p})):(o.popupEnabled=!0,o.popupTemplate=p)}));export const mapImageNoPopups=o=>p(void 0,void 0,void 0,(function*(){yield o.when(),o.sublayers.forEach((p=>{p.popupEnabled=!1}))}));