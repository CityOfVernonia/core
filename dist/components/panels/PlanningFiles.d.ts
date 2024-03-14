import esri = __esri;
export interface PlanningFilesProperties extends esri.WidgetProperties {
    planningFilesLayer: esri.FeatureLayer;
    view: esri.MapView;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
declare class PlanningFiles extends Widget {
    constructor(properties: PlanningFilesProperties);
    postInitialize(): Promise<void>;
    planningFilesLayer: esri.FeatureLayer;
    view: esri.MapView;
    private _definitionExpression;
    private _filtered;
    private _filterCount;
    private _filterType;
    private _planningTypeOptions;
    private _getFilterCount;
    private _zoomToFiltered;
    render(): tsx.JSX.Element;
    private _filterSelectAfterCreate;
    private _layerSwitchAfterCreate;
}
export default PlanningFiles;
