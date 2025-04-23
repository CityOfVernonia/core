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

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { referenceElement } from './../components/support';
import { propertyInfoUrl, taxMapUrl } from './../support/taxLotUtils';
import {
  load as bufferLoad,
  isLoaded as bufferLoaded,
  execute as geodesicBuffer,
} from '@arcgis/core/geometry/operators/geodesicBufferOperator';

let KEY = 0;

const STYLE = {
  iconButton: 'transform:scale(0.875); color:var(--calcite-ui-brand); cursor: pointer;',
  loader: '--calcite-loader-progress-color-inline: var(--calcite-color-brand);',
  popover: 'max-width: 165px; padding: 0.25rem; ',
};

@subclass('cov.components.TaxLotInfoTable')
export default class TaxLotInfoTable extends Widget {
  constructor(properties: TaxLotInfoTableProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const {
      graphic: {
        geometry,
        attributes: { VERNONIA },
      },
    } = this;

    this._mailingInfo();

    if (!geometry || VERNONIA === 0) return;

    if (!bufferLoaded()) await bufferLoad();

    const _geometry = geodesicBuffer(geometry, -1, { unit: 'feet' }) as esri.Polygon;

    this._zoningInfo(_geometry);

    this._floodInfo(_geometry);

    this._wetlandInfo(_geometry);
  }

  graphic!: esri.Graphic;

  infoLayers!: TaxLotInfoTableInfoLayers;

  @property()
  private _flood = (
    <tr>
      <th>Flood zones</th>
      <td style={STYLE.loader}>
        <calcite-loader inline label="Loading" scale="s" text="Loading"></calcite-loader>
      </td>
    </tr>
  );

  @property()
  private _mailing = (
    <tr>
      <th>Mailing address</th>
      <td style={STYLE.loader}>
        <calcite-loader inline label="Loading" scale="s" text="Loading"></calcite-loader>
      </td>
    </tr>
  );

  @property()
  private _wetlands = (
    <tr>
      <th>Wetlands</th>
      <td style={STYLE.loader}>
        <calcite-loader inline label="Loading" scale="s" text="Loading"></calcite-loader>
      </td>
    </tr>
  );

  @property()
  private _zoning = (
    <tr>
      <th>Zoning</th>
      <td style={STYLE.loader}>
        <calcite-loader inline label="Loading" scale="s" text="Loading"></calcite-loader>
      </td>
    </tr>
  );

  private async _floodInfo(geometry: esri.Polygon): Promise<void> {
    const { infoLayers } = this;

    if (!infoLayers) return;

    const { flood } = infoLayers;

    try {
      const floodZonesResults = await flood.queryFeatures({
        geometry,
        outFields: ['flood_zone'],
        returnGeometry: false,
      });

      const floodZones: string[] = [];

      floodZonesResults.features.forEach((feature: esri.Graphic): void => {
        const { flood_zone } = feature.attributes;
        if (floodZones.indexOf(flood_zone) === -1) floodZones.push(flood_zone);
      });

      this._flood = floodZones.length ? (
        <tr>
          <th>
            <calcite-link icon-end="information">Flood zones</calcite-link>
            <calcite-popover auto-close="" closable scale="s" afterCreate={referenceElement}>
              <div style={STYLE.popover}>
                Some portion of the tax lot is affected by the indicated flood zones. Turn on flood hazard layer to view
                flood zones.
              </div>
            </calcite-popover>
          </th>
          <td>
            {floodZones.map((zone: string): tsx.JSX.Element => {
              return <div key={KEY++}>{zone}</div>;
            })}
          </td>
        </tr>
      ) : (
        <tr>
          <th>Flood zones</th>
          <td>None</td>
        </tr>
      );
    } catch (error) {
      console.log(error);

      this._flood = (
        <tr>
          <th>Flood zones</th>
          <td>An error occurred</td>
        </tr>
      );
    }
  }

  private async _mailingInfo(): Promise<void> {
    const { graphic } = this;

    try {
      const layer = graphic.layer as esri.FeatureLayer;

      const objectId = graphic.attributes[layer.objectIdField];

      const taxDataResults = await layer.queryRelatedFeatures({
        objectIds: [objectId],
        outFields: ['M_ADDRESS', 'M_CITY', 'M_STATE', 'M_ZIP'],
        relationshipId: 0,
      });

      const feature = taxDataResults[objectId]?.features[0];

      if (!feature) {
        this._mailing = (
          <tr>
            <th>Mailing address</th>
            <td>Unknown</td>
          </tr>
        );

        return;
      }

      const { M_ADDRESS, M_CITY, M_STATE, M_ZIP } = feature.attributes;

      this._mailing = (
        <tr>
          <th>Mailing address</th>
          <td>
            {M_ADDRESS}
            <br></br>
            {M_CITY}, {M_STATE} {M_ZIP}
          </td>
        </tr>
      );
    } catch (error) {
      console.log(error);

      this._mailing = (
        <tr>
          <th>Mailing address</th>
          <td>An error occurred</td>
        </tr>
      );
    }
  }

