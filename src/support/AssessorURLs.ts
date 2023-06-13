/**
 * Create property info URL.
 * @param accountId number | string representing tax account number
 * @param year number tax account year in YYYY format
 * @returns property info url string
 */
export const propertyInfoUrl = (accountId: number | string, year: number): string => {
  return `https://propertyquery.columbiacountyor.gov/columbiaat/MainQueryDetails.aspx?AccountID=${accountId}&QueryYear=${year}&Roll=R`;
};

/**
 * Create tax map url.
 * @param mapId
 * @param fileType
 * @returns tax map url string
 */
export const taxMapUrl = (mapId: string): string => {
  return `https://gis.columbiacountymaps.com/TaxMaps/${mapId}.pdf`;
};
