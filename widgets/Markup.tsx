/**
 * Simple info widget for displaying text.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';

import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol } from '@arcgis/core/symbols';

import UnitsViewModel from './../viewModels/UnitsViewModel';
import { geodesicBuffer, offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';
import { SpatialReference } from '@arcgis/core/geometry';

import MarkupSymbolEditor from './MarkupSymbolEditor';
import { hexColors, rgbColors } from './../support/colors';

// styles
import './Markup.scss';
const CSS = {
  base: 'cov-markup cov-tabbed-widget',
  title: 'cov-markup--title',
  titlePaddingTop: 'cov-markup--title--padding-top',
  buttonRowActions: 'cov-markup--button-row--actions',
  buttonRow: 'cov-markup--button-row',
  inputRow: 'cov-markup--input-row',
};

// popup actions
const UID = new Date().getTime().toString(16);

const ACTIONS = {
  delete: `${UID}-delete-action`,
  update: `${UID}-update-action`,
  up: `${UID}-up-action`,
  down: `${UID}-down-action`,
};

const POPUP_ACTIONS: (esri.ActionButtonProperties & { type: 'button' })[] = [
  {
    type: 'button',
    title: 'Delete',
    id: ACTIONS.delete,
    className: 'esri-icon-trash',
  },
  {
    type: 'button',
    title: 'Edit',
    id: ACTIONS.update,
    className: 'esri-icon-edit',
  },
  {
    type: 'button',
    title: 'Up',
    id: ACTIONS.up,
    className: 'esri-icon-up',
  },
  {
    type: 'button',
    title: 'Down',
    id: ACTIONS.down,
    className: 'esri-icon-down',
  },
];

// class export
@subclass('cov.widgets.Markup')
export default class Markup extends Widget {
  /**
   * Initialize these properties first.
   */
  @property()
  protected sketchViewModel = new SketchViewModel();

  @property()
  protected unitsViewModel = new UnitsViewModel();

  @property()
  protected symbolEditor = new MarkupSymbolEditor();

  /**
   * Constructor properties.
   */
  @property()
  view!: esri.MapView;

  @property({
    aliasOf: 'sketchViewModel.pointSymbol',
  })
  pointSymbol = new SimpleMarkerSymbol({
    color: hexColors.yellow,
    size: 8,
    outline: {
      color: hexColors.red,
      width: 1,
    },
  });

  @property({
    aliasOf: 'sketchViewModel.polylineSymbol',
  })
  polylineSymbol = new SimpleLineSymbol({
    color: hexColors.red,
    width: 2,
  });

  @property({
    aliasOf: 'sketchViewModel.polygonSymbol',
  })
  polygonSymbol = new SimpleFillSymbol({
    color: [...rgbColors.yellow, 0.2],
    outline: {
      color: hexColors.red,
      width: 2,
    },
  });

  @property()
  textSymbol = new TextSymbol({
    text: 'New Text',
    color: [255, 0, 0],
    haloColor: [255, 255, 0],
    haloSize: 1,
    font: {
      family: 'Arial',
      size: '10',
    },
  });

  @property()
  offsetProjectionWkid = 26910;

  @property()
  theme = 'light';

  @property()
  scale = 'm';

  /**
   * Layers.
   */
  @property()
  protected layer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  protected text = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Text',
  });

  @property()
  protected point = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Points',
  });

  @property()
  protected polyline = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Polylines',
  });

  @property()
  protected polygon = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Polygons',
  });

  @property()
  protected layers = new GroupLayer({
    listMode: 'hide',
  });

  constructor(properties: cov.MarkupProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      layer,
      text,
      point,
      polyline,
      polygon,
      layers,
      sketchViewModel,
    } = this;

    // serviceable view
    await view.when();

    // setup sketch view model and snapping
    sketchViewModel.view = view;
    sketchViewModel.layer = layer;

    sketchViewModel.on('create', this._markupCreateEvent.bind(this));
    sketchViewModel.on('update', this._markupUpdateEvent.bind(this));

    sketchViewModel.snappingOptions.enabled = true;
    sketchViewModel.snappingOptions.featureEnabled = true;
    sketchViewModel.snappingOptions.selfEnabled = true;

    map.allLayers.forEach((_layer: esri.Layer) => {
      const { type } = _layer;
      if (type === 'feature' || type === 'graphics' || type === 'geojson' || type === 'csv') {
        sketchViewModel.snappingOptions.featureSources.add(
          new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: _layer,
          }),
        );
      }
    });

    // add layers
    layers.addMany([polygon, polyline, point, text, layer]);
    map.add(layers);

    // popup action events
    view.popup.on('trigger-action', (triggerActionEvent: esri.PopupTriggerActionEvent) => {
      switch (triggerActionEvent.action.id) {
        case ACTIONS.delete:
          this._deleteMarkupGraphic();
          break;
        case ACTIONS.update:
          this._editMarkupGraphic();
          break;
        case ACTIONS.up:
          this._moveMarkupGraphicUp();
          break;
        case ACTIONS.down:
          this._moveMarkupGraphicDown();
          break;
        default:
          break;
      }
    });

    // load projection
    projection.load();
  }

  /**
   * Begin marking up.
   * @param tool geometry type to create (no multi-point support)
   */
  markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'): void {
    const { view, sketchViewModel } = this;
    view.popup.close();
    sketchViewModel.create(tool);
  }

  /**
   * Is a graphic markup graphic or not.
   */
  private _isMarkup(graphic: Graphic): boolean {
    if (!graphic) return false;
    const { layer } = graphic;
    const { text, point, polyline, polygon } = this;
    return layer === text || layer === point || layer === polyline || layer === polygon ? true : false;
  }

  /**
   * Add symbol and popup to graphic and add to appropriate layer when sketch complete.
   */
  private _markupCreateEvent(createEvent: esri.SketchViewModelCreateEvent): void {
    const { state, graphic } = createEvent;

    if (state === 'cancel' || !graphic) return;
    if (state !== 'complete') return;

    this._addGraphic(graphic);
  }

  private _addGraphic(graphic: esri.Graphic): void {
    const { sketchViewModel } = this;
    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';

    graphic.symbol = sketchViewModel[
      `${type}Symbol` as 'pointSymbol' | 'polylineSymbol' | 'polygonSymbol'
    ] as esri.Symbol;

    graphic.popupTemplate = new PopupTemplate({
      title: `Markup ${type}`,
      content: 'Move edit actions here?',
      actions: POPUP_ACTIONS,
    });

    this[type].add(graphic);
  }

  /**
   * Remove edit graphic from sketch layer and add to appropriate layer when update complete.
   */
  private _markupUpdateEvent(updateEvent: esri.SketchViewModelUpdateEvent): void {
    const { state, graphics } = updateEvent;
    const { layer } = this;
    const graphic = graphics[0];
    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
    if (state !== 'complete') return;
    layer.removeAll();
    this[type].add(graphic);
  }

  /**
   * Delete graphic from its layer.
   */
  private _deleteMarkupGraphic(graphic?: esri.Graphic): void {
    const {
      view: { popup },
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
  }

  /**
   * Begin geometry update by removing graphic from type layer, adding to sketch layer and initializing update.
   */
  private _editMarkupGraphic(graphic?: esri.Graphic): void {
    const {
      view: { popup },
      layer,
      sketchViewModel,
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
    layer.add(graphic);
    sketchViewModel.update(graphic);
  }

  /**
   * Move markup graphic up on its layer.
   */
  private _moveMarkupGraphicUp(graphic?: esri.Graphic): void {
    const {
      view: { popup },
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    const collection = graphic.get('layer.graphics') as esri.Collection<esri.Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx < collection.length - 1) {
      collection.reorder(graphic, idx + 1);
    }
  }

  /**
   * Move markup graphic down on its layer.
   */
  private _moveMarkupGraphicDown(graphic?: esri.Graphic): void {
    const {
      view: { popup },
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    const collection = graphic.get('layer.graphics') as esri.Collection<esri.Graphic>;
    const idx = collection.indexOf(graphic);
    if (idx > 0) {
      collection.reorder(graphic, idx - 1);
    }
  }

  /**
   * Until select is native form compliant.
   */
  private _bufferUnitSelect = this.unitsViewModel.calciteLengthSelect('UNIT', 'Buffer unit');

  /**
   * Buffer a feature and add to markup.
   * @param feature
   * @param event
   */
  private _buffer(feature: esri.Graphic, event: Event): void {
    event.preventDefault();

    const { geometry, attributes, layer } = feature;
    const { view, _bufferUnitSelect } = this;
    const distance = parseInt((event.target as HTMLFormElement).DISTANCE.value);
    // @ts-ignore
    const unit = (_bufferUnitSelect.domNode as HTMLCalciteSelectElement).selectedOption.value;

    if (geometry && geometry.spatialReference.wkid === view.spatialReference.wkid) {
      this._addGraphic(
        new Graphic({
          geometry: geodesicBuffer(feature.geometry, distance, unit) as esri.Geometry,
        }),
      );
      return;
    }

    if (!geometry && layer && layer.type === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          returnGeometry: true,
          outSpatialReference: view.spatialReference,
          objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
        })
        .then((results: esri.FeatureSet) => {
          this._addGraphic(
            new Graphic({
              geometry: geodesicBuffer(results.features[0].geometry, distance, unit) as esri.Geometry,
            }),
          );
        });
      return;
    }

    console.log(feature);
  }

  /**
   * Until select is native form compliant.
   */
  private _offsetUnitSelect = this.unitsViewModel.calciteLengthSelect('UNIT', 'Buffer unit');

  /**
   * Offset a polyline
   * @param feature
   * @param event
   */
  private _offset(feature: esri.Graphic, event: Event): void {
    event.preventDefault();
    const { geometry, attributes, layer } = feature;
    const { view, offsetProjectionWkid, _offsetUnitSelect } = this;
    const distance = parseInt((event.target as HTMLFormElement).DISTANCE.value);
    // @ts-ignore
    const unit = (_offsetUnitSelect.domNode as HTMLCalciteSelectElement).selectedOption.value;

    if (geometry && geometry.spatialReference.wkid === view.spatialReference.wkid) {
      const projected = projection.project(
        geometry,
        new SpatialReference({
          wkid: offsetProjectionWkid,
        }),
      );

      this._addGraphic(
        new Graphic({
          geometry: projection.project(
            offset(projected, distance, unit, 'miter') as esri.Geometry,
            view.spatialReference,
          ) as esri.Geometry,
        }),
      );
      this._addGraphic(
        new Graphic({
          geometry: projection.project(
            offset(projected, distance * -1, unit, 'miter') as esri.Geometry,
            view.spatialReference,
          ) as esri.Geometry,
        }),
      );
      return;
    }

    if (!geometry && layer && layer.type === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          returnGeometry: true,
          outSpatialReference: new SpatialReference({
            wkid: offsetProjectionWkid,
          }),
          objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
        })
        .then((results: esri.FeatureSet) => {
          this._addGraphic(
            new Graphic({
              geometry: projection.project(results.features[0].geometry, view.spatialReference) as esri.Geometry,
            }),
          );
          this._addGraphic(
            new Graphic({
              geometry: projection.project(results.features[0].geometry, view.spatialReference) as esri.Geometry,
            }),
          );
        });
      return;
    }

    console.log(feature);
  }

  render(): tsx.JSX.Element {
    const {
      id,
      view: {
        popup: { visible, selectedFeature },
      },
      theme,
      scale,
      symbolEditor,
      _bufferUnitSelect,
      _offsetUnitSelect,
    } = this;

    const isMarkup = visible && this._isMarkup(selectedFeature);

    const isFeature = visible && selectedFeature;

    const isPolyline =
      (visible && selectedFeature?.geometry?.type === 'polyline') ||
      (selectedFeature?.layer &&
        selectedFeature.layer.type === 'feature' &&
        (selectedFeature.layer as esri.FeatureLayer).geometryType === 'polyline');

    if (isMarkup) {
      symbolEditor.graphic = selectedFeature;
    } else {
      symbolEditor.graphic = null;
    }

    return (
      <div class={CSS.base}>
        <calcite-tabs theme={theme} scale={scale} layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">Markup</calcite-tab-title>
            <calcite-tab-title>Symbol</calcite-tab-title>
            <calcite-tab-title>Tools</calcite-tab-title>
          </calcite-tab-nav>

          {/* symbol tab */}
          <calcite-tab active="">
            <div class={CSS.title}>Create</div>
            <div class={CSS.buttonRowActions}>
              <calcite-button
                icon-start="point"
                title="Draw point"
                onclick={this.markup.bind(this, 'point')}
              ></calcite-button>
              <calcite-button
                icon-start="line"
                title="Draw polyline"
                onclick={this.markup.bind(this, 'polyline')}
              ></calcite-button>
              <calcite-button
                icon-start="polygon"
                title="Draw polygon"
                onclick={this.markup.bind(this, 'polygon')}
              ></calcite-button>
              <calcite-button
                icon-start="rectangle"
                title="Draw rectangle"
                onclick={this.markup.bind(this, 'rectangle')}
              ></calcite-button>
              <calcite-button
                icon-start="circle"
                title="Draw circle"
                onclick={this.markup.bind(this, 'circle')}
              ></calcite-button>
            </div>
            <div class={CSS.title}>Edit</div>
            <div class={CSS.buttonRowActions}>
              <calcite-button
                icon-start="pencil"
                title="Edit selected"
                disabled={!isMarkup}
                onclick={this._editMarkupGraphic.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="trash"
                title="Delete selected"
                disabled={!isMarkup}
                onclick={this._deleteMarkupGraphic.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="chevron-up"
                title="Move selected up"
                disabled={!isMarkup}
                onclick={this._moveMarkupGraphicUp.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="chevron-down"
                title="Move selected down"
                disabled={!isMarkup}
                onclick={this._moveMarkupGraphicDown.bind(this, selectedFeature)}
              ></calcite-button>
            </div>
          </calcite-tab>

          {/* tools tab */}
          <calcite-tab>
            {/* <div style={`display:${!isFeature && !isPolyline ? 'block' : 'none'};`}>
              Select a markup graphic in the map to edit symbol.
            </div> */}
            <div
              afterCreate={(div: HTMLDivElement) => {
                symbolEditor.container = div;
              }}
            ></div>
          </calcite-tab>

          {/* tools tab */}
          <calcite-tab>
            {/* no graphic or feature selected */}
            <div style={`display:${!isFeature && !isPolyline ? 'block' : 'none'};`}>
              Select a markup graphic or feature in the map.
            </div>

            {/* any graphic or feature selected */}
            <div style={`display:${isFeature ? 'block' : 'none'};`}>
              <div class={CSS.title}>Buffer</div>
              <form onsubmit={this._buffer.bind(this, selectedFeature)}>
                <div class={CSS.inputRow}>
                  <label>
                    Distance
                    <calcite-input
                      type="number"
                      name="DISTANCE"
                      title="Buffer distance"
                      min="10"
                      max="2000"
                      step="1"
                      value="250"
                    ></calcite-input>
                  </label>
                  <label>
                    Unit
                    {_bufferUnitSelect}
                    {/* Until select is native form compliant. */}
                    {/* {unitsViewModel.calciteLengthSelect('UNIT', 'Buffer unit')} */}
                  </label>
                </div>
                <calcite-button
                  type="button"
                  width="full"
                  onclick={() => {
                    (document.getElementById(`markup_buffer_submit_button_${id}`) as HTMLButtonElement).click();
                  }}
                >
                  Buffer
                </calcite-button>
                <button
                  id={`markup_buffer_submit_button_${id}`}
                  type="submit"
                  style="display: none !important;"
                ></button>
              </form>
            </div>

            {/* polyline graphic or feature selected */}
            <div style={`display:${isPolyline ? 'block' : 'none'};`}>
              <div class={this.classes(CSS.title, CSS.titlePaddingTop)}>Offset</div>
              <form onsubmit={this._offset.bind(this, selectedFeature)}>
                <div class={CSS.inputRow}>
                  <label>
                    Distance
                    <calcite-input
                      type="number"
                      name="DISTANCE"
                      title="Buffer distance"
                      min="5"
                      max="500"
                      step="1"
                      value="30"
                    ></calcite-input>
                  </label>
                  <label>
                    Unit
                    {_offsetUnitSelect}
                    {/* Until select is native form compliant. */}
                    {/* {unitsViewModel.calciteLengthSelect('UNIT', 'Buffer unit')} */}
                  </label>
                </div>
                <calcite-button
                  type="button"
                  width="full"
                  onclick={() => {
                    (document.getElementById(`markup_offset_submit_button_${this.id}`) as HTMLButtonElement).click();
                  }}
                >
                  Offset
                </calcite-button>
                <button
                  id={`markup_offset_submit_button_${this.id}`}
                  type="submit"
                  style="display: none !important;"
                ></button>
              </form>
            </div>
          </calcite-tab>
        </calcite-tabs>
      </div>
    );
  }
}
