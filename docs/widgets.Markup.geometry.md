# Module: widgets/Markup/geometry

## Table of contents

### Functions

- [buffer](../wiki/widgets.Markup.geometry#buffer)
- [numberOfVertices](../wiki/widgets.Markup.geometry#numberofvertices)
- [offset](../wiki/widgets.Markup.geometry#offset)
- [polygonVertices](../wiki/widgets.Markup.geometry#polygonvertices)
- [polylineVertices](../wiki/widgets.Markup.geometry#polylinevertices)
- [queryFeatureGeometry](../wiki/widgets.Markup.geometry#queryfeaturegeometry)

## Functions

### buffer

▸ **buffer**(`geometry`, `distance`, `unit`): `Geometry`

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Geometry` |
| `distance` | `number` |
| `unit` | `LinearUnits` |

#### Returns

`Geometry`

#### Defined in

[src/widgets/Markup/geometry.ts:70](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L70)

___

### numberOfVertices

▸ **numberOfVertices**(`geometry`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polygon` \| `Polyline` |

#### Returns

`number`

#### Defined in

[src/widgets/Markup/geometry.ts:26](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L26)

___

### offset

▸ **offset**(`geometry`, `distance`, `unit`, `direction`, `offsetProjectionWkid`, `spatialReference`): `Promise`<`Polyline`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polyline` |
| `distance` | `number` |
| `unit` | `LinearUnits` |
| `direction` | ``"both"`` \| ``"left"`` \| ``"right"`` |
| `offsetProjectionWkid` | `number` |
| `spatialReference` | `SpatialReference` |

#### Returns

`Promise`<`Polyline`[]\>

#### Defined in

[src/widgets/Markup/geometry.ts:74](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L74)

___

### polygonVertices

▸ **polygonVertices**(`polygon`, `spatialReference`): `Point`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `polygon` | `Polygon` |
| `spatialReference` | `SpatialReference` |

#### Returns

`Point`[]

#### Defined in

[src/widgets/Markup/geometry.ts:58](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L58)

___

### polylineVertices

▸ **polylineVertices**(`polyline`, `spatialReference`): `Point`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `polyline` | `Polyline` |
| `spatialReference` | `SpatialReference` |

#### Returns

`Point`[]

#### Defined in

[src/widgets/Markup/geometry.ts:48](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L48)

___

### queryFeatureGeometry

▸ **queryFeatureGeometry**(`options`): `Promise`<`Geometry`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.graphic` | `Graphic` |
| `options.layer` | `FeatureLayer` |
| `options.outSpatialReference?` | `SpatialReference` |

#### Returns

`Promise`<`Geometry`\>

#### Defined in

[src/widgets/Markup/geometry.ts:6](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/geometry.ts#L6)
