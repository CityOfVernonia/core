import esri = __esri;

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import PopupTemplate from '@arcgis/core/PopupTemplate';

@subclass('cov.popups.FloodplainStructurePopupTemplate')
export default class FloodplainStructurePopupTemplate extends PopupTemplate {
  public outFields = ['*'];

  public title = '{address}';

  // @ts-expect-error content cannot be a setter/getter
  content = (event: { graphic: esri.Graphic }): HTMLElement => {
    const popupContent = new PopupContent({ graphic: event.graphic });

    return popupContent.container;
  };
}

class PopupContent extends Widget {
  private _container = document.createElement('div');

  public get container(): HTMLDivElement {
    return this._container;
  }

  public set container(value: HTMLDivElement) {
    this._container = value;
  }

  constructor(properties: esri.WidgetProperties & { graphic: esri.Graphic }) {
    super(properties);

    this.graphic = properties.graphic;
  }

  readonly graphic!: esri.Graphic;

  private _formatElevation(elevation: number): string {
    return elevation > 0 ? `${elevation}'` : 'unknown';
  }

  override render(): tsx.JSX.Element {
    return (
      <div>
        {this._renderNotice()}
        {this._renderTable()}
      </div>
    );
  }

  private _renderNotice(): tsx.JSX.Element {
    const {
      graphic: { attributes },
    } = this;

    switch (attributes.t9_5_compliance) {
      case 'Yes':
        return (
          <calcite-notice style="margin-bottom: 0.75rem;" icon="check-circle" kind="brand" open>
            <div slot="message">This structure complies with Title 9 Chapter 5.</div>
          </calcite-notice>
        );
      case 'No':
        return (
          <calcite-notice style="margin-bottom: 0.75rem;" icon="exclamation-mark-triangle" kind="danger" open>
            <div slot="message">
              This structure does not comply with Title 9 Chapter 5. Notify the floodplain administrator before
              processing any building or development application.
            </div>
          </calcite-notice>
        );
      default:
        return (
          <calcite-notice style="margin-bottom: 0.75rem;" icon="question" kind="warning" open>
            <div slot="message">
              It is unknown whether this structure complies with Title 9 Chapter 5. Notify the floodplain administrator
              before processing any building or development application.
            </div>
          </calcite-notice>
        );
    }
  }

  private _renderTable(): tsx.JSX.Element {
    const {
      graphic: {
        attributes: {
          type,
          flood_zone,
          year_built,
          elevated,
          year_elevated,
          ground_elev,
          bfe_elev,
          hfor_elev,
          floor_elev,
          notes,
        },
      },
    } = this;

    return (
      <table class="esri-widget__table">
        <tr>
          <th>Structure type</th>
          <td>{type}</td>
        </tr>
        <tr>
          <th>Flood zone</th>
          <td>{flood_zone}</td>
        </tr>
        <tr>
          <th>Year built</th>
          <td>{year_built}</td>
        </tr>
        <tr>
          <th>Elevated</th>
          <td>{elevated === 'Yes' ? `${elevated} (${year_elevated})` : elevated}</td>
        </tr>
        <tr>
          <th>Ground elevation</th>
          <td>{this._formatElevation(ground_elev)}</td>
        </tr>
        <tr>
          <th>Base flood elevation</th>
          <td>{this._formatElevation(bfe_elev)}</td>
        </tr>
        <tr>
          <th>Highest flood of record</th>
          <td>{this._formatElevation(hfor_elev)}</td>
        </tr>
        <tr>
          <th>Floor elevation</th>
          <td>{this._formatElevation(floor_elev)}</td>
        </tr>
        {notes ? (
          <tr>
            <td colspan="2">Note: {notes}</td>
          </tr>
        ) : null}
      </table>
    );
  }
}
