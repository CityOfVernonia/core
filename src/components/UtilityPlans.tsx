import esri = __esri;

export interface UtilityPlansProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
  view: esri.MapView;
}

interface I {
  state: 'plans-list' | 'location' | 'location-no-result' | 'location-result';
}

import { whenOnce, watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import { byName } from '@arcgis/core/smartMapping/symbology/support/colorRamps';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';

const BAD_EXPRESSION = '0 = 1';

let COLORS: esri.Color[] = [];

const HANDLES = {
  VIEW_CLICK: 'view-click-handle',
};

let KEY = 0;

@subclass('UtilityPlans')
export default class UtilityPlans extends Widget {
  constructor(properties: UtilityPlansProperties) {
    super(properties);

    const colorsForClassBreaks = byName('Blue and Red 16')
      ?.colorsForClassBreaks as esri.ColorRampColorsForClassBreaks[];

    COLORS = colorsForClassBreaks[colorsForClassBreaks?.length - 1].colors.map((color: esri.Color): esri.Color => {
      return color;
    });
  }

  override async postInitialize(): Promise<void> {
    const { layer, _listItems } = this;

    layer.popupEnabled = false;

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          if (visible) {
            layer.definitionExpression = BAD_EXPRESSION;

            layer.visible = true;
          } else {
            layer.visible = false;

            this._clear(true);
          }
        },
      ),
    );

    whenOnce((): boolean => this.visible).then(async (): Promise<void> => {
      const titles: string[] = [];

      const labelingInfo: esri.LabelClass[] = [];

      const uniqueValueInfos: esri.UniqueValueInfoProperties[] = [];

      try {
        (
          await layer.queryFeatures({
            where: '1 = 1',
            outFields: ['*'],
            orderByFields: ['year DESC'],
          })
        ).features.forEach((feature: esri.Graphic): void => {
          const title = feature.attributes.title;

          if (titles.indexOf(title) === -1) {
            _listItems.add(this._listItem(feature));

            titles.push(title);
          }
        });

        titles.forEach((title: string): void => {
          const color = COLORS[Math.floor(Math.random() * COLORS.length)];

          uniqueValueInfos.push({
            label: title,
            symbol: new SimpleFillSymbol({
              color: [0, 0, 0, 0],
              outline: {
                color,
                width: 1.5,
              },
            }),
            value: title,
          });

          // @ts-expect-error layer definitely has labelingInfo
          const labelClass = (layer.labelingInfo[0] as esri.LabelClass).clone();

          const textSymbol = (labelClass.symbol as esri.TextSymbol).clone();

          textSymbol.color = color;

          labelClass.labelExpressionInfo = {
            expression: `if (IsEmpty($feature.page)) { return $feature.title + ' ' + $feature.year ; } else { return $feature.title + ' ' + $feature.year + TextFormatting.NewLine + 'Page ' + $feature.page; }`,
          };

          labelClass.symbol = textSymbol;

          labelClass.where = `title = '${title}'`;

          labelingInfo.push(labelClass);
        });

        layer.renderer = new UniqueValueRenderer({
          defaultSymbol: (layer.renderer as esri.SimpleRenderer).symbol?.clone(),
          field: 'title',
          uniqueValueInfos,
        });

        layer.labelingInfo = labelingInfo;

        this._loading = false;
      } catch (error) {
        console.log(error);
      }
    });
  }

  public layer!: esri.FeatureLayer;

  public view!: esri.MapView;

  @property()
  private _loading = true;

  private _list!: HTMLCalciteListElement;

  private _listItems: esri.Collection<tsx.JSX.Element> = new Collection();

  private _locationList!: HTMLCalciteListElement;

  private _locationListItems: esri.Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _state: I['state'] = 'plans-list';

  private _clear(reset?: boolean): void {
    const { layer, _list, _locationListItems } = this;

    layer.definitionExpression = BAD_EXPRESSION;

    _list.filterText = '';

    _list.selectedItems.forEach((listItem: HTMLCalciteListItemElement): void => {
      listItem.selected = false;
    });

    _locationListItems.removeAll();

    if (reset) {
      this.removeHandles(HANDLES.VIEW_CLICK);

      this._state = 'plans-list';
    }
  }

  private _listItem(feature: esri.Graphic): tsx.JSX.Element {
    const { description, title, url, year } = feature.attributes;

    return (
      <calcite-list-item description={description} key={KEY++} label={`${title} - ${year}`} value={feature}>
        <calcite-action
          icon="file-pdf"
          slot="actions-end"
          text="View PDF"
          afterCreate={(action: HTMLCalciteActionElement): void => {
            action.addEventListener('click', (): void => {
              window.open(url, '_blank');
            });
          }}
        ></calcite-action>
      </calcite-list-item>
    );
  }

  private _location(): void {
    const { view } = this;

    this._clear();

    view.closePopup();

    this.addHandles(
      view.on('click', async (event: esri.ViewClickEvent): Promise<void> => {
        const { layer, _locationListItems } = this;

        event.stopPropagation();

        _locationListItems.removeAll();

        try {
          const features = (await layer.queryFeatures({ geometry: event.mapPoint, outFields: ['*'] })).features;

          if (!features.length) {
            this._state = 'location-no-result';

            return;
          }

          const titles: string[] = [];

          const definitionExpression: string[] = [];

          features.forEach((feature: esri.Graphic): void => {
            const title = feature.attributes.title;

            if (titles.indexOf(title) === -1) {
              _locationListItems.add(this._listItem(feature));

              definitionExpression.push(`title = '${title}'`);

              titles.push(title);
            }
          });

          layer.definitionExpression = definitionExpression.join(' OR ');

          this._state = 'location-result';
        } catch (error) {
          console.log(error);
        }
      }),
      HANDLES.VIEW_CLICK,
    );

    this._state = 'location';
  }

  private async _showListUtilityPlan(feature: esri.Graphic): Promise<void> {
    const { layer, view } = this;

    const expression = `title = '${feature.attributes.title}'`;

    layer.definitionExpression = expression;

    try {
      const extentQuery = await layer.queryExtent({ where: expression, returnGeometry: true });

      view.goTo(extentQuery.extent);
    } catch (error) {
      console.log(error);
    }
  }

  private async _showLocationListUtilityPlan(feature: esri.Graphic): Promise<void> {
    const { layer, view } = this;

    try {
      const extentQuery = await layer.queryExtent({
        where: `title = '${feature.attributes.title}'`,
        returnGeometry: true,
      });

      view.goTo(extentQuery.extent);
    } catch (error) {
      console.log(error);
    }
  }

  override render(): tsx.JSX.Element {
    const { _loading, _locationListItems, _listItems, _state } = this;

    return (
      <calcite-panel heading="Utility Plans" loading={_loading}>
        <calcite-list
          hidden={_state !== 'plans-list'}
          filter-enabled=""
          filter-placeholder="Filter plans by name or type"
          selection-appearance="border"
          selection-mode="single"
          afterCreate={this._listAfterCreate.bind(this)}
        >
          {_listItems.toArray()}

          <calcite-notice kind="danger" open slot="filter-no-results" style="margin: 0 0.75rem;">
            <div slot="message">No results.</div>
          </calcite-notice>
        </calcite-list>

        <calcite-fab
          hidden={_state !== 'plans-list'}
          icon="cursor-click"
          slot={_state === 'plans-list' ? 'fab' : null}
          text="Query location"
          text-enabled=""
          afterCreate={this._locationFabAfterCreate.bind(this)}
        ></calcite-fab>

        <calcite-notice
          icon="cursor-click"
          open={_state === 'location' || _state === 'location-no-result' || _state === 'location-result'}
          style={
            _state === 'location' || _state === 'location-no-result' || _state === 'location-result'
              ? 'margin: 0.75rem;'
              : 'margin: 0;'
          }
        >
          <div slot="message">Click on the map to query utility plans at that location.</div>
          <calcite-link slot="link" afterCreate={this._clearLinkAfterCreate.bind(this)}>
            Cancel
          </calcite-link>
        </calcite-notice>

        <calcite-notice
          kind="danger"
          open={_state === 'location-no-result'}
          style={_state === 'location-no-result' ? 'margin: 0 0.75rem 0.75rem;' : 'margin: 0;'}
        >
          <div slot="message">No utility plans at selected location.</div>
        </calcite-notice>

        <calcite-list
          hidden={_state !== 'location-result'}
          selection-appearance="border"
          selection-mode="single"
          afterCreate={this._locationListAfterCreate.bind(this)}
        >
          {_locationListItems.toArray()}
        </calcite-list>
      </calcite-panel>
    );
  }

  private _clearLinkAfterCreate(link: HTMLCalciteLinkElement): void {
    link.addEventListener('click', this._clear.bind(this, true));
  }

  private _listAfterCreate(list: HTMLCalciteListElement): void {
    const { layer } = this;

    this._list = list;

    list.filterProps = ['description', 'label'];

    list.addEventListener('calciteListChange', (): void => {
      const selected = list.selectedItems[0];

      if (selected) {
        this._showListUtilityPlan(selected.value as esri.Graphic);
      } else {
        layer.definitionExpression = BAD_EXPRESSION;
      }
    });
  }

  private _locationListAfterCreate(list: HTMLCalciteListElement): void {
    this._locationList = list;

    list.addEventListener('calciteListChange', (): void => {
      const selected = list.selectedItems[0];

      if (selected) {
        this._showLocationListUtilityPlan(selected.value as esri.Graphic);
      }
    });
  }

  private _locationFabAfterCreate(fab: HTMLCalciteFabElement): void {
    fab.addEventListener('click', this._location.bind(this));
  }
}

