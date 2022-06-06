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
import Collection from '@arcgis/core/core/Collection';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Graphic from '@arcgis/core/Graphic';
import LayerInfo from './Editor/LayerInfo';
export default class Editor extends Widget {
    constructor(properties: EditorProperties);
    postInitialize(): Promise<void>;
    view: esri.MapView;
    shellPanel: boolean;
    defaultHeading: string;
    layerInfos: Collection<LayerInfo>;
    snappingFeatureSources: Collection<esri.FeatureSnappingLayerSource>;
    pointFlashSymbol: esri.SimpleMarkerSymbol;
    polylineFlashSymbol: esri.SimpleLineSymbol;
    polygonFlashSymbol: esri.SimpleFillSymbol;
    protected state: 'default' | 'settings' | 'feature' | 'features' | 'create' | 'creating' | 'update' | 'updating' | 'deleting';
    protected feature: Graphic | null;
    protected activeLayer: esri.FeatureLayer | null;
    protected activeTemplate: esri.FeatureTemplate | null;
    private _clickEventHandle;
    private _sketch;
    private _settings;
    private _deleteModal;
    /**
     * Setup layer for editing.
     * @param layerInfo
     */
    private _initializeLayerInfo;
    /**
     * Reset widget to starting state when `LayerInfo` removed.
     */
    private _reset;
    createClickEventHandle(): void;
    removeClickEventHandle(): void;
    hitTestHandler(hitTestResult: esri.HitTestResult): void;
    /**
     * Handle geometry editor events.
     * @param action
     */
    private _geometryEditorEvents;
    setFeature(feature: esri.Graphic): void;
    createEventHandler(createEvent: esri.SketchViewModelCreateEvent): void;
    updateEventHandler(updateEvent: esri.SketchViewModelUpdateEvent): void;
    createFeature(layer: esri.FeatureLayer, template: esri.FeatureTemplate): void;
    updateFeature(updateOptions?: esri.SketchViewModelUpdateUpdateOptions): void;
    deleteFeature(): void;
    goTo(target: esri.Graphic | esri.Graphic[]): void;
    flashFeature(feature: esri.Graphic): void;
    render(): tsx.JSX.Element;
    renderDefault(): tsx.JSX.Element;
    renderSettings(): tsx.JSX.Element;
    renderCreateUpdate(): tsx.JSX.Element;
    renderFeatures(): tsx.JSX.Element;
    renderFeature(): tsx.JSX.Element | null;
    renderProgress(message: string): tsx.JSX.Element;
}
