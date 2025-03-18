import esri = __esri;

interface I {
  layers: 'point' | 'polyline' | 'polygon' | 'text';
  sides: 'both' | 'left' | 'right';
  state: 'buffer' | 'delete-all' | 'edit' | 'new-text' | 'offset' | 'selected' | 'sketch';
  tools: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'freehandPolygon' | 'freehandPolyline' | 'text';
}

/**
 * Sketch properties.
 */
export interface SketchProperties extends esri.WidgetProperties {
  view: esri.MapView;

  offsetProjectionWkid?: number;
}

import type SketchSaveLoad from './Sketch/SketchSaveLoad';

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Collection from '@arcgis/core/core/Collection';
import { watch, whenOnce } from '@arcgis/core/core/reactiveUtils';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Widget from '@arcgis/core/widgets/Widget';
import _Sketch, { COLORS, POINT_SYMBOL, TEXT_SYMBOL } from './Sketch/Sketch';
import { buffer, offset, polygonVertices, polylineVertices } from '../support/geometryUtils';
import { queryFeatureGeometry } from '../support/layerUtils';
import { referenceElement } from './support';
import Color from '@arcgis/core/Color';

const CSS_BASE = 'cov--sketch';

const CSS = {
  base: CSS_BASE,
  actionBars: `${CSS_BASE}_action-bars`,
  colorPicker: `${CSS_BASE}_color-picker`,
  notice: `${CSS_BASE}_notice`,
  options: `${CSS_BASE}_options`,
};

const HANDLE_KEYS = {
  LIFECYCLE_KEY: 'cov_components_sketch',
  SELECT_KEY: 'cov_components_sketch_select',
  SELECTED_KEY: 'cov_components_sketch_selected',
};

let KEY = 0;

/**
 * Sketch graphics on a map.
 */
@subclass('cov.components.Sketch')
export default class Sketch extends Widget {
  constructor(properties: SketchProperties) {
    super(properties);
  }

  override async postInitialize(): Promise<void> {
    const { view, _sketch } = this;

    await view.when();

    _sketch.view = view;

    const undoRedo = (): void => {
      this._canUndo = _sketch.canUndo();
      this._canRedo = _sketch.canRedo();
    };

    whenOnce((): HTMLElement | nullish => view.popup?.container).then((): void => {
      const popup = view.popup as esri.Popup;

      this.addHandles(
        watch(
          (): boolean => popup.visible,
          (visible: boolean): void => {
            const { _viewState } = this;

            if (!visible && (_viewState === 'buffer' || _viewState === 'offset')) this._reset();
          },
        ),
        HANDLE_KEYS.LIFECYCLE_KEY,
      );
    });

    this.addHandles(
      [
        // create/update
        _sketch.on('create', this._createEvent.bind(this)),
        _sketch.on('update', this._updateEvent.bind(this)),

        // undo redo
        _sketch.on('create', undoRedo),
        _sketch.on('update', undoRedo),
        _sketch.on('redo', undoRedo),
        _sketch.on('undo', undoRedo),

        // point symbol
        watch(
          (): boolean => this._createText,
          (createText: boolean): void => {
            _sketch.pointSymbol = createText ? TEXT_SYMBOL : POINT_SYMBOL;
          },
        ),

        // state
        // watch(
        //   (): I['state'] => this._viewState,
        //   (state: I['state'], oldState?: I['state']): void => {},
        // ),

        // visible
        watch(
          (): boolean => this.visible,
          (visible: boolean): void => {
            if (!visible) this._reset();
          },
        ),
      ],
      HANDLE_KEYS.LIFECYCLE_KEY,
    );
  }

  readonly offsetProjectionWkid = 102970;

  readonly view!: esri.MapView;

  private _bufferInput!: HTMLCalciteInputNumberElement;

  @property()
  private _canRedo = false;

  @property()
  private _canUndo = false;

  @property()
  private _createText = false;

  @property({ aliasOf: '_sketch.graphicsCount' })
  private _graphicsCount = 0;

  private _newTextInput!: HTMLCalciteInputElement;

  private _newTextGraphic!: esri.Graphic;

  private _offsetInput!: HTMLCalciteInputNumberElement;

  private _offsetSelect!: HTMLCalciteSelectElement;

  @property({ aliasOf: 'view.popup.visible' })
  private _popupVisible: boolean | nullish;

  @property()
  private _selectState = false;

  @property({ aliasOf: 'view.popup.selectedFeature' })
  private _selectedFeature: esri.Graphic | nullish;

  @property()
  private _selectedGraphic: esri.Graphic | nullish;

