/* His name was Bruce McNair. Copyright 2023 City of Vernonia, Oregon. */
import{__awaiter as t,__decorate as o}from"tslib";import e from"@arcgis/core/core/Accessor";import{subclass as r,property as i}from"@arcgis/core/core/accessorSupport/decorators";import n from"@arcgis/core/core/Error";import s from"@arcgis/core/identity/IdentityManager";import a from"@arcgis/core/portal/Portal";const l="jsapiauthcred";let c=class extends e{constructor(t){super(t),this.signedIn=!1}load(){const{portal:o,oAuthInfo:e}=this;return s.registerOAuthInfos([e]),new Promise(((e,r)=>{o.loaded?s.checkSignInStatus(o.url).then((t=>{this._completeSignIn(t,e)})).catch((i=>{if("User is not signed in."===i.message){const r=localStorage.getItem(l);if(r){const i=JSON.parse(r);if(!i.token)return localStorage.removeItem(l),void e(!1);s.registerToken(i),s.checkSignInStatus(o.url).then((o=>t(this,void 0,void 0,(function*(){this.portal=new a,yield this.portal.load(),this._completeSignIn(o,e)})))).catch((()=>{e(!1)}))}else e(!1)}else r(i)})):r(new n("OAuthLoadError","Portal instance must be loaded before loading OAuth instance."))}))}signIn(){const t=this.signInUrl||`${this.portal.url}/sharing/rest`;s.oAuthSignIn(t,s.findServerInfo(t),this.oAuthInfo,{oAuthPopupConfirmation:!1,signal:(new AbortController).signal}).then((()=>{window.location.reload()})).catch((()=>{}))}signOut(){s.destroyCredentials(),localStorage.removeItem(l),window.location.reload()}_completeSignIn(t,o){localStorage.setItem(l,JSON.stringify(t.toJSON())),this.credential=t,this.signedIn=!0,o(!0),t.on("token-change",(()=>{localStorage.setItem(l,JSON.stringify(this.credential.toJSON()))}))}};o([i({aliasOf:"user.fullName"})],c.prototype,"fullName",void 0),o([i({aliasOf:"user.thumbnailUrl"})],c.prototype,"thumbnailUrl",void 0),o([i({aliasOf:"portal.user"})],c.prototype,"user",void 0),o([i({aliasOf:"user.username"})],c.prototype,"username",void 0),c=o([r("OAuth")],c);export default c;