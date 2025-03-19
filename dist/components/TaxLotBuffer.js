/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as e}from"tslib";import{watch as i}from"@arcgis/core/core/reactiveUtils";import{property as s,subclass as r}from"@arcgis/core/core/accessorSupport/decorators";import o from"@arcgis/core/widgets/Widget";import{tsx as a}from"@arcgis/core/widgets/support/widget";import l from"@arcgis/core/Graphic";import{SimpleFillSymbol as c}from"@arcgis/core/symbols";import{load as n,isLoaded as d,execute as u}from"@arcgis/core/geometry/operators/geodesicBufferOperator";import{propertyInfoUrl as p}from"./../support/taxLotUtils";import{unparse as h}from"papaparse";const _="cov--tax-lot-buffer",f={background:`${_}_background`,buffering:`${_}_buffering`};let b=class extends o{constructor(t){super(t),this._distance=250,this._results=[],this._symbols={buffer:new c({color:[0,0,0,0],outline:{color:[255,222,62],width:2,style:"short-dash"}}),results:new c({color:[237,81,81,.1],outline:{color:[237,81,81],width:1.5}}),taxLot:new c({color:[20,158,206,.1],outline:{color:[20,158,206],width:1.5}})},this._taxLotId="",this._viewState="ready"}postInitialize(){this.addHandles([i((()=>this._popupVisible),this._setState.bind(this)),i((()=>this._selectedFeature),this._setState.bind(this)),i((()=>this._viewState),this._setState.bind(this)),i((()=>this.visible),(t=>{t||this._clear()}))])}_buffer(e){return t(this,void 0,void 0,(function*(){e.preventDefault();const{taxLots:t,taxLots:{objectIdField:i},view:s,view:{spatialReference:r},_distance:o,_selectedFeature:a,_symbols:c}=this;if(!this._taxLotSelected())return void(this._viewState="error");this._viewState="buffering",this._graphics||(yield this._loadLayer());const{_graphics:p}=this;try{const e=(yield t.queryFeatures({where:`${i} = ${a.attributes[i]}`,returnGeometry:!0,outSpatialReference:r})).features[0];if(!e)return void(this._viewState="error");this._taxLotId=e.attributes.TAXLOT_ID,d()||(yield n());const h=u(e.geometry,o,{unit:"feet"}),_=(yield t.queryFeatures({where:`${i} <> ${a.attributes[i]}`,geometry:h,returnGeometry:!0,outFields:["*"],outSpatialReference:r})).features;s.closePopup(),this._results=_.map((t=>{const{_symbols:e}=this;return t.symbol=e.results.clone(),t.popupTemplate=null,p.add(t),t})),p.add(new l({geometry:e.geometry,symbol:c.taxLot.clone(),popupTemplate:null})),p.add(new l({geometry:h,symbol:c.buffer.clone(),popupTemplate:null})),s.goTo(p.graphics),setTimeout((()=>{this._viewState="results"}),1e3)}catch(t){console.log(t),this._viewState="error"}}))}_clear(){const{_graphics:t}=this;t&&t.removeAll(),this._results=[],this._viewState="ready"}_download(e){return t(this,void 0,void 0,(function*(){const{_distance:t,taxLots:i,taxLots:{objectIdField:s},_results:r,_taxLotId:o}=this,a=e.target;if(r.length){a.loading=!0,a.disabled=!0;try{const e=yield i.queryRelatedFeatures({objectIds:r.map((t=>t.attributes[s])),outFields:["M_ADDRESS","M_CITY","M_STATE","M_ZIP"],relationshipId:0}),l=r.map((t=>{var i;const{TAXLOT_ID:r,ACCELA_MT:o,ACCOUNT_IDS:a,TAXMAP:l,ADDRESS:c,ACRES:n}=t.attributes,d=t.attributes[s],u=a?a.split(",").map((t=>p(t)))[0]:"NO ACCOUNT",h={TAXLOT_ID:r,ACCELA_MT:o,ACCOUNT_IDS:a||"UNKNOWN",TAXMAP:l,ADDRESS:c,ACRES:n,ACCOUNT_LINK:u||"",M_ADDRESS:"",M_CITY:"",M_STATE:"",M_ZIP:""},_=null===(i=e[d])||void 0===i?void 0:i.features[0];if(_){const{M_ADDRESS:t,M_CITY:e,M_STATE:i,M_ZIP:s}=_.attributes;return Object.assign(h,{M_ADDRESS:t,M_CITY:e,M_STATE:i,M_ZIP:s})}return h}));Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(h(l))}`,download:`${o}_${t}_buffer_results.csv`,style:{display:"none"}}).click(),a.loading=!1,a.disabled=!1}catch(t){console.log(t),a.loading=!1,a.disabled=!1,this._viewState="error"}}}))}_loadLayer(){return t(this,void 0,void 0,(function*(){const{view:t}=this;this._graphics=new((yield import("@arcgis/core/layers/GraphicsLayer")).default)({listMode:"hide"}),t.map.add(this._graphics)}))}_setState(){const{_popupVisible:t,_viewState:e}=this;"results"!==e&&"buffering"!==e&&"error"!==e&&(this._viewState=t&&this._taxLotSelected()?"selected":"ready")}_taxLotSelected(){const{taxLots:t,_selectedFeature:e}=this;return e&&e.layer===t}render(){const{_distance:t,_results:{length:e},_viewState:i}=this;return a("calcite-panel",{heading:"Tax Lot Buffer",class:this.classes(_,"buffering"===i||"selected"===i?f.background:null)},"ready"===i?a("calcite-notice",{icon:"cursor-click",kind:"brand",open:!0,style:"width: 100%;"},a("div",{slot:"message"},"Select a tax lot in the map to buffer.")):null,"selected"===i?[a("form",{onsubmit:this._buffer.bind(this)},a("calcite-label",{style:"--calcite-label-margin-bottom: 0;"},"Distance",a("calcite-input-number",{min:"10",max:"5000",step:"10","suffix-text":"feet",value:"250",afterCreate:this._inputAfterCreate.bind(this)}))),a("calcite-button",{slot:"footer",width:"full",onclick:this._buffer.bind(this)},"Buffer")]:null,"buffering"===i?a("div",{class:f.buffering},a("calcite-progress",{text:"Buffering tax lot",type:"indeterminate"})):null,"results"===i?[a("calcite-notice",{icon:"information",kind:"brand",open:!0,style:"width: 100%;"},a("div",{slot:"message"},e," tax lots within ",t," feet.")),a("calcite-button",{appearance:"outline",slot:"footer",width:"half",onclick:this._clear.bind(this)},"Clear"),a("calcite-button",{"icon-start":"file-csv",slot:"footer",width:"half",onclick:this._download.bind(this)},"Download")]:null,"error"===i?a("calcite-notice",{icon:"exclamation-mark-circle",kind:"danger",open:!0,style:"width: 100%;"},a("div",{slot:"message"},"An error occurred."),a("calcite-link",{slot:"link",onclick:this._clear.bind(this)},"Try again")):null)}_inputAfterCreate(t){t.addEventListener("calciteInputNumberInput",(()=>{this._distance=Number(t.value)}))}};e([s({aliasOf:"view.popup.visible"})],b.prototype,"_popupVisible",void 0),e([s({aliasOf:"view.popup.selectedFeature"})],b.prototype,"_selectedFeature",void 0),e([s()],b.prototype,"_viewState",void 0),b=e([r("cov.components.TaxLotBuffer")],b);export default b;