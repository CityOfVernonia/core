/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import t from"@arcgis/core/PopupTemplate";import{DateTime as e}from"luxon";const r=new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/);export default new t({outFields:["*"],title:t=>t.graphic.layer?t.graphic.layer.title:t.graphic.sourceLayer.title,content:t=>{const{graphic:i}=t,a=i.layer||i.sourceLayer,l=[];for(const t in i.attributes){const{alias:o,name:s,type:n}=a.fields.find((e=>t===e.name));if("blob"===n||"geometry"===n||"global-id"===n||"guid"===n||"oid"===n||"xml"===n)l.push("");else{let a=i.attributes[t];"date"===n&&(a=e.fromMillis(a).toUTC().toLocaleString(e.DATETIME_FULL)),"string"==typeof a&&a.match(r)&&(a=`<calcite-link href="${a}" target="_blank">View</calcite-link>`),l.push(`<tr><th>${o||s}</th><td>${a}</td></tr>`)}}return(new DOMParser).parseFromString(`<table class="esri-widget__table">${l.join("")}</table>`,"text/html").body.firstChild}});