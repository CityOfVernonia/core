# Module: support/georeferencedImage

## Table of contents

### Functions

- [auxiliaryXmlToControlPoints](../wiki/support.georeferencedImage#auxiliaryxmltocontrolpoints)
- [clearControlPoints](../wiki/support.georeferencedImage#clearcontrolpoints)
- [default](../wiki/support.georeferencedImage#default)
- [displayControlPoints](../wiki/support.georeferencedImage#displaycontrolpoints)

## Functions

### auxiliaryXmlToControlPoints

▸ **auxiliaryXmlToControlPoints**(`url`): `Promise`<{ `controlPoints`: `ControlPoint`[] ; `spatialReference`: `SpatialReference`  }\>

Parse auxiliary XML file for georeference information.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | URL of `*.aux.xml` file with georeference information |

#### Returns

`Promise`<{ `controlPoints`: `ControlPoint`[] ; `spatialReference`: `SpatialReference`  }\>

Object with array of control points and associated spatial reference

#### Defined in

[src/support/georeferencedImage.ts:69](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/georeferencedImage.ts#L69)

___

### clearControlPoints

▸ **clearControlPoints**(`view`): `void`

Clear displayed media layer control points.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `view` | `MapView` | View with media layer control points display in |

#### Returns

`void`

#### Defined in

[src/support/georeferencedImage.ts:203](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/georeferencedImage.ts#L203)

___

### default

▸ **default**(`url`, `mediaLayerProperties?`): `Promise`<`MediaLayer`\>

Create image media layer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | URL of source image for MediaLayer (must have associated `*.aux.xml` file at same location) |
| `mediaLayerProperties?` | `MediaLayerProperties` | Optional MediaLayerProperties for the MediaLayer |

#### Returns

`Promise`<`MediaLayer`\>

Promise resolving the MediaLayer

#### Defined in

[src/support/georeferencedImage.ts:137](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/georeferencedImage.ts#L137)

___

### displayControlPoints

▸ **displayControlPoints**(`mediaLayer`, `view`): `void`

Display media layer control points.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `mediaLayer` | `MediaLayer` | Media layer of interest |
| `view` | `MapView` | View to display points in |

#### Returns

`void`

#### Defined in

[src/support/georeferencedImage.ts:176](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/georeferencedImage.ts#L176)
