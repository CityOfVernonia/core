import esri = __esri;

interface I {
  viewState: 'streets' | 'info';
}

export interface StreetsShellPanelProperties extends esri.WidgetProperties {
  centerlines: esri.FeatureLayer;

  streets: esri.MapImageLayer;

  view: esri.MapView;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import '@arcgis/map-components/components/arcgis-legend';

import { referenceElement } from './support';
import { marked } from 'marked';

const CSS_BASE = 'cov--streets-shell-panel';

const CSS = {
  dataInfo: `${CSS_BASE}_data-info`,
  notice: `${CSS_BASE}_notice`,
  panel: `${CSS_BASE}_panel`,
};

const HANDLES = {
  APPLICATION_HANDLES: `${CSS_BASE}_application_handles`,
  HIGHLIGHT_HANDLES: `${CSS_BASE}_highlight_handles`,
};

@subclass('cov.components.StreetsShellPanel')
export default class StreetsShellPanel extends Widget {
  constructor(properties: StreetsShellPanelProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { centerlines, streets, view, _sublayers } = this;

    await streets.when();

    streets.sublayers?.forEach((sublayer: esri.Sublayer): void => {
      _sublayers[sublayer.id] = sublayer;
    });

    this._setDisplayInfo(10);

    this._centerlinesView = await view.whenLayerView(centerlines);

    this._centerlinesView.highlightOptions = {
      fillOpacity: 0.1,
      haloOpacity: 0.5,
    };

    this.addHandles(view.on('click', this._viewClickEvent.bind(this)), HANDLES.APPLICATION_HANDLES);

    watch((): esri.Graphic | nullish => this._feature, this._renderInfo.bind(this));

    watch(
      (): I['viewState'] => this._viewState,
      (state: I['viewState'] | nullish, oldState: I['viewState'] | nullish) => {
        if (oldState === 'info') this._clearFeature();
      },
    );
  }

  readonly centerlines!: esri.FeatureLayer;

  readonly streets!: esri.MapImageLayer;

  readonly view!: esri.MapView;

  private _centerlinesView!: esri.FeatureLayerView;

  private _dataDisplayLayerIds = [10, 11, 12, 20, 21, 22];

  private _dataInfo!: HTMLDivElement;

  @property()
  private _dataInfoHeading = '';

  private _dataInfos: {
    [key: number]: {
      title: string;
      url: string;
    };
  } = {
    10: {
      title: 'Functional Classification',
      url: '/streets/functional-classification.markdown',
    },
    12: {
      title: 'Ownership',
      url: '/streets/ownership.markdown',
    },
  };

  @property()
  private _feature: esri.Graphic | nullish = null;

  @property()
  private _featureHeading = '';

  @property()
  private _featureInfo: tsx.JSX.Element[] = [];

  private _sublayers: {
    [key: number]: esri.Sublayer;
  } = {};

  @property()
  private _viewState: I['viewState'] = 'streets';

  private _clearFeature(): void {
    this._feature = null;

    this.removeHandles(HANDLES.HIGHLIGHT_HANDLES);
  }

  private async _setDisplayInfo(id: number): Promise<void> {
    const { _dataInfo, _dataInfos } = this;

    const info = _dataInfos[id];

    if (!info) return;

    const { title, url } = info;

    this._dataInfoHeading = title;

    const markdown = await (await fetch(url, { cache: 'reload' })).text();

    marked.use({
      gfm: true,
      extensions: [
        {
          name: 'link',
          renderer: (token): string | false | undefined => {
            const { href, text } = token;

            const blank = '::_blank';

            if (text.includes(blank)) {
              return `<a href=${href} target="_blank">${text.replace(blank, '')}</a>`;
            } else {
              return `<a href=${href}>${text}</a>`;
            }
          },
        },
      ],
    });

    _dataInfo.innerHTML = await marked.parse(markdown);
  }

  private _setState(state: I['viewState']): void {
    this._viewState = state;
  }

  private async _viewClickEvent(event: esri.ViewClickEvent): Promise<void> {
    const { _centerlinesView, view } = this;

    const { mapPoint, stopPropagation } = event;

    stopPropagation();

    this._clearFeature();

    try {
      const feature = (
        await _centerlinesView.queryFeatures({
          geometry: mapPoint,
          distance: view.resolution * 3,
          outFields: ['*'],
          returnGeometry: true,
        })
      ).features[0];

      if (!feature) {
        this._setState('streets');

        return;
      }

      this._feature = feature;

      const { FUNC_CLASS, LABEL } = feature.attributes;

      this._featureHeading = LABEL || FUNC_CLASS;

      this.addHandles(_centerlinesView.highlight(feature), HANDLES.HIGHLIGHT_HANDLES);

      this._setState('info');
    } catch (error) {
      console.log(error);

      this._clearFeature();

      this._setState('streets');
    }
  }

