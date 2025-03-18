/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as e}from"tslib";import{subclass as r}from"@arcgis/core/core/accessorSupport/decorators";import l from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";import n from"@arcgis/core/PopupTemplate";import i from"@arcgis/core/core/Collection";let s=class extends n{constructor(){super(...arguments),this.outFields=["*"],this.title="{wsc_id} - {Address}",this.content=t=>new a({graphic:t.graphic}).container}};s=e([r("cov.popups.TaxLotPopupTemplate")],s);export default s;class a extends l{get container(){return this._container}set container(t){this._container=t}constructor(t){super(t),this._container=document.createElement("table"),this._rows=new i,this.graphic=t.graphic}postInitialize(){return t(this,void 0,void 0,(function*(){const{graphic:t,_rows:e}=this,r=t.attributes.Notes;try{const l=t.layer,n=t.attributes[l.objectIdField],i=yield l.queryRelatedFeatures({relationshipId:0,outFields:["*"],objectIds:[n]}),{WSC_TYPE:s,ACCT_TYPE:a,METER_SIZE_T:u,METER_SN:c,METER_REG_SN:d,METER_AGE:p,LINE_IN_MATERIAL:h,LINE_IN_SIZE:E,LINE_OUT_MATERIAL:_,LINE_OUT_SIZE:g}=i[n].features[0].attributes;e.addMany([o("tr",null,o("th",null,"Service/account type"),o("td",null,s," / ",a)),o("tr",null,o("th",null,"Meter size"),o("td",null,u,'"')),o("tr",null,o("th",null,"Serial no."),o("td",null,c)),o("tr",null,o("th",null,"Register no."),o("td",null,d||"non-radio read")),o("tr",null,o("th",null,"Meter age"),o("td",null,p," years")),o("tr",null,o("th",null,"Line in"),o("td",null,E,'" ',h)),o("tr",null,o("th",null,"Line out"),o("td",null,g,'" ',_))]),r&&e.add(o("tr",null,o("th",null,"Notes"),o("td",null,r)))}catch(t){console.log(t),e.add(o("tr",null,o("th",null,"Error"),o("td",null,"water meter information unavailable")))}}))}render(){const{_rows:t}=this;return o("table",{class:"cov--feature-table"},t.toArray())}}