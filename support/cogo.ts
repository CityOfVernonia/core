/**
 * Coordinate geometry helpers.
 */

import esri = __esri;
import { Point } from '@arcgis/core/geometry';

/**
 * Distance between two points.
 * @param point1 esri.Point | x,y key/value pair
 * @param point2 esri.Point | x,y key/value pair
 * @returns number
 */
export const distance = (
  point1: Point | { x: number; y: number },
  point2: Point | { x: number; y: number },
): number => {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
};

/**
 * Point on the line between two points some distance from point one.
 * @param point1 esri.Point
 * @param point2 esri.Point
 * @param linearDistance number
 * @returns esri.Point
 */
export const linearInterpolation = (point1: Point, point2: Point, linearDistance: number): Point => {
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
export const midpoint = (polyline: esri.Polyline): Point => {
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
