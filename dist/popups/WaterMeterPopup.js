import FeaturePopup from './FeaturePopup';
export default new FeaturePopup({
    title: '{WSC_ID} - {ADDRESS}',
    returnGeometry: true,
    displayInfos: [
        {
            fieldName: 'WSC_TYPE',
            label: 'Service Type',
        },
        {
            fieldName: 'ACCT_TYPE',
            label: 'Account Type',
            formatter: (value, fieldName, graphic, domain) => {
                return domain.codedValues.filter((codedValue) => {
                    return codedValue.code === value;
                })[0].name;
            },
        },
        {
            fieldName: 'METER_SIZE_T',
            label: 'Meter Size',
            suffix: '"',
        },
        {
            fieldName: 'METER_SN',
            label: 'Serial No.',
        },
        {
            fieldName: 'METER_REG_SN',
            label: 'Register No.',
            omitNull: true,
        },
        {
            fieldName: 'METER_AGE',
            label: 'Meter Age',
            suffix: ' years',
        },
    ],
});
