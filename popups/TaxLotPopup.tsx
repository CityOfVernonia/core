/**
 * Standard popup for tax lots in COV apps.
 */

// namespaces and types
import cov = __cov;

// imports
import { whenOnce } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import { propertyInfoUrl, taxMapUrl } from '@vernonia/assessor-urls/src/AssessorURLs';

// styles
const CSS = {
  table: 'esri-widget__table',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

let KEY = 0;

@subclass('cov.popups.TaxLotPopup.Content')
class Content extends Widget {
  @property()
  graphic!: esri.Graphic;

  @property()
  accessorValues: tsx.JSX.Element[] = [];

  constructor(properties: cov.ContentProperties) {
    super(properties);
  }

  postInitialize() {
    whenOnce(this, 'graphic', this.getAccessorValues.bind(this));
  }

  getAccessorValues(): void {
    const { graphic, accessorValues } = this;
    const { layer, attributes } = graphic;

    const objectId = attributes[(layer as esri.FeatureLayer).objectIdField] as number;

    (layer as esri.FeatureLayer)
      .queryRelatedFeatures({
        outFields: ['*'],
        relationshipId: 0,
        objectIds: [objectId],
      })
      .then((result: any) => {
        const features = result[objectId].features;

        if (features.length) {
          features.forEach((feature: any): void => {
            const { attributes } = feature;

            accessorValues.push(
              <tr key={KEY++}>
                <td class={CSS.td}>
                  <strong>Tax Account {attributes.ACCOUNT_ID}</strong>
                </td>
                <td>Land / Improvement Values</td>
              </tr>,
            );

            accessorValues.push(
              <tr key={KEY++}>
                <th class={CSS.th}>Assessed Value</th>
                <td class={CSS.td}>
                  ${attributes.AV_LAND.toLocaleString('en')} / ${attributes.AV_IMPR.toLocaleString('en')}
                </td>
              </tr>,
            );

            accessorValues.push(
              <tr key={KEY++}>
                <th class={CSS.th}>Real Market Value</th>
                <td class={CSS.td}>
                  ${attributes.RMV_LAND.toLocaleString('en')} / ${attributes.RMV_IMPR.toLocaleString('en')}
                </td>
              </tr>,
            );
          });
        }
        this.scheduleRender();
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  render(): tsx.JSX.Element {
    const attributes = this.graphic.attributes;

    if (attributes.BNDY_CLIPPED) {
      return (
        <p>
          Note: This tax lot is clipped to the City of Vernonia area spatial extent. No tax lot data is provided here.
          Please visit the{' '}
          <a href="https://www.columbiacountyor.gov/departments/Assessor" target="_blank" rel="noopener">
            Columbia County Assessor's
          </a>{' '}
          web site for tax lot information.
        </p>
      );
    }

    return (
      <table class={CSS.table}>
        {/* tax lot id */}
        <tr>
          <th class={CSS.th}>Tax Lot</th>
          {attributes.VERNONIA === 1 ? (
            <td class={CSS.td}>
              <a href={`https://www.vernonia-or.gov/tax-lot/${attributes.TAXLOT_ID}/`} target="_blank">
                {attributes.TAXLOT_ID}
              </a>
            </td>
          ) : (
            <td class={CSS.td}>{attributes.TAXLOT_ID}</td>
          )}
        </tr>
        {/* tax map */}
        <tr>
          <th class={CSS.th}>Tax Map</th>
          <td class={CSS.td}>
            <a href={taxMapUrl(attributes.TAXMAP)} target="_blank" rel="noopener">
              {`${attributes.TOWN}${attributes.TOWN_DIR}${attributes.RANGE}${attributes.RANGE_DIR} ${attributes.SECTION} ${attributes.QTR}${attributes.QTR_QTR}`}
            </a>
          </td>
        </tr>
        {/* owner */}
        <tr>
          <th class={CSS.th}>Owner</th>
          <td class={CSS.td}>{attributes.OWNER}</td>
        </tr>
        {/* address */}
        {attributes.ADDRESS ? (
          <tr>
            <th class={CSS.th}>Address (Primary Situs)</th>
            <td class={CSS.td}>
              <a
                href={`https://www.google.com/maps/place/${attributes.ADDRESS.split(' ').join('+')}+${
                  attributes.CITY
                }=${attributes.STATE}+${attributes.ZIP}/data=!3m1!1e3`}
                target="_blank"
                rel="noopener"
              >
                {attributes.ADDRESS}
              </a>
            </td>
          </tr>
        ) : null}
        {/* area */}
        <tr>
          <th class={CSS.th}>Area</th>
          <td class={CSS.td}>
            <span style="margin-right:0.75rem;">{`${attributes.ACRES} acres`}</span>
            <span>{`${attributes.SQ_FEET.toLocaleString()} sq ft`}</span>
          </td>
        </tr>
        {/* tax accounts */}
        <tr>
          <th class={CSS.th}>Tax Account(s)</th>
          <td class={CSS.td}>
            {attributes.ACCOUNT_IDS
              ? attributes.ACCOUNT_IDS.split(',').map((accountId: string) => {
                  return (
                    <a
                      style="margin-right:0.75rem;"
                      href={propertyInfoUrl(accountId, 2021)}
                      target="_blank"
                      rel="noopener"
                    >
                      {accountId}
                    </a>
                  );
                })
              : 'No related account id(s)'}
          </td>
        </tr>
        {/* assessor values */}
        {this.accessorValues}
      </table>
    );
  }
}

@subclass('cov.popups.TaxLotPopup')
export default class TaxLotPopup extends PopupTemplate {
  @property()
  title = `{TAXLOT_ID}`;

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      return new Content({
        graphic: evt.graphic,
      });
    },
  });

  @property()
  content = [this.customContent];
}
