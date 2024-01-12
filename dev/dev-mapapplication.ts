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

import MapApplication, { showAlertTopic, AlertOptions } from './../src/layouts/MapApplication';

import Portal from '@arcgis/core/portal/Portal';
import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import OAuth from '../src/support/OAuth';

import TestWidgetModal from './../src/modals/TestWidgetModal';
import Measure from './../src/widgets/Measure';

import { publish } from 'pubsub-js';

esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
esriConfig.assetsPath = './arcgis';

const portal = new Portal();
const oAuth = new OAuth({
  portal,
  oAuthInfo: new OAuthInfo({
    portalUrl: esriConfig.portalUrl,
    appId: 'abcdefghijklmnopqrstuvwxyz1234567890',
    popup: true,
  }),
});

const load = async (): Promise<void> => {
  await portal.load();
  await oAuth.load();

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

  const mapApplication = new MapApplication({
    endWidgetInfo: {
      icon: 'lightbulb',
      text: 'About',
      type: 'modal',
      widget: new TestWidgetModal(),
    },
    nextBasemap: hybridBasemap,
    oAuth,
    title: '@vernonia/core',
    searchViewModel: new SearchViewModel(),
    view,
    widgetInfos: [
      {
        icon: 'measure',
        text: 'Measure',
        type: 'panel',
        widget: new Measure({ view }),
      },
      {
        icon: 'test-data',
        text: 'Test',
        type: 'modal',
        widget: new TestWidgetModal(),
      },
    ],
  });

  mapApplication.on('load', (): void => {
    mapApplication.showAlert({
      duration: 'fast',
      label: 'Testing',
      message: 'This is a test.',
      title: 'Alert Test',
    });

    setTimeout((): void => {
      mapApplication.showAlert({
        duration: 'fast',
        kind: 'danger',
        label: 'Testing',
        message: 'This is a test.',
        title: 'Alert Test',
      });
    }, 2000);

    setTimeout((): void => {
      publish(showAlertTopic(), {
        // duration: 'slow',
        kind: 'info',
        label: 'Testing',
        message: 'This is a pub/sub test.',
        title: 'Alert Test',
        width: 240,
      } as AlertOptions);
    }, 15000);
  });
};

load();