  @property()
  private _selectedGraphics: esri.Collection<esri.Graphic> = new Collection();

  @property()
  private _selectedGraphicsListItems: esri.Collection<tsx.JSX.Element> = new Collection();

  private _sketch = new _Sketch();

  private _sketchSaveLoad!: SketchSaveLoad;

  @property()
  private _toolState: I['tools'] | 'none' = 'none';

  @property()
  private _viewState: I['state'] = 'sketch';

  private async _addSelectedFeature(): Promise<void> {
    const {
      view: { spatialReference: outSpatialReference },
      _selectedFeature: graphic,
      _sketch,
    } = this;

    if (!graphic) return;

    // @ts-expect-error not types;
    const layer = graphic.layer || graphic.sourceLayer;

    if (!layer) return;

    const geometry = await queryFeatureGeometry({
      graphic,
      layer,
      outSpatialReference,
    });

    if (!geometry) return;

    _sketch.addGeometry(geometry);
  }

  private async _addVertices(): Promise<void> {
    const {
      view: { spatialReference },
      _selectedFeature,
      _selectedGraphic,
      _sketch,
    } = this;

    const graphic = _selectedGraphic || _selectedFeature;

    if (!graphic) return;

    // @ts-expect-error not types;
    const layer = graphic.layer || graphic.sourceLayer;

    if (!layer) return;

    let geometry: esri.Geometry | nullish = graphic.geometry;

    if (!geometry) return;

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });

    if (!geometry) return;

    if (geometry.type === 'polyline')
      polylineVertices(geometry as esri.Polyline, spatialReference).forEach((point: esri.Point): void => {
        _sketch.addGeometry(point);
      });

    if (geometry.type === 'polygon')
      polygonVertices(geometry as esri.Polygon, spatialReference).forEach((point: esri.Point): void => {
        _sketch.addGeometry(point);
      });
  }

  private async _buffer(event: Event): Promise<void> {
    event.preventDefault();

    const {
      view: { spatialReference },
      _bufferInput,
      _selectedFeature,
      _selectedGraphic,
      _sketch,
    } = this;

    const graphic = _selectedGraphic || _selectedFeature;

    if (!graphic) {
      this._reset();
      return;
    }

    // @ts-expect-error not types;
    const layer = graphic.layer || graphic.sourceLayer;

    if (!layer) {
      this._reset();
      return;
    }

    let geometry: esri.Geometry | nullish = graphic.geometry;

    if (!geometry) {
      this._reset();
      return;
    }

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });

    if (!geometry) {
      this._reset();
      return;
    }

    const bufferGeometry = await buffer(geometry, Number(_bufferInput.value), 'feet');

    _sketch.addGeometry(bufferGeometry);

    this._cancel();
  }

  private _cancel(): void {
    const { _selectedGraphic } = this;

    this._viewState = _selectedGraphic ? 'edit' : 'sketch';
  }

  private _create(tool: I['tools']): void {
    const { _sketch } = this;

    if (_sketch.state === 'active') this._reset();

    this._toolState = tool;

    if (tool === 'text') {
      this._createText = true;
      _sketch.create('point');
    } else {
      _sketch.create(tool);
    }
  }

  private _createEvent(event: esri.SketchViewModelCreateEvent): void {
    const { _createText, _sketch } = this;

    const { graphic, state } = event;

    if (state === 'cancel') {
      this._reset();

      return;
    }

    if (state !== 'complete') return;

    if (state === 'complete' && !graphic.geometry) {
      this._reset();

      return;
    }

    const type = (graphic.geometry as esri.Geometry).type as 'point' | 'polygon' | 'polyline';

    // @ts-expect-error symbol will never be nullish
    graphic.symbol = graphic.symbol.clone();

    _sketch.layer.remove(graphic);

    if (_createText) {
      _sketch.text.add(graphic);

      this._newTextGraphic = graphic;

      this._viewState = 'new-text';

      this._createText = false;
    } else {
      _sketch[type].add(graphic);
    }

    this._toolState = 'none';
  }

  private _highlight(graphic: esri.Graphic): void {
    const { _sketch } = this;

    this.addHandles(
      _sketch[`${(graphic.layer as esri.GraphicsLayer).title as I['layers']}View`].highlight(graphic),
      HANDLE_KEYS.SELECTED_KEY,
    );
  }

  private _highlightGraphic(graphic: esri.Graphic): void {
    this.removeHandles(HANDLE_KEYS.SELECTED_KEY);

    this._highlight(graphic);
  }

  private _highlightSelectedGraphics(): void {
    const { _selectedGraphics, _viewState } = this;

    if (_viewState !== 'selected') return;

    this.removeHandles(HANDLE_KEYS.SELECTED_KEY);

    _selectedGraphics.forEach(this._highlight.bind(this));
  }

  private _newText(event: Event): void {
    event.preventDefault();

    const { _newTextInput, _newTextGraphic } = this;

    if (!_newTextInput || !_newTextGraphic) {
      this._reset();

      return;
    }

    this._viewState = 'sketch';

    const symbol = (_newTextGraphic.symbol as esri.TextSymbol).clone();

    symbol.text = _newTextInput.value || 'New Text';

    _newTextGraphic.symbol = symbol;
  }

  private async _offset(event: Event): Promise<void> {
    event.preventDefault();

    const {
      offsetProjectionWkid,
      view: { spatialReference },
      _offsetInput,
      _offsetSelect,
      _selectedFeature,
      _selectedGraphic,
      _sketch,
    } = this;

    const graphic = _selectedGraphic || _selectedFeature;

    if (!graphic) {
      this._reset();
      return;
    }

    // @ts-expect-error not types;
    const layer = graphic.layer || graphic.sourceLayer;

    if (!layer) {
      this._reset();
      return;
    }

    let geometry: esri.Geometry | nullish = graphic.geometry;

    if (!geometry) {
      this._reset();
      return;
    }

    if (layer.type !== 'graphics')
      geometry = await queryFeatureGeometry({
        layer,
        graphic,
        outSpatialReference: spatialReference,
      });

    if (!geometry || geometry.type !== 'polyline') {
      this._reset();
      return;
    }

    const offsetGeometries = await offset(
      geometry as esri.Polyline,
      _offsetSelect.value as I['sides'],
      Number(_offsetInput.value),
      'feet',
      offsetProjectionWkid,
    );

    offsetGeometries.forEach((polyline: esri.Polyline): void => {
      _sketch.addGeometry(polyline);
    });

    this._cancel();
  }

  private _reset(): void {
    const { _sketch } = this;

    _sketch.cancel();

    this._selectReset();

    this._createText = false;

    this._toolState = 'none';

    this._viewState = 'sketch';
  }

  private _select(): void {
    const {
      view,
      _selectedGraphics,
      _selectedGraphicsListItems,
      _selectState,
      _sketch: { point, polygon, polyline, text },
    } = this;

    this._selectState = !_selectState;

    if (!this._selectState) {
      this._reset();

      this.removeHandles(HANDLE_KEYS.SELECT_KEY);

      return;
    }

    view.closePopup();

    this.removeHandles(HANDLE_KEYS.SELECTED_KEY);

    const selectHandle = view.on('click', async (event: esri.ViewClickEvent): Promise<void> => {
      event.stopPropagation();

      const results = (await view.hitTest(event, { include: [point, polygon, polyline, text] }))
        .results as esri.GraphicHit[];

      const length = results.length;

      if (!length) {
        this._viewState = 'sketch';
        return;
      } else if (length === 1) {
        this._selectGraphic(results[0].graphic);
      } else {
        _selectedGraphicsListItems.removeAll();

        _selectedGraphics.removeAll();

        _selectedGraphicsListItems.addMany(
          results.map((graphicHit: esri.GraphicHit): tsx.JSX.Element => {
            const { graphic } = graphicHit;

            _selectedGraphics.add(graphic);

            this._highlight(graphic);

            const layer = graphic.layer as esri.GraphicsLayer;

            const title = layer.title as I['layers'];

            const symbol = graphic.symbol ? graphic.symbol.type : '';

            const label = title.charAt(0).toUpperCase() + title.slice(1);

            const icon =
              symbol === 'text'
                ? 'text-large'
                : title === 'point'
                  ? 'point'
                  : title === 'polyline'
                    ? 'line'
                    : 'polygon-vertices';

            return (
              <calcite-list-item
                key={KEY++}
                label={label}
                onclick={this._selectGraphic.bind(this, graphic)}
                onmouseenter={this._highlightGraphic.bind(this, graphic)}
              >
                <calcite-icon icon={icon} scale="s" slot="content-end"></calcite-icon>
              </calcite-list-item>
            );
          }),
        );

        this._viewState = 'selected';
      }
    });

    this.addHandles(selectHandle, HANDLE_KEYS.SELECT_KEY);
  }

  private _selectGraphic(graphic: esri.Graphic): void {
    // this.removeHandles(HANDLE_KEYS.SELECTED_KEY);

    this._selectReset();

    this._selectedGraphic = graphic;

    this._update(graphic);

    this._viewState = 'edit';
  }

  private _selectReset(): void {
    const { _selectedGraphic, _selectedGraphics } = this;

    this.removeHandles([HANDLE_KEYS.SELECT_KEY, HANDLE_KEYS.SELECTED_KEY]);

    // make sure text symbol always has text
    if (_selectedGraphic && _selectedGraphic.symbol?.type === 'text' && _selectedGraphic.symbol?.text === '') {
      _selectedGraphic.symbol.text = 'New Text';
    }

    this._selectState = false;

    this._selectedGraphic = null;

    _selectedGraphics.removeAll();
  }

  private _setSymbolProperty(property: string, value: string | number | esri.Color): void {
    const { _selectedGraphic } = this;

    if (!_selectedGraphic) return;

    const { symbol } = _selectedGraphic;

    if (!symbol) return;

    symbol.set({
      [property]: value,
    });

    _selectedGraphic.symbol = symbol.clone();
  }

  private _update(graphic: esri.Graphic): void {
    const {
      _sketch,
      _sketch: { layer },
    } = this;

    (graphic.layer as esri.GraphicsLayer).remove(graphic);

    layer.add(graphic);

    _sketch.update(graphic);
  }

  private _updateEvent(event: esri.SketchViewModelUpdateEvent): void {
    const {
      _sketch,
      _sketch: { layer, text },
    } = this;

    const { state, graphics } = event;

    if (state !== 'complete') return;

    const graphic = graphics[0];

    const geometryType = graphic.geometry?.type as 'point' | 'polyline' | 'polygon';

    const symbolType = graphic.symbol?.type;

    layer.removeAll();

    if (symbolType === 'text') {
      text.add(graphic);
    } else {
      _sketch[geometryType].add(graphic);
    }

    this._viewState = 'sketch';

    setTimeout(this._selectReset.bind(this), 500);
  }

  override render(): tsx.JSX.Element {
    const {
      _sketch: {
        snappingOptions: { featureEnabled, selfEnabled },
      },
      _viewState,
    } = this;

    return (
      <calcite-panel class={CSS.base} heading="Sketch">
        {/* options */}
        <calcite-action icon="gear" slot="header-actions-end" text="Options">
          {/* <calcite-tooltip close-on-click="" placement="bottom" slot="tooltip">
            Options
          </calcite-tooltip> */}
        </calcite-action>
        <calcite-popover
          auto-close=""
          closable
          heading="Options"
          overlay-positioning="fixed"
          placement="bottom-end"
          scale="s"
          afterCreate={referenceElement.bind(this)}
        >
          <div class={CSS.options}>
            <calcite-label layout="inline">
              <calcite-switch
                checked={featureEnabled}
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._sketch.snappingOptions.featureEnabled = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Snapping
            </calcite-label>
            <calcite-label layout="inline" style="--calcite-label-margin-bottom: 0;">
              <calcite-switch
                checked={selfEnabled}
                afterCreate={(_switch: HTMLCalciteSwitchElement): void => {
                  _switch.addEventListener('calciteSwitchChange', (): void => {
                    this._sketch.snappingOptions.selfEnabled = _switch.checked;
                  });
                }}
              ></calcite-switch>
              Guides
            </calcite-label>
          </div>
        </calcite-popover>

        {/* save/load */}
        <calcite-action
          icon="save"
          slot="header-actions-end"
          text="Save/Load"
          onclick={async (): Promise<void> => {
            const { _sketchSaveLoad } = this;

            if (!_sketchSaveLoad)
              this._sketchSaveLoad = new (await import('./Sketch/SketchSaveLoad')).default({ sketch: this._sketch });

            this._sketchSaveLoad.container.open = true;

            this._reset();
          }}
        ></calcite-action>

        {_viewState === 'buffer'
          ? this._renderBuffer()
          : _viewState === 'delete-all'
            ? this._renderDeleteAll()
            : _viewState === 'edit'
              ? this._renderEdit()
              : _viewState === 'new-text'
                ? this._renderNewText()
                : _viewState === 'offset'
                  ? this._renderOffset()
                  : _viewState === 'selected'
                    ? this._renderSelected()
                    : _viewState === 'sketch'
                      ? this._renderSketch()
                      : null}
      </calcite-panel>
    );
  }

  private _renderBuffer(): tsx.JSX.Element[] {
    return [
      <form onsubmit={this._buffer.bind(this)}>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Buffer distance
          <calcite-input-number
            integer
            max="26400"
            min="5"
            suffix-text="feet"
            value="250"
            afterCreate={(input: HTMLCalciteInputNumberElement): void => {
              this._bufferInput = input;

              input.setFocus();
            }}
          ></calcite-input-number>
        </calcite-label>
      </form>,
      <calcite-button appearance="outline" slot="footer" width="half" onclick={this._cancel.bind(this)}>
        Cancel
      </calcite-button>,
      <calcite-button slot="footer" width="half" onclick={this._buffer.bind(this)}>
        Buffer
      </calcite-button>,
    ];
  }

  private _renderDeleteAll(): tsx.JSX.Element[] {
    return [
      <calcite-notice icon="trash" kind="danger" open style="width: 100%;">
        <div slot="message">Delete all sketch graphics?</div>
      </calcite-notice>,
      <calcite-button
        appearance="outline"
        slot="footer"
        width="half"
        onclick={(): void => {
          this._viewState = 'sketch';
        }}
      >
        Cancel
      </calcite-button>,
      <calcite-button
        kind="danger"
        slot="footer"
        width="half"
        onclick={(): void => {
          const { _sketch } = this;

          _sketch.deleteAll();

          this._viewState = 'sketch';
        }}
      >
        Delete
      </calcite-button>,
    ];
  }

  private _renderEdit(): tsx.JSX.Element[] {
    const { _canRedo, _canUndo, _selectedGraphic, _sketch } = this;

    const type = _selectedGraphic && _selectedGraphic.geometry ? _selectedGraphic.geometry.type : null;

    const verticesDisabled = type === 'point';

    const offsetDisabled = type !== 'polyline';

    const bufferIcon = type ? `buffer-${type}` : 'buffer-point';

    const symbolType = _selectedGraphic ? _selectedGraphic.symbol?.type : null;

    const symbolEditor =
      symbolType === 'simple-marker'
        ? this._renderSimpleMarkerSymbolEditor(_selectedGraphic as esri.Graphic)
        : symbolType === 'simple-line'
          ? this._renderSimpleLineSymbolEditor(_selectedGraphic as esri.Graphic)
          : symbolType === 'simple-fill'
            ? this._renderSimpleFillSymbolEditor(_selectedGraphic as esri.Graphic)
            : symbolType === 'text'
              ? this._renderTextSymbolEditor(_selectedGraphic as esri.Graphic)
              : [];

    return [
      <calcite-action-bar expand-disabled="" layout="horizontal">
        <calcite-action
          disabled={!_canUndo}
          icon="undo"
          scale="s"
          onclick={_sketch.undo.bind(_sketch)}
        ></calcite-action>
        <calcite-action
          disabled={!_canRedo}
          icon="redo"
          scale="s"
          onclick={_sketch.redo.bind(_sketch)}
        ></calcite-action>
        <calcite-action
          icon="trash"
          scale="s"
          onclick={(): void => {
            const { _selectedGraphic, _sketch } = this;

            if (!_selectedGraphic) return;

            _sketch.complete();

            (_selectedGraphic.layer as esri.GraphicsLayer).remove(_selectedGraphic);

            this._viewState = 'sketch';

            this._selectReset();
          }}
        ></calcite-action>
        <calcite-action
          disabled={verticesDisabled}
          icon="vertex-plus"
          scale="s"
          onclick={this._addVertices.bind(this)}
        ></calcite-action>
        <calcite-action
          icon={bufferIcon}
          scale="s"
          onclick={(): void => {
            this._viewState = 'buffer';
          }}
        ></calcite-action>
        <calcite-action
          disabled={offsetDisabled}
          icon="offset"
          scale="s"
          onclick={(): void => {
            this._viewState = 'offset';
          }}
        ></calcite-action>
      </calcite-action-bar>,
      ...[symbolEditor],
      <calcite-button appearance="outline" slot="footer" width="full" onclick={this._reset.bind(this)}>
        Done
      </calcite-button>,
    ];
  }

  private _renderNewText(): tsx.JSX.Element[] {
    return [
      <form onsubmit={this._newText.bind(this)}>
        <calcite-label>
          New text
          <calcite-input
            value="New Text"
            afterCreate={(input: HTMLCalciteInputElement): void => {
              this._newTextInput = input;

              input.setFocus();

              setTimeout((): void => {
                input.selectText();
              }, 0);

              input.addEventListener('calciteInputInput', (): void => {
                const { _newTextGraphic } = this;

                if (!_newTextGraphic) return;

                const symbol = (_newTextGraphic.symbol as esri.TextSymbol).clone();

                symbol.text = input.value;

                _newTextGraphic.symbol = symbol;
              });
            }}
          ></calcite-input>
        </calcite-label>
      </form>,
      <calcite-button appearance="outline" slot="footer" width="full" onclick={this._newText.bind(this)}>
        Done
      </calcite-button>,
    ];
  }

  private _renderOffset(): tsx.JSX.Element[] {
    return [
      <form onsubmit={this._offset.bind(this)}>
        <calcite-label>
          Offset distance
          <calcite-input-number
            integer
            max="5280"
            min="5"
            suffix-text="feet"
            value="30"
            afterCreate={(input: HTMLCalciteInputNumberElement): void => {
              this._offsetInput = input;

              input.setFocus();
            }}
          ></calcite-input-number>
        </calcite-label>
        <calcite-label style="--calcite-label-margin-bottom: 0;">
          Sides
          <calcite-select
            afterCreate={(select: HTMLCalciteSelectElement): void => {
              this._offsetSelect = select;
            }}
          >
            <calcite-option selected value="both">
              Both
            </calcite-option>
            <calcite-option value="left">Left</calcite-option>
            <calcite-option value="right">Right</calcite-option>
          </calcite-select>
        </calcite-label>
      </form>,
      <calcite-button appearance="outline" slot="footer" width="half" onclick={this._cancel.bind(this)}>
        Cancel
      </calcite-button>,
      <calcite-button slot="footer" width="half" onclick={this._offset.bind(this)}>
        Offset
      </calcite-button>,
    ];
  }

  private _renderSelected(): tsx.JSX.Element {
    const { _selectedGraphicsListItems } = this;

    return (
      <div key={KEY++} onmouseleave={this._highlightSelectedGraphics.bind(this)}>
        <calcite-notice class={CSS.notice} open>
          <div slot="message">{`${_selectedGraphicsListItems.length} sketch graphics selected`}</div>
          <calcite-link slot="link">Clear selection</calcite-link>
        </calcite-notice>
        <calcite-list>{_selectedGraphicsListItems.toArray()}</calcite-list>
      </div>
    );
  }

  private _renderSimpleFillSymbolEditor(graphic: esri.Graphic): tsx.JSX.Element[] {
    const {
      color,
      color: { a },
      // @ts-expect-error properties exist
      outline: { color: outlineColor, style, width },
    } = graphic.symbol as esri.SimpleFillSymbol;

    return [
      <calcite-label>
        Color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              // this can be better
              this._setSymbolProperty('color.r', _color.r);
              this._setSymbolProperty('color.g', _color.g);
              this._setSymbolProperty('color.b', _color.b);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label>
        Opacity
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 1,
              min: 0,
              snap: true,
              step: 0.1,
              value: a,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('color.a', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
      <calcite-label>
        Line&nbsp;color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color: outlineColor as esri.Color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('outline.color', _color);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label>
        Line
        <calcite-select
          afterCreate={(select: HTMLCalciteSelectElement) => {
            select.addEventListener('calciteSelectChange', () => {
              this._setSymbolProperty('outline.style', select.selectedOption.value);
            });
          }}
        >
          <calcite-option selected={style === 'solid'} value="solid">
            Solid
          </calcite-option>
          <calcite-option selected={style === 'dash'} value="dash">
            Dash
          </calcite-option>
          <calcite-option selected={style === 'dot'} value="dot">
            Dot
          </calcite-option>
          <calcite-option selected={style === 'dash-dot'} value="dash-dot">
            Dash Dot
          </calcite-option>
        </calcite-select>
      </calcite-label>,
      <calcite-label style="--calcite-label-margin-bottom: 0;">
        Width
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 6,
              min: 1,
              snap: true,
              step: 1,
              value: width,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('outline.width', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
    ];
  }

  private _renderSimpleLineSymbolEditor(graphic: esri.Graphic): tsx.JSX.Element[] {
    const { color, style, width } = graphic.symbol as esri.SimpleLineSymbol;

    return [
      <calcite-label>
        Color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color: color as esri.Color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('color', _color);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label>
        Line
        <calcite-select
          afterCreate={(select: HTMLCalciteSelectElement) => {
            select.addEventListener('calciteSelectChange', () => {
              this._setSymbolProperty('style', select.selectedOption.value);
            });
          }}
        >
          <calcite-option selected={style === 'solid'} value="solid">
            Solid
          </calcite-option>
          <calcite-option selected={style === 'dash'} value="dash">
            Dash
          </calcite-option>
          <calcite-option selected={style === 'dot'} value="dot">
            Dot
          </calcite-option>
          <calcite-option selected={style === 'dash-dot'} value="dash-dot">
            Dash Dot
          </calcite-option>
        </calcite-select>
      </calcite-label>,
      <calcite-label style="--calcite-label-margin-bottom: 0;">
        Width
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 6,
              min: 1,
              snap: true,
              step: 1,
              value: width,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('width', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
    ];
  }

  private _renderSimpleMarkerSymbolEditor(graphic: esri.Graphic): tsx.JSX.Element[] {
    const {
      color,
      outline: { color: outlineColor, width },
      size,
      style,
    } = graphic.symbol as esri.SimpleMarkerSymbol;

    return [
      <calcite-label>
        Color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('color', _color);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label>
        Shape
        <calcite-select
          style="width: 100%;"
          afterCreate={(select: HTMLCalciteSelectElement) => {
            select.addEventListener('calciteSelectChange', () => {
              this._setSymbolProperty('style', select.selectedOption.value);
            });
          }}
        >
          <calcite-option selected={style === 'circle'} value="circle">
            Circle
          </calcite-option>
          <calcite-option selected={style === 'square'} value="square">
            Square
          </calcite-option>
          <calcite-option selected={style === 'diamond'} value="diamond">
            Diamond
          </calcite-option>
        </calcite-select>
      </calcite-label>,
      <calcite-label>
        Size
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 18,
              min: 6,
              snap: true,
              step: 1,
              value: size,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('size', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
      <calcite-label>
        Outline&nbsp;color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color: outlineColor as esri.Color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('outline.color', _color);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label style="--calcite-label-margin-bottom: 0;">
        Outline&nbsp;width
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 4,
              min: 0,
              snap: true,
              step: 1,
              value: width,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('outline.width', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
    ];
  }

  private _renderSketch(): tsx.JSX.Element {
    const { _canRedo, _canUndo, _graphicsCount, _popupVisible, _selectState, _selectedFeature, _sketch, _toolState } =
      this;

    const feature = _popupVisible && _selectedFeature ? _selectedFeature : null;

    const type = feature && feature.geometry ? feature.geometry.type : null;

    const addBufferDisabled = !feature;

    const verticesDisabled = !feature || type === 'point';

    const offsetDisabled = !feature || (feature && type !== 'polyline');

    const bufferIcon = type ? `buffer-${type}` : 'buffer-point';

    return (
      <div class={CSS.actionBars}>
        <calcite-action-bar expand-disabled="" layout="horizontal">
          <calcite-action
            active={_toolState === 'point'}
            icon="point"
            scale="s"
            onclick={this._create.bind(this, 'point')}
          ></calcite-action>
          <calcite-action
            active={_toolState === 'polyline'}
            icon="line"
            scale="s"
            onclick={this._create.bind(this, 'polyline')}
          ></calcite-action>
          <calcite-action
            active={_toolState === 'polygon'}
            icon="polygon-vertices"
            scale="s"
            onclick={this._create.bind(this, 'polygon')}
          ></calcite-action>

          <calcite-dropdown overlay-positioning="fixed">
            <calcite-action
              active={_toolState === 'freehandPolygon' || _toolState === 'freehandPolyline'}
              icon="freehand"
              scale="s"
              slot="trigger"
            ></calcite-action>
            <calcite-dropdown-group selection-mode="none">
              <calcite-dropdown-item icon-start="freehand" onclick={this._create.bind(this, 'freehandPolyline')}>
                Polyline
              </calcite-dropdown-item>
              <calcite-dropdown-item icon-start="freehand-area" onclick={this._create.bind(this, 'freehandPolygon')}>
                Polygon
              </calcite-dropdown-item>
            </calcite-dropdown-group>
          </calcite-dropdown>

          <calcite-dropdown overlay-positioning="fixed">
            <calcite-action
              active={_toolState === 'circle' || _toolState === 'rectangle'}
              icon="rectangle"
              scale="s"
              slot="trigger"
            ></calcite-action>
            <calcite-dropdown-group selection-mode="none">
              <calcite-dropdown-item icon-start="rectangle" onclick={this._create.bind(this, 'rectangle')}>
                Rectangle
              </calcite-dropdown-item>
              <calcite-dropdown-item icon-start="circle" onclick={this._create.bind(this, 'circle')}>
                Circle
              </calcite-dropdown-item>
            </calcite-dropdown-group>
          </calcite-dropdown>
          <calcite-action
            active={_toolState === 'text'}
            icon="text-large"
            scale="s"
            onclick={this._create.bind(this, 'text')}
          ></calcite-action>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" layout="horizontal">
          <calcite-action
            active={_selectState}
            disabled={_graphicsCount < 1}
            icon="cursor"
            scale="s"
            onclick={this._select.bind(this)}
          ></calcite-action>
          <calcite-action
            disabled={!_canUndo}
            icon="undo"
            scale="s"
            onclick={_sketch.undo.bind(_sketch)}
          ></calcite-action>
          <calcite-action
            disabled={!_canRedo}
            icon="redo"
            scale="s"
            onclick={_sketch.redo.bind(_sketch)}
          ></calcite-action>
          <calcite-action
            disabled={_graphicsCount < 1}
            icon="trash"
            scale="s"
            onclick={(): void => {
              this._reset();
              this._viewState = 'delete-all';
            }}
          ></calcite-action>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" layout="horizontal">
          <calcite-action
            disabled={addBufferDisabled}
            icon="add-layer"
            scale="s"
            onclick={this._addSelectedFeature.bind(this)}
          ></calcite-action>
          <calcite-action
            disabled={verticesDisabled}
            icon="vertex-plus"
            scale="s"
            onclick={this._addVertices.bind(this)}
          ></calcite-action>
          <calcite-action
            disabled={addBufferDisabled}
            icon={bufferIcon}
            scale="s"
            onclick={(): void => {
              this._viewState = 'buffer';
            }}
          ></calcite-action>
          <calcite-action
            disabled={offsetDisabled}
            icon="offset"
            scale="s"
            onclick={(): void => {
              this._viewState = 'offset';
            }}
          ></calcite-action>
        </calcite-action-bar>
      </div>
    );
  }

  private _renderTextSymbolEditor(graphic: esri.Graphic): tsx.JSX.Element[] {
    const {
      color,
      font: { size },
      haloColor,
      text,
    } = graphic.symbol as esri.TextSymbol;

    return [
      <calcite-label>
        Text
        <calcite-input
          value={text}
          afterCreate={(input: HTMLCalciteInputElement): void => {
            input.addEventListener('calciteInputInput', (): void => {
              this._setSymbolProperty('text', input.value);
            });
          }}
        ></calcite-input>
      </calcite-label>,
      <calcite-label>
        Color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color: color as esri.Color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('color', _color);
            });
          }}
        ></div>
      </calcite-label>,
      <calcite-label>
        Size
        <calcite-slider
          afterCreate={(slider: HTMLCalciteSliderElement) => {
            Object.assign(slider, {
              max: 18,
              min: 10,
              snap: true,
              step: 1,
              value: size,
            });

            slider.addEventListener('calciteSliderInput', () => {
              this._setSymbolProperty('font.size', slider.value as number);
            });
          }}
        ></calcite-slider>
      </calcite-label>,
      <calcite-label style="--calcite-label-margin-bottom: 0;">
        Halo&nbsp;color
        <div
          afterCreate={(container: HTMLDivElement): void => {
            const colorPicker = new ColorPicker({ color: haloColor as esri.Color, container });

            colorPicker.on('color-change', (_color: esri.Color): void => {
              this._setSymbolProperty('haloColor', _color);
            });
          }}
        ></div>
      </calcite-label>,
    ];
  }
}

