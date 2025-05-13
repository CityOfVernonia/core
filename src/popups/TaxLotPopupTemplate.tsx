import esri = __esri;

import type { TaxLotInfoTableInfoLayers } from '../components/TaxLotInfoTable';

export interface TaxLotPopupTemplateProperties extends esri.PopupTemplateProperties {
  accelaParcelURLTemplate?: string;
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

  accelaParcelURLTemplate?: string;

  infoLayers!: TaxLotInfoTableInfoLayers;

  outFields = ['*'];

  title = '{TAXLOT_ID}';

  // @ts-expect-error content cannot be a setter/getter
  content = (event: { graphic: esri.Graphic }): HTMLElement => {
    const infoLayers = this.infoLayers as TaxLotInfoTableInfoLayers;

    const accelaParcelURLTemplate = this.accelaParcelURLTemplate;

    const container = document.createElement('table');

    new TaxLotInfoTable({ accelaParcelURLTemplate, container, graphic: event.graphic, infoLayers });

    return container;
  };
}
