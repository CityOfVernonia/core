/**
 * Create property info URL.
 * @param accountId number | string representing tax account number
 * @param year number tax account year in YYYY format
 * @returns property info url string
 */
export declare const propertyInfoUrl: (accountId: number | string, year: number) => string;
/**
 * Create tax map url.
 * @param mapId
 * @param fileType
 * @returns tax map url string
 */
export declare const taxMapUrl: (mapId: string, fileType?: "pdf" | "tiff" | undefined) => string;
