/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as t}from"tslib";import{subclass as e}from"@arcgis/core/core/accessorSupport/decorators";import r from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";let i=class extends r{constructor(t){super(t),this.container=document.createElement("calcite-modal"),this.content="His name was Bruce McNair.",this.header="Alert",this.primaryButtonText="Ok";const{container:e}=this;document.body.append(e),e.addEventListener("calciteModalClose",(()=>{this.emit("alerted")}))}showAlert(t){const{container:e}=this;if(t){const{content:e,header:r,kind:o,primaryButtonText:i}=t;this.content=e,this.header=r,o&&(this.kind=o),i&&(this.primaryButtonText=i),this.renderNow()}e.open=!0}render(){const{container:t,content:e,header:r,kind:i,primaryButtonText:n}=this;return o("calcite-modal",{kind:i||null,"width-scale":"s"},o("div",{slot:"header"},r),o("div",{slot:"content"},e),o("calcite-button",{slot:"primary",width:"full",onclick:()=>{t.open=!1}},n))}};i=t([e("cov.modals.AlertModal")],i);export default i;