/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as e}from"tslib";import{subclass as i,property as o}from"@arcgis/core/core/accessorSupport/decorators";import a from"@arcgis/core/widgets/Widget";import{tsx as n}from"@arcgis/core/widgets/support/widget";import s from"@arcgis/core/core/Collection";import r from"@arcgis/core/widgets/Print/PrintViewModel";import l from"@arcgis/core/rest/support/PrintTemplate";import c from"./PhotoDialog";const p="cov-panels--print-snapshot_content",d="cov-panels--print-snapshot_footer",h="cov-panels--print-snapshot_snapshot-result",u="Map Print",g="Map Snapshot";let m=0,v=class extends a{get container(){return this._container}set container(t){this._container=t}constructor(t){super(t),this.layouts={"Letter ANSI A Landscape":"Letter Landscape","Letter ANSI A Portrait":"Letter Portrait","Tabloid ANSI B Landscape":"Tabloid Landscape","Tabloid ANSI B Portrait":"Tabloid Portrait"},this.printServiceUrl="https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",this._viewState="print",this._printResults=new s,this._snapshotResults=new s,this._photoDialog=new c}postInitialize(){return t(this,void 0,void 0,(function*(){const{printServiceUrl:t,view:e}=this;this._printer=new r({printServiceUrl:t,view:e})}))}_print(){const{container:e,_printer:i,_printResults:o}=this,a=e.querySelector('[data-print-snapshot="print title"]').value||u,s=e.querySelector('[data-print-snapshot="print layout"]').selectedOption.value;o.add(n("calcite-button",{key:m++,appearance:"outline-fill",disabled:"",loading:"",width:"full",afterCreate:e=>t(this,void 0,void 0,(function*(){try{const t=yield i.print(new l({format:"pdf",layout:s,layoutOptions:{titleText:a,scalebarUnit:"Feet"}}));e.disabled=!1,e.loading=!1,e.addEventListener("click",(()=>{window.open(t.url,"_blank")}))}catch(t){console.log(t),e.loading=!1,e.kind="danger",e.iconStart="exclamation-mark-triangle"}}))},a))}_snapshot(){return t(this,void 0,void 0,(function*(){const{container:t,view:e,_snapshotResults:i,_photoDialog:o}=this,a=t.querySelector('[data-print-snapshot="snapshot title"]').value||u,s=t.querySelector('[data-print-snapshot="snapshot format"]').value,r=`${a}.${s}`,l=(yield e.takeScreenshot({format:s})).data,c=this._dataUrl(l,a,s);i.add(n("div",{key:m++,class:h,style:`background-image: url(${c});`},n("calcite-action",{icon:"image",text:"View",onclick:o.show.bind(o,r,c)}),n("calcite-action",{icon:"download",text:"Download",onclick:o.download.bind(o,r,c)})))}))}_dataUrl(t,e,i){const o=document.createElement("canvas"),a=o.getContext("2d");return o.width=t.width,o.height=t.height,a.putImageData(t,0,0),a.font="bold 20px Arial",a.strokeStyle="#fff",a.strokeText(`${e}`,5,t.height-5,t.width-5),a.font="bold 20px Arial",a.fillStyle="#000",a.fillText(`${e}`,5,t.height-5,t.width-5),o.toDataURL("jpg"===i?"image/jpeg":"image/png")}render(){const{_printResults:t,_snapshotResults:e,_viewState:i}=this;return n("calcite-panel",{heading:"print"===i?"Print":"Snapshot"},n("calcite-action",{active:"print"===i,icon:"print",slot:"header-actions-end",text:"Print",onclick:()=>{this._viewState="print"}},n("calcite-tooltip",{"close-on-click":"",label:"Print",placement:"bottom",slot:"tooltip"},"Print")),n("calcite-action",{active:"snapshot"===i,icon:"image",slot:"header-actions-end",text:"Snapshot",onclick:()=>{this._viewState="snapshot"}},n("calcite-tooltip",{"close-on-click":"",label:"Snapshot",placement:"bottom",slot:"tooltip"},"Snapshot")),n("div",{class:p,hidden:"print"!==i},n("calcite-label",null,"Title",n("calcite-input",{"data-print-snapshot":"print title",type:"text",value:u})),n("calcite-label",{style:"--calcite-label-margin-bottom:0;"},"Layout",n("calcite-select",{"data-print-snapshot":"print layout"},this._renderLayoutOptions()))),n("div",{class:d,hidden:"print"!==i,slot:"print"===i?"footer":null},n("calcite-button",{width:"full",onclick:this._print.bind(this)},"Print"),t.toArray()),n("div",{class:p,hidden:"snapshot"!==i},n("calcite-label",null,"Title",n("calcite-input",{"data-print-snapshot":"snapshot title",type:"text",value:g})),n("calcite-label",{style:"--calcite-label-margin-bottom:0;"},"Format",n("calcite-segmented-control",{"data-print-snapshot":"snapshot format"},n("calcite-segmented-control-item",{value:"jpg",checked:!0},"JPG"),n("calcite-segmented-control-item",{value:"png"},"PNG")))),n("div",{class:d,hidden:"snapshot"!==i,slot:"snapshot"===i?"footer":null},n("calcite-button",{width:"full",onclick:this._snapshot.bind(this)},"Snapshot"),e.toArray()))}_renderLayoutOptions(){const{layouts:t}=this,e=[];for(const i in t)e.push(n("calcite-option",{label:t[i],value:i}));return e}};e([o()],v.prototype,"_viewState",void 0),v=e([i("cov.components.PrintSnapshot")],v);export default v;