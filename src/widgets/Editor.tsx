import esri = __esri;

export interface EditorProperties extends esri.WidgetProperties {
  /**
   * Map view.
   */
  view: esri.MapView;
  /**
   * Create `calcite-shell-panel` as widget's root VNode.
   * NOTE: the proper element (calcite-shell-panel or calcite-panel) must be provided as `container`.
   * @default false
   */
  shellPanel?: boolean;
  /**
   * Panel heading in default state.
   * @default Editor
   */
  defaultHeading?: string;
  /**
   * Editable layer infos.
   */
  layerInfos: LayerInfoProperties[] | LayerInfo[] | esri.Collection<LayerInfo>;
  /**
   * Additional layers to add as snapping layer.
   * Do no include `layerInfo` layers as those layers are snapping sources by default.
   */
  snappingFeatureSources?: esri.FeatureSnappingLayerSource[] | esri.Collection<esri.FeatureSnappingLayerSource>;
  /**
   * Symbol when flashing points.
   */
  pointFlashSymbol?: esri.SimpleMarkerSymbol;
  /**
   * Symbol when flashing polylines.
   */
  polylineFlashSymbol?: esri.SimpleLineSymbol;
  /**
   * Symbol when flashing polygons.
   */
  polygonFlashSymbol?: esri.SimpleFillSymbol;
}

import type { LayerInfoProperties } from './Editor/LayerInfo';
import type GeometryEditor from './Editor/GeometryEditor';

import { whenDefinedOnce, whenFalseOnce } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import Graphic from '@arcgis/core/Graphic';
import { getDisplayedSymbol } from '@arcgis/core/symbols/support/symbolUtils';
import { SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol } from '@arcgis/core/symbols';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';

import Settings from './Editor/Settings';

import LayerInfo from './Editor/LayerInfo';
import CreateFeatureSelector from './Editor/CreateFeatureSelector';
import FeatureEditor from './Editor/FeatureEditor';

import DeleteModal from './Editor/DeleteModal';

const CSS = {
  base: 'cov-editor',
  content: 'cov-editor--content',
  contentDefault: 'cov-editor--content--default',
  contentButton: 'cov-editor--content--button',
};

let KEY = 0;

@subclass('Editor')
export default class Editor extends Widget {
  //-----------------------------
  //  Lifecycle
  //-----------------------------
  constructor(properties: EditorProperties) {
    super(properties);
  }

  async postInitialize(): Promise<void> {
    const { view, layerInfos, snappingFeatureSources, _sketch } = this;

    // initialize each layer info
    layerInfos.forEach(this._initializeLayerInfo.bind(this));

    // handle adding/removing layer info
    this.own([
      layerInfos.on('after-add', async (response: { item: LayerInfo }): Promise<void> => {
        await this._initializeLayerInfo(response.item);
        this._reset();
      }),
      layerInfos.on('after-remove', this._reset.bind(this)),
    ]);

    // initialize click event
    this.createClickEventHandle();

    // init sketch
    _sketch.view = view;
    view.map.add(_sketch.layer);
    _sketch.snappingOptions.enabled = true;
    _sketch.snappingOptions.featureSources.addMany(snappingFeatureSources);
    this.own([
      _sketch.on('create', this.createEventHandler.bind(this)),
      _sketch.on('update', this.updateEventHandler.bind(this)),
    ]);

    // init settings
    this._settings = new Settings({
      snappingOptions: _sketch.snappingOptions,
      container: document.createElement('div'),
    });
  }

  //-----------------------------
  //  Constructor properties
  //-----------------------------
  view!: esri.MapView;

  shellPanel = false;

  defaultHeading = 'Editor';

  @property({
    type: Collection,
  })
  layerInfos!: Collection<LayerInfo>;

  @property({
    type: Collection,
  })
  snappingFeatureSources!: Collection<esri.FeatureSnappingLayerSource>;

  pointFlashSymbol = new SimpleMarkerSymbol({
    color: 'green',
    style: 'circle',
    size: 12,
  });

  polylineFlashSymbol = new SimpleLineSymbol({
    color: 'green',
    width: 3,
  });

  polygonFlashSymbol = new SimpleFillSymbol({
    color: [0, 255, 0, 0.25],
    outline: {
      color: 'green',
      width: 3,
    },
  });

