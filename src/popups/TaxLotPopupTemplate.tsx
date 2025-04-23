import esri = __esri;

// typescript is being weird
// import type TaxLotInfoTableInfoLayers from '../components/TaxLotInfoTable';
interface TaxLotInfoTableInfoLayers {
  flood: esri.FeatureLayer;
  zoning: esri.FeatureLayer;
  wetlands: {
    lwi: esri.FeatureLayer;
    nwi: esri.FeatureLayer;
    mow: esri.FeatureLayer;
  };
}

export interface TaxLotPopupTemplateProperties extends esri.PopupTemplateProperties {
  infoLayers: TaxLotInfoTableInfoLayers;
}

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import TaxLotInfoTable from '../components/TaxLotInfoTable';

@subclass('cov.popups.TaxLotPopupTemplate')
export default class TaxLotPopupTemplate extends PopupTemplate {
  constructor(properties: TaxLotPopupTemplateProperties) {
    super(properties);
  }

  infoLayers!: TaxLotInfoTableInfoLayers;

  outFields = ['*'];

  title = '{TAXLOT_ID}';

  // @ts-expect-error content cannot be a setter/getter
  content = (event: { graphic: esri.Graphic }): HTMLElement => {
    const infoLayers = this.infoLayers as TaxLotInfoTableInfoLayers;

    const container = document.createElement('table');

    new TaxLotInfoTable({ container, graphic: event.graphic, infoLayers });

    return container;
  };
}
