/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as e}from"tslib";import{subclass as t}from"@arcgis/core/core/accessorSupport/decorators";import i from"@arcgis/core/widgets/Widget";import{tsx as o}from"@arcgis/core/widgets/support/widget";let r=class extends i{constructor(e){super(e),this.container=document.createElement("calcite-modal"),document.body.append(this.container)}render(){return o("calcite-modal",{"close-button-disabled":"","escape-disabled":"","focus-trap-disabled":"","outside-close-disabled":"",width:"s"},o("div",{slot:"header"},"Warning"),o("div",{slot:"content"},"The selected geometry has a large number of vertices. Adding the vertices may result in the application becoming unstable or crashing. Continue with adding vertices?"),o("calcite-button",{slot:"secondary",width:"full",appearance:"outline",onclick:()=>{this.emit("confirmed",!1),this.container.open=!1}},"Cancel"),o("calcite-button",{slot:"primary",width:"full",onclick:()=>{this.emit("confirmed",!0),this.container.open=!1}},"Ok"))}};r=e([t("cov.widgets.Markup.ConfirmVerticesModal")],r);export default r;