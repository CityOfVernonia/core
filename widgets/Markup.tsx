/**
 * Widget for marking up.
 */

// namespaces and types
import cov = __cov;

// base imports
import { watch, whenOnce } from '@arcgis/core/core/watchUtils';
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { storeNode, tsx } from '@arcgis/core/widgets/support/widget';
// view models
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import UnitsViewModel from '../viewModels/UnitsViewModel';
// graphics, symbols, etc.
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleSymbolEditor from './SimpleSymbolEditor';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import { Point, SpatialReference } from '@arcgis/core/geometry';
import { SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol } from '@arcgis/core/symbols';
import { hexColors, rgbColors } from './../support/colors';
import FeatureSnappingLayerSource from '@arcgis/core/views/interactive/snapping/FeatureSnappingLayerSource';
// buffer and offset
import { geodesicBuffer, offset } from '@arcgis/core/geometry/geometryEngine';
import * as projection from '@arcgis/core/geometry/projection';

// styles
import './Markup.scss';
const CSS = {
  base: 'cov-tabbed-widget cov-markup',
  heading: 'cov-markup--heading',
  buttonRow: 'cov-markup--button-row',
  inputRow: 'cov-markup--input-row',
  popupContent: 'cov-markup--popup-content',
  popupHeading: 'cov-markup--popup-heading',
};

let KEY = 0;

const PROJECTS_DB_NAME = 'markup_widget_projects';

// class export
@subclass('cov.widgets.Markup')
export default class Markup extends Widget {
  @property()
  protected sketch = new SketchViewModel({
    layer: new GraphicsLayer({
      listMode: 'hide',
    }),
  });

  @property({
    aliasOf: 'sketch.snappingOptions.enabled',
  })
  snappingEnabled = true;

  @property({
    aliasOf: 'sketch.pointSymbol',
  })
  pointSymbol = new SimpleMarkerSymbol({
    color: hexColors.yellow,
    size: 8,
    outline: {
      color: hexColors.red,
      width: 1,
    },
  });

  @property({
    aliasOf: 'sketch.polylineSymbol',
  })
  polylineSymbol = new SimpleLineSymbol({
    color: hexColors.red,
    width: 2,
  });

  @property({
    aliasOf: 'sketch.polygonSymbol',
  })
  polygonSymbol = new SimpleFillSymbol({
    color: [...rgbColors.yellow, 0.2],
    outline: {
      color: hexColors.red,
      width: 2,
    },
  });

  @property()
  textSymbol = new TextSymbol({
    text: 'New Text',
    color: [0, 0, 0, 1],
    haloColor: [255, 255, 255, 1],
    haloSize: 1,
    horizontalAlignment: 'left',
    verticalAlignment: 'middle',
    font: {
      family: 'sans-serif',
      size: 10,
    },
  });

  @property({
    aliasOf: 'sketch.view',
  })
  view!: esri.MapView;

  @property()
  offsetProjectionWkid = 26910;

  @property({
    aliasOf: 'sketch.layer',
  })
  protected layer!: esri.GraphicsLayer;

  @property()
  protected layers = new GroupLayer({
    listMode: 'hide',
  });

  @property()
  protected text = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  protected point = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  protected polyline = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  protected polygon = new GraphicsLayer({
    listMode: 'hide',
  });

  @property()
  private _isText = false;

  @property()
  private _textInput!: HTMLCalciteInputElement;

  @property()
  protected units = new UnitsViewModel();

  @property()
  private _bufferDistance!: HTMLCalciteInputElement;

  @property()
  private _offsetDistance!: HTMLCalciteInputElement;

  @property()
  private _offsetSides!: HTMLCalciteSelectElement;

  @property()
  pouchdbVersion = '7.2.1';

  @property()
  private _projectsDbLoadCount = 0;

  @property()
  private _projectsDb!: PouchDB.Database;

  @property()
  private _projects: Collection<cov.MarkupProject> = new Collection();

  @property()
  private _projectsCurrentId: string | null = null;

