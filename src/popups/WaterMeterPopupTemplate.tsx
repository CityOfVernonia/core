import esri = __esri;

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Collection from '@arcgis/core/core/Collection';

@subclass('cov.popups.TaxLotPopupTemplate')
export default class TaxLotPopupTemplate extends PopupTemplate {
  public outFields = ['*'];

  public title = '{wsc_id} - {Address}';

  // @ts-expect-error content cannot be a setter/getter
  content = (event: { graphic: esri.Graphic }): HTMLElement => {
    const popupContent = new PopupContent({ graphic: event.graphic });

    return popupContent.container;
  };
}

class PopupContent extends Widget {
  private _container = document.createElement('table');

  public get container(): HTMLTableElement {
    return this._container;
  }

  public set container(value: HTMLTableElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);

    this.graphic = properties.graphic;
  }

  override async postInitialize(): Promise<void> {
    const { graphic, _rows } = this;

    const notes = graphic.attributes.Notes;

    try {
      let layer = graphic.layer as esri.FeatureLayer;

      // @ts-expect-error sourceLayer not typed
      if (!layer) layer = graphic.sourceLayer as esri.FeatureLayer;

      const objectId = graphic.attributes[layer.objectIdField];

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
          <th>Service/account type</th>
          <td>
            {WSC_TYPE} / {ACCT_TYPE}
          </td>
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
          <td>{METER_REG_SN || 'non-radio read'}</td>
        </tr>,
        <tr>
          <th>Meter age</th>
          <td>{METER_AGE} years</td>
        </tr>,
        <tr>
          <th>Line in</th>
          <td>
            {LINE_IN_SIZE}" {LINE_IN_MATERIAL}
          </td>
        </tr>,
        <tr>
          <th>Line out</th>
          <td>
            {LINE_OUT_SIZE}" {LINE_OUT_MATERIAL}
          </td>
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
    } catch (error: unknown) {
      console.log(error);
      _rows.add(
        <tr>
          <th>Error</th>
          <td>water meter information unavailable</td>
        </tr>,
      );
    }
  }

  readonly graphic!: esri.Graphic;

  private _rows: esri.Collection<tsx.JSX.Element> = new Collection();

  override render(): tsx.JSX.Element {
    const { _rows } = this;

    return <table class="cov--feature-table">{_rows.toArray()}</table>;
  }
}
