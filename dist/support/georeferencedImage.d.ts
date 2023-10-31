import esri = __esri;
import { SpatialReference } from '@arcgis/core/geometry';
import MediaLayer from '@arcgis/core/layers/MediaLayer';
/**
 * Parse auxiliary XML file for georeference information.
 * @param url URL of `*.aux.xml` file with georeference information
 * @returns Object with array of control points and associated spatial reference
 */
export declare const auxiliaryXmlToControlPoints: (url: string) => Promise<{
    /**
     * Array of control points.
     */
    controlPoints: esri.ControlPoint[];
    /**
     * Spatial reference of control points.
     */
    spatialReference: esri.SpatialReference;
}>;
/**
 * Create image media layer.
 * @param url URL of source image for MediaLayer (must have associated `*.aux.xml` file at same location)
 * @param mediaLayerProperties Optional MediaLayerProperties for the MediaLayer
 * @returns Promise resolving the MediaLayer
 */
declare const imageMediaLayer: (url: string, mediaLayerProperties?: esri.MediaLayerProperties) => Promise<esri.MediaLayer>;
/**
 * Display media layer control points.
 * @param mediaLayer Media layer of interest
 * @param view View to display points in
 */
export declare const displayControlPoints: (mediaLayer: esri.MediaLayer, view: esri.MapView) => void;
/**
 * Clear displayed media layer control points.
 * @param view View with media layer control points display in
 */
export declare const clearControlPoints: (view: esri.MapView) => void;
export default imageMediaLayer;
