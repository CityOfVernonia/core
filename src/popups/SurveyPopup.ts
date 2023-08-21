//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import PopupTemplate from '@arcgis/core/PopupTemplate';

/**
 * Vernonia survey popup.
 */
export default new PopupTemplate({
  outFields: ['*'],
  title: (event: { graphic: esri.Graphic }): string => {
    const {
      graphic: {
        attributes: { Subdivision, SurveyId },
      },
    } = event;
    return Subdivision ? Subdivision : SurveyId;
  },
  content: (event: { graphic: esri.Graphic }): HTMLElement => {
    const { SurveyType, SurveyId, SurveyDate, FileDate, Comments, Sheets, Subdivision, Client, Firm, SurveyUrl } =
      event.graphic.attributes;
    const el = new DOMParser().parseFromString(
      `<table class="esri-widget__table">
        <tr>
          <th>Id</th>
          <td>
            <calcite-link href="${SurveyUrl}" target="_blank">${SurveyId} - View PDF</calcite-link>
          </td>
        </tr>
        <tr>
          <th>Type</th>
          <td>${SurveyType}</td>
        </tr>
        <tr style="${Subdivision ? '' : 'display: none;'}">
          <th>Name</th>
          <td>${Subdivision}</td>
        </tr>
        <tr>
          <th>Client</th>
          <td>${Client}</td>
        </tr>
        <tr>
          <th>Firm</th>
          <td>${Firm}</td>
        </tr>
        <tr>
          <th>Date</th>
          <td>${SurveyDate}</td>
        </tr>
        <tr>
          <th>Filed</th>
          <td>${FileDate}</td>
        </tr>
        <tr>
          <th>Comments</th>
          <td>${Comments}</td>
        </tr>
        <tr>
          <th>Pages</th>
          <td>${Sheets}</td>
        </tr>
      </table>`,
      'text/html',
    );
    return el.body.firstChild as HTMLTableElement;
  },
});
