import esri = __esri;
export interface TaxLotInfoTableInfoLayers {
    flood: esri.FeatureLayer;
    zoning: esri.FeatureLayer;
    wetlands: {
        lwi: esri.FeatureLayer;
        nwi: esri.FeatureLayer;
        mow: esri.FeatureLayer;
    };
}
export interface TaxLotInfoTableProperties extends esri.WidgetProperties {
    graphic: esri.Graphic;
    infoLayers?: TaxLotInfoTableInfoLayers;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class TaxLotInfoTable extends Widget {
    constructor(properties: TaxLotInfoTableProperties);
    postInitialize(): Promise<void>;
    graphic: esri.Graphic;
    infoLayers: TaxLotInfoTableInfoLayers;
    private _flood;
    private _mailing;
    private _wetlands;
    private _zoning;
    private _floodInfo;
    private _mailingInfo;
    private _wetlandInfo;
    private _zoningInfo;
    render(): tsx.JSX.Element;
    private _renderTaxLotInfo;
}
