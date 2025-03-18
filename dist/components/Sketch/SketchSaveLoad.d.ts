import esri = __esri;
export interface SketchSaveLoadProperties extends esri.WidgetProperties {
    sketch: Sketch;
}
import type Sketch from './Sketch';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class SketchSaveLoad extends Widget {
    private _container;
    get container(): HTMLCalciteDialogElement;
    set container(value: HTMLCalciteDialogElement);
    constructor(properties: SketchSaveLoadProperties);
    readonly sketch: Sketch;
    private _graphicsCount;
    private _reader?;
    private _viewState;
    private _close;
    private _load;
    private _readerLoad;
    private _readerError;
    private _save;
    render(): tsx.JSX.Element;
}
