import './dev-firmette.scss';

import esri = __esri;

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';

import MapApplication from './../src/layouts/MapApplication';
import FIRMette from './../src/widgets/FIRMette';

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

  const { cityLimits, extent, constraintExtent } = await cityBoundaryExtents('5e1e805849ac407a8c34945c781c1d54');

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [cityLimits],
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

  const firmette = new FIRMette({ view });

  const mapApplication = new MapApplication({
    nextBasemap: hybridBasemap,
    title: 'cov.widgets.FIRMette',
    searchViewModel: new SearchViewModel(),
    view,
    widgetInfos: [
      {
        icon: 'print',
        text: 'FIRMette',
        type: 'panel',
        widget: firmette,
      },
    ],
  });

  mapApplication.on('load', (): void => {
    mapApplication.showWidget(firmette.id);
  });
};

load();
