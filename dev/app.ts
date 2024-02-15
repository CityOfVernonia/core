import './main.scss';

import esri = __esri;

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';
import { geojsonLayerFromJSON } from './../src/support/layers';
import taxLotPopup from './../src/popups/TaxLotPopup';
import Color from '@arcgis/core/Color';

import MapApplication from './../src/layouts/MapApplication';

import BasemapImagery from './../src/panels/BasemapImagery';
import FIRMette from './../src/panels/FIRMette';
import LayersLegend from './../src/panels/LayersLegend';
import Measure from './../src/panels/Measure';
import PrintSnapshot from './../src/panels/PrintSnapshot';
import SurveySearch from './../src/panels/SurveySearch';
import TaxLotBuffer from './../src/panels/TaxLotBuffer';
import TaxMaps from './../src/panels/TaxMaps';

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

  const taxLots = new FeatureLayer({
    portalItem: {
      id: 'a0837699982f41e6b3eb92429ecdb694',
    },
    outFields: ['*'],
    popupTemplate: taxLotPopup,
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

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [taxLots, cityLimits, taxMaps],
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

  new MapApplication({
    nextBasemap: hybridBasemap,
    title: '@vernonia/core',
    searchViewModel: new SearchViewModel(),
    view,
    viewControlOptions: {
      includeFullscreen: true,
      includeLocate: true,
    },
    widgetInfos: [
      {
        icon: 'basemap',
        text: 'Basemap Imagery',
        type: 'panel',
        widget: new BasemapImagery({
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
      },
      {
        icon: 'map-pin',
        text: 'FIRMette',
        type: 'panel',
        widget: new FIRMette({ view }),
      },
      {
        icon: 'layers',
        text: 'Layers',
        type: 'panel',
        widget: new LayersLegend({ view }),
      },
      {
        icon: 'measure',
        text: 'Measure',
        type: 'panel',
        widget: new Measure({ view }),
      },
      {
        icon: 'print',
        text: 'Print',
        type: 'panel',
        widget: new PrintSnapshot({ view }),
      },
      {
        icon: 'analysis',
        text: 'Survey Search',
        type: 'panel',
        widget: new SurveySearch({
          view,
          taxLots,
          surveysGeoJSONUrl: 'https://cityofvernonia.github.io/geospatial-data/record-surveys/surveys.geojson',
        }),
      },
      {
        icon: 'territory-buffer-distance',
        text: 'Tax Lot Buffer',
        type: 'panel',
        widget: new TaxLotBuffer({ view, layer: taxLots }),
      },
      {
        icon: 'tile-layer',
        text: 'Tax Maps',
        type: 'panel',
        widget: new TaxMaps({
          view,
          layer: taxMaps,
          imageUrlTemplate: 'https://cityofvernonia.github.io/geospatial-data/tax-maps/files/jpg/{taxmap}.jpg',
          titleAttributeField: 'name',
          fileAttributeField: 'taxmap',
          urlAttributeField: 'county_url',
        }),
      },
    ],
  });
};

load();
