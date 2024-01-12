//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { DateTime } from 'luxon';

const urlCheck = new RegExp(
  /https:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
);

/**
 * Basic popup of attributes.
 */
export default new PopupTemplate({
  outFields: ['*'],
  title: (event: { graphic: esri.Graphic }): string => {
    // @ts-expect-error not typed
    return event.graphic.layer ? event.graphic.layer.title : event.graphic.sourceLayer.title;
  },
  content: (event: { graphic: esri.Graphic }): HTMLElement => {
    const { graphic } = event;
    const layer =
      (graphic.layer as esri.FeatureLayer | esri.Sublayer | esri.GeoJSONLayer) ||
      // @ts-expect-error not typed
      (graphic.sourceLayer as esri.FeatureLayer | esri.Sublayer | esri.GeoJSONLayer);
    const rows: string[] = [];

    for (const attribute in graphic.attributes) {
      const { alias, name, type } = layer.fields.find((field: esri.Field): boolean => {
        return attribute === field.name;
      }) as esri.Field;

      if (
        type === 'blob' ||
        type === 'geometry' ||
        type === 'global-id' ||
        type === 'guid' ||
        type === 'oid' ||
        type === 'xml'
      ) {
        rows.push('');
      } else {
        let value = graphic.attributes[attribute];
        if (type === 'date') value = DateTime.fromMillis(value).toUTC().toLocaleString(DateTime.DATETIME_FULL);
        if (typeof value === 'string' && value.match(urlCheck))
          value = `<calcite-link href="${value}" target="_blank">View</calcite-link>`;
        rows.push(`<tr><th>${alias || name}</th><td>${value}</td></tr>`);
      }
    }

    const el = new DOMParser().parseFromString(
      `<table class="esri-widget__table">${rows.join('')}</table>`,
      'text/html',
    );
    return el.body.firstChild as HTMLTableElement;
  },
});
