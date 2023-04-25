import esri = __esri;
import Point from '@arcgis/core/geometry/Point';
import { geodesicBuffer, offset as _offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';

export const queryFeatureGeometry = async (options: {
  layer: esri.FeatureLayer;
  graphic: esri.Graphic;
  outSpatialReference?: esri.SpatialReference;
}): Promise<esri.Geometry> => {
  const {
    layer,
    layer: { objectIdField },
    graphic,
    outSpatialReference,
  } = options;
  return (
    await layer.queryFeatures({
      where: `${objectIdField} = ${graphic.attributes[objectIdField]}`,
      returnGeometry: true,
      outSpatialReference: outSpatialReference || layer.spatialReference,
    })
  ).features[0].geometry;
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

export const buffer = (geometry: esri.Geometry, distance: number, unit: esri.LinearUnits): esri.Geometry => {
  return geodesicBuffer(geometry, distance, unit as esri.LinearUnits) as esri.Geometry;
};

export const offset = async (
  geometry: esri.Polyline,
  distance: number,
  unit: esri.LinearUnits,
  direction: 'both' | 'left' | 'right',
  offsetProjectionWkid: number,
  spatialReference: esri.SpatialReference,
): Promise<esri.Polyline[]> => {
  if (!projection.isLoaded()) await projection.load();
  const projected = projection.project(geometry, { wkid: offsetProjectionWkid }) as esri.Polyline;
  const results: esri.Polyline[] = [];
  if (direction === 'both' || direction === 'left') {
    results.push(
      projection.project(_offset(projected, distance, unit as esri.LinearUnits), spatialReference) as esri.Polyline,
    );
  }
  if (direction === 'both' || direction === 'right') {
    results.push(
      projection.project(
        _offset(projected, distance * -1, unit as esri.LinearUnits),
        spatialReference,
      ) as esri.Polyline,
    );
  }
  return results;
};
