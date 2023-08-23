# Interface: AddPortalLayerInfo

[widgets/Layers](../wiki/widgets.Layers).AddPortalLayerInfo

Info to add layer via a portal item id.

## Hierarchy

- `AddLayerInfo`

  ↳ **`AddPortalLayerInfo`**

## Table of contents

### Properties

- [add](../wiki/widgets.Layers.AddPortalLayerInfo#add)
- [id](../wiki/widgets.Layers.AddPortalLayerInfo#id)
- [index](../wiki/widgets.Layers.AddPortalLayerInfo#index)
- [layerProperties](../wiki/widgets.Layers.AddPortalLayerInfo#layerproperties)
- [snippet](../wiki/widgets.Layers.AddPortalLayerInfo#snippet)
- [title](../wiki/widgets.Layers.AddPortalLayerInfo#title)

## Properties

### add

• `Optional` **add**: (`layer`: `Layer`) => `void`

#### Type declaration

▸ (`layer`): `void`

Called when layer added.

##### Parameters

| Name | Type |
| :------ | :------ |
| `layer` | `Layer` |

##### Returns

`void`

#### Inherited from

AddLayerInfo.add

#### Defined in

[src/widgets/Layers.tsx:15](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L15)

___

### id

• **id**: `string`

Portal item id.
NOTE: loaded from default portal.

#### Defined in

[src/widgets/Layers.tsx:26](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L26)

___

### index

• `Optional` **index**: `number`

Layer index.

#### Inherited from

AddLayerInfo.index

#### Defined in

[src/widgets/Layers.tsx:7](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L7)

___

### layerProperties

• `Optional` **layerProperties**: `any`

Additional layer properties.

#### Inherited from

AddLayerInfo.layerProperties

#### Defined in

[src/widgets/Layers.tsx:11](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L11)

___

### snippet

• `Optional` **snippet**: `string`

Override portal item snippet.

#### Defined in

[src/widgets/Layers.tsx:34](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L34)

___

### title

• `Optional` **title**: `string`

Override portal item title.

#### Defined in

[src/widgets/Layers.tsx:30](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L30)
