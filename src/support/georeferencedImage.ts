//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;
import type { AlertOptions } from './../layouts/ShellApplicationMap';

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { XMLParser } from 'fast-xml-parser';
import { Point, SpatialReference } from '@arcgis/core/geometry';
import MediaLayer from '@arcgis/core/layers/MediaLayer';
import ControlPointsGeoreference from '@arcgis/core/layers/support/ControlPointsGeoreference';
import ImageElement from '@arcgis/core/layers/support/ImageElement';
import Graphic from '@arcgis/core/Graphic';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import { publish } from 'pubsub-js';

let _displayControlPoints: esri.Graphic[] = [];

/**
 * Convert a `Blob` to an object URL.
 * @param blob `Blob` to convert
 * @returns object URL string
 */
const blobToObjectUrl = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject): void => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Chunk array into array of arrays with two numbers each.
 * @param input Array of numbers
 * @returns Array of arrays with two numbers
 */
const chunkArray = (input: number[]): number[][] => {
  const output = [];
  for (let i = 0; i < input.length; i += 2) {
    output.push(input.slice(i, i + 2));
  }
  return output;
};

/**
 * Create a `HTMLImageElement` from object URL string.
 * @param objectUrl Object URL string of image
 * @returns `HTMLImageElement`
 */
const objectUrlToImage = async (objectUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject): void => {
    const image = new Image();
    image.src = objectUrl;
    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject;
  });
};

/**
 * Parse auxiliary XML file for georeference information.
 * @param url URL of `*.aux.xml` file with georeference information
 * @returns Object with array of control points and associated spatial reference
 */
export const auxiliaryXmlToControlPoints = async (
  url: string,
): Promise<{
  /**
   * Array of control points.
   */
  controlPoints: esri.ControlPoint[];
  /**
   * Spatial reference of control points.
   */
  spatialReference: esri.SpatialReference;
}> => {
  // fetch georeference xml
  const xml = await (await fetch(url)).text();

  // parse xml to json
  const xml2json = new XMLParser().parse(xml);

  // find `Metadata` object with georeference information
  const geoData = (xml2json.PAMDataset.Metadata as Array<any>).find((data: any): boolean => {
    return Object.prototype.hasOwnProperty.call(data, 'GeodataXform');
  }).GeodataXform;

  // spatial reference of target points
  const spatialReference = new SpatialReference({ wkid: geoData.SpatialReference.WKID });

  // array of source points, i.e. [pnt_1_x, pnt_1_y, pnt_2_x, pnt_2_y...]
  // xml parser will stringify numbers with precision greater than 16 so convert strings to numbers
  const sourceArray = (geoData.SourceGCPs.Double as Array<number | string>).map((value: number | string): number => {
    return typeof value === 'number' ? value : parseFloat(value);
  });

  // array of target points, i.e. [pnt_1_x, pnt_1_y, pnt_2_x, pnt_2_y...]
  // xml parser will stringify numbers with precision greater than 16 so convert strings to numbers
  const targetArray = (geoData.TargetGCPs.Double as Array<number | string>).map((value: number | string): number => {
    return typeof value === 'number' ? value : parseFloat(value);
  });

  // chunk source and target points into arrays of [pnt_x, pnt_y]
  const sourceCoordinates = chunkArray(sourceArray);
  const targetCoordinates = chunkArray(targetArray);

  // create control points
  const controlPoints = sourceCoordinates.map((source: number[], index: number): esri.ControlPoint => {
    const target = targetCoordinates[index] as number[];
    return {
      mapPoint: new Point({
        x: target[0],
        y: target[1],
        spatialReference,
      }),
      // note: source point y needs to be reversed from georeferenced xml
      sourcePoint: { x: source[0], y: -source[1] },
    };
  });

  return {
    controlPoints,
    spatialReference,
  };
};

/**
 * Create image media layer.
 * @param url URL of source image for MediaLayer (must have associated `*.aux.xml` file at same location)
 * @param mediaLayerProperties Optional MediaLayerProperties for the MediaLayer
 * @returns Promise resolving the MediaLayer
 */
const imageMediaLayer = async (
  url: string,
  mediaLayerProperties?: esri.MediaLayerProperties,
): Promise<esri.MediaLayer> => {
  // control points and spatial reference from `*.aux.xml` file
  const { controlPoints, spatialReference } = await auxiliaryXmlToControlPoints(`${url}.aux.xml`);

  // fetch image
  const blob = await (await fetch(url)).blob();

  // convert to object URL
  const imageUrl = await blobToObjectUrl(blob);

  // create HTMLImageElement for dimensions and to pass to ImageElement
  const image = await objectUrlToImage(imageUrl);

  const imageElement = new ImageElement({
    image,
    georeference: new ControlPointsGeoreference({
      controlPoints,
      width: image.width,
      height: image.height,
    }),
  });

  imageElement.watch('loadError', async (error: string) => {
    if (error) {
      console.log(error);

      // const pubSub = await import('pubsub-js');

      // pubSub.publish('shell-application-alert', {
      //   title: 'Load error',
      //   message: 'Failed to load image layer',
      //   duration: 'fast',
      //   kind: 'danger',
      // } as AlertOptions);

      publish('shell-application-alert', {
        title: 'Load error',
        message: 'Failed to load image layer',
        duration: 'fast',
        kind: 'danger',
      } as AlertOptions);

      // (await import('pubsub-js')).publish('shell-application-alert', {
      //   title: 'Load error',
      //   message: 'Failed to load image layer',
      //   duration: 'fast',
      //   kind: 'danger',
      // } as AlertOptions);
    }
  });

  const layer = new MediaLayer({
    ...mediaLayerProperties,
    ...{
      source: [imageElement],
      spatialReference,
    },
  });

  return layer;
};

/**
 * Display media layer control points.
 * @param mediaLayer Media layer of interest
 * @param view View to display points in
 */
export const displayControlPoints = (mediaLayer: esri.MediaLayer, view: esri.MapView): void => {
  if (!mediaLayer.source || !(mediaLayer.source as esri.LocalMediaElementSource).elements.length) return;
  (
    ((mediaLayer.source as esri.LocalMediaElementSource).elements.getItemAt(0) as esri.ImageElement)
      .georeference as esri.ControlPointsGeoreference
  ).controlPoints.forEach((controlPoint: esri.ControlPoint): void => {
    const graphic = new Graphic({
      geometry: controlPoint.mapPoint?.clone(),
      symbol: new SimpleMarkerSymbol({
        color: 'blue',
        size: 9,
        style: 'circle',
        outline: {
          color: 'white',
          width: 1,
        },
      }),
    });
    view.graphics.add(graphic);
    _displayControlPoints.push(graphic);
  });
};

/**
 * Clear displayed media layer control points.
 * @param view View with media layer control points display in
 */
export const clearControlPoints = (view: esri.MapView): void => {
  view.graphics.removeMany(_displayControlPoints);
  _displayControlPoints = [];
};

export default imageMediaLayer;
