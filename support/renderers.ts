import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
// import Color from '@arcgis/core/Color';

/**
 * Tax lots on hillshade or light brownish basemaps.
 */
export const taxLotsHillshade = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [152, 114, 11, 1],
      width: 0.5,
    },
  }),
});

/**
 * Tax lots on imagery basemaps.
 */
export const taxLotsImagery = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: {
      color: [152, 114, 11, 1],
      width: 0.5,
    },
  }),
});

/**
 * Wetland for imagery basemaps.
 */
export const wetlands = {
  local: new SimpleRenderer({
    symbol: new SimpleFillSymbol({
      color: [0, 0, 255, 0.2],
      outline: {
        color: [0, 0, 255, 0.8],
        width: 1,
      },
    }),
  }),

  state: new SimpleRenderer({
    symbol: new SimpleFillSymbol({
      color: [0, 255, 0, 0.2],
      outline: {
        color: [0, 255, 0, 0.8],
        width: 1,
      },
    }),
  }),

  national: new SimpleRenderer({
    symbol: new SimpleFillSymbol({
      color: [255, 0, 0, 0.2],
      outline: {
        color: [255, 0, 0, 0.8],
        width: 1,
      },
    }),
  }),
};
