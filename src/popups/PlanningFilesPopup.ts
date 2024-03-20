//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

//////////////////////////////////////
// Modules
//////////////////////////////////////
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { propertyInfoUrl } from './../support/assessorUtils';
import { DateTime } from 'luxon';

/**
 * Vernonia tax lot popup.
 */
const taxLotPopup = new PopupTemplate({
  outFields: ['*'],
  title: '{planning_file} - {status}',
  content: (event: { graphic: esri.Graphic }): HTMLElement => {
    const {
      // planning_file,
      received_date,
      // status,
      owner,
      applicant,
      address,
      tax_lot,
      tax_account,
      planning_type,
      related_files,
      notes,
    } = event.graphic.attributes;

    const account =
      tax_account !== 99999
        ? `<calcite-link href="${propertyInfoUrl(tax_account)}" target="_blank">${tax_account}</calcite-link>`
        : 'Unknown';

    const related = related_files
      ? `
      <tr>
        <th>Related</th>
        <td>${related_files}</td>
      </tr>
      `
      : '';

    const el = new DOMParser().parseFromString(
      `<table class="esri-widget__table">
          <tr>
            <th>Planning type</th>
            <td>${planning_type}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>${DateTime.fromMillis(received_date).toUTC().toLocaleString(DateTime.DATE_SHORT)}</td>
          </tr>
          <tr>
            <th>Owner</th>
            <td>${owner}</td>
          </tr>
          <tr>
            <th>Applicant</th>
            <td>${applicant}</td>
          </tr>
          <tr>
            <th>Address</th>
            <td>${address}</td>
          </tr>
          <tr>
            <th>Tax lot</th>
            <td>${tax_lot}</td>
          </tr>
          <tr>
            <th>Tax account</th>
            <td>${account}</td>
          </tr>
          ${related}
          <tr>
            <th>Notes</th>
            <td>${notes}</td>
          </tr>
        </table>`,
      'text/html',
    );
    return el.body.firstChild as HTMLTableElement;
  },
});

export default taxLotPopup;
