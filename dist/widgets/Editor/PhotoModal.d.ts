/// <reference types="@esri/calcite-components" />
import esri = __esri;
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class PhotoModal extends Widget {
    constructor(properties?: esri.WidgetProperties);
    container: HTMLCalciteModalElement;
    private _modal;
    private _title;
    private _url;
    show(title: string, url: string): void;
    render(): tsx.JSX.Element;
}
