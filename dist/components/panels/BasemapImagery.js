/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{subclass as i,property as o}from"@arcgis/core/core/accessorSupport/decorators";import r from"@arcgis/core/widgets/Widget";import{tsx as a}from"@arcgis/core/widgets/support/widget";import s from"@arcgis/core/core/Collection";import l from"@arcgis/core/layers/Layer";const c="padding: 0.75rem;",n="margin-bottom: 1rem;";let p=0,d=class extends r{constructor(e){super(e),this.control="radio",this.description="Default imagery provided by Microsoft Bing Maps.",this.imageryInfos=new s,this.title="Default Imagery",this.toggleBasemap=!0,this.link="https://www.bing.com/maps",this._controls=new s}postInitialize(){return e(this,void 0,void 0,(function*(){const{basemap:e,control:t,description:i,imageryInfos:o,link:r,title:s,_controls:l}=this;yield e.when(),o.add({description:i,layer:e.baseLayers.getItemAt(0),title:s,url:r},0),o.forEach(((e,i)=>{const{title:r}=e;"radio"===t?l.add(a("calcite-label",{key:p++,layout:"inline",style:i===o.length-1?"--calcite-label-margin-bottom: 0;":null},a("calcite-radio-button",{checked:0===i,value:r}),r)):l.add(a("calcite-option",{key:p++,checked:0===i,value:r},r))}))}))}_setBasemapImagery(t){return e(this,void 0,void 0,(function*(){const{control:e,view:{map:i},basemap:{baseLayers:o},imageryInfos:r,toggleBasemap:a}=this,s=r.find((i=>{const o="radio"===e?t.target.selectedItem.value:t.target.selectedOption.value;return i.title===o})),{description:c,layer:n,link:p,title:d,url:m,properties:g}=s;if(this.title=d,this.description=c,this.link=p||m,n)o.splice(0,1,n);else{const e=yield l.fromArcGISServerUrl({url:m,properties:g||{}});s.layer=e,o.splice(0,1,e)}const y=document.getElementsByClassName("esri-basemap-toggle")[0]||void 0;i.basemap!==this.basemap&&y&&a&&y.querySelector("calcite-button").click()}))}render(){const{control:e,description:t,link:i,title:o,_controls:r}=this;return a("calcite-panel",{heading:"Basemap Imagery"},a("div",{style:c},a("calcite-notice",{icon:"information",open:"",scale:"s",style:n},a("div",{slot:"title"},o),a("div",{slot:"message"},t),a("calcite-link",{href:i,slot:"link",target:"_blank"},"More info")),"radio"===e?a("calcite-radio-button-group",{layout:"vertical",name:"imagery-layers",afterCreate:e=>{e.addEventListener("calciteRadioButtonGroupChange",this._setBasemapImagery.bind(this))}},r.toArray()):a("calcite-select",{afterCreate:e=>{e.addEventListener("calciteSelectChange",this._setBasemapImagery.bind(this))}},r.toArray())))}};t([o()],d.prototype,"description",void 0),t([o({type:s})],d.prototype,"imageryInfos",void 0),t([o()],d.prototype,"title",void 0),t([o()],d.prototype,"link",void 0),t([o()],d.prototype,"_controls",void 0),d=t([i("cov.panels.BasemapImagery")],d);export default d;