import esri = __esri;

import { Point, SpatialReference } from '@arcgis/core/geometry';
import {
  load as bufferLoad,
  isLoaded as bufferLoaded,
  execute as geodesicBuffer,
} from '@arcgis/core/geometry/operators/geodesicBufferOperator';
import { execute as _offset } from '@arcgis/core/geometry/operators/offsetOperator';
import {
  load as projectLoad,
  isLoaded as projectLoaded,
  execute as project,
} from '@arcgis/core/geometry/operators/projectOperator';

export const buffer = async (
  geometry: esri.Geometry,
  distance: number,
  unit: esri.LengthUnit,
): Promise<esri.Polygon> => {
  if (!bufferLoaded()) await bufferLoad();

  return geodesicBuffer(geometry as esri.GeometryUnion, distance, { unit }) as esri.Polygon;
};

export const offset = async (
  geometry: esri.Polyline,
  sides: 'both' | 'left' | 'right',
  distance: number,
  unit: esri.LengthUnit,
  wkid?: number,
): Promise<esri.Polyline[]> => {
  const offsets: esri.Polyline[] = [];

  if (wkid && !projectLoaded()) await projectLoad();

  let projected: esri.Polyline | nullish;

  if (wkid) {
    projected = project(geometry, new SpatialReference({ wkid })) as esri.Polyline;
  }

  let left: esri.Polyline | nullish;

  let right: esri.Polyline | nullish;

  if (sides === 'both' || sides === 'left') {
    left = _offset(projected || geometry, distance, { unit }) as esri.Polyline;

    if (projected) {
      left = project(left, geometry.spatialReference) as esri.Polyline;
    }
  }

  if (sides === 'both' || sides === 'right') {
    right = _offset(projected || geometry, -distance, { unit }) as esri.Polyline;

    if (projected) {
      right = project(right, geometry.spatialReference) as esri.Polyline;
    }
  }

  if (left) offsets.push(left);

  if (right) offsets.push(right);

  return offsets;
};

/**
 * Distance between two points.
 * @param point1 esri.Point | x,y key/value pair
 * @param point2 esri.Point | x,y key/value pair
 * @returns number
 */
export const distance = (
  point1: esri.Point | { x: number; y: number },
  point2: esri.Point | { x: number; y: number },
): number => {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
};

/**
 * 3D distance between two points.
 * @param point1 esri.Point | x,y,z key/value pair
 * @param point2 esri.Point | x,y,z key/value pair
 * @returns number
 */
export const distance3d = (
  point1: esri.Point | { x: number; y: number; z: number },
  point2: esri.Point | { x: number; y: number; z: number },
): number => {
  const { x: x1, y: y1, z: z1 } = point1;
  const { x: x2, y: y2, z: z2 } = point2;
  return Math.sqrt(
    Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2) + Math.pow(Math.abs((z1 || 0) - (z2 || 0)), 2),
  );
};

/**
 * Point on the line between two points some distance from point one.
 * @param point1 esri.Point
 * @param point2 esri.Point
 * @param linearDistance number
 * @returns esri.Point
 */
export const linearInterpolation = (point1: esri.Point, point2: esri.Point, linearDistance: number): esri.Point => {
  const { x: x1, y: y1, spatialReference } = point1;
  const { x: x2, y: y2 } = point2;
  const steps = distance(point1, point2) / linearDistance;
  return new Point({
    x: x1 + (x2 - x1) / steps,
    y: y1 + (y2 - y1) / steps,
    spatialReference,
  });
};

/**
 * Return midpoint of polyline.
 * @param polyline esri.Polyline
 * @returns esri.Point
 */
export const midpoint = (polyline: esri.Polyline): esri.Point => {
  const {
    paths: [path],
    spatialReference,
  } = polyline;

  const segements = path.map((p: number[]) => {
    const [x, y] = p;
    return { x, y };
  });

  let td = 0;
  let dsf = 0;

  for (let i = 0; i < segements.length - 1; i += 1) {
    td += distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] }));
  }

  for (let i = 0; i < segements.length - 1; i += 1) {
    if (dsf + distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] })) > td / 2) {
      const distanceToMidpoint = td / 2 - dsf;
      return linearInterpolation(
        new Point({ ...segements[i], spatialReference }),
        new Point({ ...segements[i + 1], spatialReference }),
        distanceToMidpoint,
      );
    }
    dsf += distance(new Point({ ...segements[i] }), new Point({ ...segements[i + 1] }));
  }

  return new Point({
    ...segements[0],
    spatialReference,
  });
};

export const polygonVertices = (polygon: esri.Polygon, spatialReference: esri.SpatialReference): esri.Point[] => {
  const vertices: esri.Point[] = [];

  polygon.rings.forEach((ring: number[][]): void => {
    ring.forEach((vertex: number[], index: number): void => {
      if (index + 1 < ring.length) {
        vertices.push(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
      }
    });
  });
  return vertices;
};

export const polylineVertices = (polyline: esri.Polyline, spatialReference: esri.SpatialReference): esri.Point[] => {
  const vertices: esri.Point[] = [];

  polyline.paths.forEach((path: number[][]): void => {
    path.forEach((vertex: number[]): void => {
      vertices.push(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
    });
  });
  return vertices;
};

/**
 * Readable text angle between two points.
 * @param point1 esri.Point | x,y key/value pair
 * @param point2 esri.Point | x,y key/value pair
 * @returns number
 */
export const textAngle = (
  point1: esri.Point | { x: number; y: number },
  point2: esri.Point | { x: number; y: number },
): number => {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;

  let angle = (Math.atan2(y1 - y2, x1 - x2) * 180) / Math.PI;

  // quadrants SW SE NW NE
  angle =
    angle > 0 && angle < 90
      ? Math.abs(angle - 180) + 180
      : angle > 90 && angle < 180
        ? (angle = Math.abs(angle - 180))
        : angle <= 0 && angle >= -90
          ? Math.abs(angle)
          : Math.abs(angle) + 180;

  return angle;
};
