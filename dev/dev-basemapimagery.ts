import './main.scss';

import esri = __esri;

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';
import taxLotPopup from './../src/popups/TaxLotPopup';
import Color from '@arcgis/core/Color';

import ShellApplicationMap from './../src/layouts/ShellApplicationMap';
import Layers from './../src/widgets/Layers';
import Measure from './../src/widgets/Measure';

import BasemapImagery from './../src/widgets/BasemapImagery';

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

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [taxLots, cityLimits],
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

  new ShellApplicationMap({
    view,
    panelPosition: 'end',
    title: '@vernonia/core',
    nextBasemap: hybridBasemap,
    headerOptions: { searchViewModel: new SearchViewModel({ view }) },
    viewControlOptions: {
      includeFullscreen: true,
      includeLocate: true,
    },
    panelWidgets: [
      {
        widget: new BasemapImagery({
          control: 'select',
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
            {
              title: 'Oregon Imagery 2016',
              description: 'One-meter resolution color Digital Orthophoto Quadrangles (DOQ) flown in 2016.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2016/NAIP_2016_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2014',
              description: 'One-meter resolution color Digital Orthophoto Quadrangles (DOQ) flown in 2014.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2014/NAIP_2014_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2012',
              description: 'One-meter resolution color Digital Orthophoto Quadrangles (DOQ) flown in 2012.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2012/NAIP_2012_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2011',
              description: 'One-meter resolution color Digital Orthophoto Quadrangles (DOQ) collected in summer 2011.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2011/NAIP_2011_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2009',
              description:
                'Digital 4 band ortho imagery covering the state of Oregon was flown over the summer of 2009.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2009/NAIP_2009_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2005',
              description: 'Half-meter resolution color Digital Orthophoto Quadrangles (DOQ) from the summer of 2005',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2005/NAIP_2005_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 2000',
              description: '2000 one-meter orthoimagery.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_2000/NAIP_2000_WM/ImageServer',
            },
            {
              title: 'Oregon Imagery 1995',
              description: 'One-meter resolution color Digital Orthophoto Quadrangles (DOQ) collected in summer 1995.',
              url: 'https://imagery.oregonexplorer.info/arcgis/rest/services/NAIP_1995/NAIP_1995_WM/ImageServer',
            },
            {
              title: 'Esri World Imagery',
              description:
                'This layer presents low-resolution satellite imagery for the world and high-resolution satellite and aerial imagery, typically within 3-5 years of currency, for most of the world.',
              url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer',
            },
          ],
        }),
        icon: 'basemap',
        text: 'Basemap Imagery',
        type: 'calcite-panel',
        open: true,
      },
      {
        widget: new Layers({ view }),
        icon: 'layers',
        text: 'Layers',
        type: 'calcite-panel',
      },
      {
        widget: new Measure({ view }),
        icon: 'measure',
        text: 'Measure',
        type: 'calcite-panel',
      },
    ],
  });
};

load();
