import { __decorate } from "tslib";
import { watch } from '@arcgis/core/core/watchUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import { planarLength, planarArea, geodesicLength, geodesicArea } from '@arcgis/core/geometry/geometryEngine';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
const CSS = {
    base: 'cov-editor__geometry-info',
    result: 'cov-editor__geometry-info--result',
    units: 'cov-editor__geometry-info--units',
};
let KEY = 0;
let GeometryInfo = class GeometryInfo extends Widget {
    constructor(properties) {
        super(properties);
        this.feature = null;
        this.info = {
            length: 0,
            area: 0,
            type: '',
        };
        /**
         * Current location unit.
         */
        this.locationUnit = 'dec';
        /**
         * Available location unit and display text key/value pairs.
         */
        this.locationUnits = {
            dec: 'Decimal Degrees',
            dms: 'Degrees Minutes Seconds',
        };
        /**
         * Current length unit.
         */
        this.lengthUnit = 'feet';
        /**
         * Available length unit and display text key/value pairs.
         */
        this.lengthUnits = {
            meters: 'Meters',
            feet: 'Feet',
            kilometers: 'Kilometers',
            miles: 'Miles',
            'nautical-miles': 'Nautical Miles',
            yards: 'Yards',
        };
        /**
         * Current area unit.
         */
        this.areaUnit = 'acres';
        /**
         * Available area unit and display text key/value pairs.
         */
        this.areaUnits = {
            acres: 'Acres',
            ares: 'Ares',
            hectares: 'Hectacres',
            'square-feet': 'Square Feet',
            'square-meters': 'Square Meters',
            'square-yards': 'Square Yards',
            'square-kilometers': 'Square Kilometers',
            'square-miles': 'Square Miles',
        };
        coordinateFormatter.load();
    }
    postInitialize() {
        this.own(watch(this, 'feature', this._feature.bind(this)));
    }
    _feature(feature) {
        if (!feature)
            return;
        const { isGeo, lengthUnit, areaUnit } = this;
        const { geometry, geometry: { type }, } = feature;
        const info = Object.assign(Object.assign({}, this.info), {
            type,
        });
        if (type === 'polyline') {
            info.length = isGeo ? geodesicLength(geometry, lengthUnit) : planarLength(geometry, lengthUnit);
        }
        if (type === 'polygon') {
            info.length = isGeo ? geodesicLength(geometry, lengthUnit) : planarLength(geometry, lengthUnit);
            info.area = isGeo
                ? geodesicArea(geometry, areaUnit)
                : planarArea(geometry, areaUnit);
        }
        this.info = Object.assign(Object.assign({}, this.info), info);
    }
    _formatValue(value) {
        return Number(value.toFixed(2)).toLocaleString();
    }
    render() {
        const { feature, info, locationUnit, lengthUnits, lengthUnit, areaUnits, areaUnit } = this;
        if (!feature) {
            return tsx("div", { class: CSS.base }, "No feature.");
        }
        const type = feature.geometry.type;
        let pointInfo = null;
        if (type === 'point' && locationUnit === 'dec') {
            const { latitude, longitude } = feature.geometry;
            pointInfo = (tsx("div", null,
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Latitude: "),
                    tsx("span", null, `${Number(latitude.toFixed(6))}`)),
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Longitude: "),
                    tsx("span", null, `${Number(longitude.toFixed(6))}`))));
        }
        else if (type === 'point' && locationUnit === 'dms') {
            const dms = coordinateFormatter.toLatitudeLongitude(webMercatorToGeographic(feature.geometry, false), 'dms', 2);
            const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
            pointInfo = (tsx("div", null,
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Latitude: "),
                    tsx("span", null, dms.substring(index + 2, dms.length))),
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Longitude: "),
                    tsx("span", null, dms.substring(0, index + 1)))));
        }
        return (tsx("div", { class: CSS.base },
            tsx("div", { hidden: type !== 'point' },
                pointInfo,
                tsx("div", { class: CSS.units },
                    this._unitSelect('location'),
                    tsx("div", null))),
            tsx("div", { hidden: type !== 'polyline' },
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Length: "),
                    tsx("span", null, `${this._formatValue(info.length)} ${lengthUnits[lengthUnit].toLowerCase()}`)),
                tsx("div", { class: CSS.units },
                    this._unitSelect('length'),
                    tsx("div", null))),
            tsx("div", { hidden: type !== 'polygon' },
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Area: "),
                    tsx("span", null, `${this._formatValue(info.area)} ${areaUnits[areaUnit].toLowerCase()}`)),
                tsx("div", { class: CSS.result },
                    tsx("span", null, "Perimeter: "),
                    tsx("span", null, `${this._formatValue(info.length)} ${lengthUnits[lengthUnit].toLowerCase()}`)),
                tsx("div", { class: CSS.units },
                    this._unitSelect('area'),
                    this._unitSelect('length')))));
    }
    _unitSelect(type) {
        const selected = this[`${type}Unit`];
        const units = this[`${type}Units`];
        const options = [];
        for (const unit in units) {
            options.push(tsx("calcite-option", { key: KEY++, value: unit, selected: unit === selected }, units[unit]));
        }
        return (tsx("calcite-label", null,
            `${type.charAt(0).toUpperCase() + type.slice(1)} unit`,
            tsx("calcite-select", { value: selected, afterCreate: (calciteSelect) => {
                    calciteSelect.addEventListener('calciteSelectChange', () => {
                        const { feature } = this;
                        // @ts-ignore
                        this[`${type}Unit`] = calciteSelect.selectedOption.value;
                        if (feature)
                            this._feature(feature);
                    });
                } }, options)));
    }
};
__decorate([
    property({
        aliasOf: 'layer.spatialReference.isGeographic',
    })
], GeometryInfo.prototype, "isGeo", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "feature", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "info", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "locationUnit", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "locationUnits", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "lengthUnit", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "lengthUnits", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "areaUnit", void 0);
__decorate([
    property()
], GeometryInfo.prototype, "areaUnits", void 0);
GeometryInfo = __decorate([
    subclass('Editor.GeometryInfo')
], GeometryInfo);
export default GeometryInfo;
