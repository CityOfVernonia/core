import esri = __esri;
export interface GeometryInfoProperties extends esri.WidgetProperties {
    layer: esri.FeatureLayer;
}
interface Info {
    length: number;
    area: number;
    type: string;
}
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
export default class GeometryInfo extends Widget {
    constructor(properties: GeometryInfoProperties);
    postInitialize(): void;
    layer: esri.FeatureLayer;
    isGeo: boolean;
    feature: esri.Graphic | null;
    info: Info;
    /**
     * Current location unit.
     */
    locationUnit: string;
    /**
     * Available location unit and display text key/value pairs.
     */
    locationUnits: {
        dec: string;
        dms: string;
    };
    /**
     * Current length unit.
     */
    lengthUnit: esri.LinearUnits;
    /**
     * Available length unit and display text key/value pairs.
     */
    lengthUnits: {
        meters: string;
        feet: string;
        kilometers: string;
        miles: string;
        'nautical-miles': string;
        yards: string;
    };
    /**
     * Current area unit.
     */
    areaUnit: esri.AreaUnits;
    /**
     * Available area unit and display text key/value pairs.
     */
    areaUnits: {
        acres: string;
        ares: string;
        hectares: string;
        'square-feet': string;
        'square-meters': string;
        'square-yards': string;
        'square-kilometers': string;
        'square-miles': string;
    };
    private _feature;
    private _formatValue;
    render(): tsx.JSX.Element;
    private _unitSelect;
}
export {};
