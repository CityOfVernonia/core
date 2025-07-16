import '@esri/calcite-components/dist/calcite/calcite.css';
import '@arcgis/map-components/arcgis-map-components/arcgis-map-components.css';
import '../src/scss/cov.scss';
import '../src/components/MapApplication.scss';
import '../src/components/LayersLegend.scss';
import '../src/components/PrintSnapshot.scss';
import '../src/components/Measure.scss';
import '../src/components/Sketch.scss';
import '../src/components/TaxLotBuffer.scss';
import '../src/components/RecordSurveys.scss';

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
  const SearchViewModel = (await import('@arcgis/core/widgets/Search/SearchViewModel')).default;
  const LayerSearchSource = (await import('@arcgis/core/widgets/Search/LayerSearchSource')).default;

  // popups
  const TaxLotPopupTemplate = (await import('../src/popups/TaxLotPopupTemplate')).default;

  // application modules
  const MapApplication = (await import('../src/components/MapApplication')).default;

  // components
  const LayersLegend = (await import('../src/components/LayersLegend')).default;
  const PrintSnapshot = (await import('../src/components/PrintSnapshot')).default;
  const Measure = (await import('../src/components/Measure')).default;
  const Sketch = (await import('../src/components/Sketch')).default;
  const RecordSurveys = (await import('../src/components/RecordSurveys')).default;
  const TaxLotBuffer = (await import('../src/components/TaxLotBuffer')).default;
  const TaxMaps = (await import('../src/components/TaxMaps')).default;

  const MarkdownDialog = (await import('../src/components/MarkdownDialog')).default;

  const { taxLotColor } = await import('../src/support/taxLotUtils');

  const { applicationGraphicsLayer } = await import('../src/support/layerUtils');

  const { geojsonLayerFromJSON } = await import('../src/support/layerUtils');

  const title = '@vernonia/core';

  const { cityLimits, constraintExtent, extent } = await (
    await import('../src/support/cityBoundaryExtents')
  ).default('5e1e805849ac407a8c34945c781c1d54');

  const hillshade = new Basemap({ portalItem: { id: '6e9f78f3a26f48c89575941141fd4ac3' }, title: 'Hillshade' });

  const imagery = new Basemap({ portalItem: { id: '2622b9aecacd401583981410e07d5bb9' }, title: 'Imagery' });

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a0837699982f41e6b3eb92429ecdb694',
    },
    outFields: ['*'],
    popupTemplate: new TaxLotPopupTemplate({
      infoLayers: {
        zoning: new FeatureLayer({
          url: 'https://gis.vernonia-or.gov/server/rest/services/LandUse/Land_Use/MapServer/30',
        }),
        flood: new FeatureLayer({
          url: 'https://gis.vernonia-or.gov/server/rest/services/LandUse/Vernonia_Flood/MapServer/4',
        }),
        wetlands: {
          lwi: new FeatureLayer({
            url: 'https://gis.vernonia-or.gov/server/rest/services/Hosted/Oregon_Wetlands_2019/FeatureServer/0',
          }),
          nwi: new FeatureLayer({
            url: 'https://gis.vernonia-or.gov/server/rest/services/Hosted/Oregon_Wetlands_2019/FeatureServer/1',
          }),
          mow: new FeatureLayer({
            url: 'https://gis.vernonia-or.gov/server/rest/services/Hosted/Oregon_Wetlands_2019/FeatureServer/2',
          }),
        },
      },
    }),
  });

  const taxMaps = await geojsonLayerFromJSON(
    'https://cityofvernonia.github.io/geospatial-data/tax-map-boundaries/tax-map-boundaries.json',
    { visible: false, listMode: 'hide' },
  );

  const view = new MapView({
    map: new Map({ basemap: hillshade, layers: [taxLots, cityLimits, taxMaps], ground: 'world-elevation' }),
    extent,
    constraints: { geometry: constraintExtent, minScale: 40000, rotationEnabled: false },
    popup: { dockEnabled: true, dockOptions: { breakpoint: false, buttonEnabled: false, position: 'bottom-left' } },
  });

  applicationGraphicsLayer(view);

  taxLotColor(imagery, taxLots, view);

  const search = new SearchViewModel({
    view,
    includeDefaultSources: false,
    searchAllEnabled: false,
    sources: [
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['ADDRESS'],
        suggestionTemplate: '{ADDRESS}',
        placeholder: 'Tax lot by address',
        name: 'Tax lot by address',
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['OWNER'],
        suggestionTemplate: '{OWNER}',
        placeholder: 'Tax lot by owner',
        name: 'Tax lot by owner',
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['ACCOUNT_IDS'],
        suggestionTemplate: '{ACCOUNT_IDS}',
        placeholder: 'Tax lot by tax account',
        name: 'Tax lot by tax account',
      }),
      new LayerSearchSource({
        layer: taxLots,
        outFields: ['*'],
        searchFields: ['TAXLOT_ID'],
        suggestionTemplate: '{TAXLOT_ID}',
        placeholder: 'Tax lot by map and lot',
        name: 'Tax lot by map and lot',
      }),
    ],
  });

  new MapApplication({
    basemapOptions: { hillshade, imagery },
    components: [
      {
        component: new (await import('../src/components/BasemapImagery')).default(),
        icon: 'basemap',
        text: 'Basemap Imagery',
        type: 'calcite-panel',
      },
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
      {
        component: new Measure({ view, visible: false }),
        icon: 'measure',
        text: 'Measure',
        type: 'calcite-panel',
      },
      {
        component: new Sketch({ view, visible: false }),
        icon: 'pencil',
        text: 'Sketch',
        type: 'calcite-panel',
      },
      {
        component: new TaxMaps({ layer: taxMaps, view, visible: false }),
        icon: 'tile-layer',
        text: 'Tax Maps',
        type: 'calcite-panel',
      },
      {
        component: new RecordSurveys({
          taxLots,
          surveysUrl: 'https://cityofvernonia.github.io/geospatial-data/record-surveys/surveys.geojson',
          view,
          visible: false,
        }),
        icon: 'analysis',
        text: 'Survey Search',
        type: 'calcite-panel',
      },
      {
        component: new TaxLotBuffer({ taxLots, view, visible: false }),
        icon: 'buffer-polygon',
        text: 'Tax Lot Buffer',
        type: 'calcite-panel',
      },
      {
        component: new MarkdownDialog({ heading: 'Info', url: '/test.markdown' }),
        icon: 'information',
        text: 'Information',
        type: 'calcite-dialog',
      },
    ],
    headerOptions: { search },
    title,
    // shellPanel: new (await import('../src/components/TestShellPanel')).default(),
    view,
    viewControlOptions: { includeFullscreen: true, includeLocate: true },
  });
};

load();
