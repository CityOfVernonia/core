import esri = __esri;

interface _Item {
  count: number;
  point: esri.Point;
  element: tsx.JSX.Element;
}

import esriRequest from '@arcgis/core/request';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

const CSS = {
  content: 'cov-printfirmette-content',
  switch: 'cov-printfirmette-switch',
  error: 'cov-printfirmette-error',
};

let KEY = 0;

let COUNT = 1;

@subclass('cov.widgets.PrintFIRMette')
export default class PrintFIRMette extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      view: esri.MapView;
      layer: esri.MapImageLayer;
    },
  ) {
    super(properties);
  }

  onShow(): void {
    const { view } = this;
    this._clickHandle = view.on('click', this._viewClick.bind(this));
  }

  onHide(): void {
    const { _clickHandle } = this;
    if (_clickHandle) _clickHandle.remove();
  }

  view!: esri.MapView;

  layer!: esri.MapImageLayer;

  @property({ aliasOf: 'layer.visible' })
  private _layerVisible!: boolean;

  @property()
  private _printing = false;

  private _clickHandle!: IHandle;

  private _viewClick(event: esri.ViewClickEvent): void {
    const { _printing } = this;
    event.stopPropagation();
    if (_printing) return;
    this._printing = true;
    this._print(event.mapPoint);
  }

  private _print(point: esri.Point): void {
    const { _listItems } = this;
    const item: _Item = {
      count: COUNT,
      point,
      element: (
        <calcite-list-item
          key={KEY++}
          label={`Printing FIRMette`}
          description={`${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`}
        >
          <calcite-action loading="" slot="actions-end" icon="file-pdf" text="Download"></calcite-action>
        </calcite-list-item>
      ),
    };
    _listItems.add(item);
    COUNT = COUNT + 1;
    esriRequest(
      'https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/submitJob',
      {
        responseType: 'json',
        query: {
          f: 'json',
          FC: JSON.stringify({
            geometryType: 'esriGeometryPoint',
            features: [{ geometry: { x: point.x, y: point.y, spatialReference: { wkid: 102100 } } }],
            sr: { wkid: 102100 },
          }),
          Print_Type: 'FIRMETTE',
          graphic: 'PDF',
          input_lat: 29.877,
          input_lon: -81.2837,
        },
      },
    )
      .then(this._printCheck.bind(this, item))
      .catch((error: esri.Error): void => {
        console.log('submit job error', error);
        this._printError(item);
      });
  }

  private _printCheck(item: _Item, response: any): void {
    const data: { jobId: string; jobStatus: string } = response.data;
    if (data.jobStatus === 'esriJobSubmitted' || data.jobStatus === 'esriJobExecuting') {
      esriRequest(
        `https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${data.jobId}`,
        {
          responseType: 'json',
          query: {
            f: 'json',
          },
        },
      )
        .then((response: any): void => {
          setTimeout(this._printCheck.bind(this, item, response), 1000);
        })
        .catch((error: esri.Error): void => {
          console.log('check job error', error);
          this._printError(item);
        });
    } else if (data.jobStatus === 'esriJobSucceeded') {
      this._printComplete(item, response);
    } else {
      console.log('server job error', response);
      this._printError(item);
    }
  }

  private _printComplete(item: _Item, response: any): void {
    const { _listItems } = this;
    const data: { jobId: string; jobStatus: string; results: { OutputFile: { paramUrl: string } } } = response.data;
    esriRequest(
      `https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/jobs/${data.jobId}/${data.results.OutputFile.paramUrl}`,
      {
        responseType: 'json',
        query: {
          f: 'json',
        },
      },
    )
      .then((response: any): void => {
        _listItems.splice(_listItems.indexOf(item), 1, {
          count: item.count,
          point: item.point,
          element: (
            <calcite-list-item
              key={KEY++}
              label={`FIRMette ${item.count}`}
              description={`${item.point.latitude.toFixed(4)}, ${item.point.longitude.toFixed(4)}`}
            >
              <calcite-action
                slot="actions-end"
                icon="file-pdf"
                text="Download"
                onclick={(): void => {
                  window.open(response.data.value.url.replace('http://', 'https://'), '_blank');
                }}
              >
                <calcite-tooltip close-on-click="" slot="tooltip">
                  Download FIRMette
                </calcite-tooltip>
              </calcite-action>
            </calcite-list-item>
          ),
        });
        this._printing = false;
      })
      .catch((error: esri.Error): void => {
        console.log('get job error', error);
        this._printError(item);
      });
  }

  private _printError(item: _Item): void {
    const { _listItems } = this;
    _listItems.splice(_listItems.indexOf(item), 1, {
      count: item.count,
      point: item.point,
      element: (
        <calcite-list-item key={KEY++} label={`FIRMette ${item.count}`} description="Print error">
          <calcite-icon class={CSS.error} icon="exclamation-mark-circle" slot="actions-end"></calcite-icon>
        </calcite-list-item>
      ),
    });
  }

  render(): tsx.JSX.Element {
    const { _layerVisible, _listItems } = this;
    return (
      <calcite-panel heading="Print FIRMette">
        <div class={CSS.content}>
          <calcite-notice icon="cursor-click" open="">
            <div slot="message">Click on the map at the location to generate a FIRMette.</div>
            <calcite-label class={CSS.switch} layout="inline" slot="link">
              <calcite-switch checked={_layerVisible} afterCreate={this._switchAfterCreate.bind(this)}></calcite-switch>
              Flood hazard layer
            </calcite-label>
          </calcite-notice>
        </div>
        {_listItems.length ? (
          <calcite-list>
            {_listItems.toArray().map((item: _Item): tsx.JSX.Element => {
              return item.element;
            })}
          </calcite-list>
        ) : null}
      </calcite-panel>
    );
  }

  private _switchAfterCreate(_switch: HTMLCalciteSwitchElement): void {
    const { layer } = this;
    _switch.addEventListener('calciteSwitchChange', (): void => {
      layer.visible = _switch.checked;
    });
  }

  private _listItems: esri.Collection<_Item> = new Collection();
}
