/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{subclass as i,property as o}from"@arcgis/core/core/accessorSupport/decorators";import a from"@arcgis/core/widgets/Widget";import{tsx as n}from"@arcgis/core/widgets/support/widget";import l from"@arcgis/core/widgets/Sketch/SketchViewModel";import r from"@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource";import s from"@arcgis/core/layers/GroupLayer";import c from"@arcgis/core/layers/GraphicsLayer";import d from"@arcgis/core/Graphic";import p from"./../../support/Units";import{Point as h,Polyline as u}from"@arcgis/core/geometry";import*as m from"@arcgis/core/geometry/coordinateFormatter";import{geodesicArea as g,geodesicLength as v,simplify as _}from"@arcgis/core/geometry/geometryEngine";import{webMercatorToGeographic as y}from"@arcgis/core/geometry/support/webMercatorUtils";import{midpoint as f,textAngle as b,queryFeatureGeometry as S}from"./../../support/geometryUtils";import{CIMSymbol as L,SimpleFillSymbol as w,SimpleMarkerSymbol as E,TextSymbol as C}from"@arcgis/core/symbols";import U from"@arcgis/core/widgets/ElevationProfile";import x from"@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround";import M from"@arcgis/core/Color";const k="cov-panels--measure_measure-buttons",G="cov-panels--measure_notice",O="cov-panels--measure_options",$="cov-panels--measure_profile",P="cov-panels--measure_profile-options",A="cov-panels--measure_profile-statistics",D="cov-panels--measure_results",I="cov-panels--measure_results-row",z="cursor-events",H={area:0,areaGeometry:null,coordinatesGeometry:null,elevation:0,elevationGeometry:null,latitude:0,length:0,lengthGeometry:null,longitude:0,operation:"ready",perimeter:0,profileGeometry:null};let F=[237,81,81],R=[255,255,255];export const setMeasureColors=(e,t)=>{F=e,R=t};let N=class extends a{constructor(e){super(e),this.loaded=!1,this.units=new p,this._cursorElevationAbortController=null,this._cursor=new h({hasZ:!0,latitude:0,longitude:0,z:0}),this._measureState=H,this._sketch=new l({snappingOptions:{enabled:!0,featureEnabled:!0,selfEnabled:!0},updateOnGraphicClick:!1}),this._sketchHandle=null,this._sketchCoordinatesHandle=null,this._labels=new c,this._layer=new c,this._pointSymbol=new E({style:"circle",size:6,color:R,outline:{width:1,color:F}}),this._polylineSymbol=new L({data:{type:"CIMSymbolReference",symbol:{type:"CIMLineSymbol",symbolLayers:[{type:"CIMSolidStroke",effects:[{type:"CIMGeometricEffectDashes",dashTemplate:[4.75,4.75],lineDashEnding:"HalfPattern",offsetAlongLine:0}],enable:!0,capStyle:"Butt",joinStyle:"Round",width:2.25,color:[...R,255]},{type:"CIMSolidStroke",enable:!0,capStyle:"Butt",joinStyle:"Round",width:2.25,color:[...F,255]}]}}}),this._polygonSymbol=new w({color:[...F,.125],outline:{width:0}}),this._textSymbol=new C({color:F,haloColor:R,haloSize:2,horizontalAlignment:"center",verticalAlignment:"middle",font:{size:10}}),this._elevationProfile=new U({unit:"feet",visibleElements:{legend:!1,chart:!0,clearButton:!1,settingsButton:!1,sketchButton:!1,selectButton:!1,uniformChartScalingToggle:!1}}),this._elevationProfileLineGround=new x}postInitialize(){return e(this,void 0,void 0,(function*(){const{view:e,_elevationProfile:t,_elevationProfileLineGround:i,_labels:o,_layer:a,_pointSymbol:n,_polylineSymbol:l,_polygonSymbol:r,_sketch:c}=this;yield e.when(),m.load(),c.view=e,c.layer=a,c.activeVertexSymbol=n,c.vertexSymbol=n,c.activeLineSymbol=l,c.activeFillSymbol=r;const d=new s({layers:[a,o],listMode:"hide"});e.map.add(d),t.view=e,t.profiles.removeAll(),i.color=new M(F),t.profiles.add(i);const p=e.map.layers;p.forEach(this._addSnappingLayer.bind(this));const h=p.on("after-add",(e=>{this._addSnappingLayer(e.item),p.reorder(d,p.length-1)})),u=this.watch("visible",(e=>{e?this._createCursorEvents():(this._reset(),this.removeHandles(z))})),g=this.watch(["areaUnit","elevationUnit","latitudeLongitudeUnit","lengthUnit"],this._unitsChangeEvent.bind(this));this.addHandles([h,u,g]),this.loaded=!0,this.emit("load")}))}_addSnappingLayer(e){const{_snappingSources:t}=this;if("group"===e.type)return void e.layers.forEach((e=>{this._addSnappingLayer(e)}));const{id:i,listMode:o,title:a}=e;("hide"!==o&&a||i.includes("markup"))&&!0!==e.internal&&t.add(new r({layer:e}))}_createCursorEvents(){const{view:t,_cursor:i,_ground:o}=this,a=t.on("pointer-move",(e=>{const{latitude:o,longitude:a}=t.toMap(e);i.latitude=o,i.longitude=a})),n=t.on("pointer-move",(a=>e(this,void 0,void 0,(function*(){const{_cursorElevationAbortController:e,_measureState:{operation:n}}=this;e&&(e.abort(),this._cursorElevationAbortController=null);const l=new AbortController;this._cursorElevationAbortController=l;try{const{geometry:e}=yield o.queryElevation(t.toMap(a),{signal:l.signal});if(this._cursorElevationAbortController!==l)return;this._cursorElevationAbortController=null;const r=e.z;if(i.z=r,"measure-elevation"===n){const e=i.clone();this._updateMeasureState({elevation:r,elevationGeometry:e}),this._addLabels(e)}}catch(e){this._cursorElevationAbortController=null,"Aborted"!==e.message&&console.log("elevation query error",e)}}))));this.addHandles([a,n],z)}_buttonMeasureEvent(e,t){t.addEventListener("click",this._measure.bind(this,e))}_unitsChangeEvent(){const{elevationUnit:e,_elevationProfile:t,_measureState:{areaGeometry:i,coordinatesGeometry:o,elevationGeometry:a,lengthGeometry:n,operation:l}}=this;i&&this._area(i),"area"===l&&i&&this._addLabels(i),n&&this._length(n),"length"===l&&n&&this._addLabels(n),"coordinates"===l&&o&&(this._coordinates(o),this._addLabels(o)),"elevation"===l&&a&&this._addLabels(a),t.unit=e}_area(e){const{areaUnit:t,lengthUnit:i}=this;let o=v(e,i);o<0&&(o=v(_(e),i));const a=g(e,t);this._updateMeasureState({perimeter:o,area:a})}_areaEvent(e,t){const{_sketch:{layer:i}}=this,{state:o,graphic:a,graphic:{geometry:n}}=e;"cancel"!==o&&a?(this._area(n),"complete"===o&&(this._updateMeasureState({operation:"area",areaGeometry:n}),this._addGraphics(n,t)),this._addLabels(n,a.layer===i?void 0:a.layer)):this._reset()}_coordinates(e){const{latitude:t,longitude:i}=this._formatLatitudeLongitude(e);this._updateMeasureState({latitude:t,longitude:i})}_coordinatesEvent(e){const{_sketch:{layer:t},_sketchCoordinatesHandle:i}=this,{state:o,graphic:a,graphic:{geometry:n}}=e;"cancel"!==o&&a?"complete"===o&&(i&&(i.remove(),this._sketchCoordinatesHandle=null),this._coordinates(n),this._updateMeasureState({operation:"coordinates",coordinatesGeometry:n}),this._addLabels(n,a.layer===t?void 0:a.layer)):this._reset()}_elevationEvent(e){const{_sketch:{layer:t}}=this,{state:i,graphic:o,graphic:{geometry:a}}=e;if("cancel"===i||!o)return void this._reset();if("complete"!==i)return;this._updateMeasureState({operation:"elevation"});const n=this._cursor.z;a.z=n,this._updateMeasureState({elevation:n,elevationGeometry:a}),this._addLabels(a,o.layer===t?void 0:o.layer)}_length(e){const{lengthUnit:t}=this;let i=v(e,t);i<0&&(i=v(_(e),t)),this._updateMeasureState({length:i})}_lengthEvent(e,t){const{_sketch:{layer:i}}=this,{state:o,graphic:a,graphic:{geometry:n}}=e;"cancel"!==o&&a?(this._length(n),"complete"===o&&(this._updateMeasureState({operation:"length",lengthGeometry:n}),this._addGraphics(n,t)),this._addLabels(n,a.layer===i?void 0:a.layer)):this._reset()}_profileEvent(e){const{_elevationProfile:t}=this,{state:i,graphic:o,graphic:{geometry:a}}=e;"cancel"!==i&&o?"complete"===i&&(t.input=new d({geometry:a}),this._updateMeasureState({operation:"profile",profileGeometry:a}),this._addGraphics(a)):this._reset()}_measure(e){const{view:t,_sketch:i}=this;this._reset(),this._updateMeasureState({operation:`measure-${e}`}),this._sketchHandle=i.on("create",this[`_${e}Event`].bind(this)),"coordinates"===e&&(this._sketchCoordinatesHandle=t.on("pointer-move",(e=>{const i=t.toMap(e);this._coordinates(i),this._addLabels(i)}))),i.create("length"===e||"profile"===e?"polyline":"area"===e?"polygon":"point")}_reset(){var e;const{_elevationProfile:t,_labels:i,_layer:o,_sketch:a}=this;null===(e=this._sketchHandle)||void 0===e||e.remove(),this._sketchHandle=null,t.input=null,a.cancel(),o.removeAll(),i.removeAll(),this._updateMeasureState(H)}_updateMeasureState(e){this._measureState=Object.assign(Object.assign({},this._measureState),e)}_measureSelectedFeature(){return e(this,void 0,void 0,(function*(){const{view:e,_measureState:{operation:t},_popupVisible:i,_selectedFeature:o}=this;if(e.closePopup(),"ready"!==t||!i||!o)return;const a=o.layer||o.sourceLayer;let n=o.geometry;"graphics"!==a.type&&(n=yield S({layer:a,graphic:o,outSpatialReference:e.spatialReference}));const l={state:"complete",graphic:new d({geometry:n})};switch(n.type){case"polygon":this._areaEvent(l,!0);break;case"polyline":this._lengthEvent(l,!0)}}))}_addGraphics(e,t){const{view:{spatialReference:i},_sketch:{layer:o},_pointSymbol:a,_polygonSymbol:n,_polylineSymbol:l}=this,{type:r}=e;"polygon"===r&&t&&o.add(new d({geometry:e,symbol:n})),("polygon"===r||"polyline"===r&&t)&&o.add(new d({geometry:e,symbol:l}));const s="polyline"===r?e.paths[0]:e.rings[0];o.addMany(s.map((e=>{const[t,o]=e;return new d({geometry:new h({x:t,y:o,spatialReference:i}),symbol:a})})))}_addLabels(e,t){const{_labels:i,_measureState:{area:o,elevation:a,latitude:n,length:l,longitude:r,operation:s},_round:c}=this,{type:p}=e;i.removeAll(),t&&t.removeMany(t.graphics.filter((e=>e.symbol&&"text"===e.symbol.type)).toArray());const h=t||i;("area"===s||"measure-area"===s)&&"polygon"===p&&o&&o>0&&h.addMany([...this._createPolylineLabels(e),new d({geometry:e.centroid,symbol:this._createTextSymbol({text:c(o)})})]),("length"===s||"measure-length"===s)&&"polyline"===p&&l&&l>0&&h.addMany(this._createPolylineLabels(e)),"coordinates"!==s&&"measure-coordinates"!==s||"point"!==p||h.add(new d({geometry:e,symbol:this._createTextSymbol({text:`${n}\n${r}`,point:!0})})),"elevation"!==s&&"measure-elevation"!==s||"point"!==p||h.add(new d({geometry:e,symbol:this._createTextSymbol({text:this._formatElevation(a,!1),point:!0})}))}_createPolylineLabels(e){const{lengthUnit:t,_round:i}=this,o="polyline"===e.type?e.paths[0]:e.rings[0],a=[];return o.forEach(((o,n,l)=>{const r=l[n],s=l[n+1];if(!r||!s)return;const c=new u({paths:[[r,s]],spatialReference:e.spatialReference});let p=v(c,t);p<0&&(p=v(_(c),t)),p=this._round(p,2),a.push(new d({geometry:f(c),symbol:this._createTextSymbol({text:i(p),angle:b({x:r[0],y:r[1]},{x:s[0],y:s[1]})})}))})),a}_createTextSymbol(e){const{_textSymbol:t}=this,{text:i,point:o,angle:a}=e,n=t.clone();return n.text="string"==typeof i?i:i.toLocaleString(),o&&(n.horizontalAlignment="left",n.xoffset=8),a&&(n.angle=a),n}_cursorInfo(){const{_cursor:e}=this,{latitude:t,longitude:i}=this._formatLatitudeLongitude(e);return{latitude:t,longitude:i,elevation:this._formatElevation(e.z)}}_formatElevation(e,t){const{elevationUnit:i,units:o,_round:a}=this;let n=e||0;return"feet"===i&&(n*=3.28084),!1===t?a(n).toLocaleString():`${a(n).toLocaleString()} ${o.getUnitLabel("elevation",i)}`}_formatLatitudeLongitude(e){const{latitudeLongitudeUnit:t,_round:i}=this;let o=e.clone();o.spatialReference.isWebMercator&&(o=y(o));let a,n,{latitude:l,longitude:r}=o;if("decimal"===t)l=i(l,6),r=i(r,6);else if("dms"===t){const e=m.toLatitudeLongitude(o,"dms",2),t=-1!==e.indexOf("N")?e.indexOf("N"):e.indexOf("S");a=e.substring(0,t+1);const i=a.split(" ");l=`${i[0]}°${i[1]}'${i[2].slice(0,i[2].length-1)+'" '+i[2].slice(i[2].length-1)}`,n=e.substring(t+2,e.length);const s=n.split(" ");r=`${s[0]}°${s[1]}'${s[2].slice(0,s[2].length-1)+'" '+s[2].slice(s[2].length-1)}`}return{latitude:l,longitude:r}}_measureInfo(){const{areaUnit:e,lengthUnit:t,units:i,_measureState:{area:o,elevation:a,latitude:n,length:l,longitude:r,perimeter:s},_round:c}=this;return{area:`${c(o||0).toLocaleString()} ${i.getUnitLabel("area",e)}`,elevation:this._formatElevation(a),latitude:n||0,length:`${c(l||0).toLocaleString()} ${i.getUnitLabel("length",t)}`,longitude:r||0,perimeter:`${c(s||0).toLocaleString()} ${i.getUnitLabel("length",t)}`}}_profileStatisticsInfo(){const{_elevationProfile:{input:e},_elevationProfileLineGround:{samples:t},_profileStatistics:i,_round:o}=this;if(!i)return{avgElevation:"",avgNegativeSlope:"",avgPositiveSlope:"",elevationGain:"",elevationLoss:"",totalLength:"",maxDistance:"",maxElevation:"",maxNegativeSlope:"",maxPositiveSlope:"",minElevation:""};const{avgElevation:a,avgNegativeSlope:n,avgPositiveSlope:l,elevationGain:r,elevationLoss:s,maxDistance:c,maxElevation:d,maxNegativeSlope:p,maxPositiveSlope:h,minElevation:u}=i;let m=0;return e&&t&&t.forEach(((e,i)=>{0!==i&&(m+=Math.sqrt(Math.pow(t[i].distance-t[i-1].distance,2)+Math.pow(t[i].elevation-t[i-1].elevation,2)))})),{avgElevation:`${o(a).toLocaleString()}`,avgNegativeSlope:`-${o(n,1)}%`,avgPositiveSlope:`${o(l,1)}%`,elevationGain:`${o(r).toLocaleString()}`,elevationLoss:`${o(s).toLocaleString()}`,totalLength:`${o(m).toLocaleString()}`,maxDistance:`${o(c).toLocaleString()}`,maxElevation:`${o(d).toLocaleString()}`,maxNegativeSlope:`-${o(p,1)}%`,maxPositiveSlope:`${o(h,1)}%`,minElevation:`${o(u).toLocaleString()}`}}_round(e,t){return"number"!=typeof e?0:Number(e.toFixed(t||2))}render(){const{view:{scale:e},_measureState:{operation:t}}=this,{latitude:i,longitude:o,elevation:a}=this._cursorInfo(),{area:l,elevation:r,latitude:s,length:c,longitude:d,perimeter:p}=this._measureInfo(),{avgElevation:h,elevationGain:u,elevationLoss:m,totalLength:g,maxElevation:v,minElevation:_}=this._profileStatisticsInfo();return n("calcite-panel",{heading:"Measure"},n("calcite-action",{icon:"gear",slot:"header-actions-end",text:"Options"},n("calcite-tooltip",{"close-on-click":"",placement:"bottom",slot:"tooltip"},"Options")),n("calcite-popover",{"auto-close":"",closable:"",heading:"Options","overlay-positioning":"fixed",placement:"bottom-start",scale:"s",afterCreate:this._referenceElement.bind(this)},n("div",{class:O},n("calcite-label",{layout:"inline"},n("calcite-switch",{checked:"",afterCreate:e=>{e.addEventListener("calciteSwitchChange",(()=>{this._snapping=e.checked}))}}),"Snapping"),n("calcite-label",{layout:"inline",style:"--calcite-label-margin-bottom: 0;"},n("calcite-switch",{checked:"",afterCreate:e=>{e.addEventListener("calciteSwitchChange",(()=>{this._guides=e.checked}))}}),"Guides"))),n("div",{class:k},n("calcite-button",{"icon-start":"measure-line",afterCreate:this._buttonMeasureEvent.bind(this,"length")}),n("calcite-tooltip",{placement:"bottom","close-on-click":"",afterCreate:this._referenceElement.bind(this)},"Length"),n("calcite-button",{"icon-start":"measure-area",afterCreate:this._buttonMeasureEvent.bind(this,"area")}),n("calcite-tooltip",{placement:"bottom","close-on-click":"",afterCreate:this._referenceElement.bind(this)},"Area"),n("calcite-button",{"icon-start":"point",afterCreate:this._buttonMeasureEvent.bind(this,"coordinates")}),n("calcite-tooltip",{placement:"bottom","close-on-click":"",afterCreate:this._referenceElement.bind(this)},"Coordinates"),n("calcite-button",{"icon-start":"altitude",afterCreate:this._buttonMeasureEvent.bind(this,"elevation")}),n("calcite-tooltip",{placement:"bottom","close-on-click":"",afterCreate:this._referenceElement.bind(this)},"Elevation"),n("calcite-button",{"icon-start":"graph-time-series",afterCreate:this._buttonMeasureEvent.bind(this,"profile")}),n("calcite-tooltip",{placement:"bottom","close-on-click":"",afterCreate:this._referenceElement.bind(this)},"Profile")),n("div",{class:D,hidden:"ready"!==t},n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"latitudeLongitude","Latitude")}),n("div",null,": ",i)),n("div",{class:I},"Longitude: ",o),n("hr",null),n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"elevation","Elevation")}),n("div",null,": ",a)),n("hr",null),n("div",{class:I},"Scale: 1:",Math.round(e).toLocaleString())),n("div",{class:D,hidden:"area"!==t&&"measure-area"!==t},n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"area","Area")}),n("div",null,": ",l)),n("hr",null),n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"length","Perimeter")}),n("div",null,": ",p))),n("div",{class:D,hidden:"length"!==t&&"measure-length"!==t},n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"length","Length")}),n("div",null,": ",c))),n("div",{class:D,hidden:"coordinates"!==t&&"measure-coordinates"!==t},n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"latitudeLongitude","Latitude")}),n("div",null,": ",s)),n("div",{class:I},"Longitude: ",d)),n("div",{class:D,hidden:"elevation"!==t&&"measure-elevation"!==t},n("div",{class:I},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"elevation","Elevation")}),n("div",null,": ",r))),n("calcite-notice",{class:G,hidden:"measure-profile"!==t,icon:"line-straight",open:""},n("div",{slot:"message"},"Draw a line to create a profile.")),n("div",{class:$,hidden:"profile"!==t},n("div",{class:P},n("div",{afterCreate:this._createUnitsDropdown.bind(this,"elevation","Elevation unit")}),n("calcite-label",{layout:"inline",style:"--calcite-label-margin-bottom: 0;"},n("calcite-switch",{afterCreate:e=>{e.addEventListener("calciteSwitchChange",(()=>{this._uniformChartScaling=e.checked}))}}),"Uniform scale")),n("div",{afterCreate:e=>{this._elevationProfile.container=e}}),n("div",{class:A},n("table",null,n("tr",null,n("th",null,"Length (3D)"),n("th",null,"Gain"),n("th",null,"Loss")),n("tr",null,n("td",null,g),n("td",null,u),n("td",null,m)),n("tr",null,n("th",null,"Min"),n("th",null,"Max"),n("th",null,"Avg")),n("tr",null,n("td",null,_),n("td",null,v),n("td",null,h))))),n("calcite-button",{appearance:"outline",hidden:"ready"===t,slot:"ready"===t?null:"footer",width:"full",onclick:this._reset.bind(this)},(null==t?void 0:t.includes("measure"))?"Cancel":"Clear"))}_createUnitsDropdown(e,t,i){new B({text:t,type:e,units:this.units,container:i})}_referenceElement(e){const t=e.previousElementSibling;t&&(e.referenceElement=t)}_renderMeasureSelectedFeatureButton(){const{_measureState:{operation:e},_popupVisible:t,_selectedFeature:i}=this;if("ready"!==e||!t||!i)return null;const o=i.geometry.type;if("polygon"!==o&&"polyline"!==o)return null;return n("calcite-button",{appearance:"outline","icon-start":{polygon:"measure-area",polyline:"measure-line"}[o],slot:"footer",width:"full",onclick:this._measureSelectedFeature.bind(this)},"Selected ",{polygon:"Area",polyline:"Length"}[o])}};t([o()],N.prototype,"loaded",void 0),t([o({aliasOf:"units.areaUnit"})],N.prototype,"areaUnit",void 0),t([o({aliasOf:"units.latitudeLongitudeUnit"})],N.prototype,"latitudeLongitudeUnit",void 0),t([o({aliasOf:"units.elevationUnit"})],N.prototype,"elevationUnit",void 0),t([o({aliasOf:"units.lengthUnit"})],N.prototype,"lengthUnit",void 0),t([o({aliasOf:"view.map.ground"})],N.prototype,"_ground",void 0),t([o()],N.prototype,"_measureState",void 0),t([o({aliasOf:"view.popup.selectedFeature"})],N.prototype,"_selectedFeature",void 0),t([o({aliasOf:"view.popup.visible"})],N.prototype,"_popupVisible",void 0),t([o({aliasOf:"_sketch.pointSymbol"})],N.prototype,"_pointSymbol",void 0),t([o({aliasOf:"_sketch.polylineSymbol"})],N.prototype,"_polylineSymbol",void 0),t([o({aliasOf:"_sketch.polygonSymbol"})],N.prototype,"_polygonSymbol",void 0),t([o({aliasOf:"_sketch.snappingOptions.featureSources"})],N.prototype,"_snappingSources",void 0),t([o({aliasOf:"_sketch.snappingOptions.featureEnabled"})],N.prototype,"_snapping",void 0),t([o({aliasOf:"_sketch.snappingOptions.selfEnabled"})],N.prototype,"_guides",void 0),t([o({aliasOf:"_elevationProfile.viewModel.uniformChartScaling"})],N.prototype,"_uniformChartScaling",void 0),t([o({aliasOf:"_elevationProfile.viewModel.statistics"})],N.prototype,"_profileStatistics",void 0),N=t([i("cov.panels.Measure")],N);let B=class extends a{constructor(e){super(e),this.text="Units",this._items=[],this._titles={area:"Area units",elevation:"Elevation units",latitudeLongitude:"Lat/Lng format",length:"Length units"}}postInitialize(){const{type:e,units:t,_items:i}=this,o=`${e}Unit`;t[`${e}UnitInfos`].forEach((e=>{const{name:t,unit:a}=e;i.push(n("calcite-dropdown-item",{scale:"s",afterCreate:e=>{e.selected=a===this[o],e.addEventListener("calciteDropdownItemSelect",(()=>{this[o]=a})),this.watch(o,(()=>{e.selected=this[o]===a}))}},t))}))}render(){const{text:e,type:t,_items:i,_titles:o}=this;return n("div",null,n("calcite-dropdown",{"overlay-positioning":"fixed",scale:"s","width-scale":"s"},n("calcite-link",{slot:"trigger"},e),n("calcite-dropdown-group",{"group-title":o[t],scale:"s"},i)))}};t([o({aliasOf:"units.areaUnit"})],B.prototype,"areaUnit",void 0),t([o({aliasOf:"units.elevationUnit"})],B.prototype,"elevationUnit",void 0),t([o({aliasOf:"units.latitudeLongitudeUnit"})],B.prototype,"latitudeLongitudeUnit",void 0),t([o({aliasOf:"units.lengthUnit"})],B.prototype,"lengthUnit",void 0),B=t([i("cov.panels.Measure.UnitsDropdown")],B);export{B as UnitsDropdown};export default N;