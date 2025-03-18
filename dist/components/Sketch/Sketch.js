/* His name was Bruce McNair. Copyright 2025 City of Vernonia, Oregon. */
import{__awaiter as e,__decorate as t}from"tslib";import{watch as i,whenOnce as o}from"@arcgis/core/core/reactiveUtils";import{property as r,subclass as n}from"@arcgis/core/core/accessorSupport/decorators";import s from"@arcgis/core/widgets/Sketch/SketchViewModel";import l from"@arcgis/core/views/interactive/snapping/SnappingOptions";import a from"@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource";import h from"@arcgis/core/layers/GroupLayer";import p from"@arcgis/core/layers/GraphicsLayer";import c from"@arcgis/core/Graphic";import{CIMSymbol as y,SimpleFillSymbol as d,SimpleLineSymbol as g,SimpleMarkerSymbol as m,TextSymbol as S}from"@arcgis/core/symbols";import{APPLICATION_GRAPHICS_LAYER as w}from"../../support/layerUtils";export const COLORS={white:[255,255,255],black:[0,0,0],grey:[128,128,128],red:[237,81,81],blue:[20,158,206],green:[167,198,54],purple:[158,85,156],orange:[252,146,31],yellow:[255,222,62]};const f=new y({data:{type:"CIMSymbolReference",symbol:{type:"CIMLineSymbol",symbolLayers:[{type:"CIMSolidStroke",effects:[{type:"CIMGeometricEffectDashes",dashTemplate:[4.75,4.75],lineDashEnding:"HalfPattern",offsetAlongLine:0}],enable:!0,capStyle:"Butt",joinStyle:"Round",width:2.25,color:[...COLORS.white,255]},{type:"CIMSolidStroke",enable:!0,capStyle:"Butt",joinStyle:"Round",width:2.25,color:[...COLORS.red,255]}]}}}),O=new m({style:"circle",size:6,color:COLORS.yellow,outline:{width:1,color:COLORS.red}}),u="sketch-custom-handles";export const POINT_SYMBOL=new m({style:"circle",size:8,color:COLORS.yellow,outline:{width:1,color:COLORS.red}});const L=new d({color:[...COLORS.yellow,.125],outline:{color:COLORS.red,width:2}}),b=new g({color:COLORS.red,width:2}),C=new m({style:"circle",size:6,color:COLORS.white,outline:{width:1,color:COLORS.red}}),v=new l({enabled:!0,featureEnabled:!0,selfEnabled:!0});export const TEXT_SYMBOL=new S({color:COLORS.red,haloColor:COLORS.white,haloSize:2,horizontalAlignment:"center",text:"New Text",verticalAlignment:"middle",font:{size:12}});let x=class extends s{constructor(t){super(t),this.graphicsCount=0,this.layer=new p,this.layers=new h({listMode:"hide"}),this.point=new p({title:"point"}),this.polygon=new p({title:"polygon"}),this.polyline=new p({title:"polyline"}),this.text=new p({title:"text"}),this.textSymbol=TEXT_SYMBOL,this.updateOnGraphicClick=!1,this.activeFillSymbol=L,this.activeLineSymbol=f,this.activeVertexSymbol=O,this.pointSymbol=POINT_SYMBOL,this.polygonSymbol=L,this.polylineSymbol=b,this.snappingOptions=v,this.vertexSymbol=C;const r=[this.polygon,this.polyline,this.point,this.text];this.layers.addMany([...r,this.layer]),o((()=>this.view)).then((t=>e(this,void 0,void 0,(function*(){yield t.when(),w?w.add(this.layers):t.map.add(this.layers);const e=t.map.layers;r.forEach(this._addSnappingLayer.bind(this)),e.forEach(this._addSnappingLayer.bind(this)),this.addHandles(e.on("after-add",(e=>{this._addSnappingLayer(e.item)})),u),this.pointView=yield t.whenLayerView(this.point),this.polygonView=yield t.whenLayerView(this.polygon),this.polylineView=yield t.whenLayerView(this.polyline),this.textView=yield t.whenLayerView(this.text)})))),this.addHandles(r.map((e=>i((()=>e.graphics.length),(()=>{this.graphicsCount=this.polygon.graphics.length+this.polyline.graphics.length+this.point.graphics.length+this.text.graphics.length})))),u)}addGeometry(e){const{type:t}=e;if("point"!==t&&"polygon"!==t&&"polyline"!==t)return;const i=new c({geometry:e,symbol:this[`${t}Symbol`]});return this[t].add(i),i}addJSON(e){const t=c.fromJSON(e),{geometry:i,symbol:o}=t;if(!o)return this.addGeometry(i);const r=t.symbol.type,n=t.geometry.type;return"point"===n||"polygon"===n||"polyline"===n?("text"===r?this.text.add(t):this[n].add(t),t):void 0}deleteAll(){const{layers:{layers:e}}=this;e.forEach((e=>{e.removeAll()}))}featureJSON(){const{point:e,polygon:t,polyline:i,text:o}=this,r=[];return[e,i,t,o].forEach((e=>{e.graphics.forEach((e=>{r.push(e.toJSON())}))})),{features:r}}_addSnappingLayer(e){const{snappingOptions:{featureSources:t}}=this,{listMode:i,title:o,type:r}=e;if("group"===r)return void e.layers.forEach(this._addSnappingLayer.bind(this));if(!0===e.internal)return;if("hide"===i||!o)return;if("graphics"!==r&&"csv"!==r&&"feature"!==r&&"geojson"!==r)return;const n=e;t.add(new a({layer:n}))}};t([r()],x.prototype,"graphicsCount",void 0),x=t([n("cov.components.Sketch.Sketch")],x);export default x;