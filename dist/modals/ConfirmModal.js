/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as t}from"tslib";import{subclass as e}from"@arcgis/core/core/accessorSupport/decorators";import o from"@arcgis/core/widgets/Widget";import{tsx as i}from"@arcgis/core/widgets/support/widget";let n=class extends o{constructor(t){super(t),this.container=document.createElement("calcite-modal"),this.content="Proceed to be awesome?",this.header="Confirm",this.primaryButtonText="Ok",this.secondaryButtonText="Cancel",document.body.append(this.container)}showConfirm(t){const{container:e}=this;if(t){const{content:e,header:o,kind:i,primaryButtonText:n,secondaryButtonText:r}=t;this.content=e,this.header=o,i&&(this.kind=i),n&&(this.primaryButtonText=n),r&&(this.secondaryButtonText=r),this.renderNow()}e.open=!0}render(){const{container:t,content:e,header:o,kind:n,primaryButtonText:r,secondaryButtonText:c}=this;return i("calcite-modal",{"close-button-disabled":"","escape-disabled":"",kind:n||null,"outside-close-disabled":"","width-scale":"s"},i("div",{slot:"header"},o),i("div",{slot:"content"},e),i("calcite-button",{slot:"primary",width:"full",onclick:()=>{t.open=!1,this.emit("confirmed",!0)}},r),i("calcite-button",{appearance:"outline",slot:"secondary",width:"full",onclick:()=>{t.open=!1,this.emit("confirmed",!1)}},c))}};n=t([e("cov.modals.ConfirmModal")],n);export default n;