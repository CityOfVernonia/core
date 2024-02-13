import './dev-measure.scss';

import esri = __esri;

import esriConfig from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import cityBoundaryExtents from './../src/support/cityBoundaryExtents';
import taxLotPopup from './../src/popups/TaxLotPopup';
import Color from '@arcgis/core/Color';

import MapApplication from './../src/layouts/MapApplication';
import Measure from './../src/widgets/Measure';

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

  const wastewater = new MapImageLayer({
    portalItem: {
      id: '00c2e9bba18842ebaf204b6cca12af2f',
    },
  });

  const view = new MapView({
    map: new WebMap({
      basemap: hillshadeBasemap,
      layers: [taxLots, wastewater, cityLimits],
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

  // setMeasureColors([0, 0, 0], [255, 255, 255]);

  const measure = new Measure({
    view,
  });

  const mapApplication = new MapApplication({
    nextBasemap: hybridBasemap,
    title: 'cov.widgets.Measure',
    view,
    widgetInfos: [
      {
        icon: 'measure',
        text: 'Measure',
        type: 'panel',
        widget: measure,
      },
    ],
  });

  mapApplication.on('load', (): void => {
    mapApplication.showWidget(measure.id);
  });
};

load();