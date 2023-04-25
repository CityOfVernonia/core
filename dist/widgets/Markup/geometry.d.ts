import esri = __esri;
import Point from '@arcgis/core/geometry/Point';
export declare const queryFeatureGeometry: (options: {
    layer: esri.FeatureLayer;
    graphic: esri.Graphic;
    outSpatialReference?: esri.SpatialReference;
}) => Promise<esri.Geometry>;
export declare const polylineVertices: (polyline: esri.Polyline, spatialReference: esri.SpatialReference) => esri.Point[];
export declare const polygonVertices: (polygon: esri.Polygon, spatialReference: esri.SpatialReference) => esri.Point[];
export declare const buffer: (geometry: esri.Geometry, distance: number, unit: esri.LinearUnits) => esri.Geometry;
export declare const offset: (geometry: esri.Polyline, distance: number, unit: esri.LinearUnits, direction: 'both' | 'left' | 'right', offsetProjectionWkid: number, spatialReference: esri.SpatialReference) => Promise<esri.Polyline[]>;
