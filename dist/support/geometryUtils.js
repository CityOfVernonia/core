/* His name was Bruce McNair. Copyright 2024 City of Vernonia, Oregon. */
import{__awaiter as e}from"tslib";import{Point as t}from"@arcgis/core/geometry";import{geodesicBuffer as r,offset as n}from"@arcgis/core/geometry/geometryEngine";import*as o from"@arcgis/core/geometry/projection";export const distance=(e,t)=>{const{x:r,y:n}=e,{x:o,y:a}=t;return Math.sqrt(Math.pow(Math.abs(r-o),2)+Math.pow(Math.abs(n-a),2))};export const distance3d=(e,t)=>{const{x:r,y:n,z:o}=e,{x:a,y:s,z:c}=t;return Math.sqrt(Math.pow(Math.abs(r-a),2)+Math.pow(Math.abs(n-s),2)+Math.pow(Math.abs(o-c),2))};export const linearInterpolation=(e,r,n)=>{const{x:o,y:a,spatialReference:s}=e,{x:c,y:i}=r,p=distance(e,r)/n;return new t({x:o+(c-o)/p,y:a+(i-a)/p,spatialReference:s})};export const midpoint=e=>{const{paths:[r],spatialReference:n}=e,o=r.map((e=>{const[t,r]=e;return{x:t,y:r}}));let a=0,s=0;for(let e=0;e<o.length-1;e+=1)a+=distance(new t(Object.assign({},o[e])),new t(Object.assign({},o[e+1])));for(let e=0;e<o.length-1;e+=1){if(s+distance(new t(Object.assign({},o[e])),new t(Object.assign({},o[e+1])))>a/2){const r=a/2-s;return linearInterpolation(new t(Object.assign(Object.assign({},o[e]),{spatialReference:n})),new t(Object.assign(Object.assign({},o[e+1]),{spatialReference:n})),r)}s+=distance(new t(Object.assign({},o[e])),new t(Object.assign({},o[e+1])))}return new t(Object.assign(Object.assign({},o[0]),{spatialReference:n}))};export const textAngle=(e,t)=>{const{x:r,y:n}=e,{x:o,y:a}=t;let s=180*Math.atan2(n-a,r-o)/Math.PI;return s=s>0&&s<90?Math.abs(s-180)+180:s>90&&s<180?s=Math.abs(s-180):s<=0&&s>=-90?Math.abs(s):Math.abs(s)+180,s};export const queryFeatureGeometry=t=>e(void 0,void 0,void 0,(function*(){const{layer:e,layer:{objectIdField:r},graphic:n,outSpatialReference:o}=t;return(yield e.queryFeatures({where:`${r} = ${n.attributes[r]}`,returnGeometry:!0,outSpatialReference:o||e.spatialReference})).features[0].geometry}));export const numberOfVertices=e=>{const{type:t}=e;let r=0;return"polyline"===t&&e.paths.forEach((e=>{e.forEach((()=>{++r}))})),"polygon"===t&&e.rings.forEach((e=>{e.forEach(((t,n)=>{n+1<e.length&&++r}))})),r};export const polylineVertices=(e,r)=>{const n=[];return e.paths.forEach((e=>{e.forEach((e=>{n.push(new t({x:e[0],y:e[1],spatialReference:r}))}))})),n};export const polygonVertices=(e,r)=>{const n=[];return e.rings.forEach((e=>{e.forEach(((o,a)=>{a+1<e.length&&n.push(new t({x:o[0],y:o[1],spatialReference:r}))}))})),n};export const buffer=(e,t,n)=>r(e,t,n);export const offset=(t,r,a,s,c,i)=>e(void 0,void 0,void 0,(function*(){o.isLoaded()||(yield o.load());const e=o.project(t,{wkid:c}),p=[];return"both"!==s&&"left"!==s||p.push(o.project(n(e,r,a),i)),"both"!==s&&"right"!==s||p.push(o.project(n(e,-1*r,a),i)),p}));