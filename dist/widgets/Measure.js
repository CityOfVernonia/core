import { __awaiter, __decorate } from "tslib";
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import { Point, Polyline } from '@arcgis/core/geometry';
import { CIMSymbol, SimpleFillSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import Color from '@arcgis/core/Color';
import { geodesicArea, geodesicLength, simplify } from '@arcgis/core/geometry/geometryEngine';
import * as coordinateFormatter from '@arcgis/core/geometry/coordinateFormatter';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import ElevationProfileViewModel from '@arcgis/core/widgets/ElevationProfile';
import ElevationProfileLineGround from '@arcgis/core/widgets/ElevationProfile/ElevationProfileLineGround';
const CSS = {
    base: 'cov-measure',
    // content containers
    content: 'cov-measure--content',
    optionsContent: 'cov-measure--options-content',
    // controls and results
    row: 'cov-measure--row',
    result: 'cov-measure--result',
    // color selector
    colorSelector: 'cov-measure--color-selector',
    colorSelectorColor: 'cov-measure--color-selector--color',
    colorSelectorColorSelected: 'cov-measure--color-selector--color--selected',
};
let KEY = 0;
const SETTINGS_KEY = 'measure_settings_store';
// arcgis `Candy Shop`
const COLORS = {
    primary: [237, 81, 81],
    secondary: [255, 255, 255],
    colors: [
        [237, 81, 81],
        [20, 158, 206],
        [167, 198, 54],
        [158, 85, 156],
        [252, 146, 31],
        [255, 222, 62],
    ],
};
/**
 * Measure widget for ArcGIS JS API including length, area, location, elevation and ground profiles.
 */
let Measure = class Measure extends Widget {
    ////////////////////////////////////////////////////////////////
    // Lifecycle
    ///////////////////////////////////////////////////////////////
    constructor(properties) {
        super(properties);
        this.lengthUnit = 'feet';
        this.lengthUnits = {
            meters: 'Meters',
            feet: 'Feet',
            kilometers: 'Kilometers',
            miles: 'Miles',
            'nautical-miles': 'Nautical Miles',
        };
        this.areaUnit = 'acres';
        this.areaUnits = {
            acres: 'Acres',
            'square-feet': 'Square Feet',
            'square-meters': 'Square Meters',
            'square-kilometers': 'Square Kilometers',
            'square-miles': 'Square Miles',
        };
        this.locationUnit = 'dec';
        this.locationUnits = {
            dec: 'Decimal Degrees',
            dms: 'Degrees Minutes Seconds',
        };
        this.elevationUnit = 'feet';
        this.elevationUnits = {
            feet: 'Feet',
            meters: 'Meters',
        };
        /**
         * Labels visible.
         */
        this.labelsVisible = true;
        /**
         * Add units to labels.
         */
        this.labelUnits = false;
        /**
         * Length, area and elevation precision.
         */
        this.unitsPrecision = 2;
        /**
         * Decimal degrees precision.
         */
        this.degreesPrecision = 6;
        /**
         * Format numbers, e.i. thousand separated, etc.
         */
        this.localeFormat = true;
        ////////////////////////////////////////////////////////////////
        // Internal properties
        ///////////////////////////////////////////////////////////////
        /**
         * Graphics color.
         */
        this.color = COLORS.primary;
        /**
         * Sketch VM for draw operations.
         */
        this.sketch = new SketchViewModel({
            layer: new GraphicsLayer({
                listMode: 'hide',
                title: 'Measure',
            }),
            snappingOptions: {
                enabled: true,
                featureEnabled: true,
                selfEnabled: true,
            },
            updateOnGraphicClick: false,
        });
        this.pointSymbol = new SimpleMarkerSymbol({
            style: 'circle',
            size: 6,
            color: COLORS.secondary,
            outline: {
                width: 1,
                color: COLORS.primary,
            },
        });
        this.polylineSymbol = new CIMSymbol({
            data: {
                type: 'CIMSymbolReference',
                symbol: {
                    type: 'CIMLineSymbol',
                    symbolLayers: [
                        {
                            type: 'CIMSolidStroke',
                            effects: [
                                {
                                    type: 'CIMGeometricEffectDashes',
                                    dashTemplate: [4.75, 4.75],
                                    lineDashEnding: 'HalfPattern',
                                    // controlPointEnding: 'NoConstraint',
                                    offsetAlongLine: 0, // test this
                                },
                            ],
                            enable: true,
                            capStyle: 'Butt',
                            joinStyle: 'Round',
                            // miterLimit: 10,
                            width: 2.25,
                            color: [...COLORS.secondary, 255],
                        },
                        {
                            type: 'CIMSolidStroke',
                            enable: true,
                            capStyle: 'Butt',
                            joinStyle: 'Round',
                            // miterLimit: 10,
                            width: 2.25,
                            color: [...COLORS.primary, 255],
                        },
                    ],
                },
            },
        });
        this.polygonSymbol = new SimpleFillSymbol({
            color: [...COLORS.primary, 0.125],
            outline: {
                width: 0,
            },
        });
        this.textSymbol = new TextSymbol({
            color: COLORS.primary,
            haloColor: COLORS.secondary,
            haloSize: 2,
            horizontalAlignment: 'center',
            verticalAlignment: 'middle',
            font: {
                size: 10,
                // weight: 'bold',
            },
        });
        this.elevationProfile = new ElevationProfileViewModel({
            unit: 'feet',
            visibleElements: {
                legend: false,
                chart: true,
                clearButton: false,
                settingsButton: false,
                sketchButton: false,
                selectButton: false,
                uniformChartScalingToggle: false,
            },
        });
        this.elevationProfileLineGround = new ElevationProfileLineGround();
        this.layers = new GroupLayer({
            listMode: 'hide',
            title: 'Measure Layers',
        });
        this.labels = new GraphicsLayer({
            listMode: 'hide',
            title: 'Measure Labels',
        });
        /**
         * Widget state and measurement values.
         */
        this.state = {
            operation: 'ready',
            x: 0,
            y: 0,
            z: 0,
            length: 0,
            area: 0,
            locationX: 0,
            locationY: 0,
            elevation: 0,
            lengthGeometry: null,
            areaGeometry: null,
            locationGeometry: null,
            elevationGeometry: null,
            profileGeometry: null,
        };
        this.optionsVisible = false;
        /**
         * Handle for sketch create.
         */
        this._sketchHandle = null;
        // load settings from local storage
        this._loadSettings();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { view, sketch, pointSymbol, polylineSymbol, polygonSymbol, elevationProfile, elevationProfileLineGround, layers, labels, labelsVisible, } = this;
            yield view.when();
            // initialize sketch and snapping
            sketch.view = view;
            // @ts-ignore
            sketch.activeLineSymbol = polylineSymbol;
            // @ts-ignore
            sketch.activeVertexSymbol = pointSymbol;
            // @ts-ignore
            sketch.vertexSymbol = pointSymbol;
            sketch.activeFillSymbol = polygonSymbol;
            view.map.layers.forEach(this._addSnappingLayer.bind(this));
            const layerAdd = view.map.layers.on('after-add', (event) => {
                this._addSnappingLayer(event.item);
                // keep the layers on top
                view.map.layers.reorder(layers, view.map.layers.length - 1);
            });
            // add layers
            labels.visible = labelsVisible;
            layers.addMany([sketch.layer, labels]);
            view.map.add(layers);
            // load coordinate formatter
            coordinateFormatter.load();
            // initialize elevation profile
            elevationProfile.view = view;
            elevationProfile.profiles.removeAll();
            elevationProfileLineGround.color = new Color(this.color);
            elevationProfile.profiles.add(elevationProfileLineGround);
            // cursor coordinates
            const locationHandle = view.on('pointer-move', (screenPoint) => {
                // get coordinates
                const { x, y } = this._location(view.toMap(screenPoint));
                //set state
                this.state = Object.assign(Object.assign({}, this.state), { x,
                    y });
            });
            // location labels when measuring
            const locationLabels = view.on('pointer-move', (screenPoint) => {
                const { state: { operation }, } = this;
                if (operation === 'measure-location') {
                    this._addLabels(view.toMap(screenPoint), labels);
                }
            });
            // cursor elevation
            const elevationHandle = view.on('pointer-move', (screenPoint) => __awaiter(this, void 0, void 0, function* () {
                // reject if no ground
                if (!view.map.ground) {
                    this.state = Object.assign(Object.assign({}, this.state), { z: -99999 });
                }
                // get elevation
                const z = yield this._elevation(view.toMap(screenPoint));
                // set state
                this.state = Object.assign(Object.assign({}, this.state), { z });
            }));
            // elevation labels when measuring
            const elevationLabels = view.on('pointer-move', (screenPoint) => {
                const { state: { operation }, } = this;
                if (operation === 'measure-elevation') {
                    this._addLabels(view.toMap(screenPoint), labels);
                }
            });
            // watch units to update measurements and displayed units
            const lenghUnitChange = watch(() => this.lengthUnit, this._unitsChange.bind(this));
            const areaUnitChange = watch(() => this.areaUnit, this._unitsChange.bind(this));
            const locationUnitChange = watch(() => this.locationUnit, this._unitsChange.bind(this));
            const elevationUnitChange = watch(() => this.elevationUnit, this._unitsChange.bind(this));
            // watch settings change except lables and color
            const labelUnitsChange = watch(() => this.labelUnits, this._updateSettings.bind(this));
            const localeFormatChange = watch(() => this.localeFormat, this._updateSettings.bind(this));
            const snappingEnabledChange = watch(() => sketch.snappingOptions.enabled, this._updateSettings.bind(this));
            const uniformChartScalingChange = watch(() => elevationProfile.viewModel.uniformChartScaling, this._updateSettings.bind(this));
            // watch label visibility
            const labelsVisibilityChange = watch(() => this.labelsVisible, (visible) => {
                labels.visible = visible;
                this._updateSettings();
            });
            const colorChange = watch(() => this.color, (color) => {
                this._setColors(color);
                this._updateSettings();
                // FIX
                // only updates text color
                // this._unitsChange();
            });
            // own handles
            this.own([
                layerAdd,
                locationHandle,
                locationLabels,
                elevationHandle,
                elevationLabels,
                lenghUnitChange,
                areaUnitChange,
                locationUnitChange,
                elevationUnitChange,
                labelUnitsChange,
                localeFormatChange,
                snappingEnabledChange,
                uniformChartScalingChange,
                labelsVisibilityChange,
                colorChange,
            ]);
        });
    }
    ////////////////////////////////////////////////////////////////
    // Public methods
    ///////////////////////////////////////////////////////////////
    /**
     * Convenience method for widget control classes.
     */
    onHide() {
        this._reset();
        this.optionsVisible = false;
    }
    ////////////////////////////////////////////////////////////////
    // Private methods
    ///////////////////////////////////////////////////////////////
    /**
     * Handle unit changes.
     */
    _unitsChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const { state: { operation, lengthGeometry, areaGeometry, locationGeometry, elevationGeometry }, elevationProfile, } = this;
            if (lengthGeometry)
                this._length(lengthGeometry);
            if (operation === 'length' && lengthGeometry)
                this._addLabels(lengthGeometry);
            if (areaGeometry)
                this._area(areaGeometry);
            if (operation === 'area' && areaGeometry)
                this._addLabels(areaGeometry);
            if (locationGeometry) {
                const { x, y } = this._location(locationGeometry);
                this.state = Object.assign(Object.assign({}, this.state), { locationX: x, locationY: y });
            }
            if (operation === 'location' && locationGeometry)
                this._addLabels(locationGeometry);
            if (elevationGeometry) {
                const z = yield this._elevation(elevationGeometry);
                this.state = Object.assign(Object.assign({}, this.state), { z, elevation: z });
            }
            if (operation === 'elevation' && elevationGeometry)
                this._addLabels(elevationGeometry);
            elevationProfile.unit = this.elevationUnit;
        });
    }
    /**
     * Load settings from local storage.
     */
    _loadSettings() {
        const { sketch: { snappingOptions }, elevationProfile: { viewModel }, } = this;
        const settingsItem = localStorage.getItem(SETTINGS_KEY);
        const settings = settingsItem ? JSON.parse(settingsItem) : null;
        if (settings) {
            const { snapping, labels, labelUnits, localeFormat, uniformChartScaling, color } = settings;
            snappingOptions.enabled = snapping;
            this.labelsVisible = labels;
            this.labelUnits = labelUnits;
            this.localeFormat = localeFormat;
            viewModel.uniformChartScaling = uniformChartScaling;
            this.color = color;
            this._setColors(color);
        }
        else {
            this._updateSettings();
        }
    }
    /**
     * Update settings local storage.
     */
    _updateSettings() {
        const { sketch: { snappingOptions }, elevationProfile: { viewModel }, } = this;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
            snapping: snappingOptions.enabled,
            labels: this.labelsVisible,
            labelUnits: this.labelUnits,
            localeFormat: this.localeFormat,
            uniformChartScaling: viewModel.uniformChartScaling,
            color: this.color,
        }));
    }
    /**
     * Set symbol and profile colors.
     * @param color
     */
    _setColors(color) {
        const { pointSymbol, polylineSymbol, polygonSymbol, textSymbol, elevationProfileLineGround } = this;
        pointSymbol.outline.color = new Color(color);
        // @ts-ignore
        polylineSymbol.data.symbol.symbolLayers[1].color = [...color, 255];
        // @ts-ignore
        polygonSymbol.color = new Color([...color, 0.125]);
        textSymbol.color = new Color(color);
        elevationProfileLineGround.color = new Color(color);
    }
    /**
     * Add layer as snapping source.
     * @param layer
     */
    _addSnappingLayer(layer) {
        const { sketch: { snappingOptions }, } = this;
        if (layer.type === 'group') {
            layer.layers.forEach((_layer) => {
                this._addSnappingLayer(_layer);
            });
            return;
        }
        if ((layer.listMode === 'hide' || layer.title === undefined || layer.title === null) &&
            !layer.id.includes('markup'))
            return;
        // @ts-ignore
        if (layer.internal === true)
            return;
        snappingOptions.featureSources.add(new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: layer,
        }));
    }
    /**
     * Reset the widget.
     */
    _reset() {
        var _a;
        const { sketch, sketch: { layer }, labels, elevationProfile, } = this;
        // don't use deconstructed properties to remove handles
        (_a = this._sketchHandle) === null || _a === void 0 ? void 0 : _a.remove();
        this._sketchHandle = null;
        // cancel sketch
        sketch.cancel();
        layer.removeAll();
        labels.removeAll();
        // clear profile
        elevationProfile.viewModel.clear();
        // reset state
        this.state = Object.assign(Object.assign({}, this.state), { operation: 'ready', length: 0, area: 0 });
    }
    /**
     * Round a number.
     * @param value
     * @param digits
     * @returns number
     */
    _round(value, digits) {
        return Number(value.toFixed(digits));
    }
    /**
     * Format measurement and units for display and labels.
     * @param measurement
     * @param unit
     * @param label
     * @returns string
     */
    _format(measurement, unit, label) {
        const { labelUnits, localeFormat } = this;
        const _measurement = localeFormat ? measurement.toLocaleString() : measurement;
        const _unit = unit.replace('-', ' ').replace('square', 'sq');
        return label === true && labelUnits === false ? `${_measurement}` : `${_measurement} ${_unit}`;
    }
    /**
     * Wire unit select event.
     * @param type
     * @param select
     */
    _unitChangeEvent(type, select) {
        select.addEventListener('calciteSelectChange', () => {
            this[`${type}Unit`] = select.selectedOption.value;
        });
    }
    /**
     * Wire measure button event.
     * @param type
     * @param button
     */
    _measureEvent(type, button) {
        button.addEventListener('click', this._measure.bind(this, type));
    }
    /**
     * Wire clear button event.
     * @param button
     */
    _clearEvent(button) {
        button.addEventListener('click', this._reset.bind(this));
    }
    /**
     * Initiate measuring.
     * @param type
     */
    _measure(type) {
        const { sketch } = this;
        // reset
        this._reset();
        // set state
        this.state = Object.assign(Object.assign({}, this.state), { operation: `measure-${type}` });
        // create handle
        this._sketchHandle = sketch.on('create', this[`_${type}Event`].bind(this));
        // begin sketch
        sketch.create(type === 'length' || type === 'profile' ? 'polyline' : type === 'area' ? 'polygon' : 'point');
    }
    /**
     * Handle length event.
     * @param event
     */
    _lengthEvent(event) {
        const { sketch: { layer }, } = this;
        const { state, graphic, graphic: { geometry }, } = event;
        // reset on cancel
        if (state === 'cancel' || !graphic) {
            this._reset();
            return;
        }
        // measure
        this._length(geometry);
        // completed
        if (state === 'complete') {
            // set state
            this.state = Object.assign(Object.assign({}, this.state), { operation: 'length', lengthGeometry: geometry });
            // add additional graphics
            this._addGraphics(geometry);
        }
        // add labels
        this._addLabels(geometry, graphic.layer === layer ? undefined : graphic.layer);
    }
    /**
     * Measure length and set state.
     * @param polyline
     */
    _length(polyline) {
        const { unitsPrecision, lengthUnit } = this;
        // measure length
        let length = geodesicLength(polyline, lengthUnit);
        // simplify and remeasure length if required
        if (length < 0)
            length = geodesicLength(simplify(polyline), lengthUnit);
        // round
        length = this._round(length, unitsPrecision);
        // set state
        this.state = Object.assign(Object.assign({}, this.state), { length, lengthGeometry: polyline });
    }
    /**
     * Handle area event.
     * @param event
     */
    _areaEvent(event) {
        const { sketch: { layer }, } = this;
        const { state, graphic, graphic: { geometry }, } = event;
        // reset on cancel
        if (state === 'cancel' || !graphic) {
            this._reset();
            return;
        }
        // measure
        this._area(geometry);
        // completed
        if (state === 'complete') {
            // set state
            this.state = Object.assign(Object.assign({}, this.state), { operation: 'area', areaGeometry: geometry });
            // add additional graphics
            this._addGraphics(geometry);
        }
        else {
            // add outline
            this._addPolygonOutline(geometry, graphic.layer);
        }
        // add labels
        this._addLabels(geometry, graphic.layer === layer ? undefined : graphic.layer);
    }
    /**
     * Measure area and set state.
     * @param polygon
     */
    _area(polygon) {
        const { unitsPrecision, lengthUnit, areaUnit } = this;
        // measure length (perimeter)
        let length = geodesicLength(polygon, lengthUnit);
        // simplify and remeasure length if required
        if (length < 0)
            length = geodesicLength(simplify(polygon), lengthUnit);
        // round
        length = this._round(length, unitsPrecision);
        let area = geodesicArea(polygon, areaUnit);
        // simplify and remeasure length if required
        if (area < 0)
            area = geodesicArea(simplify(polygon), areaUnit);
        // round
        area = this._round(area, unitsPrecision);
        // set state
        this.state = Object.assign(Object.assign({}, this.state), { length,
            area, areaGeometry: polygon });
    }
    /**
     * Handle location event and set state.
     * @param event
     */
    _locationEvent(event) {
        const { sketch: { layer }, } = this;
        const { state, graphic, graphic: { geometry }, } = event;
        // reset on cancel
        if (state === 'cancel' || !graphic) {
            this._reset();
            return;
        }
        // get coordinates and set state
        if (state === 'complete') {
            const { x, y } = this._location(geometry);
            this.state = Object.assign(Object.assign({}, this.state), { operation: 'location', locationX: x, locationY: y, locationGeometry: geometry });
        }
        // add labels
        this._addLabels(geometry, graphic.layer === layer ? undefined : graphic.layer);
    }
    /**
     * Location coordinates.
     * @param point
     * @returns
     */
    _location(point) {
        const { degreesPrecision, locationUnit } = this;
        let x = this._round(point.longitude, degreesPrecision);
        let y = this._round(point.latitude, degreesPrecision);
        if (locationUnit === 'dms') {
            const dms = coordinateFormatter.toLatitudeLongitude(webMercatorToGeographic(point, false), 'dms', 2);
            const index = dms.indexOf('N') !== -1 ? dms.indexOf('N') : dms.indexOf('S');
            y = dms.substring(0, index + 1);
            x = dms.substring(index + 2, dms.length);
        }
        return { x, y };
    }
    /**
     * Handle elevation event and set state.
     * @param event
     * @returns
     */
    _elevationEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sketch: { layer }, } = this;
            const { state, graphic, graphic: { geometry }, } = event;
            // reset on cancel
            if (state === 'cancel' || !graphic) {
                this._reset();
                return;
            }
            // get coordinates and set state
            if (state === 'complete') {
                const elevation = yield this._elevation(geometry);
                this.state = Object.assign(Object.assign({}, this.state), { operation: 'elevation', elevation, elevationGeometry: geometry });
                // add labels
                this._addLabels(geometry);
            }
            // add labels
            this._addLabels(geometry, graphic.layer === layer ? undefined : graphic.layer);
        });
    }
    /**
     * Query elevation.
     * @param point
     * @returns
     */
    _elevation(point) {
        return new Promise((resolve) => {
            const { view: { map: { ground }, }, unitsPrecision, elevationUnit, } = this;
            ground
                .queryElevation(point)
                .then((result) => {
                resolve(this._round(result.geometry.z * (elevationUnit === 'feet' ? 3.2808399 : 1), unitsPrecision));
            })
                .catch(() => {
                resolve(-99999);
            });
        });
    }
    _profileEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { 
            // sketch: { layer },
            elevationProfile, } = this;
            const { state, graphic, graphic: { geometry }, } = event;
            // reset on cancel
            if (state === 'cancel' || !graphic) {
                this._reset();
                return;
            }
            if (state === 'complete') {
                elevationProfile.input = new Graphic({
                    geometry,
                });
                this.state = Object.assign(Object.assign({}, this.state), { operation: 'profile', profileGeometry: geometry });
                // add additional graphics
                this._addGraphics(geometry);
            }
            // TODO: decide if labeling is necessary
            // add labels
            // this._addLabels(geometry as Polyline, graphic.layer === layer ? undefined : (graphic.layer as esri.GraphicsLayer));
        });
    }
    /**
     * Add additional graphics when complete.
     * @param geometry
     */
    _addGraphics(geometry) {
        const { view: { spatialReference }, sketch: { layer }, pointSymbol, polylineSymbol, } = this;
        const { type } = geometry;
        // add polygon outline
        if (type === 'polygon') {
            layer.add(new Graphic({
                geometry,
                symbol: polylineSymbol,
            }));
        }
        // add vertices for polylines and polygons
        if (type === 'polyline' || type == 'polygon') {
            const coordinates = type === 'polyline' ? geometry.paths[0] : geometry.rings[0];
            layer.addMany(coordinates.map((coordinate) => {
                const [x, y] = coordinate;
                return new Graphic({
                    geometry: new Point({ x, y, spatialReference }),
                    symbol: pointSymbol,
                });
            }));
        }
    }
    /**
     * Add outline to area polygon.
     * As of 4.22 api's sketch polyline symbol only shows CIM on active polygon sketch segment.
     * @param geometry
     * @param layer
     */
    _addPolygonOutline(geometry, layer) {
        const { polylineSymbol } = this;
        const { graphics } = layer;
        layer.removeMany(graphics
            .filter((graphic) => {
            return graphic.attributes && graphic.attributes.outline === true;
        })
            .toArray());
        // add to graphics collection to set index
        graphics.add(new Graphic({
            geometry,
            attributes: {
                outline: true,
            },
            symbol: polylineSymbol,
        }), 1);
    }
    /**
     * Add label graphics.
     * @param geometry
     */
    _addLabels(geometry, layer) {
        const { labelsVisible, labels, state: { operation, area, x, y, z, locationX, locationY, elevation }, areaUnit, elevationUnit, } = this;
        const { type } = geometry;
        // remove all labels
        labels.removeAll();
        if (layer)
            layer.removeMany(layer.graphics
                .filter((graphic) => {
                return graphic.symbol && graphic.symbol.type === 'text';
            })
                .toArray());
        // measuring length labels
        if ((operation === 'measure-length' || operation === 'measure-profile') &&
            type === 'polyline' &&
            layer &&
            labelsVisible)
            layer.addMany(this._polylineLabels(geometry));
        // measured length labels
        if ((operation === 'length' || operation === 'profile') && type === 'polyline')
            labels.addMany(this._polylineLabels(geometry));
        // measuring area labels
        if (operation === 'measure-area' && type === 'polygon' && area > 0 && layer && labelsVisible) {
            layer.add(new Graphic({
                geometry: geometry.centroid,
                symbol: this._createTextSymbol(this._format(area, areaUnit, true)),
            }));
            layer.addMany(this._polylineLabels(geometry));
        }
        // measured area labels
        if (operation === 'area' && type === 'polygon') {
            labels.add(new Graphic({
                geometry: geometry.centroid,
                symbol: this._createTextSymbol(this._format(area, areaUnit, true)),
            }));
            labels.addMany(this._polylineLabels(geometry));
        }
        // measuring location labels
        if (operation === 'measure-location' && type === 'point' && layer && labelsVisible)
            layer.add(new Graphic({
                geometry: geometry,
                symbol: this._createTextSymbol(`${y}\n${x}`, true),
            }));
        // measured location labels
        if (operation === 'location' && type === 'point')
            labels.add(new Graphic({
                geometry: geometry,
                symbol: this._createTextSymbol(`${locationY}\n${locationX}`, true),
            }));
        // measuring elevation labels
        if (operation === 'elevation' && type === 'point')
            labels.add(new Graphic({
                geometry: geometry,
                symbol: this._createTextSymbol(this._format(elevation, elevationUnit, true), true),
            }));
        // measured elevation labels
        if (operation === 'measure-elevation' && type === 'point' && layer && labelsVisible)
            layer.add(new Graphic({
                geometry: geometry,
                symbol: this._createTextSymbol(this._format(z, elevationUnit, true), true),
            }));
    }
    /**
     * Create and return new text symbol.
     * @param text
     * @param point
     * @returns
     */
    _createTextSymbol(text, point, angle) {
        const { textSymbol } = this;
        const sym = textSymbol.clone();
        sym.text = text;
        if (point) {
            sym.horizontalAlignment = 'left';
            sym.xoffset = 8;
        }
        if (angle)
            sym.angle = angle;
        return sym;
    }
    _polylineLabels(geometry) {
        const { lengthUnit } = this;
        const paths = geometry.type === 'polyline' ? geometry.paths[0] : geometry.rings[0];
        const graphics = [];
        // measure each polyline segment
        paths.forEach((point, index, path) => {
            const a = path[index];
            const b = path[index + 1];
            if (!a || !b)
                return;
            // create polyline
            const polyline = new Polyline({
                paths: [[a, b]],
                spatialReference: geometry.spatialReference,
            });
            // measure length
            let length = geodesicLength(polyline, lengthUnit);
            // simplify and remeasure length if required
            if (length < 0)
                length = geodesicLength(simplify(polyline), lengthUnit);
            // round
            length = this._round(length, 2);
            graphics.push(new Graphic({
                geometry: this._midpoint(polyline),
                symbol: this._createTextSymbol(this._format(length, lengthUnit, true), undefined, this._textSymbolAngle(a[0], a[1], b[0], b[1])),
            }));
        });
        return graphics;
    }
    /**
     * Return midpoint of polyline.
     * @param polyline Polyline
     * @returns esri.Point
     */
    _midpoint(polyline) {
        const { paths: [path], spatialReference, } = polyline;
        /**
         * Distance between two points.
         * @param point1 esri.Point | x,y key/value pair
         * @param point2 esri.Point | x,y key/value pair
         * @returns number
         */
        const distance = (point1, point2) => {
            const { x: x1, y: y1 } = point1;
            const { x: x2, y: y2 } = point2;
            return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
        };
        /**
         * Point on the line between two points some distance from point one.
         * @param point1 esri.Point
         * @param point2 esri.Point
         * @param linearDistance number
         * @returns esri.Point
         */
        const linearInterpolation = (point1, point2, linearDistance) => {
            const { x: x1, y: y1, spatialReference } = point1;
            const { x: x2, y: y2 } = point2;
            const steps = distance(point1, point2) / linearDistance;
            return new Point({
                x: x1 + (x2 - x1) / steps,
                y: y1 + (y2 - y1) / steps,
                spatialReference,
            });
        };
        const segements = path.map((p) => {
            const [x, y] = p;
            return { x, y };
        });
        let td = 0;
        let dsf = 0;
        for (let i = 0; i < segements.length - 1; i += 1) {
            td += distance(new Point(Object.assign({}, segements[i])), new Point(Object.assign({}, segements[i + 1])));
        }
        for (let i = 0; i < segements.length - 1; i += 1) {
            if (dsf + distance(new Point(Object.assign({}, segements[i])), new Point(Object.assign({}, segements[i + 1]))) > td / 2) {
                const distanceToMidpoint = td / 2 - dsf;
                return linearInterpolation(new Point(Object.assign(Object.assign({}, segements[i]), { spatialReference })), new Point(Object.assign(Object.assign({}, segements[i + 1]), { spatialReference })), distanceToMidpoint);
            }
            dsf += distance(new Point(Object.assign({}, segements[i])), new Point(Object.assign({}, segements[i + 1])));
        }
        return new Point(Object.assign(Object.assign({}, segements[0]), { spatialReference }));
    }
    /**
     * Text symbol angle between two sets of points.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns
     */
    _textSymbolAngle(x1, y1, x2, y2) {
        let angle = (Math.atan2(y1 - y2, x1 - x2) * 180) / Math.PI;
        // quadrants SW SE NW NE
        angle =
            angle > 0 && angle < 90
                ? Math.abs(angle - 180) + 180
                : angle > 90 && angle < 180
                    ? (angle = Math.abs(angle - 180))
                    : angle <= 0 && angle >= -90
                        ? Math.abs(angle)
                        : Math.abs(angle) + 180;
        return angle;
    }
    render() {
        const { id, view: { scale }, optionsVisible, state, state: { operation, x, y, locationX, locationY }, unitsPrecision, lengthUnit, areaUnit, elevationUnit, elevationProfile: { viewModel: { state: profileState, uniformChartScaling }, }, localeFormat, } = this;
        // @ts-ignore
        const statistics = this.elevationProfile.viewModel.statistics || null;
        // format values
        const length = `Length: ${this._format(state.length, lengthUnit)}`;
        const area = `Area: ${this._format(state.area, areaUnit)}`;
        const perimeter = length.replace('Length: ', 'Perimeter: ');
        const latitude = `Latitude: ${operation === 'location' ? locationY : y}`;
        const longitude = `Longitude: ${operation === 'location' ? locationX : x}`;
        const elevation = `Elevation: ${operation === 'elevation' ? state.elevation.toLocaleString() : state.z.toLocaleString()} ${elevationUnit}`;
        const cursorLatitude = `Latitude: ${y}`;
        const cursorLongitude = `Longitude: ${x}`;
        const cursorElevation = `Elevation: ${state.z.toLocaleString()} ${elevationUnit}`;
        // hidden logic for results and cancel/clear button
        const lengthResults = !(operation === 'length' || operation === 'measure-length');
        const areaResults = !(operation === 'area' || operation === 'measure-area');
        const locationResults = !(operation === 'location' || operation === 'measure-location');
        const elevationResults = !(operation === 'elevation' || operation === 'measure-elevation');
        const profileResults = operation !== 'profile' && profileState !== 'created';
        const clearCancel = operation === 'ready';
        const clearCancelText = operation === 'measure-length' ||
            operation === 'measure-area' ||
            operation === 'measure-location' ||
            operation === 'measure-elevation' ||
            operation === 'measure-profile'
            ? 'Cancel'
            : 'Clear';
        const tooltips = [0, 1, 2, 3, 4, 5].map((num) => {
            return `tooltip_${id}_${num}_${KEY++}`;
        });
        return (tsx("calcite-panel", { class: CSS.base, heading: "Measure" },
            tsx("calcite-action", { id: tooltips[0], slot: "header-actions-end", icon: optionsVisible ? 'x' : 'gear', afterCreate: (action) => {
                    action.addEventListener('click', () => {
                        this.optionsVisible = !this.optionsVisible;
                    });
                } }),
            tsx("calcite-tooltip", { "reference-element": tooltips[0], placement: "bottom", "close-on-click": "" }, optionsVisible ? 'Close' : 'Options'),
            tsx("div", { class: CSS.content, hidden: optionsVisible },
                tsx("div", { class: CSS.row },
                    tsx("calcite-button", { id: tooltips[1], appearance: "transparent", "icon-start": "measure-line", afterCreate: this._measureEvent.bind(this, 'length') }),
                    tsx("calcite-tooltip", { "reference-element": tooltips[1], placement: "bottom", "close-on-click": "" }, "Length"),
                    tsx("calcite-button", { id: tooltips[2], appearance: "transparent", "icon-start": "measure-area", afterCreate: this._measureEvent.bind(this, 'area') }),
                    tsx("calcite-tooltip", { "reference-element": tooltips[2], placement: "bottom", "close-on-click": "" }, "Area"),
                    tsx("calcite-button", { id: tooltips[3], appearance: "transparent", "icon-start": "point", afterCreate: this._measureEvent.bind(this, 'location') }),
                    tsx("calcite-tooltip", { "reference-element": tooltips[3], placement: "bottom", "close-on-click": "" }, "Location"),
                    tsx("calcite-button", { id: tooltips[4], appearance: "transparent", "icon-start": "altitude", afterCreate: this._measureEvent.bind(this, 'elevation') }),
                    tsx("calcite-tooltip", { "reference-element": tooltips[4], placement: "bottom", "close-on-click": "" }, "Elevation"),
                    tsx("calcite-button", { id: tooltips[5], appearance: "transparent", "icon-start": "graph-time-series", afterCreate: this._measureEvent.bind(this, 'profile') }),
                    tsx("calcite-tooltip", { "reference-element": tooltips[5], placement: "bottom", "close-on-click": "" }, "Profile")),
                tsx("div", { class: CSS.result, hidden: !clearCancel },
                    tsx("span", null, cursorLatitude),
                    tsx("span", null, cursorLongitude),
                    tsx("span", null, cursorElevation),
                    tsx("span", null,
                        "Scale: 1:",
                        localeFormat ? Math.round(scale).toLocaleString() : Math.round(scale))),
                tsx("calcite-select", { hidden: lengthResults, afterCreate: this._unitChangeEvent.bind(this, 'length') }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit)),
                tsx("div", { class: CSS.result, hidden: lengthResults },
                    tsx("span", null, length)),
                tsx("div", { class: CSS.row, hidden: areaResults },
                    tsx("calcite-select", { afterCreate: this._unitChangeEvent.bind(this, 'area') }, this._renderUnitOptions(this.areaUnits, this.areaUnit)),
                    tsx("calcite-select", { afterCreate: this._unitChangeEvent.bind(this, 'length') }, this._renderUnitOptions(this.lengthUnits, this.lengthUnit))),
                tsx("div", { class: CSS.result, hidden: areaResults },
                    tsx("span", null, area),
                    tsx("span", null, perimeter)),
                tsx("calcite-select", { hidden: locationResults, afterCreate: this._unitChangeEvent.bind(this, 'location') }, this._renderUnitOptions(this.locationUnits, this.locationUnit)),
                tsx("div", { class: CSS.result, hidden: locationResults },
                    tsx("span", null, latitude),
                    tsx("span", null, longitude)),
                tsx("calcite-select", { hidden: elevationResults, afterCreate: this._unitChangeEvent.bind(this, 'elevation') }, this._renderUnitOptions(this.elevationUnits, this.elevationUnit)),
                tsx("div", { class: CSS.result, hidden: elevationResults }, elevation),
                tsx("calcite-select", { hidden: profileResults, afterCreate: this._unitChangeEvent.bind(this, 'elevation') }, this._renderUnitOptions(this.elevationUnits, this.elevationUnit)),
                tsx("div", { hidden: profileResults, afterCreate: (container) => {
                        this.elevationProfile.container = container;
                    } }),
                tsx("div", { class: CSS.result, hidden: profileResults },
                    tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                        "Uniform profile scale",
                        tsx("calcite-switch", { afterCreate: (_switch) => {
                                _switch.checked = uniformChartScaling;
                                _switch.addEventListener('calciteSwitchChange', () => {
                                    this.elevationProfile.viewModel.uniformChartScaling = _switch.checked;
                                });
                            } })),
                    tsx("span", null,
                        "Min elevation:",
                        ' ',
                        statistics ? this._format(this._round(statistics.minElevation, unitsPrecision), elevationUnit) : ''),
                    tsx("span", null,
                        "Max elevation:",
                        ' ',
                        statistics ? this._format(this._round(statistics.maxElevation, unitsPrecision), elevationUnit) : ''),
                    tsx("span", null,
                        "Avg elevation:",
                        ' ',
                        statistics ? this._format(this._round(statistics.avgElevation, unitsPrecision), elevationUnit) : ''),
                    tsx("span", null,
                        "Elevation gain:",
                        ' ',
                        statistics ? this._format(this._round(statistics.elevationGain, unitsPrecision), elevationUnit) : ''),
                    tsx("span", null,
                        "Elevation loss:",
                        ' ',
                        statistics ? this._format(this._round(statistics.elevationLoss, unitsPrecision), elevationUnit) : '')),
                tsx("span", { hidden: clearCancel },
                    tsx("calcite-button", { afterCreate: this._clearEvent.bind(this) }, clearCancelText))),
            tsx("div", { class: CSS.optionsContent, hidden: !optionsVisible },
                tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                    "Feature snapping",
                    tsx("calcite-switch", { afterCreate: (_switch) => {
                            const { sketch: { snappingOptions }, } = this;
                            _switch.checked = snappingOptions.featureEnabled;
                            _switch.addEventListener('calciteSwitchChange', () => {
                                snappingOptions.featureEnabled = _switch.checked;
                            });
                        } })),
                tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                    "Sketch guides",
                    tsx("calcite-switch", { afterCreate: (_switch) => {
                            const { sketch: { snappingOptions }, } = this;
                            _switch.checked = snappingOptions.selfEnabled;
                            _switch.addEventListener('calciteSwitchChange', () => {
                                snappingOptions.selfEnabled = _switch.checked;
                            });
                        } })),
                tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                    "Graphic labels",
                    tsx("calcite-switch", { afterCreate: (_switch) => {
                            const { labelsVisible } = this;
                            _switch.checked = labelsVisible;
                            _switch.addEventListener('calciteSwitchChange', () => {
                                this.labelsVisible = _switch.checked;
                            });
                        } })),
                tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                    "Graphic label units",
                    tsx("calcite-switch", { afterCreate: (_switch) => {
                            const { labelUnits } = this;
                            _switch.checked = labelUnits;
                            _switch.addEventListener('calciteSwitchChange', () => {
                                this.labelUnits = _switch.checked;
                            });
                        } })),
                tsx("calcite-label", { alignment: "start", layout: "inline-space-between" },
                    "Format results",
                    tsx("calcite-switch", { afterCreate: (_switch) => {
                            const { localeFormat } = this;
                            _switch.checked = localeFormat;
                            _switch.addEventListener('calciteSwitchChange', () => {
                                this.localeFormat = _switch.checked;
                            });
                        } })),
                tsx("calcite-label", null,
                    "Color",
                    this._renderColorSelector()))));
    }
    ////////////////////////////////////////////////////////////////
    // Rendering methods
    ///////////////////////////////////////////////////////////////
    /**
     * Render unit select options.
     * @param units
     * @param defaultUnit
     * @returns
     */
    _renderUnitOptions(units, defaultUnit) {
        const options = [];
        for (const unit in units) {
            options.push(tsx("calcite-option", { key: KEY++, label: units[unit], value: unit, selected: unit === defaultUnit }));
        }
        return options;
    }
    /**
     * Render color tiles to select color.
     * @returns
     */
    _renderColorSelector() {
        const { colors } = COLORS;
        const { color: _color } = this;
        return (tsx("div", { class: CSS.colorSelector }, colors.map((color) => {
            const selected = color[0] === _color[0] && color[1] === _color[1] && color[2] === _color[2];
            return (tsx("div", { class: this.classes(CSS.colorSelectorColor, selected ? CSS.colorSelectorColorSelected : ''), style: `background-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 1);`, afterCreate: (div) => {
                    div.addEventListener('click', () => {
                        this.color = color;
                    });
                } }));
        })));
    }
};
__decorate([
    property()
], Measure.prototype, "lengthUnit", void 0);
__decorate([
    property()
], Measure.prototype, "areaUnit", void 0);
__decorate([
    property()
], Measure.prototype, "locationUnit", void 0);
__decorate([
    property()
], Measure.prototype, "elevationUnit", void 0);
__decorate([
    property()
], Measure.prototype, "labelsVisible", void 0);
__decorate([
    property()
], Measure.prototype, "labelUnits", void 0);
__decorate([
    property()
], Measure.prototype, "localeFormat", void 0);
__decorate([
    property()
], Measure.prototype, "color", void 0);
__decorate([
    property({
        aliasOf: 'sketch.pointSymbol',
    })
], Measure.prototype, "pointSymbol", void 0);
__decorate([
    property({
        aliasOf: 'sketch.polylineSymbol',
    })
], Measure.prototype, "polylineSymbol", void 0);
__decorate([
    property({
        aliasOf: 'sketch.polygonSymbol',
    })
], Measure.prototype, "polygonSymbol", void 0);
__decorate([
    property()
], Measure.prototype, "state", void 0);
__decorate([
    property()
], Measure.prototype, "optionsVisible", void 0);
Measure = __decorate([
    subclass('Measure')
], Measure);
export default Measure;
