# Class: default

[widgets/TaxMaps](../wiki/widgets.TaxMaps).default

A widget for displaying tax map image media layers.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.TaxMaps.default#constructor)

### Properties

- [\_imageLayerInfo](../wiki/widgets.TaxMaps.default#_imagelayerinfo)
- [\_imageLayerInfos](../wiki/widgets.TaxMaps.default#_imagelayerinfos)
- [\_loading](../wiki/widgets.TaxMaps.default#_loading)
- [\_opacity](../wiki/widgets.TaxMaps.default#_opacity)
- [\_options](../wiki/widgets.TaxMaps.default#_options)
- [container](../wiki/widgets.TaxMaps.default#container)
- [declaredClass](../wiki/widgets.TaxMaps.default#declaredclass)
- [destroyed](../wiki/widgets.TaxMaps.default#destroyed)
- [fileAttributeField](../wiki/widgets.TaxMaps.default#fileattributefield)
- [icon](../wiki/widgets.TaxMaps.default#icon)
- [id](../wiki/widgets.TaxMaps.default#id)
- [imageUrlTemplate](../wiki/widgets.TaxMaps.default#imageurltemplate)
- [initialized](../wiki/widgets.TaxMaps.default#initialized)
- [label](../wiki/widgets.TaxMaps.default#label)
- [layer](../wiki/widgets.TaxMaps.default#layer)
- [showSwitch](../wiki/widgets.TaxMaps.default#showswitch)
- [titleAttributeField](../wiki/widgets.TaxMaps.default#titleattributefield)
- [urlAttributeField](../wiki/widgets.TaxMaps.default#urlattributefield)
- [view](../wiki/widgets.TaxMaps.default#view)
- [visible](../wiki/widgets.TaxMaps.default#visible)

### Methods

- [\_get](../wiki/widgets.TaxMaps.default#_get)
- [\_load](../wiki/widgets.TaxMaps.default#_load)
- [\_selectAfterCreate](../wiki/widgets.TaxMaps.default#_selectaftercreate)
- [\_set](../wiki/widgets.TaxMaps.default#_set)
- [\_show](../wiki/widgets.TaxMaps.default#_show)
- [addHandles](../wiki/widgets.TaxMaps.default#addhandles)
- [classes](../wiki/widgets.TaxMaps.default#classes)
- [destroy](../wiki/widgets.TaxMaps.default#destroy)
- [emit](../wiki/widgets.TaxMaps.default#emit)
- [get](../wiki/widgets.TaxMaps.default#get)
- [hasEventListener](../wiki/widgets.TaxMaps.default#haseventlistener)
- [hasHandles](../wiki/widgets.TaxMaps.default#hashandles)
- [isFulfilled](../wiki/widgets.TaxMaps.default#isfulfilled)
- [isRejected](../wiki/widgets.TaxMaps.default#isrejected)
- [isResolved](../wiki/widgets.TaxMaps.default#isresolved)
- [notifyChange](../wiki/widgets.TaxMaps.default#notifychange)
- [on](../wiki/widgets.TaxMaps.default#on)
- [own](../wiki/widgets.TaxMaps.default#own)
- [postInitialize](../wiki/widgets.TaxMaps.default#postinitialize)
- [removeHandles](../wiki/widgets.TaxMaps.default#removehandles)
- [render](../wiki/widgets.TaxMaps.default#render)
- [renderNow](../wiki/widgets.TaxMaps.default#rendernow)
- [scheduleRender](../wiki/widgets.TaxMaps.default#schedulerender)
- [set](../wiki/widgets.TaxMaps.default#set)
- [watch](../wiki/widgets.TaxMaps.default#watch)
- [when](../wiki/widgets.TaxMaps.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `WidgetProperties` & { `fileAttributeField`: `string` ; `imageUrlTemplate`: `string` ; `layer`: `GeoJSONLayer` ; `showSwitch?`: `boolean` ; `titleAttributeField`: `string` ; `urlAttributeField`: `string` ; `view`: `MapView`  } |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/TaxMaps.tsx:52](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L52)

## Properties

### \_imageLayerInfo

• `Private` **\_imageLayerInfo**: ``null`` \| `ImageLayerInfo` = `null`

#### Defined in

[src/widgets/TaxMaps.tsx:187](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L187)

___

### \_imageLayerInfos

• `Private` **\_imageLayerInfos**: `ImageLayerInfo`[] = `[]`

#### Defined in

[src/widgets/TaxMaps.tsx:184](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L184)

___

### \_loading

• **\_loading**: `boolean` = `false`

#### Defined in

[src/widgets/TaxMaps.tsx:199](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L199)

___

### \_opacity

• `Private` **\_opacity**: `number` = `0.4`

#### Defined in

[src/widgets/TaxMaps.tsx:190](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L190)

___

### \_options

• `Private` **\_options**: `Element`[]

#### Defined in

[src/widgets/TaxMaps.tsx:192](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L192)

___

### container

• **container**: `string` \| `HTMLElement`

The ID or node representing the DOM element containing the widget.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#container)

#### Inherited from

Widget.container

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112184

___

### declaredClass

• **declaredClass**: `string`

#### Inherited from

Widget.declaredClass

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:18

___

### destroyed

• **destroyed**: `boolean`

#### Inherited from

Widget.destroyed

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:16

___

### fileAttributeField

• **fileAttributeField**: `string`

#### Defined in

[src/widgets/TaxMaps.tsx:173](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L173)

___

### icon

• **icon**: `string`

Icon which represents the widget.

**`Default`**

```ts
null

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#icon)
```

#### Inherited from

Widget.icon

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112192

___

### id

• **id**: `string`

The unique ID assigned to the widget when the widget is created.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#id)

#### Inherited from

Widget.id

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112198

___

### imageUrlTemplate

• **imageUrlTemplate**: `string`

#### Defined in

[src/widgets/TaxMaps.tsx:171](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L171)

___

### initialized

• **initialized**: `boolean`

#### Inherited from

Widget.initialized

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:17

___

### label

• **label**: `string`

The widget's label.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#label)

#### Inherited from

Widget.label

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112204

___

### layer

• **layer**: `GeoJSONLayer`

#### Defined in

[src/widgets/TaxMaps.tsx:169](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L169)

___

### showSwitch

• **showSwitch**: `boolean` = `true`

#### Defined in

[src/widgets/TaxMaps.tsx:179](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L179)

___

### titleAttributeField

• **titleAttributeField**: `string`

#### Defined in

[src/widgets/TaxMaps.tsx:175](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L175)

___

### urlAttributeField

• **urlAttributeField**: `string`

#### Defined in

[src/widgets/TaxMaps.tsx:177](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L177)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/TaxMaps.tsx:167](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L167)

___

### visible

• **visible**: `boolean`

Indicates whether the widget is visible.

**`Default`**

```ts
true

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#visible)
```

#### Inherited from

Widget.visible

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112212

## Methods

### \_get

▸ `Protected` **_get**(`propertyName`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |

#### Returns

`any`

#### Inherited from

Widget.\_get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:32

▸ `Protected` **_get**<`T`\>(`propertyName`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |

#### Returns

`T`

#### Inherited from

Widget.\_get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:33

___

### \_load

▸ `Private` **_load**(`imageLayerInfo`): `Promise`<`void`\>

On demand load image media layer.

#### Parameters

| Name | Type |
| :------ | :------ |
| `imageLayerInfo` | `ImageLayerInfo` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/TaxMaps.tsx:233](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L233)

___

### \_selectAfterCreate

▸ `Private` **_selectAfterCreate**(`select`): `void`

Wire select events.

#### Parameters

| Name | Type |
| :------ | :------ |
| `select` | `HTMLCalciteSelectElement` |

#### Returns

`void`

#### Defined in

[src/widgets/TaxMaps.tsx:261](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L261)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.TaxMaps.default)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |
| `value` | `T` |

#### Returns

[`default`](../wiki/widgets.TaxMaps.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_show

▸ `Private` **_show**(`value`): `void`

Show selected tax map image media layer.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`void`

#### Defined in

[src/widgets/TaxMaps.tsx:208](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L208)

___

### addHandles

▸ **addHandles**<`T`\>(`handles`, `groupKey?`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handles` | `IHandle` \| `IHandle`[] |
| `groupKey?` | `Exclude`<`T`, `IHandle`\> |

#### Returns

`void`

#### Inherited from

Widget.addHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:28

___

### classes

▸ **classes**(`...classNames`): `string`

A utility method used for building the value for a widget's `class` property.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#classes)

#### Parameters

| Name | Type |
| :------ | :------ |
| `...classNames` | `any`[] |

#### Returns

`string`

#### Inherited from

Widget.classes

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112224

___

### destroy

▸ **destroy**(): `void`

Destroys the widget instance.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#destroy)

#### Returns

`void`

#### Inherited from

Widget.destroy

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112230

___

### emit

▸ **emit**(`type`, `event?`): `boolean`

Emits an event on the instance.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-Evented.html#emit)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` |
| `event?` | `any` |

#### Returns

`boolean`

#### Inherited from

Widget.emit

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:2121

___

### get

▸ **get**<`T`\>(`propertyName`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |

#### Returns

`T`

#### Inherited from

Widget.get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:21

▸ **get**(`propertyName`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |

#### Returns

`any`

#### Inherited from

Widget.get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:22

___

### hasEventListener

▸ **hasEventListener**(`type`): `boolean`

Indicates whether there is an event listener on the instance that matches the provided event name.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-Evented.html#hasEventListener)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` |

#### Returns

`boolean`

#### Inherited from

Widget.hasEventListener

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:2127

___

### hasHandles

▸ **hasHandles**<`T`\>(`groupKey?`): `boolean`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `groupKey?` | `Exclude`<`T`, `IHandle`\> |

#### Returns

`boolean`

#### Inherited from

Widget.hasHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:30

___

### isFulfilled

▸ **isFulfilled**(): `boolean`

`isFulfilled()` may be used to verify if creating an instance of the class is fulfilled (either resolved or rejected).

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#isFulfilled)

#### Returns

`boolean`

#### Inherited from

Widget.isFulfilled

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112236

___

### isRejected

▸ **isRejected**(): `boolean`

`isRejected()` may be used to verify if creating an instance of the class is rejected.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#isRejected)

#### Returns

`boolean`

#### Inherited from

Widget.isRejected

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112242

___

### isResolved

▸ **isResolved**(): `boolean`

`isResolved()` may be used to verify if creating an instance of the class is resolved.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#isResolved)

#### Returns

`boolean`

#### Inherited from

Widget.isResolved

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112248

___

### notifyChange

▸ `Protected` **notifyChange**(`propertyName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |

#### Returns

`void`

#### Inherited from

Widget.notifyChange

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:31

___

### on

▸ **on**(`type`, `listener`): `IHandle`

Registers an event handler on the instance.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-Evented.html#on)

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `string` \| `string`[] |
| `listener` | `EventHandler` |

#### Returns

`IHandle`

#### Inherited from

Widget.on

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:2133

___

### own

▸ **own**(`handleOrHandles`): `void`

Adds one or more handles which are to be tied to the lifecycle of the widget.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#own)

#### Parameters

| Name | Type |
| :------ | :------ |
| `handleOrHandles` | `WatchHandle` \| `WatchHandle`[] |

#### Returns

`void`

#### Inherited from

Widget.own

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112254

___

### postInitialize

▸ **postInitialize**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

Widget.postInitialize

#### Defined in

[src/widgets/TaxMaps.tsx:89](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L89)

___

### removeHandles

▸ **removeHandles**<`T`\>(`groupKey?`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `groupKey?` | `Exclude`<`T`, `IHandle`\> |

#### Returns

`void`

#### Inherited from

Widget.removeHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:29

___

### render

▸ **render**(): `Element`

#### Returns

`Element`

#### Overrides

Widget.render

#### Defined in

[src/widgets/TaxMaps.tsx:276](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxMaps.tsx#L276)

___

### renderNow

▸ **renderNow**(): `void`

Renders widget to the DOM immediately.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#renderNow)

#### Returns

`void`

#### Inherited from

Widget.renderNow

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112272

___

### scheduleRender

▸ **scheduleRender**(): `void`

*This method is primarily used by developers when implementing custom widgets.* Schedules widget rendering.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#scheduleRender)

#### Returns

`void`

#### Inherited from

Widget.scheduleRender

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112278

___

### set

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.TaxMaps.default)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `propertyName` | `string` |
| `value` | `T` |

#### Returns

[`default`](../wiki/widgets.TaxMaps.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.TaxMaps.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.TaxMaps.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:24

___

### watch

▸ **watch**(`path`, `callback`, `sync?`): `WatchHandle`

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` \| `string`[] |
| `callback` | `WatchCallback` |
| `sync?` | `boolean` |

#### Returns

`WatchHandle`

#### Inherited from

Widget.watch

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:25

___

### when

▸ **when**(`callback?`, `errback?`): `Promise`<`any`\>

`when()` may be leveraged once an instance of the class is created.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#when)

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback?` | `Function` |
| `errback?` | `Function` |

#### Returns

`Promise`<`any`\>

#### Inherited from

Widget.when

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112284
