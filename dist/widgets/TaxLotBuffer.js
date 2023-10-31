/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{subclass as i,property as r}from"@arcgis/core/core/accessorSupport/decorators";import o from"@arcgis/core/widgets/Widget";import{tsx as s}from"@arcgis/core/widgets/support/widget";import a from"@arcgis/core/layers/GraphicsLayer";import{SimpleFillSymbol as c}from"@arcgis/core/symbols";import l from"@arcgis/core/Graphic";import{geodesicBuffer as n}from"@arcgis/core/geometry/geometryEngine";import{unparse as d}from"papaparse";const u="cov-widgets--tax-lot-buffer_content";let f=class extends o{constructor(e){super(e),this._bufferSymbol=new c({color:[0,0,0,0],outline:{color:[255,222,62],width:2,style:"short-dash"}}),this._distance=0,this._featureSymbol=new c({color:[20,158,206,.1],outline:{color:[20,158,206],width:1.5}}),this._graphics=new a({listMode:"hide"}),this._id="",this._results=[],this._resultSymbol=new c({color:[237,81,81,.1],outline:{color:[237,81,81],width:1.5}}),this._viewState="ready"}postInitialize(){return e(this,void 0,void 0,(function*(){const{view:{map:e},_graphics:t}=this;e.add(t),this.addHandles(this.watch(["_viewState","_visible","_selectedFeature"],(()=>{const{_viewState:e,_visible:t,_selectedFeature:i}=this;"buffered"!==e&&(this._viewState=t&&i?"selected":"ready")})))}))}onHide(){this._clear()}_clear(){const{view:{popup:e},_graphics:t}=this;e.clear&&"function"==typeof e.clear&&e.clear(),e.close(),this._viewState="ready",t.removeAll()}_buffer(t){var i;return e(this,void 0,void 0,(function*(){const{view:e,view:{spatialReference:r},layer:o,layer:{objectIdField:s},_selectedFeature:a,_graphics:c,_bufferSymbol:d,_featureSymbol:u,_resultSymbol:f}=this;t.preventDefault(),this._viewState="buffering";const h=yield o.queryFeatures({objectIds:[a.attributes[s]],outFields:[s,"TAXLOT_ID"],returnGeometry:!0,outSpatialReference:r});if(!h.features&&!h.features[0])return void(this._viewState="error");const{geometry:p,attributes:m}=h.features[0];this._distance=parseInt((null===(i=t.target.querySelector("calcite-input-number"))||void 0===i?void 0:i.value)||"10"),this._id=m.TAXLOT_ID;const _=n(p,this._distance,"feet"),b=yield o.queryFeatures({where:`${s} <> ${m[s]}`,geometry:_,outFields:["*"],returnGeometry:!0,outSpatialReference:r});b.features?(this._results=b.features,b.features.forEach((e=>{e.symbol=f,c.add(e)})),c.add(new l({geometry:p,symbol:u})),c.add(new l({geometry:_,symbol:d})),e.closePopup(),e.goTo(this._results),this._viewState="buffered"):this._viewState="error"}))}_download(){const{_id:e,_distance:t,_results:i}=this;if(!i.length)return;const r=i.map((e=>{const{attributes:t}=e,i=t.ACCOUNT_IDS.split(",").map((e=>`https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${e}&QueryYear=2023&Roll=R`));return{"Tax Lot":t.TAXLOT_ID,Owner:t.OWNER,Address:t.ADDRESS,Account:i[0]||" "}})),o=Object.assign(document.createElement("a"),{href:`data:text/csv;charset=utf-8,${encodeURIComponent(d(r))}`,download:`${e}_${t}_buffer_results.csv`,style:{display:"none"}});document.body.appendChild(o),o.click(),document.body.removeChild(o)}render(){const{id:e,_viewState:t,_distance:i,_id:r,_results:o}=this,a=`buffer_form_${e}`;return s("calcite-panel",{heading:"Tax Lot Buffer"},s("div",{class:u,hidden:"ready"!==t},s("calcite-notice",{icon:"cursor-click",open:""},s("div",{slot:"message"},"Select a tax lot in the map to buffer."))),s("div",{class:u,hidden:"selected"!==t},s("form",{id:a,onsubmit:this._buffer.bind(this)},s("calcite-label",{style:"--calcite-label-margin-bottom: 0;"},"Distance",s("calcite-input-number",{min:"10",max:"5000",step:"10","suffix-text":"feet",value:"250"})))),s("calcite-button",{form:a,hidden:"selected"!==t,slot:"selected"===t?"footer":null,type:"submit",width:"full"},"Buffer"),s("div",{class:u,hidden:"buffering"!==t},s("calcite-progress",{text:"Buffering",type:"indeterminate"})),s("div",{class:u,hidden:"buffered"!==t},s("calcite-notice",{icon:"information",open:""},s("div",{slot:"title"},r),s("div",{slot:"message"},o.length," tax lots within ",i," feet."))),s("calcite-button",{appearance:"outline",hidden:"buffered"!==t,slot:"buffered"===t?"footer":null,width:"full",onclick:this._clear.bind(this)},"Clear"),s("calcite-button",{hidden:"buffered"!==t,"icon-start":"file-csv",slot:"buffered"===t?"footer":null,width:"full",onclick:this._download.bind(this)},"Download"),s("div",{class:u,hidden:"error"!==t},s("calcite-notice",{icon:"exclamation-mark-circle",kind:"danger",open:""},s("div",{slot:"message"},"An error has occurred."),s("calcite-link",{slot:"link",onclick:this._clear.bind(this)},"Try again"))))}};t([r({aliasOf:"view.popup.selectedFeature"})],f.prototype,"_selectedFeature",void 0),t([r()],f.prototype,"_viewState",void 0),t([r({aliasOf:"view.popup.visible"})],f.prototype,"_visible",void 0),f=t([i("cov.widgets.TaxLotBuffer")],f);export default f;