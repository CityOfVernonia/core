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

import MapApplication from './../src/layouts/MapApplication';
import Layers from './../src/widgets/Layers';
import Measure from './../src/widgets/Measure';

import AlertModal from './../src/modals/AlertModal';
import ConfirmModal from './../src/modals/ConfirmModal';

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

  new MapApplication({
    nextBasemap: hybridBasemap,
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
        icon: 'layers',
        text: 'Layers',
        type: 'panel',
        widget: new Layers({ view }),
      },
    ],
  });

  // @ts-expect-error testing 1 2 3
  const alertModal1 = (window.alertModal1 = new AlertModal());

  // @ts-expect-error testing 1 2 3
  window.alertModal1Show = (): void => {
    alertModal1.showAlert({
      content: 'You have been alerted.',
      header: 'Alert!',
      kind: 'danger',
    });
  };

  alertModal1.on('alerted', (): void => {
    console.log('alerted');
  });

  // @ts-expect-error testing 1 2 3
  window.alertModal2 = new AlertModal({
    content: 'This is a test of the alert modal system.',
    header: 'Test!',
    kind: 'warning',
    primaryButtonText: 'Got It',
  });

  // @ts-expect-error testing 1 2 3
  const confirmModal1 = (window.confirmModal1 = new ConfirmModal());

  confirmModal1.on('confirmed', (confirmed: boolean): void => {
    console.log('confirmed', confirmed);
  });

  // @ts-expect-error testing 1 2 3
  const confirmModal2 = (window.confirmModal2 = new ConfirmModal({
    content: 'Is 12345678987654321 a prime number?',
    header: 'Primes',
    primaryButtonText: 'Yes',
    secondaryButtonText: 'No',
  }));

  confirmModal2.on('confirmed', (confirmed: boolean): void => {
    console.log('confirmed', confirmed);
  });
};

load();
