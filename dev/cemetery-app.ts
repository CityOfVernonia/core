import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/map-components/arcgis-map-components/arcgis-map-components.css';
import '../src/scss/cov.scss';
import '../src/components/MapApplication.scss';
import '../src/components/CemeteryShellPanel.scss';

import esri = __esri;

// arcgis config
import esriConfig from '@arcgis/core/config';
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

// map components
import { setAssetPath } from '@arcgis/map-components';
setAssetPath('./map-components');

// calcite assets
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
defineCustomElements(window, { resourcesUrl: './calcite/assets' });

const load = async (): Promise<void> => {
  const Map = (await import('@arcgis/core/Map')).default;
  const MapView = (await import('@arcgis/core/views/MapView')).default;
  const FeatureLayer = (await import('@arcgis/core/layers/FeatureLayer')).default;
  const MapImageLayer = (await import('@arcgis/core/layers/MapImageLayer')).default;

  const { SimpleFillSymbol } = await import('@arcgis/core/symbols');

  // application modules
  const MapApplication = (await import('../src/components/MapApplication')).default;

  const CemeteryShellPanel = (await import('../src/components/CemeteryShellPanel')).default;

  const mapImageNoPopups = (await import('../src/support/layerUtils')).mapImageNoPopups;

  const cemetery = new MapImageLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/Cemetery/vmc_test/MapServer',
  });

  mapImageNoPopups(cemetery);

  const plots = new FeatureLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/Cemetery/vmc_test/MapServer/2',
    labelsVisible: false,
    renderer: {
      type: 'simple',
      symbol: new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          color: [0, 0, 0, 0],
        },
      }),
    },
  });

  await plots.load();

  const burials = new FeatureLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/Cemetery/vmc_test/MapServer/10',
  });

  const reservations = new FeatureLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/Cemetery/vmc_test/MapServer/9',
  });

  const view = new MapView({
    map: new Map({ layers: [cemetery, plots] }),
    extent: plots.fullExtent as esri.Extent,
    constraints: {
      geometry: (plots.fullExtent as esri.Extent).clone().expand(1.5),
      minScale: 1800,
      rotationEnabled: false,
    },
  });

  new MapApplication({
    float: false,
    shellPanel: new CemeteryShellPanel({
      burials,
      plots,
      printServiceUrl:
        'https://gis.vernonia-or.gov/server/rest/services/Cemetery/CemeteryPrintTask/GPServer/Export%20Web%20Map',
      reservations,
      view,
    }),
    title: 'Vernonia Memorial Cemetery',
    view,
  });
};

load();
