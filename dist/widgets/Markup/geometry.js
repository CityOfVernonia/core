import { __awaiter } from "tslib";
import Point from '@arcgis/core/geometry/Point';
import { geodesicBuffer, offset as _offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';
export const queryFeatureGeometry = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { layer, layer: { objectIdField }, graphic, outSpatialReference, } = options;
    return (yield layer.queryFeatures({
        where: `${objectIdField} = ${graphic.attributes[objectIdField]}`,
        returnGeometry: true,
        outSpatialReference: outSpatialReference || layer.spatialReference,
    })).features[0].geometry;
});
export const numberOfVertices = (geometry) => {
    const { type } = geometry;
    let count = 0;
    if (type === 'polyline') {
        geometry.paths.forEach((path) => {
            path.forEach(() => {
                ++count;
            });
        });
    }
    if (type === 'polygon') {
        geometry.rings.forEach((ring) => {
            ring.forEach((vertex, index) => {
                if (index + 1 < ring.length) {
                    ++count;
                }
            });
        });
    }
    return count;
};
export const polylineVertices = (polyline, spatialReference) => {
    const vertices = [];
    polyline.paths.forEach((path) => {
        path.forEach((vertex) => {
            vertices.push(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
        });
    });
    return vertices;
};
export const polygonVertices = (polygon, spatialReference) => {
    const vertices = [];
    polygon.rings.forEach((ring) => {
        ring.forEach((vertex, index) => {
            if (index + 1 < ring.length) {
                vertices.push(new Point({ x: vertex[0], y: vertex[1], spatialReference }));
            }
        });
    });
    return vertices;
};
export const buffer = (geometry, distance, unit) => {
    return geodesicBuffer(geometry, distance, unit);
};
export const offset = (geometry, distance, unit, direction, offsetProjectionWkid, spatialReference) => __awaiter(void 0, void 0, void 0, function* () {
    if (!projection.isLoaded())
        yield projection.load();
    const projected = projection.project(geometry, { wkid: offsetProjectionWkid });
    const results = [];
    if (direction === 'both' || direction === 'left') {
        results.push(projection.project(_offset(projected, distance, unit), spatialReference));
    }
    if (direction === 'both' || direction === 'right') {
        results.push(projection.project(_offset(projected, distance * -1, unit), spatialReference));
    }
    return results;
});
