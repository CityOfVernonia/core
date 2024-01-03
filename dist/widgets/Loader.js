/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as e}from"tslib";import{subclass as t}from"@arcgis/core/core/accessorSupport/decorators";import o from"@arcgis/core/widgets/Widget";import{tsx as r}from"@arcgis/core/widgets/support/widget";import i,{coffeePath as s,heartPath as l}from"../support/logo";const a="cov-widgets--loader",n="cov-widgets--loader_title",c="cov-widgets--loader_info",d="cov-widgets--loader_heart",g="cov-widgets--loader_coffee";let p=class extends o{constructor(e){super(e),this.container=document.createElement("div"),this.title="Vernonia",this.copyright="City of Vernonia",this.logo=i,document.body.append(this.container)}end(){const{container:e}=this;setTimeout((()=>{e.style.opacity="0"}),3e3),setTimeout((()=>{this.destroy()}),4e3)}render(){const{title:e,copyright:t,logo:o}=this;return r("div",{class:a},r("div",{class:n},r("div",null,e),r("calcite-progress",{type:"indeterminate"})),r("div",{class:c},r("div",null,"Copyright © ",(new Date).getFullYear()," ",t),r("div",null,r("span",null,"Made with"),r("svg",{class:d,"aria-hidden":"true",focusable:"false",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},r("path",{fill:"currentColor",d:l})),r("span",null,"and"),r("svg",{class:g,"aria-hidden":"true",focusable:"false",role:"img",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 512"},r("path",{fill:"currentColor",d:s})),r("span",null,"in Vernonia, Oregon"))),o?r("img",{src:o,alt:t}):null)}};p=e([t("cov.widgets.Loader")],p);export default p;