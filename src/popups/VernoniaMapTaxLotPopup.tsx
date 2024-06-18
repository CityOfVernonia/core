//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { propertyInfoUrl, taxMapUrl } from './../support/assessorUtils';
import { geodesicBuffer } from '@arcgis/core/geometry/geometryEngine';

let KEY = 0;

/**
 * Vernonia map tax lot popup.
 */
@subclass('cov.popups.VernoniaMapTaxLotPopup')
export default class VernoniaMapTaxLotPopup extends PopupTemplate {
  constructor(
    properties: esri.PopupTemplateProperties & {
      zoning: esri.FeatureLayer;
      floodZones: esri.FeatureLayer;
    },
  ) {
    super(properties);
  }

  zoning!: esri.FeatureLayer;

  floodZones!: esri.FeatureLayer;

  outFields = ['*'];

  title = '{TAXLOT_ID}';

  content = (event: { graphic: esri.Graphic }): HTMLElement => {
    const { zoning, floodZones } = this;
    const container = document.createElement('table');
    new VernoniaMapTaxLotPopupContent({ graphic: event.graphic, container, zoning, floodZones });
    return container;
  };
}

@subclass('VernoniaMapTaxLotPopupContent')
class VernoniaMapTaxLotPopupContent extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
      zoning: esri.FeatureLayer;
      floodZones: esri.FeatureLayer;
    },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const {
      graphic: {
        geometry,
        attributes: { VERNONIA },
      },
    } = this;

    if (!VERNONIA) return;

    const _geometry = geodesicBuffer(geometry, -1, 'feet') as esri.Polygon;

    this._zoningInfo(_geometry);
    this._floodZoneInfo(_geometry);
  }

  graphic!: esri.Graphic;

  zoning!: esri.FeatureLayer;

  floodZones!: esri.FeatureLayer;

  @property()
  private _zoning = (
    <tr>
      <th>Zoning</th>
      <td style="text-align:center;padding:0;vertical-align:middle;">
        <calcite-button
          style="transform:scale(0.8);"
          appearance="transparent"
          disabled=""
          loading=""
          scale="s"
        ></calcite-button>
      </td>
    </tr>
  );

  @property()
  private _floodZones = (
    <tr>
      <th>Flood zones</th>
      <td style="text-align:center;padding:0;vertical-align:middle;">
        <calcite-button
          style="transform:scale(0.8);"
          appearance="transparent"
          disabled=""
          loading=""
          scale="s"
        ></calcite-button>
      </td>
    </tr>
  );

  private async _zoningInfo(geometry: esri.Geometry): Promise<void> {
    const { zoning } = this;

    const zoningResults = await zoning.queryFeatures({
      geometry,
      outFields: ['localZCode', 'localZDesc'],
      returnGeometry: false,
    });

    const zones: string[] = [];

    zoningResults.features.forEach((feature: esri.Graphic): void => {
      const { localZCode, localZDesc } = feature.attributes;
      const zone = `${localZCode} - ${localZDesc}`;
      if (zones.indexOf(zone) === -1) zones.push(zone);
    });

    this._zoning = (
      <tr>
        <th>Zoning</th>
        <td>
          {zones.map((zone: string): tsx.JSX.Element => {
            return <div key={KEY++}>{zone}</div>;
          })}
        </td>
      </tr>
    );
  }

  private async _floodZoneInfo(geometry: esri.Geometry): Promise<void> {
    const { floodZones } = this;

    const floodZonesResults = await floodZones.queryFeatures({
      geometry,
      outFields: ['flood_zone'],
      returnGeometry: false,
    });

    const zones: string[] = [];

    floodZonesResults.features.forEach((feature: esri.Graphic): void => {
      const { flood_zone } = feature.attributes;
      if (zones.indexOf(flood_zone) === -1) zones.push(flood_zone);
    });

    this._floodZones = (
      <tr>
        <th>
          <div style="display:flex;flex-direction:row;">
            <span style="margin-right:0.25rem;">Flood zones</span>
            <calcite-icon
              icon="information"
              scale="s"
              style="transform:scale(0.875);color:var(--calcite-ui-brand);"
            ></calcite-icon>
            <calcite-popover
              auto-close=""
              closable=""
              scale="s"
              afterCreate={(element: HTMLCalcitePopoverElement): void => {
                element.referenceElement = element.previousElementSibling as HTMLCalciteIconElement;
              }}
            >
              <div style="max-width:120px;padding:0.25rem;">
                Some portion of the tax lot is affected by the indicated flood zones. Turn on flood hazard layer to view
                flood zones.
              </div>
            </calcite-popover>
          </div>
        </th>
        <td>
          {!zones.length
            ? 'None'
            : zones.map((zone: string): tsx.JSX.Element => {
                return <div key={KEY++}>{zone}</div>;
              })}
        </td>
      </tr>
    );
  }

  render(): tsx.JSX.Element {
    const { _zoning, _floodZones } = this;
    const { TAXLOT_ID, ACCOUNT_IDS, TAXMAP, ADDRESS, OWNER, ACRES, SQ_FEET, VERNONIA } = this.graphic.attributes;

    const address = ADDRESS ? (
      <tr>
        <th>Address</th>
        <td>{ADDRESS}</td>
      </tr>
    ) : null;

    const _accounts = ACCOUNT_IDS.split(',');

    const accounts =
      _accounts.length === 1 ? (
        <calcite-link href={`${propertyInfoUrl(_accounts[0])}`} target="_blank">
          {_accounts[0]}
        </calcite-link>
      ) : (
        _accounts.map((account: string, index: number): tsx.JSX.Element => {
          return (
            <span>
              <calcite-link href={`${propertyInfoUrl(account)}`} target="_blank">
                {account}
              </calcite-link>
              {index < _accounts.length - 1 ? <span>&nbsp;&nbsp;</span> : ''}
            </span>
          );
        })
      );

    return (
      <table class="esri-widget__table">
        <tr>
          <th>Tax lot</th>
          <td>
            <calcite-link href={`https://vernonia-tax-lot.netlify.app/${TAXLOT_ID}/`} target="_blank">
              {TAXLOT_ID}
            </calcite-link>
          </td>
        </tr>
        <tr>
          <th>Tax map</th>
          <td>
            <calcite-link href={`${taxMapUrl(TAXMAP)}`} target="_blank">
              {TAXMAP}
            </calcite-link>
          </td>
        </tr>
        <tr>
          <th>Owner</th>
          <td>{OWNER}</td>
        </tr>
        {address}
        <tr>
          <th>Area</th>
          <td>
            {ACRES} acres&nbsp;&nbsp;{(SQ_FEET as number).toLocaleString()} sq ft
          </td>
        </tr>
        <tr>
          <th>Tax account{_accounts.length > 1 ? 's' : ''}</th>
          <td>{accounts}</td>
        </tr>
        {VERNONIA ? _zoning : null}
        {VERNONIA ? _floodZones : null}
      </table>
    );
  }
}
