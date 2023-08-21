/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import{__decorate as t}from"tslib";import e from"@arcgis/core/request";import{subclass as i,property as o}from"@arcgis/core/core/accessorSupport/decorators";import r from"@arcgis/core/widgets/Widget";import{tsx as s}from"@arcgis/core/widgets/support/widget";import n from"@arcgis/core/core/Collection";const c="cov-widgets--printfirmette_content",l="cov-widgets--printfirmette_switch",a="cov-widgets--printfirmette_error";let p=0,d=1,h=class extends r{constructor(t){super(t),this._listItems=new n,this._printing=!1}onShow(){const{view:t}=this;this._clickHandle=t.on("click",this._viewClick.bind(this))}onHide(){const{_clickHandle:t}=this;t&&t.remove()}_print(t){const{_listItems:i}=this,o={count:d,point:t,element:s("calcite-list-item",{key:p++,label:"Printing FIRMette",description:`${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}`},s("calcite-action",{loading:"",slot:"actions-end",icon:"file-pdf",text:"Download"}))};i.add(o),d+=1,e("https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/submitJob",{responseType:"json",query:{f:"json",FC:JSON.stringify({geometryType:"esriGeometryPoint",features:[{geometry:{x:t.x,y:t.y,spatialReference:{wkid:102100}}}],sr:{wkid:102100}}),Print_Type:"FIRMETTE",graphic:"PDF",input_lat:29.877,input_lon:-81.2837}}).then(this._printCheck.bind(this,o)).catch((t=>{console.log("submit job error",t),this._printError(o)}))}_printCheck(t,i){const o=i.data;"esriJobSubmitted"===o.jobStatus||"esriJobExecuting"===o.jobStatus?e(`https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${o.jobId}`,{responseType:"json",query:{f:"json"}}).then((e=>{setTimeout(this._printCheck.bind(this,t,e),1e3)})).catch((e=>{console.log("check job error",e),this._printError(t)})):"esriJobSucceeded"===o.jobStatus?this._printComplete(t,i):(console.log("server job error",i),this._printError(t))}_printComplete(t,i){const{_listItems:o}=this,r=i.data;e(`https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${r.jobId}/${r.results.OutputFile.paramUrl}`,{responseType:"json",query:{f:"json"}}).then((e=>{o.splice(o.indexOf(t),1,{count:t.count,point:t.point,element:s("calcite-list-item",{key:p++,label:`FIRMette ${t.count}`,description:`${t.point.latitude.toFixed(4)}, ${t.point.longitude.toFixed(4)}`},s("calcite-action",{slot:"actions-end",icon:"file-pdf",text:"Download",onclick:()=>{window.open(e.data.value.url.replace("http://","https://"),"_blank")}},s("calcite-tooltip",{"close-on-click":"",slot:"tooltip"},"Download FIRMette")))}),this._printing=!1})).catch((e=>{console.log("get job error",e),this._printError(t)}))}_printError(t){const{_listItems:e}=this;e.splice(e.indexOf(t),1,{count:t.count,point:t.point,element:s("calcite-list-item",{key:p++,label:`FIRMette ${t.count}`,description:"Print error"},s("calcite-icon",{class:a,icon:"exclamation-mark-circle",slot:"actions-end"}))}),this._printing=!1}_viewClick(t){const{_printing:e}=this;t.stopPropagation(),e||(this._printing=!0,this._print(t.mapPoint))}render(){const{_layerVisible:t,_listItems:e}=this;return s("calcite-panel",{heading:"Print FIRMette"},s("div",{class:c},s("calcite-notice",{icon:"cursor-click",open:""},s("div",{slot:"message"},"Click on the map at the location to generate a FIRMette."),s("calcite-label",{class:l,layout:"inline",slot:"link"},s("calcite-switch",{checked:t,afterCreate:this._switchAfterCreate.bind(this)}),"Flood hazard layer"))),e.length?s("calcite-list",null,e.toArray().map((t=>t.element))):null)}_switchAfterCreate(t){const{layer:e}=this;t.addEventListener("calciteSwitchChange",(()=>{e.visible=t.checked}))}};t([o({aliasOf:"layer.visible"})],h.prototype,"_layerVisible",void 0),t([o()],h.prototype,"_printing",void 0),h=t([i("cov.widgets.PrintFIRMette")],h);export default h;