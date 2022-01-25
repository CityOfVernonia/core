import cov = __cov;

import Collection from '@arcgis/core/core/Collection';
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
import { DateTime } from 'luxon';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';

import './Notes.scss';
const CSS = {
  base: 'cov-notes',
  note: 'cov-notes--note',
  noteDate: 'cov-notes--note--date',
};

let KEY = 0;

@subclass('cov.widgets.Notes')
export default class Notes extends Widget {
  layer!: esri.FeatureLayer;

  relationshipId!: number;

  @property()
  feature: esri.Graphic | null = null;

  private _notesLayer!: esri.FeatureLayer;

  @property()
  private _notes: esri.Collection<esri.widget.tsx.JSX.Element> = new Collection();

  private _errorNotice!: HTMLCalciteNoticeElement;

  private _addModal!: HTMLCalciteModalElement;

  private _addInput!: HTMLCalciteInputElement;

  constructor(properties?: cov.NotesProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { layer, relationshipId, feature, _notes } = this;

    await layer.when();

    const relationship = layer.relationships.find((relationship: esri.Relationship): boolean => {
      return relationship.id === relationshipId;
    });

    if (!relationship) {
      this.destroy();
      return;
    }

    this._notesLayer = new FeatureLayer({
      url: `${layer.url}/${relationship.relatedTableId}`,
    });

    if (feature) this._queryNotes();

    this.own(
      watch(this, 'feature', (feature: esri.Graphic) => {
        if (feature) {
          this._queryNotes();
        } else {
          _notes.removeAll();
        }
      }),
    );
  }

  private _queryNotes(): void {
    const { layer, relationshipId, feature, _notes } = this;

    _notes.removeAll();

    if (!feature) return;

    const objectId = feature.attributes[layer.objectIdField];

    layer
      .queryRelatedFeatures({
        relationshipId,
        objectIds: [objectId],
        outFields: ['*'],
        orderByFields: ['DATE DESC'],
      })
      .then((result: any) => {
        const results = result[objectId];

        if (!results || !results.features) return;

        results.features.sort((a: esri.Graphic, b: esri.Graphic) => (a.attributes.DATE < b.attributes.DATE ? 1 : -1));

        results.features.forEach(this._createNote.bind(this));
      })
      .catch(this._error.bind(this));
  }

  private _showAddNote(): void {
    const { _addModal, _addInput } = this;

    _addInput.value = '';
    _addModal.active = true;
  }

  private _addNote(): void {
    const { feature, _notesLayer, _addModal, _addInput } = this;

    const value = _addInput.value;

    if (!feature || !value) {
      _addInput.setFocus();
      return;
    }

    _addModal.active = false;

    _notesLayer
      .applyEdits({
        addFeatures: [
          new Graphic({
            attributes: {
              NOTE: value,
              REL_GLOBALID: feature.attributes['GlobalID'],
            },
          }),
        ],
      })
      .then((result: any): void => {
        console.log(result);

        const addResult = result.addFeatureResults[0];

        if (addResult.error) {
          this._error(addResult.error);
          return;
        }

        _notesLayer
          .queryFeatures({
            objectIds: [addResult.objectId],
            outFields: ['*'],
          })
          .then((result: esri.FeatureSet) => {
            this._createNote(result.features[0]);
          })
          .catch(this._error.bind(this));
      })
      .catch(this._error.bind(this));
  }

  private _createNote(feature: esri.Graphic, index?: number): void {
    const { _notes } = this;
    const { NOTE, DATE } = feature.attributes;
    const dt = DateTime.fromMillis(DATE);

    index = index !== undefined ? index : 0;

    _notes.add(
      <div key={KEY++} class={CSS.note}>
        <div>{NOTE}</div>
        <div class={CSS.noteDate}>{dt.toLocaleString(DateTime.DATE_SHORT)}</div>
      </div>,
      index,
    );
  }

  private _error(error: esri.Error): void {
    const { _errorNotice } = this;

    console.log(error);

    _errorNotice.active = true;

    setTimeout((): void => {
      _errorNotice.active = false;
    }, 6000);
  }

  render(): tsx.JSX.Element {
    const { _notes, feature } = this;

    if (!feature) return <div class={CSS.base}></div>;

    return (
      <div class={CSS.base}>
        {/* add button */}
        <calcite-button
          appearance="outline"
          icon-start="plus"
          afterCreate={(calciteButton: HTMLCalciteButtonElement): void => {
            calciteButton.addEventListener('click', this._showAddNote.bind(this));
          }}
        >
          Add Note
        </calcite-button>

        {/* error */}
        <calcite-notice
          color="red"
          dismissible=""
          scale="s"
          afterCreate={storeNode.bind(this)}
          data-node-ref="_errorNotice"
        >
          <div slot="message">An error occurred.</div>
        </calcite-notice>

        {/* notes */}
        {_notes.length ? (
          _notes.toArray()
        ) : (
          <div key={KEY++} class={CSS.note}>
            No associated notes.
          </div>
        )}

        {/* add modal */}
        <calcite-modal width="s" afterCreate={storeNode.bind(this)} data-node-ref="_addModal">
          <div slot="header">Add Note</div>
          <div slot="content">
            <calcite-input
              type="textarea"
              max-length="600"
              placeholder="Add note..."
              afterCreate={storeNode.bind(this)}
              data-node-ref="_addInput"
            ></calcite-input>
          </div>
          <calcite-button
            slot="secondary"
            width="full"
            appearance="outline"
            afterCreate={(calciteButton: HTMLCalciteButtonElement) => {
              calciteButton.addEventListener('click', (): void => {
                this._addModal.active = false;
              });
            }}
          >
            Cancel
          </calcite-button>
          <calcite-button
            slot="primary"
            width="full"
            afterCreate={(calciteButton: HTMLCalciteButtonElement) => {
              calciteButton.addEventListener('click', this._addNote.bind(this));
            }}
          >
            Add
          </calcite-button>
        </calcite-modal>
      </div>
    );
  }
}
