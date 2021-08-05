// import esri = __esri;

// esri config and auth
import esriConfig from '@arcgis/core/config';

// loading screen
import LoadingScreen from './../widgets/LoadingScreen';

import DisclaimerModal from './../widgets/DisclaimerModal';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';

// the viewer
import Viewer from './../Viewer';

import Measure from './../widgets/Measure';

import Print from './../widgets/Print';

// app config and init loading screen
const title = '@vernonia/core dev';

const loadingScreen = new LoadingScreen({
  title,
});

if (!DisclaimerModal.isAccepted()) {
  new DisclaimerModal();
}

// config portal and auth
esriConfig.portalUrl = 'https://gisportal.vernonia-or.gov/portal';

// view
const view = new MapView({
  map: new Map({
    basemap: new Basemap({
      portalItem: {
        id: 'f36cd213cc934d2391f58f389fc9eaec',
      },
    }),
    layers: [],
    ground: 'world-elevation',
  }),
  zoom: 15,
  center: [-123.18291178267039, 45.8616094153766],
  constraints: {
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

new Viewer({
  view,
  title,
  includeHeader: false,
  widgets: [{
    widget: new Measure({ view }),
    text: 'Measure',
    icon: 'measure',
  }, {
    widget: new Print({ view, printServiceUrl: 'https://gisportal.vernonia-or.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task', }),
    text: 'Print',
    icon: 'print',
  }],
});

view.when(() => {
  loadingScreen.end();
});
