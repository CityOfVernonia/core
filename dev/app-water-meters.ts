import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/map-components/arcgis-map-components/arcgis-map-components.css';
import '../src/scss/cov.scss';
import '../src/components/MapApplication.scss';

// import esri = __esri;

// arcgis config
import esriConfig from '@arcgis/core/config';
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

// map components
import { setAssetPath } from '@arcgis/map-components';
setAssetPath('./map-components');

// calcite assets
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
defineCustomElements(window, { resourcesUrl: './calcite' });

const load = async (): Promise<void> => {
  // arcgis modules
  const Map = (await import('@arcgis/core/Map')).default;
  const MapView = (await import('@arcgis/core/views/MapView')).default;
  const Basemap = (await import('@arcgis/core/Basemap')).default;
  const FeatureLayer = (await import('@arcgis/core/layers/FeatureLayer')).default;

  // application modules
  const MapApplication = (await import('../src/components/MapApplication')).default;

  // components
  const WaterMetersShellPanel = (await import('../src/components/WaterMetersShellPanel')).default;

  const title = 'Water Meters';

  const { constraintExtent, extent } = await (
    await import('../src/support/cityBoundaryExtents')
  ).default('5e1e805849ac407a8c34945c781c1d54');

  const imagery = new Basemap({ portalItem: { id: '2622b9aecacd401583981410e07d5bb9' }, title: 'Imagery' });

  const layer = new FeatureLayer({
    url: 'https://gis.vernonia-or.gov/server/rest/services/UtilityMapping/Water_Meters/MapServer/0',
    outFields: ['*'],
    popupEnabled: false,
  });

  const view = new MapView({
    map: new Map({ basemap: imagery, layers: [layer], ground: 'world-elevation' }),
    extent,
    constraints: { geometry: constraintExtent, minScale: 40000, rotationEnabled: false },
    popup: { dockEnabled: true, dockOptions: { breakpoint: false, buttonEnabled: false, position: 'bottom-left' } },
  });

  new MapApplication({
    header: false,
    title,
    shellPanel: new WaterMetersShellPanel({ layer, view }),
    view,
    viewControlOptions: { includeFullscreen: true, includeLocate: true },
  });
};

load();
