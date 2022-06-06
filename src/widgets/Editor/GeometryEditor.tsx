export interface GeometryEditorProperties extends esri.WidgetProperties {
  layer: esri.FeatureLayer;
}

// import { watch } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Graphic from '@arcgis/core/Graphic';
// import hljs from 'highlight.js';

const CSS = {
  base: 'cov-editor__geometry-editor',
  buttons: 'cov-editor__geometry-editor--buttons',
};

@subclass('Editor.GeometryEditor')
export default class GeometryEditor extends Widget {
  constructor(properties: GeometryEditorProperties) {
    super(properties);
  }

  layer!: esri.FeatureLayer;

  @property()
  feature: Graphic | null = null;

  // private _jsonModal!: HTMLCalciteModalElement;

  // private _jsonContent!: HTMLDivElement;

  render(): tsx.JSX.Element {
    const { feature } = this;

    if (!feature) {
      return <div class={CSS.base}>No feature.</div>;
    }

    const type = feature.geometry.type as 'point' | 'polyline' | 'polygon';

    return (
      <div class={CSS.base}>
        {/* <p>Edit</p> */}
        <div class={CSS.buttons}>
          <calcite-button
            title="Zoom to"
            appearance="transparent"
            icon-start="zoom-to-object"
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'go-to');
              });
            }}
          ></calcite-button>
          <calcite-button
            title="Move"
            appearance="transparent"
            icon-start="move"
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'move');
              });
            }}
          ></calcite-button>
          <calcite-button
            title="Edit vertices"
            appearance="transparent"
            icon-start="vertex-edit"
            disabled={type === 'point'}
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'reshape');
              });
            }}
          ></calcite-button>
          <calcite-button
            title="Rotate"
            appearance="transparent"
            icon-start="rotate"
            disabled={type === 'point'}
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'rotate');
              });
            }}
          ></calcite-button>
          <calcite-button
            title="Scale"
            appearance="transparent"
            icon-start="arrow-double-diagonal-1"
            disabled={type === 'point'}
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'scale');
              });
            }}
          ></calcite-button>
          <calcite-button
            title="Delete"
            appearance="transparent"
            color="red"
            icon-start="trash"
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'delete');
              });
            }}
          ></calcite-button>
        </div>
        {/* <p>Tools</p>
        <div class={CSS.buttons}>
          <calcite-button
            title="Zoom to"
            appearance="transparent"
            icon-start="zoom-to-object"
            afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
              calciteButton.addEventListener('click', (): void => {
                this.emit('action', 'go-to');
              });
            }}
          ></calcite-button>
          <calcite-button appearance="transparent" icon-start="measure"></calcite-button>
          <calcite-button onclick={(): void => {
            const { feature } = this;

            if (!feature) return;

            this._jsonContent.innerHTML = hljs.highlight(JSON.stringify(new Graphic({
              geometry: feature.geometry,
              attributes: feature.attributes,
            }).toJSON(), null, 2), {language: 'json'}).value;

            this._jsonModal.active = true;
          }} appearance="transparent" icon-start="brackets-curly"></calcite-button>
        </div> */}

        {/* <calcite-modal afterCreate={storeNode.bind(this)} data-node-ref="_jsonModal">
          <div slot="header" id="modal-title">Feature JSON</div>
          <div slot="content">
            <pre>
              <code afterCreate={storeNode.bind(this)} data-node-ref="_jsonContent"></code>
            </pre>
          </div>
          <calcite-button slot="primary" width="full" onclick={(): void => { this._jsonModal.active = false; }}>Close</calcite-button>
        </calcite-modal> */}
      </div>
    );
  }
}