  private async _wetlandInfo(geometry: esri.Polygon): Promise<void> {
    const { infoLayers } = this;

    if (!infoLayers) return;

    const {
      wetlands: { lwi, nwi, mow },
    } = infoLayers;

    try {
      const lwiResult = (
        await lwi.queryFeatures({
          geometry,
          returnGeometry: false,
        })
      ).features.length;

      const nwiResult = (
        await nwi.queryFeatures({
          geometry,
          returnGeometry: false,
        })
      ).features.length;

      const mowResult = (
        await mow.queryFeatures({
          geometry,
          returnGeometry: false,
        })
      ).features.length;

      this._wetlands =
        lwiResult + nwiResult + mowResult > 0 ? (
          <tr>
            <th>
              <calcite-link icon-end="information">Wetlands</calcite-link>
              <calcite-popover auto-close="" closable scale="s" afterCreate={referenceElement}>
                <div style={STYLE.popover}>
                  Some portion of the tax lot may be affected by wetlands. Turn on wetlands layer to view potential
                  wetlands.
                </div>
              </calcite-popover>
            </th>
            <td>Yes</td>
          </tr>
        ) : (
          <tr>
            <th>Wetlands</th>
            <td>No</td>
          </tr>
        );
    } catch (error) {
      console.log(error);

      this._wetlands = (
        <tr>
          <th>Wetlands</th>
          <td>An error occurred</td>
        </tr>
      );
    }
  }

  private async _zoningInfo(geometry: esri.Polygon): Promise<void> {
    const { infoLayers } = this;

    if (!infoLayers) return;

    const { zoning } = infoLayers;

    try {
      const zoningResults = await zoning.queryFeatures({
        geometry,
        outFields: ['localZCode', 'localZDesc'],
        returnGeometry: false,
      });

      const zones: string[] = [];

      zoningResults.features.forEach((feature: esri.Graphic): void => {
        const { localZCode, localZDesc } = feature.attributes;
        const zoningText = `${localZCode} - ${localZDesc}`;
        if (zones.indexOf(zoningText) === -1) zones.push(zoningText);
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
    } catch (error) {
      console.log(error);

      this._zoning = (
        <tr>
          <th>Zoning</th>
          <td>An error occurred</td>
        </tr>
      );
    }
  }

  override render(): tsx.JSX.Element {
    const { infoLayers, _flood, _mailing, _wetlands, _zoning } = this;
    const { VERNONIA } = this.graphic.attributes;
    return (
      <table class="cov--feature-table">
        {this._renderTaxLotInfo()}
        {_mailing}
        {infoLayers && VERNONIA === 1 ? _zoning : null}
        {infoLayers && VERNONIA === 1 ? _flood : null}
        {infoLayers && VERNONIA === 1 ? _wetlands : null}
      </table>
    );
  }

  private _renderTaxLotInfo(): tsx.JSX.Element | null[] {
    const { TAXLOT_ID, ACCELA_MT, ACCOUNT_IDS, TAXMAP, ADDRESS, OWNER, ACRES, SQ_FEET } = this.graphic.attributes;

    const address = ADDRESS ? (
      <tr>
        <th>Address</th>
        <td>{ADDRESS}</td>
      </tr>
    ) : null;

    let accounts: string | tsx.JSX.Element | tsx.JSX.Element[] = 'Unknown';

    let _accounts: string[] = [];

    if (ACCOUNT_IDS) {
      _accounts = ACCOUNT_IDS.includes(',') ? ACCOUNT_IDS.split(',') : ACCOUNT_IDS.split('||');

      accounts =
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
    }

    return [
      <tr>
        <th>Tax lot</th>
        <td>
          <calcite-link href={`https://vernonia-tax-lot.netlify.app/${TAXLOT_ID}/`} target="_blank">
            {TAXLOT_ID}
          </calcite-link>
        </td>
      </tr>,
      <tr>
        <th>Accela id</th>
        <td>{ACCELA_MT}</td>
      </tr>,
      <tr>
        <th>Tax map</th>
        <td>
          <calcite-link href={`${taxMapUrl(TAXMAP)}`} target="_blank">
            {TAXMAP}
          </calcite-link>
        </td>
      </tr>,
      <tr>
        <th>Owner</th>
        <td>{OWNER || 'Unknown'}</td>
      </tr>,
      address,
      <tr>
        <th>Area</th>
        <td>
          {ACRES} acres&nbsp;&nbsp;{(SQ_FEET as number).toLocaleString()} sq ft
        </td>
      </tr>,
      <tr>
        <th>Tax account{_accounts.length > 1 ? 's' : ''}</th>
        <td>{accounts}</td>
      </tr>,
    ];
  }
}
