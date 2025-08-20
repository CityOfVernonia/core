import esri = __esri;
interface I {
    state: 'Functional classification' | 'ODOT reported' | 'Surface condition' | 'Surface material';
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class StreetsInfoDialog extends Widget {
    private _container;
    get container(): HTMLCalciteDialogElement;
    set container(value: HTMLCalciteDialogElement);
    constructor(properties?: esri.WidgetProperties);
    show(type: I['state']): void;
    private _viewState;
    render(): tsx.JSX.Element;
}
export {};
