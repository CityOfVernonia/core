import esri = __esri;

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';

@subclass('Editor.PhotoModal')
export default class PhotoModal extends Widget {
  constructor(properties?: esri.WidgetProperties) {
    super(properties);
    document.body.append(this.container);
  }

  container = document.createElement('calcite-modal');

  private _modal!: HTMLCalciteModalElement;

  @property()
  private _title = 'Photo';

  @property()
  private _url = '';

  show(title: string, url: string): void {
    const { _modal } = this;
    this._title = title;
    this._url = url;
    _modal.active = true;
  }

  render(): tsx.JSX.Element {
    const { _title, _url } = this;

    return (
      <calcite-modal afterCreate={storeNode.bind(this)} data-node-ref="_modal">
        <div slot="header">{_title}</div>
        <div slot="content">
          <img style="width: 100%;" src={_url}></img>
        </div>
        <calcite-button
          slot="primary"
          afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
            calciteButton.addEventListener('click', (): void => {
              this._modal.active = false;
            });
          }}
        >
          Close
        </calcite-button>
      </calcite-modal>
    );
  }
}
