/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as e}from"tslib";import{subclass as l}from"@arcgis/core/core/accessorSupport/decorators";import n from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";import{referenceElement as r}from"./../components/support";import i from"@arcgis/core/PopupTemplate";import{propertyInfoUrl as s,taxMapUrl as a}from"./../support/taxLotUtils";import{load as d,isLoaded as u,execute as c}from"@arcgis/core/geometry/operators/geodesicBufferOperator";let h=0;const f="--calcite-loader-progress-color-inline: var(--calcite-color-brand);",g="max-width: 165px; padding: 0.25rem; ";let p=class extends i{constructor(t){super(t),this.outFields=["*"],this.title="{TAXLOT_ID}",this.content=t=>{const{infoLayers:e}=this;return new y({graphic:t.graphic,infoLayers:e}).container}}};p=e([l("cov.popups.TaxLotPopupTemplate")],p);export default p;class y extends n{get container(){return this._container}set container(t){this._container=t}constructor(t){super(t),this._container=document.createElement("table"),this._flood=o("tr",null,o("th",null,"Flood zones"),o("td",{style:f},o("calcite-loader",{inline:!0,label:"Loading",scale:"s",text:"Loading"}))),this._mailing=o("tr",null,o("th",null,"Mailing address"),o("td",{style:f},o("calcite-loader",{inline:!0,label:"Loading",scale:"s",text:"Loading"}))),this._wetlands=o("tr",null,o("th",null,"Wetlands"),o("td",{style:f},o("calcite-loader",{inline:!0,label:"Loading",scale:"s",text:"Loading"}))),this._zoning=o("tr",null,o("th",null,"Zoning"),o("td",{style:f},o("calcite-loader",{inline:!0,label:"Loading",scale:"s",text:"Loading"}))),this.graphic=t.graphic,this.infoLayers=t.infoLayers}postInitialize(){return t(this,void 0,void 0,(function*(){const{graphic:{geometry:t,attributes:{VERNONIA:e}},infoLayers:l}=this;if(this._mailingInfo(),!t||!l||0===e)return;u()||(yield d());const n=c(t,-1,{unit:"feet"});this._zoningInfo(n),this._floodInfo(n),this._wetlandInfo(n)}))}_floodInfo(e){return t(this,void 0,void 0,(function*(){const{infoLayers:t}=this;if(!t)return;const{flood:l}=t;try{const t=yield l.queryFeatures({geometry:e,outFields:["flood_zone"],returnGeometry:!1}),n=[];t.features.forEach((t=>{const{flood_zone:e}=t.attributes;-1===n.indexOf(e)&&n.push(e)})),this._flood=n.length?o("tr",null,o("th",null,o("calcite-link",{"icon-end":"information"},"Flood zones"),o("calcite-popover",{"auto-close":"",closable:!0,scale:"s",afterCreate:r},o("div",{style:g},"Some portion of the tax lot is affected by the indicated flood zones. Turn on flood hazard layer to view flood zones."))),o("td",null,n.map((t=>o("div",{key:h++},t))))):o("tr",null,o("th",null,"Flood zones"),o("td",null,"None")),this.scheduleRender()}catch(t){console.log(t),this._flood=o("tr",null,o("th",null,"Flood zones"),o("td",null,"An error occurred")),this.scheduleRender()}}))}_mailingInfo(){return t(this,void 0,void 0,(function*(){var t;const{graphic:e}=this;try{const l=e.layer,n=e.attributes[l.objectIdField],r=null===(t=(yield l.queryRelatedFeatures({objectIds:[n],outFields:["M_ADDRESS","M_CITY","M_STATE","M_ZIP"],relationshipId:0}))[n])||void 0===t?void 0:t.features[0];if(!r)return void(this._mailing=o("tr",null,o("th",null,"Mailing address"),o("td",null,"Unknown")));const{M_ADDRESS:i,M_CITY:s,M_STATE:a,M_ZIP:d}=r.attributes;this._mailing=o("tr",null,o("th",null,"Mailing address"),o("td",null,i,o("br",null),s,", ",a," ",d)),this.scheduleRender()}catch(t){console.log(t),this._mailing=o("tr",null,o("th",null,"Mailing address"),o("td",null,"An error occurred")),this.scheduleRender()}}))}_wetlandInfo(e){return t(this,void 0,void 0,(function*(){const{infoLayers:t}=this;if(!t)return;const{wetlands:{lwi:l,nwi:n,mow:i}}=t;try{const t=(yield l.queryFeatures({geometry:e,returnGeometry:!1})).features.length,s=(yield n.queryFeatures({geometry:e,returnGeometry:!1})).features.length,a=(yield i.queryFeatures({geometry:e,returnGeometry:!1})).features.length;this._wetlands=t+s+a>0?o("tr",null,o("th",null,o("calcite-link",{"icon-end":"information"},"Wetlands"),o("calcite-popover",{"auto-close":"",closable:!0,scale:"s",afterCreate:r},o("div",{style:g},"Some portion of the tax lot may be affected by wetlands. Turn on wetlands layer to view potential wetlands."))),o("td",null,"Yes")):o("tr",null,o("th",null,"Wetlands"),o("td",null,"No")),this.scheduleRender()}catch(t){console.log(t),this._wetlands=o("tr",null,o("th",null,"Wetlands"),o("td",null,"An error occurred")),this.scheduleRender()}}))}_zoningInfo(e){return t(this,void 0,void 0,(function*(){const{infoLayers:t}=this;if(!t)return;const{zoning:l}=t;try{const t=yield l.queryFeatures({geometry:e,outFields:["localZCode","localZDesc"],returnGeometry:!1}),n=[];t.features.forEach((t=>{const{localZCode:e,localZDesc:l}=t.attributes,o=`${e} - ${l}`;-1===n.indexOf(o)&&n.push(o)})),this._zoning=o("tr",null,o("th",null,"Zoning"),o("td",null,n.map((t=>o("div",{key:h++},t))))),this.scheduleRender()}catch(t){console.log(t),this._zoning=o("tr",null,o("th",null,"Zoning"),o("td",null,"An error occurred")),this.scheduleRender()}}))}render(){const{infoLayers:t,_flood:e,_mailing:l,_wetlands:n,_zoning:r}=this,{VERNONIA:i}=this.graphic.attributes;return o("table",{class:"cov--feature-table"},this._renderTaxLotInfo(),l,t&&1===i?r:null,t&&1===i?e:null,t&&1===i?n:null)}_renderTaxLotInfo(){const{TAXLOT_ID:t,ACCELA_MT:e,ACCOUNT_IDS:l,TAXMAP:n,ADDRESS:r,OWNER:i,ACRES:d,SQ_FEET:u}=this.graphic.attributes,c=r?o("tr",null,o("th",null,"Address"),o("td",null,r)):null;let h="Unknown",f=[];return l&&(f=l.split(","),h=1===f.length?o("calcite-link",{href:`${s(f[0])}`,target:"_blank"},f[0]):f.map(((t,e)=>o("span",null,o("calcite-link",{href:`${s(t)}`,target:"_blank"},t),e<f.length-1?o("span",null,"  "):"")))),[o("tr",null,o("th",null,"Tax lot"),o("td",null,o("calcite-link",{href:`https://vernonia-tax-lot.netlify.app/${t}/`,target:"_blank"},t))),o("tr",null,o("th",null,"Accela id"),o("td",null,e)),o("tr",null,o("th",null,"Tax map"),o("td",null,o("calcite-link",{href:`${a(n)}`,target:"_blank"},n))),o("tr",null,o("th",null,"Owner"),o("td",null,i||"Unknown")),c,o("tr",null,o("th",null,"Area"),o("td",null,d," acres  ",u.toLocaleString()," sq ft")),o("tr",null,o("th",null,"Tax account",f.length>1?"s":""),o("td",null,h))]}}