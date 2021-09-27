import esri = __esri;

import { generalize, geodesicLength, geodesicArea } from '@arcgis/core/geometry/geometryEngine';
import { Polyline } from '@arcgis/core/geometry';
import Graphic from '@arcgis/core/Graphic';

export const labelSegmentLengths = (
  geometry: esri.Polyline | esri.Polygon,
  unit: esri.LinearUnits,
  includeUnit: boolean,
  textSymbol: esri.TextSymbol,
  layer: esri.GraphicsLayer,
  popupTemplate?: esri.PopupTemplate,
): void => {
  geometry = generalize(geometry, 0.0001, false) as esri.Polyline | esri.Polygon;

  const pairs = geometry.type === 'polyline' ? geometry.paths : geometry.rings;

  pairs.forEach((xy: number[][]): void => {
    const { length } = xy;

    for (let i = 0; i < length - 1; i++) {
      const polyline = new Polyline({
        paths: [[xy[i], xy[i + 1]]],
        spatialReference: geometry.spatialReference,
      });

      let text = geodesicLength(polyline, unit).toFixed(2);

      if (includeUnit) text = `${text} ${unit}`;

      // const angle = Math.atan2(Math.abs(xy[i + 1][1]) - Math.abs(xy[i][1]), Math.abs(xy[i + 1][0]) - Math.abs(xy[i][0])) * 180 / Math.PI;

      const symbol = textSymbol.clone();

      symbol.text = text;
      symbol.verticalAlignment = 'middle';
      symbol.horizontalAlignment = 'center';
      // symbol.angle = angle;

      const graphic = new Graphic({
        geometry: polyline.extent.center,
        symbol,
      });

      if (popupTemplate) graphic.popupTemplate = popupTemplate;

      layer.add(graphic);
    }
  });
};

export const labelPolygonArea = (
  polygon: esri.Polygon,
  unit: esri.ArealUnits,
  includeUnit: boolean,
  textSymbol: esri.TextSymbol,
  layer: esri.GraphicsLayer,
  popupTemplate?: esri.PopupTemplate,
): void => {
  let text = geodesicArea(polygon, unit).toFixed(2);

  if (includeUnit) text = `${text} ${unit}`;

  const symbol = textSymbol.clone();

  symbol.text = text;
  symbol.verticalAlignment = 'middle';
  symbol.horizontalAlignment = 'center';

  const graphic = new Graphic({
    geometry: polygon.centroid,
    symbol,
  });

  if (popupTemplate) graphic.popupTemplate = popupTemplate;

  layer.add(graphic);
};