  @property()
  private _projectsCreateTitle!: HTMLCalciteInputElement;

  @property()
  private _projectsCreateDescription!: HTMLCalciteInputElement;

  @property()
  private _projectsAlert!: HTMLCalciteAlertElement;

  @property()
  private _projectsAlertMessage!: string;

  constructor(properties: cov.MarkupProperties) {
    super(properties);
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/pouchdb@${this.pouchdbVersion}/dist/pouchdb.min.js`;
    document.body.append(script);
  }

  async postInitialize(): Promise<void> {
    const {
      view,
      view: { map },
      layer,
      layers,
      text,
      point,
      polyline,
      polygon,
      sketch,
    } = this;

    // serviceable view
    await view.when();

    // add layers
    map.add(layer);
    layers.addMany([polygon, polyline, point, text]);
    map.add(layers);

    // setup sketch
    sketch.on('create', this._markupCreateEvent.bind(this));
    sketch.on('update', this._markupUpdateEvent.bind(this));
    sketch.snappingOptions.featureEnabled = true;
    sketch.snappingOptions.selfEnabled = false;
    map.allLayers.forEach((_layer: esri.Layer) => {
      const { type } = _layer;
      if (
        type === 'feature' ||
        type === 'graphics' ||
        type === 'geojson' ||
        (type === 'csv' && _layer.listMode !== 'hide' && _layer.title)
      ) {
        sketch.snappingOptions.featureSources.add(
          new FeatureSnappingLayerSource({
            //@ts-ignore
            layer: _layer,
          }),
        );
      }
    });
    layers.layers.forEach((_layer: esri.Layer) => {
      sketch.snappingOptions.featureSources.add(
        new FeatureSnappingLayerSource({
          //@ts-ignore
          layer: _layer,
        }),
      );
    });

    watch(map, 'allLayers.length', () => {
      // add new layers as snapping sources
      map.allLayers.forEach((_layer: esri.Layer) => {
        const { type } = _layer;
        const isSource = sketch.snappingOptions.featureSources.find(
          (source: esri.FeatureSnappingLayerSource): boolean => {
            return source.layer === _layer;
          },
        );

        if (isSource) return;

        if (
          type === 'feature' ||
          type === 'graphics' ||
          type === 'geojson' ||
          (type === 'csv' && _layer.listMode !== 'hide' && _layer.title)
        ) {
          sketch.snappingOptions.featureSources.add(
            new FeatureSnappingLayerSource({
              //@ts-ignore
              layer: _layer,
            }),
          );
        }
      });

      // always on top
      map.layers.reorder(layers, map.layers.length - 1);
    });

    // load projection
    projection.load();

    // load projects
    whenOnce(this, '_projectsDb', this._initProjects.bind(this));
    this._initProjectsDB();
  }

  /**
   * Begin marking up.
   * @param tool geometry type to create (no multi-point support)
   */
  markup(tool: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle', text?: boolean): void {
    const {
      view: { popup },
      sketch,
    } = this;
    popup.close();

    this._isText = text === true;

    sketch.create(tool);
  }

  /**
   * Add a feature to markup.
   * @param graphic
   */
  addFeature(graphic: esri.Graphic): void {
    const { view } = this;
    const { geometry, attributes, layer } = graphic;

    if (geometry) {
      this._addGraphic(graphic);
      return;
    }

    if (!geometry && layer && layer.type === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          returnGeometry: true,
          outSpatialReference: view.spatialReference,
          objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
        })
        .then((result: esri.FeatureSet) => {
          this._addGraphic(result.features[0]);
        });
    }
  }

  /**
   * Is a graphic markup graphic or not.
   */
  private _isMarkup(graphic: Graphic): boolean {
    if (!graphic) return false;
    const { layer } = graphic;
    const { text, point, polyline, polygon } = this;
    return layer === text || layer === point || layer === polyline || layer === polygon ? true : false;
  }

  /**
   * Add symbol and popup to graphic and add to appropriate layer when sketch complete.
   */
  private _markupCreateEvent(createEvent: esri.SketchViewModelCreateEvent): void {
    const { state, graphic } = createEvent;
    if (state === 'cancel' || !graphic) {
      this._isText = false;
      return;
    }
    if (state !== 'complete') return;
    this._addGraphic(graphic);
  }

  /**
   * Adds any point, polyline or polygon to corresponding layer.
   * @param graphic
   */
  private _addGraphic(graphic: esri.Graphic): void {
    const {
      layer,
      sketch,
      text,
      textSymbol,
      _isText,
      _textInput: { value },
    } = this;
    const type = graphic.geometry.type as 'point' | 'polyline' | 'polygon';

    if (graphic.layer && graphic.layer === layer) layer.remove(graphic);

    graphic = new Graphic({
      geometry: graphic.geometry,
    });

    if (_isText) {
      graphic.symbol = textSymbol.clone();
      (graphic.symbol as esri.TextSymbol).text = value || 'New Text';
    }

    if (!graphic.symbol) {
      graphic.symbol = (
        sketch[`${type}Symbol` as 'pointSymbol' | 'polylineSymbol' | 'polygonSymbol'] as
          | esri.SimpleMarkerSymbol
          | esri.SimpleLineSymbol
          | esri.SimpleFillSymbol
      ).clone();
    }

    graphic.popupTemplate = new PopupTemplate({
      title: `Markup ${graphic.symbol.type === 'text' ? 'text' : type}`,
      content: [
        new CustomContent({
          creator: (): esri.Widget => {
            return new SimpleSymbolEditor({
              graphic,
            });
          },
        }),
      ],
    });

    if (_isText) {
      text.add(graphic);
    } else {
      this[type].add(graphic);
    }

    this._isText = false;
    this._textInput.value = 'New Text';
  }

  /**
   * Remove edit graphic from sketch layer and add to appropriate layer when update complete.
   */
  private _markupUpdateEvent(updateEvent: esri.SketchViewModelUpdateEvent): void {
    const { state, graphics } = updateEvent;
    const {
      sketch: { layer },
    } = this;
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
      sketch,
      sketch: { layer },
    } = this;
    graphic = graphic || popup.selectedFeature;
    if (!graphic || !this._isMarkup(graphic)) return;
    popup.close();
    (graphic.layer as GraphicsLayer).remove(graphic);
    layer.add(graphic);
    sketch.update(graphic);
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

  /**
   * Convert point symbol to text symbol.
   * @param graphic
   */
  private _pointToText(graphic: esri.Graphic): void {
    const {
      view: { popup },
      textSymbol,
      text,
    } = this;
    const {
      geometry: { type },
    } = graphic;
    if (type !== 'point') return;

    popup.close();

    (graphic.layer as esri.GraphicsLayer).remove(graphic);

    graphic.symbol = textSymbol.clone();

    text.add(graphic);

    popup.clear();
    popup.open({
      features: [graphic],
    });
  }

  /**
   * Buffer a feature and add to markup.
   * @param graphic
   */
  private _buffer(graphic: esri.Graphic): void {
    const { geometry, attributes, layer } = graphic;
    const {
      view,
      units: { lengthUnit },
      _bufferDistance,
    } = this;
    const distance = parseInt(_bufferDistance.value as string);

    if (geometry && geometry.spatialReference.wkid === view.spatialReference.wkid) {
      this._addGraphic(
        new Graphic({
          geometry: geodesicBuffer(geometry, distance, lengthUnit) as esri.Geometry,
        }),
      );
      return;
    }

    if (!geometry && layer && layer.type === 'feature') {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          returnGeometry: true,
          outSpatialReference: view.spatialReference,
          objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
        })
        .then((results: esri.FeatureSet) => {
          this._addGraphic(
            new Graphic({
              geometry: geodesicBuffer(results.features[0].geometry, distance, lengthUnit) as esri.Geometry,
            }),
          );
        });
    }
  }

  /**
   * Offset a polyline
   * @param feature
   * @param event
   */
  private _offset(graphic: esri.Graphic): void {
    const { geometry, attributes, layer } = graphic;
    const {
      view,
      units: { lengthUnit },
      offsetProjectionWkid,
      _offsetDistance,
      _offsetSides,
    } = this;
    const distance = parseInt(_offsetDistance.value as string);

    const sides = _offsetSides.selectedOption.value;

    if (geometry && geometry.spatialReference.wkid === view.spatialReference.wkid) {
      const projected = projection.project(
        geometry,
        new SpatialReference({
          wkid: offsetProjectionWkid,
        }),
      );

      if (sides === 'both' || sides === 'right') {
        this._addGraphic(
          new Graphic({
            geometry: projection.project(
              offset(projected, distance, lengthUnit, 'miter') as esri.Geometry,
              view.spatialReference,
            ) as esri.Geometry,
          }),
        );
      }

      if (sides === 'both' || sides === 'left') {
        this._addGraphic(
          new Graphic({
            geometry: projection.project(
              offset(projected, distance * -1, lengthUnit, 'miter') as esri.Geometry,
              view.spatialReference,
            ) as esri.Geometry,
          }),
        );
      }
      return;
    }

    // needs work
    // if (!geometry && layer && layer.type === 'feature') {
    //   (layer as esri.FeatureLayer)
    //     .queryFeatures({
    //       returnGeometry: true,
    //       outSpatialReference: new SpatialReference({
    //         wkid: offsetProjectionWkid,
    //       }),
    //       objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
    //     })
    //     .then((results: esri.FeatureSet) => {
    //       this._addGraphic(
    //         new Graphic({
    //           geometry: projection.project(results.features[0].geometry, view.spatialReference) as esri.Geometry,
    //         }),
    //       );
    //       this._addGraphic(
    //         new Graphic({
    //           geometry: projection.project(results.features[0].geometry, view.spatialReference) as esri.Geometry,
    //         }),
    //       );
    //     });
    // }
  }

  /**
   * Add vertices to polyline or polygon.
   * @param feature
   */
  private _addVertices(feature: esri.Graphic): void {
    const { view } = this;
    const { layer, geometry, attributes } = feature;

    if (
      geometry &&
      (geometry.type === 'polyline' || geometry.type === 'polygon') &&
      geometry.spatialReference.wkid === view.spatialReference.wkid
    ) {
      this._addVerticesGetVertices(geometry as esri.Polyline | esri.Polygon);
    }

    if (
      !geometry &&
      layer &&
      layer.type === 'feature' &&
      ((layer as esri.FeatureLayer).geometryType === 'polyline' ||
        (layer as esri.FeatureLayer).geometryType === 'polygon')
    ) {
      (layer as esri.FeatureLayer)
        .queryFeatures({
          returnGeometry: true,
          outSpatialReference: view.spatialReference,
          objectIds: [attributes[(layer as esri.FeatureLayer).objectIdField]],
        })
        .then((results: esri.FeatureSet) => {
          this._addVerticesGetVertices(results.features[0].geometry as esri.Polyline | esri.Polygon);
        });
    }
  }

  /**
   * Paths and rings to each vertex.
   * @param geometry
   */
  private _addVerticesGetVertices(geometry: esri.Polyline | esri.Polygon): void {
    if (geometry.type === 'polyline') {
      (geometry as esri.Polyline).paths.forEach((path: number[][]) => {
        path.forEach(this._addVerticesGraphics.bind(this));
      });
    }
    if (geometry.type === 'polygon') {
      (geometry as esri.Polygon).rings.forEach((ring: number[][]) => {
        ring.forEach((vertex: number[], index: number) => {
          if (index + 1 < ring.length) {
            this._addVerticesGraphics(vertex);
          }
        });
      });
    }
  }

  /**
   * Add vertex graphic.
   * @param vertex
   */
  private _addVerticesGraphics(vertex: number[]): void {
    const { view } = this;
    const [x, y] = vertex;
    this._addGraphic(
      new Graphic({
        geometry: new Point({
          x,
          y,
          spatialReference: view.spatialReference,
        }),
      }),
    );
  }

  /**
   * Show projects alert.
   * @param color
   * @param message
   */
  private _projectsAlertShow(color: 'blue' | 'green' | 'yellow' | 'red', message: string) {
    const { _projectsAlert } = this;
    this._projectsAlertMessage = message;
    _projectsAlert.color = color;
    _projectsAlert.active = true;
    setTimeout(() => (_projectsAlert.active = false), 3000);
  }

  /**
   * Initialize projects database.
   * @returns
   */
  private _initProjectsDB(): void {
    const { _projectsDb, _projectsDbLoadCount } = this;
    if (_projectsDb || _projectsDbLoadCount > 10) return;
    if (window.PouchDB) {
      this._projectsDb = new PouchDB(PROJECTS_DB_NAME);
    } else {
      this._projectsDbLoadCount++;
      setTimeout(this._initProjectsDB.bind(this), 500);
    }
  }

  /**
   * Initialize projects.
   */
  private _initProjects(): void {
    const { _projectsDb, _projects } = this;

    _projectsDb
      .allDocs({
        include_docs: true,
      })
      .then((results: PouchDB.Core.AllDocsResponse<any>) => {
        const projects: cov.MarkupProject[] = results.rows.map((row: any) => {
          return this._createProject(row.doc);
        });

        _projects.addMany(projects);

        _projects.sort((a: cov.MarkupProject, b: cov.MarkupProject): number => {
          return a.doc.updated > b.doc.updated ? -1 : 1;
        });
      });
  }

  /**
   * Create project collection item.
   * @param doc
   * @returns
   */
  private _createProject(doc: cov.MarkupProject['doc']): cov.MarkupProject {
    const { _id: id, title, description } = doc;
    return {
      id,
      doc,
      listItem: (
        <calcite-pick-list-item key={KEY++} label={title} description={description}>
          <calcite-action
            slot="actions-end"
            icon="folder-open"
            onclick={this._loadProject.bind(this, id)}
          ></calcite-action>
          <calcite-action slot="actions-end" icon="trash" onclick={this._deleteProject.bind(this, id)}></calcite-action>
        </calcite-pick-list-item>
      ),
      activeListItem: (
        <calcite-pick-list-item key={KEY++} label={title} description={description}>
          <calcite-action slot="actions-end" icon="save" onclick={this._updateProject.bind(this, id)}></calcite-action>
          <calcite-action
            slot="actions-end"
            icon="x-circle"
            onclick={() => {
              this._clearProjectGraphics();
              this._projectsCurrentId = null;
            }}
          ></calcite-action>
        </calcite-pick-list-item>
      ),
    } as cov.MarkupProject;
  }

  /**
   * Create a new project.
   */
  private _newProject(): void {
    const { _projectsDb, _projects, _projectsCreateTitle, _projectsCreateDescription } = this;
    const time = new Date().getTime();

    _projectsDb
      .put({
        _id: time.toString(),
        created: time,
        updated: time,
        title: _projectsCreateTitle.value,
        description: _projectsCreateDescription.value || 'No description',
        ...this._getProjectGraphics(),
      })
      .then((result: PouchDB.Core.Response) => {
        if (result.ok) {
          _projectsDb.get(result.id).then((doc: PouchDB.Core.IdMeta & PouchDB.Core.GetMeta) => {
            _projects.add(this._createProject(doc as cov.MarkupProject['doc']));
            this._projectsCurrentId = doc._id;
            this._projectsAlertShow('green', 'Project created.');
          });
        }
      });
  }

  /**
   * Update a project.
   * @param id
   */
  private _updateProject(id: string): void {
    const { _projectsDb, _projects } = this;

    const project = _projects.find((item: cov.MarkupProject): boolean => {
      return item.id === id;
    });

    if (!project) return;

    const doc: cov.MarkupProject['doc'] = {
      ...project.doc,
      updated: new Date().getTime(),
      ...this._getProjectGraphics(),
    };

    _projectsDb.put(doc).then((result: PouchDB.Core.Response) => {
      if (result.ok) {
        _projectsDb.get(result.id).then((doc: PouchDB.Core.IdMeta & PouchDB.Core.GetMeta) => {
          project.doc = doc as cov.MarkupProject['doc'];
          this._projectsAlertShow('green', 'Project saved.');
        });
      }
    });
  }

  /**
   * Delete a project
   * @param id
   */
  private _deleteProject(id: string): void {
    const { _projectsDb, _projects } = this;
    const project = _projects.find((item: cov.MarkupProject): boolean => {
      return id === item.id;
    });

    _projectsDb.remove(project.doc).then((result: PouchDB.Core.Response) => {
      if (result.ok) {
        _projects.remove(project);
      }
    });
  }

  /**
   * Load a project.
   * @param id
   */
  private _loadProject(id: string): void {
    const { view, _projects } = this;
    const graphics: esri.Graphic[] = [];

    const project = _projects.find((item: cov.MarkupProject): boolean => {
      return item.id === id;
    });

    if (!project) return;

    this._clearProjectGraphics();

    project.doc.text.forEach((graphic: esri.GraphicProperties): void => {
      const _graphic = Graphic.fromJSON(graphic);
      graphics.push(_graphic);
      this._addGraphic(_graphic);
    });

    project.doc.point.forEach((graphic: esri.GraphicProperties): void => {
      const _graphic = Graphic.fromJSON(graphic);
      graphics.push(_graphic);
      this._addGraphic(_graphic);
    });

    project.doc.polyline.forEach((graphic: esri.GraphicProperties): void => {
      const _graphic = Graphic.fromJSON(graphic);
      graphics.push(_graphic);
      this._addGraphic(_graphic);
    });

    project.doc.polygon.forEach((graphic: esri.GraphicProperties): void => {
      const _graphic = Graphic.fromJSON(graphic);
      graphics.push(_graphic);
      this._addGraphic(_graphic);
    });

    this._projectsCurrentId = id;

    view.goTo(graphics);
  }

  /**
   * Get all markup graphics.
   * @returns
   */
  _getProjectGraphics(): any {
    const { text, point, polyline, polygon } = this;
    return {
      text: text.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      point: point.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      polyline: polyline.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
      polygon: polygon.graphics.toArray().map((graphic: esri.Graphic) => {
        return graphic.toJSON();
      }),
    };
  }

  /**
   * Clear all project graphics.
   */
  private _clearProjectGraphics(): void {
    const { text, point, polyline, polygon } = this;

    text.removeAll();
    point.removeAll();
    polyline.removeAll();
    polygon.removeAll();
  }

  render(): tsx.JSX.Element {
    const {
      id,
      view: {
        popup: { visible, selectedFeature },
      },
      snappingEnabled,
      units,
      _projects,
      _projectsAlertMessage,
    } = this;

    const isMarkup = visible && this._isMarkup(selectedFeature);

    const isFeature = visible && selectedFeature && !this._isMarkup(selectedFeature);

    const isMarkupOrFeature = visible && selectedFeature;

    const isPoint =
      (visible && selectedFeature?.geometry?.type === 'point') ||
      (selectedFeature?.layer &&
        selectedFeature.layer.type === 'feature' &&
        (selectedFeature.layer as esri.FeatureLayer).geometryType === 'point');

    const isPolyline =
      (visible && selectedFeature?.geometry?.type === 'polyline') ||
      (selectedFeature?.layer &&
        selectedFeature.layer.type === 'feature' &&
        (selectedFeature.layer as esri.FeatureLayer).geometryType === 'polyline');

    // const isPolygon =
    //   (visible && selectedFeature?.geometry?.type === 'polygon') ||
    //   (selectedFeature?.layer &&
    //     selectedFeature.layer.type === 'feature' &&
    //     (selectedFeature.layer as esri.FeatureLayer).geometryType === 'polygon');

    const isText = selectedFeature?.symbol?.type === 'text';

    return (
      <div class={CSS.base}>
        <calcite-tabs layout="center">
          <calcite-tab-nav slot="tab-nav">
            <calcite-tab-title active="">
              <calcite-icon scale="s" icon="pencil"></calcite-icon>
            </calcite-tab-title>
            <calcite-tab-title>
              <calcite-icon scale="s" icon="wrench"></calcite-icon>
            </calcite-tab-title>
            <calcite-tab-title>
              <calcite-icon scale="s" icon="save"></calcite-icon>
            </calcite-tab-title>
          </calcite-tab-nav>

          {/* markup tab */}
          <calcite-tab active="">
            <div class={CSS.heading}>Create</div>
            <div class={CSS.buttonRow}>
              <calcite-button
                icon-start="point"
                title="Draw point"
                onclick={this.markup.bind(this, 'point')}
              ></calcite-button>
              <calcite-button
                icon-start="line"
                title="Draw polyline"
                onclick={this.markup.bind(this, 'polyline')}
              ></calcite-button>
              <calcite-button
                icon-start="polygon-vertices"
                title="Draw polygon"
                onclick={this.markup.bind(this, 'polygon')}
              ></calcite-button>
              <calcite-button
                icon-start="rectangle"
                title="Draw rectangle"
                onclick={this.markup.bind(this, 'rectangle')}
              ></calcite-button>
              <calcite-button
                icon-start="circle"
                title="Draw circle"
                onclick={this.markup.bind(this, 'circle')}
              ></calcite-button>
            </div>
            <div class={CSS.buttonRow}>
              <calcite-input
                type="text"
                placeholder="Text to add"
                value="New Text"
                afterCreate={storeNode.bind(this)}
                data-node-ref="_textInput"
              >
                <calcite-button
                  slot="action"
                  icon-start="text-large"
                  title="Draw text"
                  onclick={this.markup.bind(this, 'point', true)}
                ></calcite-button>
              </calcite-input>
            </div>
            <calcite-label layout="inline" alignment="end">
              <calcite-checkbox
                checked={snappingEnabled}
                onclick={() => (this.snappingEnabled = !this.snappingEnabled)}
              ></calcite-checkbox>
              Enable snapping
            </calcite-label>
            <div class={CSS.heading}>Edit</div>
            <div class={CSS.buttonRow}>
              <calcite-button
                icon-start="pencil"
                title="Edit selected"
                disabled={!isMarkup}
                onclick={this._editMarkupGraphic.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="trash"
                title="Delete selected"
                disabled={!isMarkup}
                onclick={this._deleteMarkupGraphic.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="chevron-up"
                title="Move selected up"
                disabled={!isMarkup}
                onclick={this._moveMarkupGraphicUp.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="chevron-down"
                title="Move selected down"
                disabled={!isMarkup}
                onclick={this._moveMarkupGraphicDown.bind(this, selectedFeature)}
              ></calcite-button>
            </div>
            <div class={CSS.heading}>Tools</div>
            <div class={CSS.buttonRow}>
              <calcite-button
                icon-start="add-layer"
                title="Add selected"
                disabled={!isFeature}
                onclick={this.addFeature.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="add-text"
                title="Convert selected to text"
                disabled={!(isMarkup && isPoint && !isText)}
                onclick={this._pointToText.bind(this, selectedFeature)}
              ></calcite-button>
              <calcite-button
                icon-start="vertex-plus"
                title="Add vertices points to selected"
                disabled={!(isMarkupOrFeature && !isPoint)}
                onclick={this._addVertices.bind(this, selectedFeature)}
              ></calcite-button>
            </div>
          </calcite-tab>

          {/* tools tab */}
          <calcite-tab>
            <div style={`display: ${!isMarkupOrFeature ? 'block' : 'none'};`}>
              Select a markup graphic or feature in the map.
            </div>

            <div style={`display: ${isMarkupOrFeature ? 'block' : 'none'};`}>
              <div class={CSS.heading}>Buffer</div>
              <div class={CSS.inputRow}>
                <calcite-label>
                  Distance
                  <calcite-input
                    type="number"
                    min="5"
                    step="1"
                    value="250"
                    afterCreate={storeNode.bind(this)}
                    data-node-ref="_bufferDistance"
                  ></calcite-input>
                </calcite-label>
                <calcite-label>
                  Unit
                  {units.calciteLengthSelect()}
                </calcite-label>
              </div>
              <calcite-button width="full" icon-start="rings" onclick={this._buffer.bind(this, selectedFeature)}>
                Buffer
              </calcite-button>
            </div>

            <div style={`display: ${isMarkupOrFeature && isPolyline ? 'block' : 'none'}; margin-top: 0.75rem;`}>
              <div class={CSS.heading}>Offset</div>
              <div class={CSS.inputRow}>
                <calcite-label>
                  Distance
                  <calcite-input
                    type="number"
                    min="5"
                    step="1"
                    value="30"
                    afterCreate={storeNode.bind(this)}
                    data-node-ref="_offsetDistance"
                  ></calcite-input>
                </calcite-label>
                <calcite-label>
                  Unit
                  {units.calciteLengthSelect()}
                </calcite-label>
              </div>
              <div class={CSS.inputRow}>
                <calcite-label>
                  Sides
                  <calcite-select afterCreate={storeNode.bind(this)} data-node-ref="_offsetSides">
                    <calcite-option value="both">Both</calcite-option>
                    <calcite-option value="right">Right</calcite-option>
                    <calcite-option value="left">Left</calcite-option>
                  </calcite-select>
                </calcite-label>
                <calcite-label></calcite-label>
              </div>
              <calcite-button width="full" icon-start="hamburger" onclick={this._offset.bind(this, selectedFeature)}>
                Offset
              </calcite-button>
            </div>
          </calcite-tab>

          {/* projects tab */}
          <calcite-tab>
            <div class={CSS.heading}>
              <div>Projects</div>
              <calcite-popover-manager>
                <calcite-popover
                  id={`markup_new_project_popover_${id}`}
                  reference-element={`markup_new_project_${id}`}
                  overlay-positioning="fixed"
                  placement="leading-start"
                >
                  <div class={CSS.popupContent}>
                    <div class={CSS.popupHeading}>New Project</div>
                    <calcite-label>
                      Title
                      <calcite-input
                        type="text"
                        required=""
                        value="My project"
                        afterCreate={storeNode.bind(this)}
                        data-node-ref="_projectsCreateTitle"
                      ></calcite-input>
                    </calcite-label>
                    <calcite-label>
                      Description
                      <calcite-input
                        type="textarea"
                        placeholder="optional"
                        afterCreate={storeNode.bind(this)}
                        data-node-ref="_projectsCreateDescription"
                      ></calcite-input>
                    </calcite-label>
                    <calcite-button
                      width="half"
                      appearance="outline"
                      onclick={() => {
                        (
                          document.getElementById(`markup_new_project_popover_${id}`) as HTMLCalcitePopoverElement
                        ).toggle();
                      }}
                    >
                      Cancel
                    </calcite-button>
                    <calcite-button
                      width="half"
                      icon-start="save"
                      onclick={() => {
                        this._newProject();
                        (
                          document.getElementById(`markup_new_project_popover_${id}`) as HTMLCalcitePopoverElement
                        ).toggle();
                      }}
                    >
                      Save
                    </calcite-button>
                  </div>
                </calcite-popover>
                <calcite-button id={`markup_new_project_${id}`} scale="s" width="auto" icon-start="plus">
                  New
                </calcite-button>
              </calcite-popover-manager>
            </div>
            {_projects.toArray().map((project: cov.MarkupProject): tsx.JSX.Element | undefined => {
              return project.id !== this._projectsCurrentId ? project.listItem : project.activeListItem;
            })}
          </calcite-tab>
        </calcite-tabs>

        <calcite-alert afterCreate={storeNode.bind(this)} data-node-ref="_projectsAlert">
          <div slot="message">{_projectsAlertMessage}</div>
        </calcite-alert>
      </div>
    );
  }
}