  render(): tsx.JSX.Element {
    const { _dataInfoHeading, _featureHeading, _featureInfo, _viewState } = this;

    return (
      <calcite-shell-panel class={CSS_BASE}>
        {/* action bar */}
        <calcite-action-bar slot="action-bar">
          <calcite-action
            active={_viewState === 'streets'}
            icon="car"
            text="Streets"
            onclick={this._setState.bind(this, 'streets')}
          ></calcite-action>
          <calcite-tooltip close-on-click="" afterCreate={referenceElement.bind(this)}>
            Streets
          </calcite-tooltip>
        </calcite-action-bar>

        {/* streets */}
        <calcite-panel heading="Streets" hidden={_viewState !== 'streets'}>
          <div>
            <calcite-notice class={CSS.notice} closable icon="cursor-click" open>
              <div slot="message">Click on a street for detailed information.</div>
            </calcite-notice>
          </div>
          <calcite-block expanded heading="Layers" icon-start="layers">
            <calcite-label>
              Data display
              <calcite-select afterCreate={this._dataDisplayAfterCreate.bind(this)}>
                <calcite-option selected value="10">
                  Functional classification
                </calcite-option>
                <calcite-option value="12">Ownership</calcite-option>
                <calcite-option value="21">Surface type</calcite-option>
                <calcite-option value="22">Surface width</calcite-option>
                <calcite-option value="11">ODOT reported</calcite-option>
              </calcite-select>
            </calcite-label>
            <calcite-label>
              Linear referencing
              <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
                <calcite-checkbox afterCreate={this._directionAfterCreate.bind(this)}></calcite-checkbox>
                Direction
              </calcite-label>
              <calcite-label layout="inline">
                <calcite-checkbox afterCreate={this._stationsAfterCreate.bind(this)}></calcite-checkbox>
                Stations
              </calcite-label>
            </calcite-label>
          </calcite-block>
          <calcite-block collapsible heading={`${_dataInfoHeading} Info`} icon-start="information">
            <div class={CSS.dataInfo} afterCreate={this._dataInfoAfterCreate.bind(this)}></div>
          </calcite-block>
          <calcite-block collapsible heading="Legend" icon-start="legend">
            <arcgis-legend afterCreate={this._legendAfterCreate.bind(this)}></arcgis-legend>
          </calcite-block>
        </calcite-panel>

        <calcite-panel heading={_featureHeading} hidden={_viewState !== 'info'}>
          {_featureInfo}
        </calcite-panel>
      </calcite-shell-panel>
    );
  }

  private _dataDisplayAfterCreate(select: HTMLCalciteSelectElement): void {
    select.addEventListener('calciteSelectChange', (): void => {
      const { _dataDisplayLayerIds, _sublayers } = this;

      _dataDisplayLayerIds.forEach((id: number) => {
        const sublayer = _sublayers[id];

        if (!sublayer) return;

        const _id = Number(select.selectedOption.value);

        sublayer.visible = sublayer.id === _id;

        if (sublayer.id === _id) this._setDisplayInfo(_id);
      });
    });
  }

  private _dataInfoAfterCreate(div: HTMLDivElement): void {
    this._dataInfo = div;
  }

  private _directionAfterCreate(checkbox: HTMLCalciteCheckboxElement): void {
    checkbox.addEventListener('calciteCheckboxChange', (): void => {
      this._sublayers[3].visible = checkbox.checked;
    });
  }

  private _legendAfterCreate(legend: HTMLArcgisLegendElement & { view: esri.MapView }): void {
    const { streets, view, _dataDisplayLayerIds } = this;

    legend.view = view;

    legend.layerInfos = [
      {
        layer: streets,
        sublayerIds: _dataDisplayLayerIds,
      },
    ];
  }

  private async _renderInfo(feature: esri.Graphic | nullish): Promise<void> {
    if (!feature) {
      this._featureInfo = [];

      return;
    }

    const { FUNC_CLASS, LABEL, ODOT_REPORT, OWNER, VERNONIA } = feature.attributes;

    console.log(feature.attributes);

    if (VERNONIA === 0) {
      this._featureInfo = [
        <calcite-notice class={CSS.notice} icon="information" open>
          <div slot="message">
            {LABEL || FUNC_CLASS} is not in Vernonia city limits or owned by the City. Extended street data is not
            available.
          </div>
        </calcite-notice>,
      ];
    } else if (VERNONIA === 1 && OWNER !== 'City of Vernonia') {
      this._featureInfo = [
        <calcite-notice class={CSS.notice} icon="information" open>
          <div slot="message">
            {LABEL || FUNC_CLASS} is not owned by the City. Extended street data is not available.
          </div>
        </calcite-notice>,
        <table class="esri-widget__table">
          <tr>
            <th>Owner</th>
            <td>{OWNER}</td>
          </tr>
          <tr>
            <th>Functional classification</th>
            <td>{FUNC_CLASS}</td>
          </tr>
          <tr>
            <th>ODOT reported</th>
            <td>{ODOT_REPORT === 1 ? 'Yes' : 'No'}</td>
          </tr>
        </table>,
      ];
    } else {
      this._featureInfo = [];
    }
  }

  private _stationsAfterCreate(checkbox: HTMLCalciteCheckboxElement): void {
    checkbox.addEventListener('calciteCheckboxChange', (): void => {
      this._sublayers[1].visible = checkbox.checked;
      this._sublayers[2].visible = checkbox.checked;
    });
  }
}
