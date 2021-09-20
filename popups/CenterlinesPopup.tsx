import cov = __cov;

import { whenOnce } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import PopupTemplate from '@arcgis/core/PopupTemplate';
import CustomContent from '@arcgis/core/popup/content/CustomContent';

const CSS = {
  table: 'esri-widget__table',
  th: 'esri-feature__field-header',
  td: 'esri-feature__field-data',
};

let KEY = 0;

@subclass('cov.popups.CenterlinesPopup.Content')
class Content extends Widget {
  @property()
  graphic!: esri.Graphic;

  @property()
  surfaceCondition: tsx.JSX.Element[] = [];

  @property()
  surfaceType: tsx.JSX.Element[] = [];

  @property()
  readonly conditions = [null, 'Poor', 'Marginal', 'Fair', 'Good', 'Excellent'];

  @property()
  readonly types: { name: string; code: string }[] = [
    {
      name: 'UNIMPROVED (Open for Travel)',
      code: 'U',
    },
    {
      name: 'GRADED & DRAINED (Natural Surface)',
      code: 'D',
    },
    {
      name: 'GRADED AND DRAINED (Gravel)',
      code: 'G',
    },
    {
      name: 'OIL MAT',
      code: 'O',
    },
    {
      name: 'ASPHALT CONCRETE',
      code: 'A',
    },
    {
      name: 'CONCRETE, BRICK, STONE',
      code: 'N',
    },
    {
      name: 'OTHER, UNKNOWN',
      code: 'Z',
    },
  ];

  constructor(properties: cov.ContentProperties) {
    super(properties);
    whenOnce(this, 'graphic', this._getRelatedInfo.bind(this));
  }

  private _getRelatedInfo(): void {
    const { graphic, surfaceCondition, conditions, surfaceType, types } = this;
    const { layer, attributes } = graphic;

    const objectId = attributes[(layer as esri.FeatureLayer).objectIdField] as number;

    // surface condition
    (layer as esri.FeatureLayer)
      .queryRelatedFeatures({
        outFields: ['*'],
        relationshipId: 1,
        objectIds: [objectId],
        orderByFields: ['BEG_M DESC'],
      })
      .then((result: any) => {
        const { features } = result[objectId];

        features.sort((a: esri.Graphic, b: esri.Graphic) => (a.attributes.BEG_M > b.attributes.BEG_M ? 1 : -1));

        surfaceCondition.push(
          <tr key={KEY++}>
            <th class={CSS.th} colspan="2" style="border-right:none;">
              <strong>Surface Condition</strong>
            </th>
          </tr>,
        );

        features.forEach((feature: esri.Graphic) => {
          const { attributes } = feature;
          surfaceCondition.push(
            <tr key={KEY++}>
              <th class={CSS.th}>
                {attributes.BEG_M} - {attributes.END_M} ({(attributes.END_M - attributes.BEG_M).toLocaleString()} feet)
              </th>
              <td class={CSS.td}>{conditions[attributes.SURF_CONDITION]}</td>
            </tr>,
          );
        });

        this.scheduleRender();
      });

    // surface type
    (layer as esri.FeatureLayer)
      .queryRelatedFeatures({
        outFields: ['*'],
        relationshipId: 0,
        objectIds: [objectId],
        orderByFields: ['BEG_M DESC'],
      })
      .then((result: any) => {
        const { features } = result[objectId];

        features.sort((a: esri.Graphic, b: esri.Graphic) => (a.attributes.BEG_M > b.attributes.BEG_M ? 1 : -1));

        surfaceType.push(
          <tr key={KEY++}>
            <th class={CSS.th} colspan="2" style="border-right:none;">
              <strong>Surface Type</strong>
            </th>
          </tr>,
        );

        features.forEach((feature: esri.Graphic) => {
          const { attributes } = feature;

          const surfType = types.find((t: { name: string; code: string }) => {
            return t.code === attributes.SURF_TYPE;
          })?.name;

          surfaceType.push(
            <tr key={KEY++}>
              <th class={CSS.th}>
                {attributes.BEG_M} - {attributes.END_M} ({(attributes.END_M - attributes.BEG_M).toLocaleString()} feet)
              </th>
              <td class={CSS.td}>{surfType || ''}</td>
            </tr>,
          );
        });

        this.scheduleRender();
      });
  }

  render(): tsx.JSX.Element {
    const {
      graphic: { attributes },
      surfaceCondition,
      surfaceType,
    } = this;

    return (
      <div>
        <table class={CSS.table}>
          <tr>
            <th class={CSS.th}>Owner</th>
            <td class={CSS.td}>{attributes.OWNER}</td>
          </tr>

          <tr>
            <th class={CSS.th}>Maintainer</th>
            <td class={CSS.td}>{attributes.MAINTAINER}</td>
          </tr>

          <tr>
            <th class={CSS.th}>Functional Classification</th>
            <td class={CSS.td}>{attributes.FUNC_CLASS}</td>
          </tr>

          <tr>
            <th class={CSS.th}>Condition Reported</th>
            <td class={CSS.td}>{attributes.SURF_REPORT ? 'Yes' : 'No'}</td>
          </tr>

          <tr>
            <th class={CSS.th}>ODOT Reported</th>
            <td class={CSS.td}>{attributes.ODOT_REPORT ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <th class={CSS.th}>Length</th>
            <td class={CSS.td}>
              {attributes.Shape__Length.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              feet
            </td>
          </tr>
          {surfaceCondition}
          {surfaceType}
        </table>
      </div>
    );
  }
}

@subclass('cov.popups.CenterlinesPopup')
export default class CenterlinesPopup extends PopupTemplate {
  @property()
  title = (feature: { graphic: esri.Graphic }): string => {
    const {
      graphic: { attributes },
    } = feature;
    return attributes.LABEL.length > 1 ? `${attributes.LABEL} - ${attributes.FUNC_CLASS}` : attributes.FUNC_CLASS;
  };

  @property()
  outFields = ['*'];

  @property()
  customContent = new CustomContent({
    outFields: ['*'],
    creator: (evt: any): Widget => {
      const { graphic } = evt;
      return new Content({
        graphic,
      });
    },
  });

  @property()
  content = [this.customContent];
}
