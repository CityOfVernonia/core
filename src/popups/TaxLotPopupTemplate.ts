import esri = __esri;

import type { TaxLotInfoTableInfoLayers } from '../components/TaxLotInfoTable';

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
    // console.log(event);

    const infoLayers = this.infoLayers as TaxLotInfoTableInfoLayers;

    const container = document.createElement('table');

    new TaxLotInfoTable({ container, graphic: event.graphic, infoLayers });

    return container;
  };
}