  //-----------------------------
  //  Properties
  //-----------------------------
  @property()
  protected state:
    | 'default'
    | 'settings'
    | 'feature'
    | 'features'
    | 'create'
    | 'creating'
    | 'update'
    | 'updating'
    | 'deleting' = 'default';

  @property()
  protected feature: Graphic | null = null;

  protected activeLayer: esri.FeatureLayer | null = null;

  protected activeTemplate: esri.FeatureTemplate | null = null;

  //-----------------------------
  //  Private properties
  //-----------------------------
  private _clickEventHandle!: esri.Handle;

  private _sketch = new SketchViewModel({
    layer: new GraphicsLayer({
      listMode: 'hide',
    }),
  });

  private _settings!: Settings;

  private _deleteModal = new DeleteModal();

  /**
   * Setup layer for editing.
   * @param layerInfo
   */
  private async _initializeLayerInfo(layerInfo: LayerInfo): Promise<void> {
    const {
      view,
      layerInfos,
      _sketch: {
        snappingOptions: { featureSources },
      },
    } = this;

    // replace LayerInfoProperties with LayerInfo instance
    if (!layerInfo.declaredClass) {
      const index = layerInfos.indexOf(layerInfo);
      layerInfo = new LayerInfo(layerInfo);
      layerInfos.splice(index, 1, layerInfo);
    }

    const { layer } = layerInfo;

    await layer.when();

    // layer view
    view.whenLayerView(layer).then((layerView: esri.FeatureLayerView): void => {
      layerInfo.view = layerView;
    });

    const createFeatureSelector = (layerInfo.createFeatureSelector = new CreateFeatureSelector({
      layer,
      container: document.createElement('calcite-block'),
    }));

    this.own(
      createFeatureSelector.on('create', (createEvent: any): void => {
        this.createFeature(createEvent.layer, createEvent.template);
      }),
    );

    const featureEditor = (layerInfo.featureEditor = new FeatureEditor({
      layer,
      container: document.createElement('div'),
    }));

    whenDefinedOnce(featureEditor, 'geometryEditor', (geometryEditor: GeometryEditor): void => {
      this.own(geometryEditor.on('action', this._geometryEditorEvents.bind(this)));
    });

    // snapping
    featureSources.add(
      new FeatureSnappingLayerSource({
        // @ts-ignore
        layer,
      }),
    );

    this.scheduleRender();
  }

  /**
   * Reset widget to starting state when `LayerInfo` removed.
   */
  private _reset(): void {
    const { _sketch } = this;
    _sketch.cancel();
    this.state = 'default';
    this.feature = null;
    this.activeLayer = null;
    this.activeTemplate = null;
    this.removeClickEventHandle();
    this.createClickEventHandle();
    this.scheduleRender();
  }

  createClickEventHandle(): void {
    const { view, layerInfos } = this;

    this._clickEventHandle = view.on('click', (point: esri.ScreenPoint): void => {
      view
        .hitTest(point, {
          include: layerInfos
            .map((layerInfo: LayerInfo): esri.FeatureLayer => {
              return layerInfo.layer;
            })
            .toArray(),
        })
        .then(this.hitTestHandler.bind(this));
    });
  }

  removeClickEventHandle(): void {
    const { _clickEventHandle } = this;
    _clickEventHandle.remove();
  }

  hitTestHandler(hitTestResult: esri.HitTestResult): void {
    const { layerInfos } = this;
    const { results } = hitTestResult;

    this.feature = null;

    layerInfos.forEach((layerInfo: LayerInfo): void => {
      const { highlight } = layerInfo;

      layerInfo.features = null;

      if (highlight) highlight.remove();
    });

    if (!results.length) {
      this.state = 'default';
      return;
    }

    layerInfos.forEach((layerInfo: LayerInfo): void => {
      const { layer, view } = layerInfo;

      layerInfo.features =
        results
          .filter((value: esri.HitTestResultResults): boolean => {
            return value.graphic.layer === layer;
          })
          .map((value: esri.HitTestResultResults): esri.Graphic => {
            return value.graphic;
          }) || null;

      layerInfo.highlight = view.highlight(layerInfo.features);
    });

    if (results.length === 1) {
      this.feature = results[0].graphic;
      this.state = 'feature';
    } else if (results.length > 1) {
      this.state = 'features';
      this.scheduleRender();
    }
  }

