import './main.scss';

import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import TaxLotPopup from './../src/popups/TaxLotPopup';

import MapApplication from '@vernonia/map-application/dist/MapApplication';

import Measure from './../src/widgets/Measure';
import './../src/widgets/Measure.scss';

import Markup from './../src/widgets/Markup';
import './../src/widgets/Markup.scss';

esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';

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

  const cityLimits = new FeatureLayer({
    portalItem: {
      id: '5e1e805849ac407a8c34945c781c1d54',
    },
  });

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a0837699982f41e6b3eb92429ecdb694',
    },
    outFields: ['*'],
    popupTemplate: TaxLotPopup,
  });

  await cityLimits.load();
  const extent = cityLimits.fullExtent.clone();
  const constraintGeometry = extent.clone().expand(3);

  const view = new MapView({
    map: new Map({
      basemap: hillshadeBasemap,
      layers: [taxLots, cityLimits],
      ground: 'world-elevation',
    }),
    extent,
    constraints: {
      geometry: constraintGeometry,
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

  new MapApplication({
    contentBehind: true,
    title: '@vernonia/core',
    nextBasemap: hybridBasemap,
    panelPosition: 'end',
    panelWidgets: [
      {
        widget: new Measure({ view }),
        text: 'Measure',
        icon: 'measure',
        type: 'calcite-panel',
      },
      {
        widget: new Markup({ view, offsetProjectionWkid: 102970 }),
        text: 'Markup',
        icon: 'pencil',
        type: 'calcite-panel',
      },
    ],
    view,
    viewControlOptions: {
      includeLocate: true,
      includeFullscreen: true,
      includeMagnifier: true,
    },
  });
};

load();
