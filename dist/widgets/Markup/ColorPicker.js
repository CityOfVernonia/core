/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as o}from"tslib";import{subclass as r,property as e}from"@arcgis/core/core/accessorSupport/decorators";import t from"@arcgis/core/widgets/Widget";import{tsx as c}from"@arcgis/core/widgets/support/widget";import s from"@arcgis/core/Color";const i="cov-markup--color-picker",l="cov-markup--color-picker--color",a="cov-markup--color-picker--color--selected";let p=class extends t{constructor(o){super(o),this.colors={white:[255,255,255],black:[0,0,0],grey:[128,128,128],red:[237,81,81],blue:[20,158,206],green:[167,198,54],purple:[158,85,156],orange:[252,146,31],yellow:[255,222,62]}}render(){return c("div",{class:i},this._renderColorTiles())}_renderColorTiles(){const{colors:o}=this,r=[];for(const e in o){const[t,i,p]=o[e],d=this.color&&t===this.r&&i===this.g&&p===this.b;r.push(c("div",{class:this.classes(l,d?a:""),style:`background-color: rgba(${t}, ${i}, ${p}, 1);`,afterCreate:o=>{o.addEventListener("click",(()=>{this.color=new s({r:t,g:i,b:p})}))}}))}return r}};o([e()],p.prototype,"color",void 0),o([e({aliasOf:"color.r"})],p.prototype,"r",void 0),o([e({aliasOf:"color.g"})],p.prototype,"g",void 0),o([e({aliasOf:"color.b"})],p.prototype,"b",void 0),o([e({aliasOf:"color.a"})],p.prototype,"a",void 0),p=o([r("cov.widgets.Markup.ColorPicker")],p);export default p;