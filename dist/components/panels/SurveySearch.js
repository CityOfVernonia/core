/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{subclass as l,property as i}from"@arcgis/core/core/accessorSupport/decorators";import s from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";import r from"@arcgis/core/core/Collection";import{geodesicBuffer as n}from"@arcgis/core/geometry/geometryEngine";import c from"@arcgis/core/layers/GraphicsLayer";import a from"@arcgis/core/layers/GeoJSONLayer";import{SimpleFillSymbol as d}from"@arcgis/core/symbols";const u="cov-panels--survey-search_content",h="cov-panels--survey-search_content-searching",v="esri-widget__table";let p=0,_=class extends s{constructor(e){super(e),this._graphics=new c({listMode:"hide"}),this._selectedTaxLotSymbol=new d({color:[20,158,206,.5],outline:{color:[20,158,206],width:2}}),this._selectedResult=null,this._selectedSymbol=new d({color:[255,222,62,.3],outline:{color:[255,222,62],width:2}}),this._surveyInfos=new r,this._surveyInfoIndex=null,this._resultSymbol=new d({color:[237,81,81,.05],outline:{color:[237,81,81],width:1}}),this._viewState="ready"}postInitialize(){const{view:{map:e},_graphics:t}=this;e.add(t),this.addHandles([this.watch(["_viewState","_visible","_selectedTaxLot"],(()=>{const{taxLots:e,_viewState:t,_visible:l,_selectedTaxLot:i}=this;"results"!==t&&"searching"!==t&&"info"!==t&&"error"!==t&&(this._viewState=l&&i&&i.layer===e?"selected":"ready")})),this.watch("visible",(e=>{e||this._clear()}))])}_clear(){const{_graphics:e,_surveyInfos:t}=this;e.removeAll(),t.removeAll(),this._selectedResult=null,this._viewState="ready"}_search(){return e(this,void 0,void 0,(function*(){const{view:e,view:{spatialReference:t},taxLots:l,taxLots:{objectIdField:i},surveysGeoJSONUrl:s,_selectedTaxLot:r,_selectedTaxLotSymbol:c,_surveys:d,_surveyInfos:u,_resultSymbol:h,_graphics:_,_graphics:{graphics:m}}=this;if(_.removeAll(),this._viewState="searching",!d)return this._surveys=new a({url:s}),void this._search();const y=(yield l.queryFeatures({where:`${i} = ${r.attributes[i]}`,returnGeometry:!0,outSpatialReference:t})).features[0];if(y.symbol=c.clone(),m.add(y),!y)return void(this._viewState="error");const f=(yield d.queryFeatures({geometry:n(y.geometry,10,"feet"),outFields:["*"],returnGeometry:!0,outSpatialReference:t})).features;f?(e.closePopup(),f.sort(((e,t)=>e.attributes.Timestamp>t.attributes.Timestamp?-1:1)),f.forEach(((e,t)=>{const{attributes:{Client:l,Comments:i,FileDate:s,Firm:r,SurveyDate:n,SurveyType:c,Sheets:a,Subdivision:d,SurveyId:m,SurveyUrl:y}}=e;e.symbol=h.clone(),_.add(e);const f=d||m;u.add({feature:e,listItem:o("calcite-list-item",{key:p++,label:f,description:`${c} - ${n}`,afterCreate:t=>{t.addEventListener("calciteListItemSelect",this._setSelectedResult.bind(this,e))}},o("calcite-action",{icon:"information",slot:"actions-end",text:"View info",afterCreate:l=>{l.addEventListener("click",(()=>{this._setSelectedResult(e),this._surveyInfoIndex=t,this._viewState="info"}))}},o("calcite-tooltip",{"close-on-click":"","overlay-positioning":"fixed",placement:"leading",slot:"tooltip"},"Info")),o("calcite-action",{slot:"actions-end",icon:"file-pdf",text:"View PDF",afterCreate:e=>{e.addEventListener("click",(()=>{window.open(y,"_blank")}))}},o("calcite-tooltip",{"close-on-click":"","overlay-positioning":"fixed",placement:"trailing",slot:"tooltip"},"PDF"))),infoTable:o("table",{key:p++,class:v},o("tr",null,o("th",null,"Survey id"),o("td",null,o("calcite-link",{href:y,target:"_blank"},m))),o("tr",null,o("th",null,"Type"),o("td",null,c)),d?o("tr",null,o("th",null,"Name"),o("td",null,d)):null,o("tr",null,o("th",null,"Client"),o("td",null,l)),o("tr",null,o("th",null,"Firm"),o("td",null,r)),o("tr",null,o("th",null,"Date"),o("td",null,n)),o("tr",null,o("th",null,"Filed"),o("td",null,s)),o("tr",null,o("th",null,"Comments"),o("td",null,i)),o("tr",null,o("th",null,"Pages"),o("td",null,a.toString())))})})),e.goTo(_.graphics),setTimeout((()=>{this._viewState="results"}),1e3)):this._viewState="error"}))}_setSelectedResult(e){const{_selectedResult:t,_selectedSymbol:l,_resultSymbol:i,_graphics:{graphics:s}}=this;t&&(t.symbol=i.clone()),e&&(this._selectedResult=e,e.symbol=l.clone(),s.reorder(e,s.length-1))}_selectNextPrevious(e){const{_surveyInfos:t,_surveyInfoIndex:l}=this;if(null===l)return;const i="next"===e?l+1:l-1,{feature:s}=t.getItemAt(i);s&&(this._setSelectedResult(s),this._surveyInfoIndex=i)}render(){const{_viewState:e,_selectedTaxLot:t,_surveyInfos:l,_surveyInfoIndex:i}=this;return o("calcite-panel",{heading:"Survey Search"},o("div",{class:u,hidden:"ready"!==e},o("calcite-notice",{icon:"cursor-click",open:""},o("div",{slot:"message"},"Select a tax lot in the map to search for related surveys and plats."))),o("div",{class:u,hidden:"selected"!==e},t?o("calcite-notice",{icon:"search",open:""},o("div",{slot:"message"},t.attributes.TAXLOT_ID,o("br",null),t.attributes.OWNER)):null),o("calcite-button",{hidden:"selected"!==e,slot:"selected"===e?"footer":null,width:"full",onclick:this._search.bind(this)},"Search Surveys"),o("div",{class:h,hidden:"searching"!==e},o("calcite-progress",{text:"Searching related surveys",type:"indeterminate"})),o("calcite-list",{hidden:"results"!==e},l.map((e=>e.listItem)).toArray()),o("calcite-button",{appearance:"outline-fill",hidden:"results"!==e,slot:"results"===e?"footer":null,width:"full",onclick:this._clear.bind(this)},"Clear"),o("calcite-action",{disabled:null===i||0===i,hidden:"info"!==e,icon:"chevron-left",slot:"info"===e?"header-actions-end":null,text:"Previous",onclick:this._selectNextPrevious.bind(this,"previous")},o("calcite-tooltip",{"close-on-click":"",label:"Previous",placement:"bottom",slot:"tooltip"},"Previous")),o("calcite-action",{disabled:null===i||i===l.length-1,hidden:"info"!==e,icon:"chevron-right",slot:"info"===e?"header-actions-end":null,text:"Next",onclick:this._selectNextPrevious.bind(this,"next")},o("calcite-tooltip",{"close-on-click":"",label:"Next",placement:"bottom",slot:"tooltip"},"Next")),null!==i?l.getItemAt(i).infoTable:null,o("calcite-button",{appearance:"outline-fill",hidden:"info"!==e,slot:"info"===e?"footer":null,width:"full",onclick:()=>{this._setSelectedResult(),this._surveyInfoIndex=null,this._viewState="results"}},"Back"),o("div",{class:u,hidden:"error"!==e},o("calcite-notice",{icon:"exclamation-mark-circle",kind:"danger",open:""},o("div",{slot:"message"},"An error occurred searching surveys."),o("calcite-link",{onclick:this._clear.bind(this),slot:"link"},"Try again"))))}};t([i({aliasOf:"view.popup.selectedFeature"})],_.prototype,"_selectedTaxLot",void 0),t([i()],_.prototype,"_selectedResult",void 0),t([i()],_.prototype,"_surveyInfoIndex",void 0),t([i()],_.prototype,"_viewState",void 0),t([i({aliasOf:"view.popup.visible"})],_.prototype,"_visible",void 0),_=t([l("cov.panels.SurveySearch")],_);export default _;