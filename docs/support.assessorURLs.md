# Module: support/assessorURLs

## Table of contents

### Functions

- [propertyInfoUrl](../wiki/support.assessorURLs#propertyinfourl)
- [taxMapUrl](../wiki/support.assessorURLs#taxmapurl)

## Functions

### propertyInfoUrl

▸ **propertyInfoUrl**(`accountId`, `year`): `string`

Create property info URL.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountId` | `string` \| `number` | number \| string representing tax account number |
| `year` | `number` | number tax account year in YYYY format |

#### Returns

`string`

property info url string

#### Defined in

src/support/assessorURLs.ts:7

___

### taxMapUrl

▸ **taxMapUrl**(`mapId`): `string`

Create tax map url.

#### Parameters

| Name | Type |
| :------ | :------ |
| `mapId` | `string` |

#### Returns

`string`

tax map url string

#### Defined in

src/support/assessorURLs.ts:17