  /**
   * Handle geometry editor events.
   * @param action
   */
  private _geometryEditorEvents(action: string): void {
    const { feature, _deleteModal } = this;

    if (!feature) return;

    const type = feature.geometry.type;

    switch (action) {
      case 'move':
        this.updateFeature(
          type === 'point'
            ? undefined
            : {
                tool: 'move',
                toggleToolOnClick: false,
              },
        );
        break;
      case 'reshape':
        this.updateFeature({
          tool: 'reshape',
          enableRotation: false,
          enableScaling: false,
          toggleToolOnClick: false,
        });
        break;
      case 'rotate':
        this.updateFeature({
          tool: 'transform',
          enableScaling: false,
          toggleToolOnClick: false,
        });
        break;
      case 'scale':
        this.updateFeature({
          tool: 'transform',
          enableRotation: false,
          toggleToolOnClick: false,
        });
        break;
      case 'delete':
        _deleteModal.show(this.deleteFeature.bind(this));
        break;
      case 'go-to':
        this.goTo(feature);
        break;
      default:
        break;
    }
  }

  setFeature(feature: esri.Graphic): void {
    const { layerInfos } = this;
    this.feature = feature;
    this.state = 'feature';
    layerInfos.forEach((layerInfo: LayerInfo): void => {
      const { layer, view, highlight } = layerInfo;
      if (highlight) highlight.remove();
      if (feature.layer === layer) layerInfo.highlight = view.highlight(feature);
      layerInfo.features = null;
    });
  }

  createEventHandler(createEvent: esri.SketchViewModelCreateEvent): void {
    const { layerInfos, _sketch, activeLayer, activeTemplate } = this;
    const { graphic, state } = createEvent;

    const layerInfo = layerInfos.find((layerInfo: LayerInfo): boolean => {
      return layerInfo.layer === activeLayer;
    });

    const { layer, view, highlight } = layerInfo;

    if (state === 'cancel') this.state = 'default';

    // `complete()` called without geometry (point) or polyline/polygon with only one vertex
    if (
      (state === 'complete' && !graphic) ||
      (state === 'complete' &&
        graphic &&
        graphic.geometry.type === 'polyline' &&
        (graphic.geometry as esri.Polyline).paths[0].length === 1) ||
      (state === 'complete' &&
        graphic &&
        graphic.geometry.type === 'polygon' &&
        (graphic.geometry as esri.Polygon).rings[0].length === 1)
    ) {
      this.state = 'default';
      return;
    }

    if (state === 'complete') {
      this.state = 'creating';

      _sketch.layer.removeAll();

      layer
        .applyEdits({
          addFeatures: [
            new Graphic({
              geometry: graphic.geometry,
              ...activeTemplate?.prototype,
            }),
          ],
        })
        .then(async (results: any): Promise<void> => {
          const result = results.addFeatureResults[0] as esri.FeatureEditResult;

          if (result.error) {
            // TODO: error handling
            this.state = 'default';
          } else {
            await whenFalseOnce(view, 'updating');

            if (highlight) highlight.remove();
            view
              .queryFeatures({
                where: `${layer.objectIdField} = ${result.objectId}`,
                returnGeometry: true,
              })
              .then((featureSet: esri.FeatureSet) => {
                this.feature = featureSet.features[0] as esri.Graphic;
                layerInfo.highlight = view.highlight(this.feature);
                this.state = 'feature';
              });
            this.activeLayer = null;
          }
        })
        .catch((error: esri.Error) => {
          console.log(error);
          this.state = 'default';
          this.activeLayer = null;
        });
    }
  }

  updateEventHandler(updateEvent: esri.SketchViewModelUpdateEvent): void {
    const { feature, layerInfos, _sketch, activeLayer } = this;
    const { graphics, state, aborted } = updateEvent;
    const updateGraphic = graphics[0];

    if (state !== 'active' && state !== 'start') this.createClickEventHandle();

    if (!feature || state !== 'complete') return;

    const layerInfo = layerInfos.find((layerInfo: LayerInfo): boolean => {
      return layerInfo.layer === activeLayer;
    });

    const { layer, view, highlight } = layerInfo;

    const reset = () => {
      layer.refresh();
      view.filter = new FeatureFilter();
      this.state = 'feature';
    };

    this.state = 'updating';

    _sketch.layer.remove(updateGraphic);

    if (aborted) {
      reset();
      return;
    }

    feature.geometry = updateGraphic.geometry;

    layer
      .applyEdits({
        updateFeatures: [feature],
      })
      .then(async (): Promise<void> => {
        reset();

        await whenFalseOnce(view, 'updating');

        if (highlight) highlight.remove();

        view
          .queryFeatures({
            where: `${layer.objectIdField} = ${feature.attributes[layer.objectIdField]}`,
            outFields: ['*'],
            returnGeometry: true,
          })
          .then(async (featureSet: esri.FeatureSet) => {
            this.state = 'feature';
            this.feature = featureSet.features[0] as esri.Graphic;
            layerInfo.highlight = view.highlight(this.feature);
            layer.refresh();
          });
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        reset();
      });
  }