@subclass('cov.components.Sketch.ColorPicker')
class ColorPicker extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      color: esri.Color;
    },
  ) {
    super(properties);

    for (const color in COLORS) {
      this.colors.push(new Color(COLORS[color]).toCss());
    }
  }

  @property()
  protected color!: esri.Color;

  protected colors: string[] = [];

  render(): tsx.JSX.Element {
    return <div class={CSS.colorPicker}>{this._renderSwatches()}</div>;
  }

  private _renderSwatches(): tsx.JSX.Element[] {
    const swatches = this.colors.map((color: string): tsx.JSX.Element => {
      const active = color === this.color.toCss();

      return (
        <calcite-color-picker-swatch
          active={active}
          color={color}
          scale="s"
          afterCreate={(swatch: HTMLCalciteColorPickerSwatchElement): void => {
            swatch.addEventListener('click', (): void => {
              this.color = new Color(color);

              this.emit('color-change', this.color);
            });
          }}
        ></calcite-color-picker-swatch>
      );
    });

    // maybe custom colors or maybe not
    // swatches.push(
    //   <div>
    //     <calcite-color-picker-swatch scale="s"></calcite-color-picker-swatch>
    //     <calcite-popover auto-close="" overlay-positioning="fixed" afterCreate={referenceElement.bind(this)}>
    //       <calcite-color-picker channels-disabled="" hex-disabled="" saved-disabled="" scale="s"></calcite-color-picker>
    //       <calcite-button appearance="outline" scale="s">Done</calcite-button>
    //     </calcite-popover>
    //   </div>,
    // );

    return swatches;
  }
}
