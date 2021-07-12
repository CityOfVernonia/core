/**
 * Provides additional properties and logic to esri.SketchViewModel for adding and editing markup graphics.
 */

// namespaces and types
import esri = __esri;

// base imports
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import { whenOnce } from '@arcgis/core/core/watchUtils';

// class imports
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SnappingOptions from '@arcgis/core/views/interactive/snapping/SnappingOptions';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import SnappingOptionsModal from '../widgets/SnappingOptionsModal';

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
@subclass('cov.viewModels.MarkupViewModel')
export default class MarkupViewModel extends SketchViewModel {
  @property()
  layer = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  point = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Points',
  });

  @property()
  polyline = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Polylines',
  });

  @property()
  polygon = new GraphicsLayer({
    listMode: 'hide',
    title: 'Markup Polygons',
  });

  @property()
  layers = new GroupLayer({
    listMode: 'hide',
  });

  @property()
  snappingOptions = new SnappingOptions({
    enabled: true,
    featureEnabled: true,
  });

  @property()
  snappingOptionsModal = new SnappingOptionsModal();

  constructor(properties?: esri.SketchViewModelProperties) {
    super(properties);
    // initialize when serviceable view
    whenOnce(this, 'view', this._init.bind(this));
  }

  /**
   * Show snapping options modal.
   */
  showSnappingOptionsModal(): void {
    this.snappingOptionsModal.show();
  }

  /**
   * Begin marking up.
   * @param tool geometry type to create (no multi-point support)
   */
  markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'): void {
    const { view } = this;
    view.popup.close();
    this.create(tool);
  }

  /**
   * Add layers and wire events.
   */
  private _init(view: esri.MapView): void {
    const { map } = view;
    const { layer, point, polyline, polygon, layers, snappingOptions } = this;

    // layers
    layers.addMany([polygon, polyline, point, layer]);
    map.add(layers);

    // sketch vm events
    this.on('create', this._markupCreateEvent.bind(this));
    this.on('update', this._markupUpdateEvent.bind(this));

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

    // snapping
    view.when((): void => {
      map.allLayers.forEach((_layer: esri.Layer) => {
        const { type } = _layer;
        if (type === 'feature' || type === 'graphics' || type === 'geojson' || type === 'csv') {
          snappingOptions.featureSources.add(
            new FeatureSnappingLayerSource({
              //@ts-ignore
              layer: _layer,
            }),
          );
        }
      });

      this.snappingOptionsModal.snappingOptions = snappingOptions;
    });
  }

  /**
   * Is a graphic markup graphic or not.
   */
  private _isMarkup(graphic: Graphic): boolean {
    const { layer } = graphic;
    const { point, polyline, polygon } = this;
    return layer === point || layer === polyline || layer === polygon ? true : false;
  }

  /**
   * Add symbol and popup to graphic and add to appropriate layer when sketch complete.
   */
  private _markupCreateEvent(createEvent: esri.SketchViewModelCreateEvent): void {
    const { state, graphic } = createEvent;
    if (state === 'cancel' || !graphic) return;
    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';
    if (state !== 'complete') return;
    graphic.symbol = this[`${type}Symbol` as 'pointSymbol' | 'polylineSymbol' | 'polygonSymbol'] as esri.Symbol;

    graphic.popupTemplate = new PopupTemplate({
      title: `Markup ${type}`,
      // content: [
      //   new CustomContent({
      //     creator: (creatorEvent: any): esri.Widget => {
      //       return new SimpleMarkerEditor({
      //         graphic: creatorEvent.graphic,
      //       });
      //     },
      //   }),
      // ],
      content: 'Symbol editor goes here.',
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
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
    layer.add(graphic);
    this.update(graphic);
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
}