  createFeature(layer: esri.FeatureLayer, template: esri.FeatureTemplate): void {
    const { _sketch } = this;

    this.activeLayer = layer;

    this.activeTemplate = template;

    this.state = 'create';

    let tool = this.activeTemplate.drawingTool as any;

    if (tool === 'line') tool = 'polyline';

    _sketch.create(tool);
  }

  updateFeature(updateOptions?: esri.SketchViewModelUpdateUpdateOptions): void {
    const { feature, layerInfos, _sketch } = this;

    if (!feature) return;

    this.removeClickEventHandle();

    this.state = 'update';

    const {
      view,
      layer,
      layer: { objectIdField },
    } = layerInfos.find((layerInfo: LayerInfo): boolean => {
      return layerInfo.layer === feature.layer;
    });

    this.activeLayer = layer;

    view.filter = new FeatureFilter({
      where: `${objectIdField} <> ${feature.attributes[objectIdField]}`,
    });

    getDisplayedSymbol(feature).then((symbol: esri.Symbol): void => {
      const updateGraphic = feature.clone();

      updateGraphic.symbol = symbol;
      _sketch.layer.add(updateGraphic);
      _sketch.update(updateGraphic, updateOptions || {});
    });
  }

  deleteFeature(): void {
    const { feature, layerInfos } = this;

    if (!feature) return;

    const { layer } = layerInfos.find((layerInfo: LayerInfo): boolean => {
      return layerInfo.layer === feature.layer;
    });

    this.state = 'deleting';

    layer
      .applyEdits({
        deleteFeatures: [feature],
      })
      .then((): void => {
        this.feature = null;
        this.state = 'default';
      })
      .catch((error: esri.Error): void => {
        console.log(error);
        this.state = 'feature';
      });
  }

  goTo(target: esri.Graphic | esri.Graphic[]): void {
    const { view } = this;

    view.goTo(target);
  }

  flashFeature(feature: esri.Graphic): void {
    const {
      view: { graphics },
    } = this;

    const graphic = new Graphic({
      geometry: feature.geometry,
      symbol:
        this[`${(feature.layer as esri.FeatureLayer).geometryType as 'point' | 'polyline' | 'polygon'}FlashSymbol`],
    });

    graphics.add(graphic);

    setTimeout((): void => {
      graphics.remove(graphic);
    }, 1000);
  }

  render(): tsx.JSX.Element {
    const { shellPanel, defaultHeading, feature, state } = this;

    const heading =
      state === 'default'
        ? defaultHeading
        : state === 'settings'
        ? 'Settings'
        : state === 'create' || state === 'creating'
        ? 'New Feature'
        : state === 'update' || state === 'updating'
        ? 'Update Feature'
        : state === 'deleting'
        ? 'Delete Feature'
        : state === 'features'
        ? 'Features'
        : state === 'feature' && feature
        ? `${feature.layer.title} Feature`
        : '';

    const panel = (
      <calcite-panel
        heading={heading}
        width-scale={shellPanel !== true ? 'm' : ''}
        height-scale={shellPanel !== true ? 'l' : ''}
      >
        {state === 'default'
          ? this.renderDefault()
          : state === 'settings'
          ? this.renderSettings()
          : state === 'create'
          ? this.renderCreateUpdate()
          : state === 'creating'
          ? this.renderProgress('Creating feature.')
          : state === 'update'
          ? this.renderCreateUpdate()
          : state === 'updating'
          ? this.renderProgress('Updating feature.')
          : state === 'deleting'
          ? this.renderProgress('Deleting feature.')
          : state === 'features'
          ? this.renderFeatures()
          : state === 'feature' && feature
          ? this.renderFeature()
          : null}
      </calcite-panel>
    );

    return shellPanel === true ? (
      <calcite-shell-panel class={CSS.base} width-scale="m">
        {panel}
      </calcite-shell-panel>
    ) : (
      panel
    );
  }

