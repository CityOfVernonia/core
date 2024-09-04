/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import o from"@arcgis/core/config";import i from"@arcgis/core/identity/IdentityManager";import{watch as n}from"@arcgis/core/core/reactiveUtils";import{subclass as l,property as a}from"@arcgis/core/core/accessorSupport/decorators";import s from"@arcgis/core/widgets/Widget";import{tsx as r}from"@arcgis/core/widgets/support/widget";import c from"@arcgis/core/core/Collection";import d from"./support/logo";import p from"./support/Loader";import h from"./../components/dialogs/Disclaimer";import m from"./support/ViewControl2D";import u from"./support/basemapToggle";import{subscribe as v}from"pubsub-js";const f="cov-layouts--map-application",g="cov-layouts--map-application_header",_="cov-layouts--map-application_header--content cov-layouts--map-application_header--title",C="cov-layouts--map-application_header--content cov-layouts--map-application_header--controls",b="cov-layouts--map-application_header--compact",w="cov-layouts--map-application_header--compact-controls",y="cov-layouts--map-application_user-control",A="cov-layouts--map-application_user-control--popover",P="cov-layouts--map-application_view";let S=0;const k="show-alert";export const showAlertTopic=()=>k;export const toggleMapNavigationTopic=()=>"toggle-map-navigation";let E=class extends s{constructor(e){super(e),this.container=document.createElement("calcite-shell"),this.disclaimerOptions={},this.headerCompact=!1,this.includeDisclaimer=!0,this.loaderOptions={},this.title="Vernonia",this.viewControlOptions={},this.loaded=!1,this._alerts=new c,this._shellPanelActionGroups=new c,this._shellPanelComponents=new c,this._visibleShellPanelComponent=null,document.body.append(this.container)}postInitialize(){return e(this,void 0,void 0,(function*(){const{disclaimerOptions:e,endShellPanelComponent:t,loaderOptions:n,nextBasemap:l,title:a,shellPanel:s,shellPanelComponentInfos:r,view:d,view:{ui:f},viewControlOptions:g}=this;let{includeDisclaimer:_}=this;const C=new p(n.title?n:Object.assign(Object.assign({},n),{title:a}));f.remove("zoom"),f.add(new m(Object.assign({view:d},g)),"top-left"),l&&u(d,l,"bottom-right"),r&&!s&&(this._addShellPanelComponents(r),t&&this._addShellPanelComponents(new c([t]),!0));try{(yield i.checkSignInStatus(o.portalUrl))&&(_=!1)}catch(e){"User is not signed in."!==e.message&&console.log(e),_=!0}_&&!h.isAccepted()&&new h(e),v(k,((e,t)=>{this._alertEvent(t)})),yield d.when(),C.end(),this.loaded=!0,this.emit("load")}))}showAlert(e){this._alertEvent(e)}showWidget(e){this._visibleShellPanelComponent=e}_addShellPanelComponents(e,t){const{_shellPanelActionGroups:o,_shellPanelComponents:i}=this;let l=[];e.forEach(((a,s)=>{const{component:c,icon:d,groupEnd:p,text:h,type:m}=a;let u;switch(c.addHandles(c.on(k,this._alertEvent.bind(this))),m){case"modal":c.container=document.createElement("calcite-modal"),document.body.append(c.container);break;case"dialog":c.container=document.createElement("calcite-dialog"),document.body.append(c.container);break;case"panel":u=r("calcite-panel",{afterCreate:e=>{c.container=e,this._shellPanelComponentEvents(c)}});break;case"flow":u=r("calcite-flow",{afterCreate:e=>{c.container=e,this._shellPanelComponentEvents(c)}})}"modal"!==m&&"dialog"!==m&&(c.visible=!1),u&&i.add(u);const v=r("calcite-action",{icon:d,text:h,afterCreate:e=>{"modal"===m||"dialog"===m?e.addEventListener("click",(()=>{c.container.open=!0})):(e.addEventListener("click",(()=>{this._visibleShellPanelComponent=this._visibleShellPanelComponent===c.id?null:c.id})),this.addHandles(n((()=>this._visibleShellPanelComponent),(t=>{e.active=t===c.id}))))}},r("calcite-tooltip",{"close-on-click":"",slot:"tooltip"},h));l.push(v),(p||s+1===e.length)&&(o.add(r("calcite-action-group",{key:S++,slot:t?"actions-end":null},l)),l=[])}))}_alertEvent(e){const{_alerts:t}=this,{duration:o,icon:i,kind:n,label:l,link:a,message:s,title:c,width:d}=e;t.add(r("calcite-alert",{key:S++,icon:i||null,kind:n||"brand",open:"",label:l,"auto-close":o?"":null,"auto-close-duration":o||null,style:d?`--calcite-alert-width: ${d}px`:null},c?r("div",{slot:"title"},c):null,r("div",{slot:"message"},s),a?r("calcite-link",{href:a.href||null,slot:"link",target:a.href?"_blank":null,onclick:e=>{e.click&&e.addEventListener("click",e.click)}},a.text):null))}_shellPanelComponentEvents(e){e.addHandles(e.on(k,this._alertEvent.bind(this))),this.addHandles(n((()=>this._visibleShellPanelComponent),((t,o)=>{e.visible=t===e.id,t===e.id&&e.onShow&&"function"==typeof e.onShow&&e.onShow(),o&&o===e.id&&e.onHide&&"function"==typeof e.onHide&&e.onHide()})))}render(){const{header:e,shellPanel:t,_alerts:o,_shellPanelActionGroups:i,_shellPanelComponents:n}=this;return r("calcite-shell",{class:f,"content-behind":""},e?r("div",{slot:"header",afterCreate:this._headerAfterCreate.bind(this)}):!1===e?null:this._defaultHeader(),r("div",{class:P,afterCreate:this._viewAfterCreate.bind(this)}),t?r("calcite-shell-panel",{"display-mode":"float",position:"end",slot:"panel-end",afterCreate:this._shellPanelAfterCreate.bind(this)}):n&&n.length?r("calcite-shell-panel",{"display-mode":"float",position:"end",slot:"panel-end"},r("calcite-action-bar",{slot:"action-bar",afterCreate:this._actionBarAfterCreate.bind(this)},i.toArray()),n.toArray()):null,r("calcite-shell-panel",{layout:"horizontal",position:"end",resizable:"",slot:"footer",style:"--calcite-shell-panel-min-height: 100px; --calcite-shell-panel-max-height: 500px;",afterCreate:this._footerAfterCreate.bind(this)}),r("div",{slot:"alerts"},o.toArray()))}_actionBarAfterCreate(e){if(!e.getAttribute("slot"))return;const{view:t}=this,o=()=>{const o=e.getBoundingClientRect().width;t.padding=Object.assign(Object.assign({},t.padding),{right:o})};o(),new ResizeObserver((()=>{o()})).observe(e)}_defaultHeader(){const{headerCompact:e,title:t}=this;return!0===e?r("div",{class:b,slot:"header"},r("div",{class:w},r("img",{src:d}),r("div",{afterCreate:this._searchAfterCreate.bind(this)}),r("div",{afterCreate:this._userControlAfterCreate.bind(this)}))):r("div",{class:g,slot:"header"},r("div",{class:_},r("img",{src:d}),r("div",null,t)),r("div",{class:C},r("div",{afterCreate:this._searchAfterCreate.bind(this)}),r("div",{afterCreate:this._userControlAfterCreate.bind(this)})))}_headerAfterCreate(e){const{header:t}=this;t&&(t.container=e)}_footerAfterCreate(e){const{footer:t}=this;t?t.container=e:e.remove()}_shellPanelAfterCreate(e){const{shellPanel:t}=this;t&&(t.container=e,setTimeout((()=>{const t=e.querySelector("calcite-action-bar");t&&this._actionBarAfterCreate(t)}),0))}_userControlAfterCreate(e){const{oAuth:t}=this;t?new x({container:e,oAuth:t}):e.remove()}_searchAfterCreate(t){return e(this,void 0,void 0,(function*(){const{searchViewModel:e,view:o}=this;e?(e.view||(e.view=o),new((yield import("@arcgis/core/widgets/Search")).default)({container:t,viewModel:e})):t.remove()}))}_viewAfterCreate(e){this.view.container=e}};t([a({type:c})],E.prototype,"shellPanelComponentInfos",void 0),t([a()],E.prototype,"_alerts",void 0),t([a()],E.prototype,"_shellPanelActionGroups",void 0),t([a()],E.prototype,"_shellPanelComponents",void 0),t([a()],E.prototype,"_visibleShellPanelComponent",void 0),E=t([l("cov.layouts.MapApplication")],E);let x=class extends s{constructor(e){super(e)}render(){const{id:e,oAuth:t,oAuth:{signedIn:o,fullName:i,username:n,thumbnailUrl:l}}=this,a=`user_control_${e}`;return o?r("div",{class:y},r("calcite-avatar",{id:a,"full-name":i,thumbnail:l,role:"button"}),r("calcite-popover",{"auto-close":"",label:"Sign out",placement:"bottom","reference-element":a,"overlay-positioning":"fixed"},r("div",{class:A},r("div",null,i),r("span",null,n),r("calcite-button",{width:"full",onclick:t.signOut.bind(t)},"Sign out")))):r("div",{class:y},r("calcite-icon",{id:a,icon:"sign-in",role:"button",onclick:t.signIn.bind(t)}),r("calcite-tooltip",{label:"Sign in",placement:"bottom","reference-element":a,"overlay-positioning":"fixed"},"Sign in"))}};x=t([l("UserControl")],x);export default E;