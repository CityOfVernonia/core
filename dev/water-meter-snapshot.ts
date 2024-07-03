import './main.scss';

import esri = __esri;

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';

import MapApplication from './../src/layouts/MapApplication';

import WaterMeterSnapshot from './../src/components/shellPanels/WaterMeterSnapshot';

esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

const load = async (): Promise<void> => {
  const { cityLimits, extent, constraintExtent } = await cityBoundaryExtents('5e1e805849ac407a8c34945c781c1d54');

  const layer = new FeatureLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/UtilityMapping/Water_Meters/MapServer/0',
    outFields: ['*'],
    popupEnabled: false,
  });

  const view = new MapView({
    map: new WebMap({
      basemap: new Basemap({
        portalItem: {
          id: '2622b9aecacd401583981410e07d5bb9',
        },
      }),
      layers: [cityLimits, layer],
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

  new MapApplication({
    shellPanel: new WaterMeterSnapshot({ layer, view }),
    title: '@vernonia/core',
    view,
  });
};

load();
