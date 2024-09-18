import esri = __esri;
/**
 * Distance between two points.
 * @param point1 esri.Point | x,y key/value pair
 * @param point2 esri.Point | x,y key/value pair
 * @returns number
 */
export declare const distance: (point1: esri.Point | {
    x: number;
    y: number;
}, point2: esri.Point | {
    x: number;
    y: number;
}) => number;
/**
 * 3D distance between two points.
 * @param point1 esri.Point | x,y,z key/value pair
 * @param point2 esri.Point | x,y,z key/value pair
 * @returns number
 */
export declare const distance3d: (point1: esri.Point | {
    x: number;
    y: number;
    z: number;
}, point2: esri.Point | {
    x: number;
    y: number;
    z: number;
}) => number;
/**
 * Point on the line between two points some distance from point one.
 * @param point1 esri.Point
 * @param point2 esri.Point
 * @param linearDistance number
 * @returns esri.Point
 */
export declare const linearInterpolation: (point1: esri.Point, point2: esri.Point, linearDistance: number) => esri.Point;
/**
 * Return midpoint of polyline.
 * @param polyline esri.Polyline
 * @returns esri.Point
 */
export declare const midpoint: (polyline: esri.Polyline) => esri.Point;
/**
 * Readable text angle between two points.
 * @param point1 esri.Point | x,y key/value pair
 * @param point2 esri.Point | x,y key/value pair
 * @returns number
 */
export declare const textAngle: (point1: esri.Point | {
    x: number;
    y: number;
}, point2: esri.Point | {
    x: number;
    y: number;
}) => number;
export declare const queryFeatureGeometry: (options: {
    layer: esri.FeatureLayer;
    graphic: esri.Graphic;
    outSpatialReference?: esri.SpatialReference;
}) => Promise<esri.Geometry>;
export declare const numberOfVertices: (geometry: esri.Polyline | esri.Polygon) => number;
export declare const polylineVertices: (polyline: esri.Polyline, spatialReference: esri.SpatialReference) => esri.Point[];
export declare const polygonVertices: (polygon: esri.Polygon, spatialReference: esri.SpatialReference) => esri.Point[];
export declare const buffer: (geometry: esri.Geometry, distance: number, unit: esri.LinearUnits) => esri.Geometry;
export declare const offset: (geometry: esri.Polyline, distance: number, unit: esri.LinearUnits, direction: "both" | "left" | "right", offsetProjectionWkid: number, spatialReference: esri.SpatialReference) => Promise<esri.Polyline[]>;
