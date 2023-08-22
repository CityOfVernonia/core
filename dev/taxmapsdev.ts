import './main.scss';

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import cityBoundaryExtents from '../dist/support/cityBoundaryExtents';

import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { SimpleRenderer } from '@arcgis/core/renderers';
import { SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';
import LabelClass from '@arcgis/core/layers/support/LabelClass';

import ShellApplicationMap from '../dist/layouts/ShellApplicationMap';
import TaxMaps from '../src/widgets/TaxMaps';

esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

const load = async (): Promise<void> => {
  const hillshadeBasemap = new Basemap({
    portalItem: {
      id: '6e9f78f3a26f48c89575941141fd4ac3',
    },
  });

  const hybridBasemap = new Basemap({
    portalItem: {
      id: '2622b9aecacd401583981410e07d5bb9',
    },
  });

  const taxMaps = new GeoJSONLayer({
    url: 'https://cityofvernonia.github.io/vernonia-tax-maps/TaxMapBoundaries.geojson',
    outFields: ['*'],
    title: 'Tax Map Boundaries',
    visible: false,
    renderer: new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          color: 'yellow',
          width: 0.75,
        },
      }),
    }),
    labelingInfo: [
      new LabelClass({
        labelExpressionInfo: {
          expression: '$feature.name',
        },
        symbol: new TextSymbol({
          color: 'yellow',
          haloColor: [0, 0, 0, 0.5],
          haloSize: 1.25,
        }),
      }),
    ],
  });

  const { cityLimits, extent, constraintExtent } = await cityBoundaryExtents('5e1e805849ac407a8c34945c781c1d54');

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [cityLimits, taxMaps],
      ground: 'world-elevation',
    }),
    extent,
    constraints: {
      geometry: constraintExtent,
      minScale: 40000,
      rotationEnabled: false,
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: 'bottom-left',
        breakpoint: false,
      },
    },
  });

  new ShellApplicationMap({
    view,
    panelPosition: 'end',
    title: '@vernonia/core',
    nextBasemap: hybridBasemap,
    headerOptions: { searchViewModel: new SearchViewModel({ view }) },
    viewControlOptions: {
      includeFullscreen: true,
      includeLocate: true,
    },
    panelWidgets: [
      {
        widget: new TaxMaps({
          view,
          layer: taxMaps,
          imageUrlTemplate: 'https://cityofvernonia.github.io/vernonia-tax-maps/tax-maps/jpg/{taxmap}.jpg',
          titleAttributeField: 'name',
          fileAttributeField: 'taxmap',
          urlAttributeField: 'county_url',
        }),
        icon: 'information',
        text: 'Tax Maps',
        type: 'calcite-panel',
        open: true,
      },
    ],
  });
};

load();