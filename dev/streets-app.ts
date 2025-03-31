import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/map-components/arcgis-map-components/arcgis-map-components.css';
import '../src/scss/cov.scss';
import '../src/components/MapApplication.scss';
import '../src/components/StreetsShellPanel.scss';

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
  const Basemap = (await import('@arcgis/core/Basemap')).default;
  const FeatureLayer = (await import('@arcgis/core/layers/FeatureLayer')).default;
  const MapImageLayer = (await import('@arcgis/core/layers/MapImageLayer')).default;

  const { SimpleLineSymbol } = await import('@arcgis/core/symbols');

  // application modules
  const MapApplication = (await import('../src/components/MapApplication')).default;

  // const mapImageNoPopups = (await import('../src/support/layerUtils')).mapImageNoPopups;

  // const hillshade = new Basemap({ portalItem: { id: '6e9f78f3a26f48c89575941141fd4ac3' }, title: 'Hillshade' });

  const imagery = new Basemap({ portalItem: { id: '2ae669ac07e646b19726b95ff04c06c3' }, title: 'Imagery' });

  const streets = new MapImageLayer({
    portalItem: { id: '14747b921aec4ecdab09fed9dc6a25e5' },
  });

  const centerlines = new FeatureLayer({
    portalItem: { id: 'c616c25335f94d3eb9880c057a372ac9' },
    outFields: ['*'],
    opacity: 0,
  });

  const { cityLimits, constraintExtent, extent } = await (
    await import('../src/support/cityBoundaryExtents')
  ).default('5e1e805849ac407a8c34945c781c1d54');

  const view = new MapView({
    map: new Map({ basemap: imagery, layers: [streets, cityLimits, centerlines], ground: 'world-elevation' }),
    extent,
    constraints: { geometry: constraintExtent, minScale: 40000, rotationEnabled: false },
    popup: { dockEnabled: true, dockOptions: { breakpoint: false, buttonEnabled: false, position: 'bottom-left' } },
  });

  new MapApplication({
    float: false,
    shellPanel: new (await import('../src/components/StreetsShellPanel')).default({ centerlines, streets, view }),
    title: 'Vernonia Streets',
    view,
  });
};

load();
