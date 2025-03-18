import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/map-components/arcgis-map-components/arcgis-map-components.css';
import '../src/scss/cov.scss';
import './main.scss';
import '../src/components/MapApplication.scss';
import '../src/components/LayersLegend.scss';
import '../src/components/PrintSnapshot.scss';

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
  // arcgis modules
  const Map = (await import('@arcgis/core/Map')).default;
  const MapView = (await import('@arcgis/core/views/MapView')).default;
  const Basemap = (await import('@arcgis/core/Basemap')).default;

  // application modules
  const MapApplication = (await import('../src/components/MapApplication')).default;

  // components
  const LayersLegend = (await import('../src/components/LayersLegend')).default;
  const PrintSnapshot = (await import('../src/components/PrintSnapshot')).default;

  const title = '@vernonia/core';

  const { cityLimits, constraintExtent, extent } = await (
    await import('../src/support/cityBoundaryExtents')
  ).default('5e1e805849ac407a8c34945c781c1d54');

  const hillshade = new Basemap({ portalItem: { id: '6e9f78f3a26f48c89575941141fd4ac3' }, title: 'Hillshade' });

  const imagery = new Basemap({ portalItem: { id: '2622b9aecacd401583981410e07d5bb9' }, title: 'Imagery' });

  const view = new MapView({
    map: new Map({ basemap: hillshade, layers: [cityLimits], ground: 'world-elevation' }),
    extent,
    constraints: { geometry: constraintExtent, minScale: 40000, rotationEnabled: false },
    popup: { dockEnabled: true, dockOptions: { breakpoint: false, buttonEnabled: false, position: 'bottom-left' } },
  });

  new MapApplication({
    basemapOptions: { hillshade, imagery },
    components: [
      { component: new LayersLegend({ view, visible: false }), icon: 'layers', text: 'Layers', type: 'calcite-panel' },
      {
        component: new PrintSnapshot({
          printServiceUrl:
            'https://gis.vernonia-or.gov/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
          view,
          visible: false,
        }),
        icon: 'print',
        text: 'Print',
        type: 'calcite-panel',
      },
    ],
    title,
    view,
    viewControlOptions: { includeFullscreen: true, includeLocate: true },
  });
};

load();
