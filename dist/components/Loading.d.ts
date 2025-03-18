import esri = __esri;
/**
 * Loading properties.
 */
export interface LoadingProperties extends esri.WidgetProperties {
    /**
     * Application title.
     */
    title?: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Loading screen for applications.
 */
export default class Loading extends Widget {
    private _container;
    get container(): HTMLDivElement;
    set container(value: HTMLDivElement);
    constructor(properties?: esri.WidgetProperties & {
        title: string;
    });
    title: string;
    end(): void;
    render(): tsx.JSX.Element;
}
