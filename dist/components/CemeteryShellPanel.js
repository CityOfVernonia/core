/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{subclass as i,property as o}from"@arcgis/core/core/accessorSupport/decorators";import r from"@arcgis/core/widgets/Widget";import{tsx as s}from"@arcgis/core/widgets/support/widget";import l from"@arcgis/core/core/Collection";import a from"@arcgis/core/Graphic";import{SimpleFillSymbol as n}from"@arcgis/core/symbols";import{referenceElement as c}from"./support";import{DateTime as d}from"luxon";const h=d.DATE_SHORT,u="cov--cemetery-shell-panel",p={plots:`${u}_plots`,print:`${u}_print`,search:`${u}_search`,spacing:`${u}_spacing`};let m=0,_=1,f=class extends r{constructor(e){super(e),this._abortController=null,this._infos=new l,this._plotId="",this._printResults=new l,this._results=new l,this._symbol=new n({color:[0,0,0,0],outline:{color:[255,0,0],width:1.5}}),this._viewState="search"}postInitialize(){return e(this,void 0,void 0,(function*(){const{plots:t,view:i}=this;yield this.view.when(),this.addHandles(i.on("click",(i=>e(this,void 0,void 0,(function*(){const e=(yield t.queryFeatures({geometry:i.mapPoint,outFields:["PLOT_ID"],returnGeometry:!1})).features[0];e?this._plotInfo(e.attributes.PLOT_ID):this._clearPlot()})))))}))}_abort(){const{_abortController:e}=this;e&&(e.abort(),this._abortController=null)}_clearPlot(){const{view:e}=this;this._infos.removeAll(),this._plotId="",e.graphics.removeAll()}_burialDates(e){const{attributes:{DOB:t,DOD:i,DOI:o}}=e;return{dob:t?d.fromMillis(t,{zone:"utc"}).toLocaleString(h):"Unknown",dod:i?d.fromMillis(i,{zone:"utc"}).toLocaleString(h):"Unknown",doi:o?d.fromMillis(o,{zone:"utc"}).toLocaleString(h):"Unknown"}}_plotInfo(t){return e(this,void 0,void 0,(function*(){var e;const{burials:i,plots:o,reservations:r,_infos:l,_symbol:n,view:c}=this;this._clearPlot();const d=`PLOT_ID = '${t}'`;try{const h=(yield o.queryFeatures({where:d,outFields:["STATUS"],returnGeometry:!0})).features[0];if(!h)return;switch(h.attributes.STATUS){case"AVAILABLE":l.add(s("calcite-notice",{key:m++,open:!0,scale:"s"},s("div",{slot:"title"},"Available"),s("div",{slot:"message"},"Plot ",t," is available for purchase.")));break;case"RESTRICTED":l.add(s("calcite-notice",{key:m++,open:!0,scale:"s"},s("div",{slot:"title"},"Restricted"),s("div",{slot:"message"},"Plot ",t," is restricted.")));break;case"RESERVED":{const e=(yield r.queryFeatures({where:d,outFields:["OWNER_NAME"]})).features[0];console.log(e),l.add(s("calcite-notice",{key:m++,open:!0,scale:"s"},s("div",{slot:"title"},"Reserved"),s("div",{slot:"message"},"Plot ",t," is reserved un the name ",s("i",null,e.attributes.OWNER_NAME),". The legal rights of this plot may or may not be with this person(s). Please contact City Hall at"," ",s("calcite-link",{href:"tel:+1-503-429-5291"},"503.429.5291")," for mor information.")));break}case"OCCUPIED":(yield i.queryFeatures({where:d,orderByFields:["DOD DESC"],outFields:["*"]})).features.forEach((e=>{const{attributes:{FULL_NAME:t,BURIAL_ID:i,VETERAN:o}}=e,{dob:r,dod:a,doi:n}=this._burialDates(e);l.add(s("calcite-notice",{key:m++,open:!0,scale:"s"},s("div",{slot:"title"},t),s("div",{slot:"message"},"Born: ",r,s("br",null),"Died: ",a,s("br",null),"Interred: ",n,s("br",null),"Veteran: ","YES"===o?"Yes":"No",s("br",null),"Burial id: ",i)))}));break}const u=h.geometry;if(u){const t=new a({geometry:u.clone(),symbol:n.clone()});c.graphics.add(t),c.goTo(null===(e=u.extent)||void 0===e?void 0:e.expand(3))}this._plotId=t,this._setState("info")}catch(e){console.log(e)}}))}_print(){return e(this,void 0,void 0,(function*(){this._printer||(this._printer=new((yield import("@arcgis/core/widgets/Print/PrintViewModel")).default)({printServiceUrl:this.printServiceUrl,view:this.view}),this._printTemplate=new((yield import("@arcgis/core/rest/support/PrintTemplate")).default)({format:"pdf",layout:"Vernonia Memorial Cemetery"}));const{_printer:t,_printResults:i,_printTemplate:o}=this;i.add(s("calcite-button",{appearance:"outline",disabled:!0,key:m++,loading:!0,afterCreate:i=>e(this,void 0,void 0,(function*(){try{const e=yield t.print(o);i.disabled=!1,i.loading=!1,i.iconStart="download",i.addEventListener("click",(()=>{window.open(e.url,"_blank")}))}catch(e){console.log(e),i.loading=!1,i.kind="danger",i.iconStart="exclamation-mark-triangle"}}))},"Print (",_++,")"))}))}_search(){return e(this,void 0,void 0,(function*(){const{burials:e,reservations:t,_input:i,_results:o,_segmentedControl:r}=this,l=i.value,a=r.selectedItem.value;if(this._abort(),!l||l.length<3)return void o.removeAll();const n=new AbortController,{signal:c}=n;this._abortController=n;try{if("burials"===a){const t=(yield e.queryFeatures({where:`(LOWER(FULL_NAME) like '%${l.toLowerCase()}%')`,outFields:["*"],orderByFields:["DOD DESC"],returnGeometry:!1},{signal:c})).features;o.removeAll(),t.forEach((e=>{const{attributes:{FULL_NAME:t,PLOT_ID:i}}=e,{dod:r}=this._burialDates(e),l={feature:e,element:s("calcite-list-item",{description:`${r} (${i})`,key:m++,label:t,onclick:this._plotInfo.bind(this,i)})};o.add(l)}))}else{const e=(yield t.queryFeatures({where:`(LOWER(OWNER_NAME) like '%${l.toLowerCase()}%')`,outFields:["OWNER_NAME","PLOT_ID"],returnGeometry:!1},{signal:c})).features;o.removeAll(),e.forEach((e=>{const{attributes:{OWNER_NAME:t,PLOT_ID:i}}=e,r={feature:e,element:s("calcite-list-item",{description:i,key:m++,label:t,onclick:this._plotInfo.bind(this,i)})};o.add(r)}))}}catch(e){e.message||"Aborted"===e.message||console.log(e),this._abort()}}))}_setState(e){this._viewState=e}render(){const{_infos:e,_plotId:t,_printResults:i,_results:o,_viewState:r}=this;return s("calcite-shell-panel",{class:this.classes(u,"search"!==r?p.spacing:null)},s("calcite-action-bar",{slot:"action-bar"},s("calcite-action",{active:"search"===r,icon:"search",text:"Burial Search",afterCreate:this._actionAfterCreate.bind(this,"search")}),s("calcite-tooltip",{"close-on-click":"",afterCreate:c.bind(this)},"Burial Search"),s("calcite-action",{active:"info"===r,icon:"information",text:"Plot Info",afterCreate:this._actionAfterCreate.bind(this,"info")}),s("calcite-tooltip",{"close-on-click":"",afterCreate:c.bind(this)},"Plot Info"),s("calcite-action",{active:"print"===r,icon:"print",text:"Print",afterCreate:this._actionAfterCreate.bind(this,"print")}),s("calcite-tooltip",{"close-on-click":"",afterCreate:c.bind(this)},"Print")),s("calcite-panel",{heading:"Burial Search",hidden:"search"!==r},s("div",{class:p.search},s("calcite-label",null,s("calcite-input",{clearable:!0,placeholder:"Search by name",afterCreate:this._inputAfterCreate.bind(this)})),s("calcite-label",null,s("calcite-segmented-control",{scale:"s",afterCreate:this._segmentedControlAfterCreate.bind(this)},s("calcite-segmented-control-item",{value:"burials",checked:!0},"Burials"),s("calcite-segmented-control-item",{value:"reservations"},"Reservations")))),s("calcite-list",null,o.toArray().map((e=>e.element)))),s("calcite-panel",{heading:t?`Plot ${t}`:"Plot Info",hidden:"info"!==r},s("div",{class:p.plots},e.length?e.toArray():s("calcite-notice",{open:!0},s("div",{slot:"message"},"Click on a plot in the map to view plot information."),s("calcite-link",{slot:"link",onclick:()=>{this._setState("search"),this._input.setFocus()}},"Burial Search")))),s("calcite-panel",{heading:"Print",hidden:"print"!==r},s("div",{class:p.print},s("calcite-notice",{open:!0},s("div",{slot:"message"},"To print a downloadable PDF, position the map to the area you wish to print.")),s("calcite-button",{width:"full",onclick:this._print.bind(this)},"Print"),i.toArray())))}_actionAfterCreate(e,t){t.addEventListener("click",this._setState.bind(this,e))}_inputAfterCreate(e){this._input=e,e.addEventListener("calciteInputInput",this._search.bind(this))}_segmentedControlAfterCreate(e){this._segmentedControl=e,e.addEventListener("calciteSegmentedControlChange",(()=>{const{_input:e,_results:t}=this;t.removeAll(),e.value="",e.setFocus()}))}};t([o()],f.prototype,"_plotId",void 0),t([o()],f.prototype,"_viewState",void 0),f=t([i("cov.components.CemeteryShellPanel")],f);export default f;