//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

interface IResponse {
  data: { jobId: string; jobStatus: string; results: { OutputFile: { paramUrl: string } }; value: { url: string } };
}

/**
 * FIRMette widget constructor properties.
 */
export interface FIRMetteProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import esriRequest from '@arcgis/core/request';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { Point } from '@arcgis/core/geometry';
import Graphic from '@arcgis/core/Graphic';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const STYLE = {
  notice: 'margin: 0.5rem 0.75rem',
};

const URL = 'https://msc.fema.gov/arcgis/rest/services/NFHL_Print/AGOLPrintB/GPServer/Print%20FIRM%20or%20FIRMette/';

/**
 * A widget for generating FIRMette PDFs.
 */
@subclass('cov.widgets.FIRMette')
export default class FIRMette extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: FIRMetteProperties) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view: { graphics },
      _graphic,
    } = this;

    // add graphic
    graphics.add(_graphic);

    // watch visibility
    this.addHandles(
      this.watch('visible', (visible: boolean): void => {
        const { view, _viewClickHandle, _viewState } = this;
        if (visible) {
          view.closePopup();
          this._viewClickHandle = view.on('click', this._viewClickEvent.bind(this));
          this.addHandles(this._viewClickHandle);
          if (_viewState !== 'ready' && _viewState !== 'error') this._graphicVisible(true);
        } else {
          if (_viewClickHandle) _viewClickHandle.remove();
          this._graphicVisible(false);
        }
      }),
    );
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _firmetteURL = '';

  private _graphic = new Graphic({
    symbol: new SimpleMarkerSymbol({
      style: 'x',
      outline: {
        color: [255, 0, 0],
        width: 2,
      },
      size: 12,
    }),
    visible: false,
  });

  @property()
  private _point = new Point();

  private _viewClickHandle?: IHandle;

  @property()
  private _viewState: 'ready' | 'map-point' | 'printing' | 'printed' | 'error' = 'ready';

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  private _error(): void {
    this._graphicVisible(false);
    this._viewState = 'error';
  }

  private _graphicVisible(visible: boolean): void {
    this._graphic.visible = visible;
  }

  private async _print(): Promise<void> {
    const {
      _point: { x, y },
    } = this;

    this._viewState = 'printing';

    try {
      const submitResponse = (await esriRequest(`${URL}submitJob`, {
        responseType: 'json',
        query: {
          f: 'json',
          FC: JSON.stringify({
            geometryType: 'esriGeometryPoint',
            features: [{ geometry: { x, y, spatialReference: { wkid: 102100 } } }],
            sr: { wkid: 102100 },
          }),
          Print_Type: 'FIRMETTE',
          graphic: 'PDF',
          input_lat: 29.877,
          input_lon: -81.2837,
        },
      })) as IResponse;

      this._printCheck(submitResponse);
    } catch (error) {
      console.log(error);
      this._error();
    }
  }

  private async _printCheck(response: IResponse): Promise<void> {
    const {
      data: { jobId, jobStatus },
    } = response;
    if (jobStatus === 'esriJobSubmitted' || jobStatus === 'esriJobExecuting') {
      try {
        const checkResponse = (await esriRequest(`${URL}jobs/${jobId}`, {
          responseType: 'json',
          query: {
            f: 'json',
          },
        })) as IResponse;

        setTimeout(this._printCheck.bind(this, checkResponse), 1500);
      } catch (error) {
        console.log(error);
        this._error();
      }
    } else if (jobStatus === 'esriJobSucceeded') {
      this._printComplete(response);
    } else {
      console.log('server job error', response);
      this._error();
    }
  }

  private async _printComplete(response: IResponse): Promise<void> {
    const {
      data: {
        jobId,
        results: {
          OutputFile: { paramUrl },
        },
      },
    } = response;

    try {
      const completeResponse = (await esriRequest(`${URL}jobs/${jobId}/${paramUrl}`, {
        responseType: 'json',
        query: {
          f: 'json',
        },
      })) as IResponse;

      this._firmetteURL = completeResponse.data.value.url.replace('http://', 'https://');
      this._viewState = 'printed';
    } catch (error) {
      console.log(error);
      this._error();
    }
  }

  private _reset(): void {
    this._graphicVisible(false);
    this._viewState = 'ready';
  }

  private _viewClickEvent(event: esri.ViewClickEvent): void {
    const { _graphic } = this;
    const { mapPoint, stopPropagation } = event;
    stopPropagation();
    this._point = _graphic.geometry = mapPoint;
    this._graphicVisible(true);
    this._viewState = 'map-point';
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const {
      _firmetteURL,
      _point: { latitude, longitude },
      _viewState,
    } = this;
    return (
      <calcite-panel heading="FIRMette">
        {/* ready state */}
        <calcite-notice hidden={_viewState !== 'ready'} icon="cursor-click" style={STYLE.notice} open="">
          <div slot="message">Click on the map at the location to print a FIRMette.</div>
        </calcite-notice>

        {/* map point state */}
        <calcite-notice hidden={_viewState !== 'map-point'} icon="pin" style={STYLE.notice} open="">
          <div slot="message">
            <div>Latitude: {latitude.toFixed(4)}</div>
            <div>Longitude: {longitude.toFixed(4)}</div>
          </div>
        </calcite-notice>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'map-point'}
          slot={_viewState === 'map-point' ? 'footer' : null}
          width="full"
          onclick={this._reset.bind(this)}
        >
          Cancel
        </calcite-button>
        <calcite-button
          hidden={_viewState !== 'map-point'}
          slot={_viewState === 'map-point' ? 'footer' : null}
          width="full"
          onclick={this._print.bind(this)}
        >
          Print
        </calcite-button>

        {/* printing state */}
        <calcite-loader
          hidden={_viewState !== 'printing'}
          scale="s"
          text="Printing FIRMette"
          type="indeterminate"
        ></calcite-loader>

        {/* printed state */}
        <calcite-notice hidden={_viewState !== 'printed'} icon="check" kind="success" style={STYLE.notice} open="">
          <div slot="message">Your FIRMette is ready.</div>
        </calcite-notice>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'printed'}
          slot={_viewState === 'printed' ? 'footer' : null}
          width="full"
          onclick={this._reset.bind(this)}
        >
          Reset
        </calcite-button>
        <calcite-button
          hidden={_viewState !== 'printed'}
          slot={_viewState === 'printed' ? 'footer' : null}
          width="full"
          onclick={(): void => {
            window.open(_firmetteURL, '_blank');
          }}
        >
          View
        </calcite-button>

        {/* error state */}
        <calcite-notice
          hidden={_viewState !== 'error'}
          icon="exclamation-mark-circle"
          kind="danger"
          style={STYLE.notice}
          open=""
        >
          <div slot="message">An error has occurred.</div>
        </calcite-notice>
        <calcite-button
          appearance="outline"
          hidden={_viewState !== 'error'}
          slot={_viewState === 'error' ? 'footer' : null}
          width="full"
          onclick={this._reset.bind(this)}
        >
          Try Again
        </calcite-button>
      </calcite-panel>
    );
  }
}
