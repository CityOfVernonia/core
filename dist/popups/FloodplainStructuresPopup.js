/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as t}from"tslib";import{subclass as e,property as l}from"@arcgis/core/core/accessorSupport/decorators";import r from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";import n from"@arcgis/core/PopupTemplate";export default new n({outFields:["*"],title:"{address}",content:t=>{const e=document.createElement("div");return new i({graphic:t.graphic,container:e}),e}});let i=class extends r{constructor(t){super(t)}_formatElevation(t){return t>0?`${t}'`:"unknown"}render(){return o("div",null,this._renderNotice(),this._renderTable())}_renderNotice(){const{graphic:{attributes:t}}=this;switch(t.t9_5_compliance){case"Yes":return o("calcite-notice",{style:"margin-bottom: 0.5rem;",icon:"check-circle",kind:"brand",scale:"s",open:!0},o("div",{slot:"message"},"This structure complies with Title 9 Chapter 5."));case"No":return o("calcite-notice",{style:"margin-bottom: 0.5rem;",icon:"exclamation-mark-triangle",kind:"danger",scale:"s",open:!0},o("div",{slot:"message"},"This structure does not comply with Title 9 Chapter 5. Notify the floodplain administrator before processing any building or development application."));default:return o("calcite-notice",{style:"margin-bottom: 0.5rem;",icon:"question",kind:"warning",scale:"s",open:!0},o("div",{slot:"message"},"It is unknown whether this structure complies with Title 9 Chapter 5. Notify the floodplain administrator before processing any building or development application."))}}_renderTable(){const{graphic:{attributes:{type:t,flood_zone:e,year_built:l,elevated:r,year_elevated:n,ground_elev:i,bfe_elev:a,hfor_elev:s,floor_elev:c,notes:u}}}=this;return o("table",{class:"esri-widget__table"},o("tr",null,o("th",null,"Structure type"),o("td",null,t)),o("tr",null,o("th",null,"Flood zone"),o("td",null,e)),o("tr",null,o("th",null,"Year built"),o("td",null,l)),o("tr",null,o("th",null,"Elevated"),o("td",null,"Yes"===r?`${r} (${n})`:r)),o("tr",null,o("th",null,"Ground elevation"),o("td",null,this._formatElevation(i))),o("tr",null,o("th",null,"Base flood elevation"),o("td",null,this._formatElevation(a))),o("tr",null,o("th",null,"Highest flood of record"),o("td",null,this._formatElevation(s))),o("tr",null,o("th",null,"Floor elevation"),o("td",null,this._formatElevation(c))),u?o("tr",null,o("td",{colspan:"2"},"Note: ",u)):null)}};t([l()],i.prototype,"graphic",void 0),i=t([e("FloodplainStructure")],i);