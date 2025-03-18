import esri = __esri;

export interface SketchSaveLoadProperties extends esri.WidgetProperties {
  sketch: Sketch;
}

import type Sketch from './Sketch';
import type { AlertOptions } from '../MapApplication';

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { publish } from 'pubsub-js';
import { SHOW_ALERT_TOPIC } from '../MapApplication';

const LOAD_FORM_ID = 'cov-sketch-load-form';

const SAVE_FORM_ID = 'cov-sketch-save-form';

@subclass('cov.components.Sketch.SketchSaveLoad')
export default class SketchSaveLoad extends Widget {
  private _container = document.createElement('calcite-dialog');

  public get container(): HTMLCalciteDialogElement {
    return this._container;
  }

  public set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties: SketchSaveLoadProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);

    this.container.addEventListener('calciteDialogClose', (): void => {
      this._viewState = 'save';
    });
  }

  readonly sketch!: Sketch;

  @property({ aliasOf: 'sketch.graphicsCount' })
  private _graphicsCount!: number;

  private _reader?: FileReader;

  private _viewState: 'save' | 'load' = 'save';

  private _close(): void {
    const { container } = this;

    container.open = false;
  }

  private _load(event: Event): void {
    event.preventDefault();

    const form = this.container.querySelector(`#${LOAD_FORM_ID}`) as HTMLFormElement;

    const input = form.querySelector('calcite-input') as HTMLCalciteInputElement;

    if (!input.files || !input.files[0]) {
      input.setFocus();

      return;
    }

    let { _reader } = this;

    if (!_reader) {
      _reader = this._reader = new FileReader();

      _reader.onload = this._readerLoad.bind(this, form);

      _reader.onerror = this._readerError.bind(this);
    }

    const file = input.files[0];

    _reader.readAsText(file);
  }

  private _readerLoad(form: HTMLFormElement): void {
    const { sketch, _reader } = this;

    if (!_reader) return;

    form.reset();

    sketch.deleteAll();

    const { features } = JSON.parse(_reader.result as string);

    const graphics = features.map((feature: object): esri.Graphic | nullish => {
      return sketch.addJSON(feature);
    });

    sketch.view?.goTo(graphics);

    this._close();
  }

  private _readerError(event: Event): void {
    console.log(event);

    publish(SHOW_ALERT_TOPIC, {
      icon: 'exclamation-mark-triangle',
      kind: 'danger',
      label: 'Load Sketch Error',
      message: 'An error occurred loading sketch graphics.',
      title: 'Load Sketch Error',
    } as AlertOptions);
  }

  private _save(event: Event): void {
    event.preventDefault();

    const { sketch } = this;

    const form = this.container.querySelector(`#${SAVE_FORM_ID}`) as HTMLFormElement;

    const filename = (form.querySelector('calcite-input') as HTMLCalciteInputElement).value || 'my_sketches';

    const a = Object.assign(document.createElement('a'), {
      href: `data:text/plain;charset=UTF-8,${encodeURIComponent(JSON.stringify(sketch.featureJSON()))}`,
      download: `${filename}.json`,
    });

    a.click();

    // this.container.open = false;
  }

  override render(): tsx.JSX.Element {
    const { _graphicsCount, _viewState } = this;

    const saveDisabled = _graphicsCount < 1;

    return (
      <calcite-dialog heading="Save/Load Sketch Graphics" modal width="s">
        <calcite-tabs>
          {/* tabs */}
          <calcite-tab-nav slot="title-group">
            <calcite-tab-title
              icon-start="save"
              selected={_viewState === 'save'}
              onclick={(): void => {
                this._viewState = 'save';
              }}
            >
              Save
            </calcite-tab-title>
            <calcite-tab-title
              icon-start="folder-open"
              selected={_viewState === 'load'}
              onclick={(): void => {
                this._viewState = 'load';
              }}
            >
              Load
            </calcite-tab-title>
          </calcite-tab-nav>
          {/* save */}
          <calcite-tab selected={_viewState === 'save'}>
            <form id={SAVE_FORM_ID} onsubmit={this._save.bind(this)}>
              <calcite-label style="--calcite-label-margin-bottom:0;">
                File name
                <calcite-input disabled={saveDisabled} suffix-text=".json" value="my_sketches"></calcite-input>
              </calcite-label>
            </form>
            <calcite-notice
              icon="exclamation-mark-triangle"
              kind="warning"
              open={saveDisabled}
              style="margin-top: 0.75rem;"
            >
              <div slot="message">No sketch graphics to save.</div>
            </calcite-notice>
          </calcite-tab>
          {/* load */}
          <calcite-tab selected={_viewState === 'load'}>
            <form id={LOAD_FORM_ID} onsubmit={this._load.bind(this)}>
              <calcite-label style="--calcite-label-margin-bottom:0;">
                ArcGIS JSON file
                <calcite-input accept=".json" type="file"></calcite-input>
              </calcite-label>
            </form>
            <calcite-notice icon="exclamation-mark-triangle" kind="warning" open style="margin-top: 0.75rem;">
              <div slot="message">Existing sketch graphics will be deleted.</div>
            </calcite-notice>
          </calcite-tab>
        </calcite-tabs>
        {/* footer buttons */}
        <calcite-button slot="footer-end" appearance="outline" onclick={this._close.bind(this)}>
          Cancel
        </calcite-button>
        <calcite-button
          disabled={saveDisabled}
          form={SAVE_FORM_ID}
          hidden={_viewState !== 'save'}
          slot={_viewState === 'save' ? 'footer-end' : null}
          type="submit"
          onclick={this._save.bind(this)}
        >
          Save
        </calcite-button>
        <calcite-button
          hidden={_viewState !== 'load'}
          slot={_viewState === 'load' ? 'footer-end' : null}
          type="submit"
          onclick={this._load.bind(this)}
        >
          Load
        </calcite-button>
      </calcite-dialog>
    );
  }
}
