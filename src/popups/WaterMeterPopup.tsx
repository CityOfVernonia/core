import esri = __esri;
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

const CSS = {
  table: 'esri-widget__table',
};

/**
 * Water meter popup template.
 */
export default new PopupTemplate({
  outFields: ['*'],
  title: '{wsc_id} - {address}',
  content: (event: { graphic: esri.Graphic }): HTMLTableElement => {
    const contentWidget = new ContentWidget({
      graphic: event.graphic,
    });
    return contentWidget.container;
  },
});

@subclass('ContentWidget')
class ContentWidget extends Widget {
  container = document.createElement('table');

  constructor(
    properties: esri.WidgetProperties & {
      graphic: esri.Graphic;
    },
  ) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { graphic, layer, objectIdField, _rows } = this;

    const objectId = graphic.attributes[objectIdField];

    const notes = graphic.attributes.Notes;

    const query = await layer.queryRelatedFeatures({
      relationshipId: 0,
      outFields: ['*'],
      objectIds: [objectId],
    });

    const {
      WSC_TYPE,
      ACCT_TYPE,
      METER_SIZE_T,
      METER_SN,
      METER_REG_SN,
      METER_AGE,
      LINE_IN_MATERIAL,
      LINE_IN_SIZE,
      LINE_OUT_MATERIAL,
      LINE_OUT_SIZE,
    } = query[objectId].features[0].attributes;

    _rows.addMany([
      <tr>
        <th>Service type</th>
        <td>{WSC_TYPE}</td>
      </tr>,
      <tr>
        <th>Account type</th>
        <td>{ACCT_TYPE}</td>
      </tr>,
      <tr>
        <th>Meter size</th>
        <td>{METER_SIZE_T}"</td>
      </tr>,
      <tr>
        <th>Serial no.</th>
        <td>{METER_SN}</td>
      </tr>,
      <tr>
        <th>Register no.</th>
        <td>{METER_REG_SN}</td>
      </tr>,
      <tr>
        <th>Meter age</th>
        <td>{METER_AGE} years</td>
      </tr>,
      <tr>
        <th>Size in</th>
        <td>{LINE_IN_SIZE}"</td>
      </tr>,
      <tr>
        <th>Material in</th>
        <td>{LINE_IN_MATERIAL}</td>
      </tr>,
      <tr>
        <th>Size out</th>
        <td>{LINE_OUT_SIZE}"</td>
      </tr>,
      <tr>
        <th>Material out</th>
        <td>{LINE_OUT_MATERIAL}</td>
      </tr>,
    ]);

    if (notes) {
      _rows.add(
        <tr>
          <th>Notes</th>
          <td>{notes}</td>
        </tr>,
      );
    }
  }

  graphic!: esri.Graphic;

  @property({ aliasOf: 'graphic.layer' })
  layer!: esri.FeatureLayer;

  @property({ aliasOf: 'graphic.layer.objectIdField' })
  objectIdField!: string;

  private _rows: Collection<tsx.JSX.Element> = new Collection();

  render(): tsx.JSX.Element {
    const { _rows } = this;
    return <table class={CSS.table}>{_rows.toArray()}</table>;
  }
}
