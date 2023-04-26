import PopupTemplate from '@arcgis/core/PopupTemplate';
export default new PopupTemplate({
    title: '{TAXLOT_ID}',
    content: (event) => {
        const { TAXLOT_ID, ACCOUNT_IDS, TAXMAP, ADDRESS, OWNER, ACRES, SQ_FEET } = event.graphic.attributes;
        const address = ADDRESS
            ? `
        <tr>
          <th>Address (Primary Situs)</th>
          <td>${ADDRESS}</td>
        </tr>
      `
            : '';
        const accounts = ACCOUNT_IDS.split(',').map((account) => {
            return `
          <calcite-link href="https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${account}&QueryYear=2023&Roll=R" target="_blank">${account}</calcite-link>
        `;
        });
        const el = new DOMParser().parseFromString(`<table class="esri-widget__table">
          <tr>
            <th>Tax lot</th>
            <td>
            <calcite-link href="https://vernonia-tax-lot.netlify.app/${TAXLOT_ID}/" target="_blank">${TAXLOT_ID}</calcite-link>
            </td>
          </tr>
          <tr>
            <th>Tax map</th>
            <td>
              <calcite-link href="https://gis.columbiacountymaps.com/TaxMaps/${TAXMAP}.pdf" target="_blank">${TAXMAP}</calcite-link>
            </td>
          </tr>
          <tr>
            <th>Owner</th>
            <td>${OWNER}</td>
          </tr>
          ${address}
          <tr>
            <th>Area</th>
            <td>${ACRES} acres&nbsp;&nbsp;${SQ_FEET.toLocaleString()} sq ft</td>
          </tr>
          <tr>
            <th>Tax account(s)</th>
            <td>
              ${accounts.join('&nbsp;')}
            </td>
          </tr>
        </table>`, 'text/html');
        return el.body.firstChild;
    },
});