// @subclass('PDFDialog')
// class PDFDialog extends Widget {
//   private _container = document.createElement('calcite-dialog');

//   get container() {
//     return this._container;
//   }

//   set container(value: HTMLCalciteDialogElement) {
//     this._container = value;
//   }

//   constructor(properties?: esri.WidgetProperties) {
//     super(properties);

//     this.container = this._container;

//     document.body.appendChild(this.container);
//   }

//   public async show(feature: esri.Graphic): Promise<void> {
//     const { container } = this;

//     const { title } = feature.attributes;

//     this._heading = title;

//     container.open = true;
//   }

//   private _canvas!: HTMLCanvasElement;

//   @property()
//   private _heading = 'PDF Dialog';

//   render(): tsx.JSX.Element {
//     const { _heading } = this;

//     return (
//       <calcite-dialog heading={_heading} modal style="--calcite-dialog-content-space: 0;">
//         <canvas height="100%" width="100%" afterCreate={this._canvasAfterCreate.bind(this)}></canvas>
//         <calcite-button
//           slot="footer-end"
//           onclick={(): void => {
//             (this.container as HTMLCalciteDialogElement).open = false;
//           }}
//         >
//           Close
//         </calcite-button>
//       </calcite-dialog>
//     );
//   }

//   private _canvasAfterCreate(canvas: HTMLCanvasElement) {
//     this._canvas = canvas;
//   }
// }
