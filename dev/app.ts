import '@esri/calcite-components/dist/calcite/calcite.css';
import './main.scss';

import esri = __esri;

// esri config
import esriConfig from '@arcgis/core/config';
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

// calcite
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
defineCustomElements(window, { resourcesUrl: './calcite/assets' });

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';
import { geojsonLayerFromJSON } from './../src/support/layerUtils';
// import taxLotPopup from './../src/popups/TaxLotPopup';
import VernoniaMapTaxLotPopup from './../src/popups/VernoniaMapTaxLotPopup';
import planningFilesPopup from './../src/popups/PlanningFilesPopup';
import Color from '@arcgis/core/Color';

import MapApplication from './../src/layouts/MapApplication';

import BasemapImagery from './../src/components/panels/BasemapImagery';
import FIRMette from './../src/components/panels/FIRMette';
import LayersLegend from './../src/components/panels/LayersLegend';
import Measure from './../src/components/panels/Measure';
import PlanningFiles from './../src/components/panels/PlanningFiles';
import PrintSnapshot from './../src/components/panels/PrintSnapshot';
import SurveySearch from './../src/components/panels/SurveySearch';
import TaxLotBuffer from './../src/components/panels/TaxLotBuffer';
import TaxMaps from './../src/components/panels/TaxMaps';

import TestModal from './../src/components/modals/TestModal';
// import TestShellPanel from './../src/components/shellPanels/TestShellPanel';

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

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a0837699982f41e6b3eb92429ecdb694',
    },
    outFields: ['*'],
    // popupTemplate: taxLotPopup,
    popupTemplate: new VernoniaMapTaxLotPopup({
      zoning: new FeatureLayer({
        url: 'https://gis.vernonia-or.gov/server/rest/services/LandUse/Land_Use/MapServer/30',
      }),
      floodZones: new FeatureLayer({
        url: 'https://gis.vernonia-or.gov/server/rest/services/LandUse/Vernonia_Flood/MapServer/4',
      }),
    }),
  });

  taxLots.when((): void => {
    const tlr = taxLots.renderer as esri.SimpleRenderer;
    const tls = tlr.symbol as esri.SimpleFillSymbol;
    view.map.watch('basemap', (basemap: esri.Basemap): void => {
      tls.outline.color = basemap === hybridBasemap ? new Color([246, 213, 109, 0.5]) : new Color([152, 114, 11, 0.5]);
    });
  });

  const taxMaps = await geojsonLayerFromJSON(
    'https://cityofvernonia.github.io/geospatial-data/tax-maps/tax-map-boundaries.json',
    { visible: false },
  );

  const planningFilesLayer = new FeatureLayer({
    portalItem: {
      id: '2de40e7eca4445e2b2fa42b58b664fda',
    },
    popupTemplate: planningFilesPopup,
    visible: false,
  });

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [taxLots, cityLimits, taxMaps, planningFilesLayer],
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

  const mapApplication = new MapApplication({
    endShellPanelComponent: {
      component: new TestModal(),
      icon: 'lightbulb',
      text: 'Info',
      type: 'modal',
    },
    // footer: new TestShellPanel(),
    nextBasemap: hybridBasemap,
    title: '@vernonia/core',
    searchViewModel: new SearchViewModel(),
    shellPanelComponentInfos: [
      {
        component: new BasemapImagery({
          control: 'radio',
          view,
          basemap: hybridBasemap,
          imageryInfos: [
            {
              title: 'Oregon Imagery 2022',
              description:
                'One-foot resolution color Digital Orthophoto Quarter Quadrangles (DOQQ) acquired between June and September 2022.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2022/OSIP_2022_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2020',
              description: '60cm resolution color Digital Orthophoto Quadrangles (DOQ) flown in 2020.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2020/NAIP_2020_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2018',
              description: '60cm resolution color Digital Orthophoto Quadrangles (DOQ) flown in 2018.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/OSIP_2018/OSIP_2018_WM/ImageServer',
            },
          ],
        }),
        icon: 'basemap',
        text: 'Basemap Imagery',
        type: 'panel',
      },
      {
        component: new FIRMette({ view }),
        icon: 'map-pin',
        text: 'FIRMette',
        type: 'panel',
      },
      {
        component: new LayersLegend({ view }),
        icon: 'layers',
        text: 'Layers',
        type: 'panel',
      },
      {
        component: new Measure({ view }),
        icon: 'measure',
        text: 'Measure',
        type: 'panel',
      },
      {
        component: new PlanningFiles({ layer: planningFilesLayer }),
        icon: 'file-report',
        text: 'Planning Files',
        type: 'panel',
      },
      {
        component: new PrintSnapshot({ view }),
        icon: 'print',
        text: 'Print',
        type: 'panel',
      },
      {
        component: new SurveySearch({
          view,
          taxLots,
          surveysGeoJSONUrl: 'https://cityofvernonia.github.io/geospatial-data/record-surveys/surveys.geojson',
        }),
        icon: 'analysis',
        text: 'Survey Search',
        type: 'panel',
      },
      {
        component: new TaxLotBuffer({ view, layer: taxLots }),
        icon: 'territory-buffer-distance',
        text: 'Tax Lot Buffer',
        type: 'panel',
      },
      {
        component: new TaxMaps({
          view,
          layer: taxMaps,
          imageUrlTemplate: 'https://cityofvernonia.github.io/geospatial-data/tax-maps/files/jpg/{taxmap}.jpg',
          titleAttributeField: 'name',
          fileAttributeField: 'taxmap',
          urlAttributeField: 'county_url',
        }),
        icon: 'tile-layer',
        text: 'Tax Maps',
        type: 'panel',
      },
    ],
    view,
    viewControlOptions: {
      includeFullscreen: true,
      includeLocate: true,
    },
  });

  mapApplication.on('load', (): void => {});

  console.log(view);
};

load();
