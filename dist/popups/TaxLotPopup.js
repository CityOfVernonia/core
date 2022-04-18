import FeaturePopup from './FeaturePopup';
export default new FeaturePopup({
    title: '{TAXLOT_ID}',
    returnGeometry: true,
    displayInfos: [
        {
            fieldName: 'TAXLOT_ID',
            label: 'Tax Lot',
            formatter: (value) => {
                return `<calcite-link href="https://www.vernonia-or.gov/tax-lot/${value}/" target="_blank">${value}</calcite-link>`;
            },
        },
        {
            fieldName: 'TAXMAP',
            label: 'Tax Map',
            formatter: (value) => {
                return `<calcite-link href="https://gis.columbiacountymaps.com/TaxMaps/${value}.pdf" target="_blank">${value}</calcite-link>`;
            },
        },
        {
            fieldName: 'OWNER',
            label: 'Owner',
        },
        {
            fieldName: 'ADDRESS',
            label: 'Address (Primary Situs)',
            omitNull: true,
        },
        {
            fieldName: 'ACRES',
            label: 'Tax Map',
            formatter: (value, fieldName, graphic) => {
                return `${value.toLocaleString()} acres&nbsp;&nbsp;${graphic.attributes.SQ_FEET.toLocaleString()} sq ft`;
            },
        },
        {
            fieldName: 'ACCOUNT_IDS',
            label: 'Tax Account(s)',
            formatter: (value) => {
                if (!value)
                    return 'No related tax accounts';
                return value
                    .split(',')
                    .map((id) => {
                    return `<calcite-link href="https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${id}&QueryYear=2022&Roll=R" target="_blank">${id}</calcite-link>`;
                })
                    .join('&nbsp;&nbsp;');
            },
        },
    ],
});
