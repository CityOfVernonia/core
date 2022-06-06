import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';

@subclass('Editor.DeleteModal')
export default class DeleteModal extends Widget {
  constructor(properties?: esri.WidgetProperties) {
    super(properties);
    document.body.append(this.container);
  }

  container = document.createElement('calcite-modal');

  private _modal!: HTMLCalciteModalElement;

  @property()
  private _delete!: () => void;

  show(onDelete: () => void): void {
    const { _modal } = this;

    this._delete = onDelete;

    _modal.active = true;
  }

  render(): tsx.JSX.Element {
    return (
      <calcite-modal width="350" afterCreate={storeNode.bind(this)} data-node-ref="_modal">
        <div slot="header">Delete</div>
        <div slot="content">Are you sure you want to delete this item?</div>
        <calcite-button
          slot="primary"
          afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
            calciteButton.addEventListener('click', (): void => {
              this._delete();

              this._modal.active = false;
            });
          }}
        >
          Yes
        </calcite-button>
        <calcite-button
          slot="secondary"
          appearance="outline"
          afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
            calciteButton.addEventListener('click', (): void => {
              this._modal.active = false;
            });
          }}
        >
          No
        </calcite-button>
      </calcite-modal>
    );
  }
}
