import esri = __esri;
export declare const buffer: (geometry: esri.Geometry, distance: number, unit: esri.LengthUnit) => Promise<esri.Polygon>;
export declare const offset: (geometry: esri.Polyline, sides: "both" | "left" | "right", distance: number, unit: esri.LengthUnit, wkid?: number) => Promise<esri.Polyline[]>;
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
export declare const polygonVertices: (polygon: esri.Polygon, spatialReference: esri.SpatialReference) => esri.Point[];
export declare const polylineVertices: (polyline: esri.Polyline, spatialReference: esri.SpatialReference) => esri.Point[];
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
