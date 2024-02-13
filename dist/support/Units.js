/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__decorate as t}from"tslib";import{subclass as e,property as n}from"@arcgis/core/core/accessorSupport/decorators";import i from"@arcgis/core/core/Accessor";import o from"@arcgis/core/core/Collection";let s=class extends i{constructor(t){if(super(t),this.areaUnitInfos=new o([{label:"acres",name:"Acres",unit:"acres"},{label:"ft²",name:"Sq feet",unit:"square-feet"},{label:"m²",name:"Sq meters",unit:"square-meters"},{label:"km²",name:"Sq kilometers",unit:"square-kilometers"},{label:"mi²",name:"Sq miles",unit:"square-miles"}]),this.coordinateUnitInfos=new o([{label:"Oregon Statewide Lambert",latestWkid:6557,name:"NAD 1983 (2011) Oregon Statewide Lambert (Intl Feet)",unit:"feet",wkid:102970}]),this.elevationUnitInfos=new o([{label:"ft",name:"Feet",unit:"feet"},{label:"m",name:"Meters",unit:"meters"}]),this.latitudeLongitudeUnitInfos=new o([{label:"dd",name:"Decimal degrees",unit:"decimal"},{label:"dms",name:"Degrees minutes seconds",unit:"dms"}]),this.lengthUnitInfos=new o([{label:"ft",name:"Feet",unit:"feet"},{label:"m",name:"Meters",unit:"meters"},{label:"mi",name:"Miles",unit:"miles"},{label:"km",name:"Kilometers",unit:"kilometers"}]),this.areaUnit=this.areaUnitInfos.getItemAt(0).unit,this.coordinateUnit=this.coordinateUnitInfos.getItemAt(0).unit,this.elevationUnit=this.elevationUnitInfos.getItemAt(0).unit,this.latitudeLongitudeUnit=this.latitudeLongitudeUnitInfos.getItemAt(0).unit,this.lengthUnit=this.lengthUnitInfos.getItemAt(0).unit,t){const{areaUnit:e,areaUnitInfos:n,coordinateUnit:i,coordinateUnitInfos:s,elevationUnit:a,elevationUnitInfos:r,latitudeLongitudeUnit:l,latitudeLongitudeUnitInfos:m,lengthUnit:u,lengthUnitInfos:d}=t;n&&(this.areaUnitInfos=new o(n)),e&&(this.areaUnit=e),s&&(this.coordinateUnitInfos=new o(s)),i&&(this.coordinateUnit=i),r&&(this.elevationUnitInfos=new o(r)),a&&(this.elevationUnit=a),m&&(this.latitudeLongitudeUnitInfos=new o(m)),l&&(this.latitudeLongitudeUnit=l),d&&(this.lengthUnitInfos=new o(d)),u&&(this.lengthUnit=u)}}getUnitLabel(t,e){const n=this[`${t}UnitInfos`].find((t=>t.unit===e));return n?n.label:""}getUnitName(t,e){const n=this[`${t}UnitInfos`].find((t=>t.unit===e));return n?n.name:""}};t([n()],s.prototype,"areaUnit",void 0),t([n()],s.prototype,"coordinateUnit",void 0),t([n()],s.prototype,"elevationUnit",void 0),t([n()],s.prototype,"latitudeLongitudeUnit",void 0),t([n()],s.prototype,"lengthUnit",void 0),s=t([e("cov.support.Units")],s);export default s;