  renderDefault(): tsx.JSX.Element {
    const { layerInfos } = this;
    return (
      <div key={KEY++}>
        <div class={CSS.contentDefault}>
          <div>Select a feature in the map, or create a new feature by selecting a feature type below.</div>
          <calcite-button
            title="Settings"
            appearance="transparent"
            icon-start="gear"
            onclick={() => {
              this.state = 'settings';
            }}
          ></calcite-button>
        </div>
        <div
          afterCreate={(div: HTMLDivElement): void => {
            layerInfos.forEach((layerInfo: LayerInfo) => {
              const { createFeatureSelector } = layerInfo;
              const parent =
                createFeatureSelector && createFeatureSelector.container
                  ? (createFeatureSelector.container as HTMLElement).parentElement
                  : null;
              if (parent) parent.removeChild(createFeatureSelector.container as HTMLElement);
              if (createFeatureSelector) div.append(createFeatureSelector.container);
            });
          }}
        ></div>
      </div>
    );
  }

  renderSettings(): tsx.JSX.Element {
    const { _settings } = this;
    return (
      <div key={KEY++}>
        <div class={CSS.contentButton}>
          <calcite-button
            appearance="transparent"
            icon-start="chevron-left"
            onclick={() => {
              this.state = 'default';
            }}
          >
            Back
          </calcite-button>
        </div>

        <div
          afterCreate={(div: HTMLDivElement) => {
            div.append(_settings.container);
          }}
        ></div>
      </div>
    );
  }

  renderCreateUpdate(): tsx.JSX.Element {
    const { _settings } = this;

    return (
      <div key={KEY++}>
        <div class={CSS.contentButton}>
          <calcite-button
            width="half"
            appearance="outline"
            onclick={() => {
              this._sketch.cancel();
            }}
          >
            Cancel
          </calcite-button>
          <calcite-button
            width="half"
            appearance="solid"
            onclick={() => {
              this._sketch.complete();
            }}
          >
            Done
          </calcite-button>
        </div>
        {_settings.createSnappingOptionsBlock()}
      </div>
    );
  }

  renderFeatures(): tsx.JSX.Element {
    const { layerInfos } = this;

    const items: tsx.JSX.Element[] = [];

    layerInfos.forEach((layerInfo: LayerInfo): void => {
      const {
        layer: { title, objectIdField },
        features,
      } = layerInfo;

      if (!features) return;

      features.forEach((feature: esri.Graphic): void => {
        items.push(
          <calcite-list-item non-interactive="" label={`${title} (${feature.attributes[objectIdField]})`}>
            <calcite-action
              slot="actions-end"
              icon="cursor-plus"
              title="Select feature"
              afterCreate={(calciteAction: HTMLCalciteActionElement): void => {
                calciteAction.addEventListener('click', this.setFeature.bind(this, feature));
              }}
            ></calcite-action>
            <calcite-action
              slot="actions-end"
              icon="flash"
              title="Flash feature"
              afterCreate={(calciteAction: HTMLCalciteActionElement): void => {
                calciteAction.addEventListener('click', this.flashFeature.bind(this, feature));
              }}
            ></calcite-action>
          </calcite-list-item>,
        );
      });
    });

    return (
      <div key={KEY++} class={CSS.content}>
        <p>Select a feature.</p>
        {items}
      </div>
    );
  }

  renderFeature(): tsx.JSX.Element | null {
    const { feature, layerInfos } = this;

    if (!feature) return null;

    const layer = feature.layer as esri.FeatureLayer;

    return (
      <div
        key={KEY++}
        afterCreate={(div: HTMLDivElement): void => {
          const featureEditor = layerInfos.find((layerInfo: LayerInfo): boolean => {
            return layerInfo.layer === layer;
          }).featureEditor;

          featureEditor.feature = feature;

          const parent = (featureEditor.container as HTMLElement).parentElement;
          if (parent) parent.removeChild(featureEditor.container as HTMLElement);

          div.append(featureEditor.container);
        }}
      ></div>
    );
  }

  renderProgress(message: string): tsx.JSX.Element {
    return (
      <div key={KEY++} class={CSS.content}>
        <p>{message}</p>
        <calcite-progress type="indeterminate"></calcite-progress>
      </div>
    );
  }
}
