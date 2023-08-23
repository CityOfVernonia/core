# Class: default

[widgets/TaxLotBuffer](../wiki/widgets.TaxLotBuffer).default

A widget for buffering a tax lot and downloading results.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.TaxLotBuffer.default#constructor)

### Properties

- [\_bufferSymbol](../wiki/widgets.TaxLotBuffer.default#_buffersymbol)
- [\_distance](../wiki/widgets.TaxLotBuffer.default#_distance)
- [\_featureSymbol](../wiki/widgets.TaxLotBuffer.default#_featuresymbol)
- [\_graphics](../wiki/widgets.TaxLotBuffer.default#_graphics)
- [\_id](../wiki/widgets.TaxLotBuffer.default#_id)
- [\_resultSymbol](../wiki/widgets.TaxLotBuffer.default#_resultsymbol)
- [\_results](../wiki/widgets.TaxLotBuffer.default#_results)
- [\_selectedFeature](../wiki/widgets.TaxLotBuffer.default#_selectedfeature)
- [\_viewState](../wiki/widgets.TaxLotBuffer.default#_viewstate)
- [\_visible](../wiki/widgets.TaxLotBuffer.default#_visible)
- [container](../wiki/widgets.TaxLotBuffer.default#container)
- [declaredClass](../wiki/widgets.TaxLotBuffer.default#declaredclass)
- [destroyed](../wiki/widgets.TaxLotBuffer.default#destroyed)
- [icon](../wiki/widgets.TaxLotBuffer.default#icon)
- [id](../wiki/widgets.TaxLotBuffer.default#id)
- [initialized](../wiki/widgets.TaxLotBuffer.default#initialized)
- [label](../wiki/widgets.TaxLotBuffer.default#label)
- [layer](../wiki/widgets.TaxLotBuffer.default#layer)
- [view](../wiki/widgets.TaxLotBuffer.default#view)
- [visible](../wiki/widgets.TaxLotBuffer.default#visible)

### Methods

- [\_buffer](../wiki/widgets.TaxLotBuffer.default#_buffer)
- [\_clear](../wiki/widgets.TaxLotBuffer.default#_clear)
- [\_download](../wiki/widgets.TaxLotBuffer.default#_download)
- [\_get](../wiki/widgets.TaxLotBuffer.default#_get)
- [\_set](../wiki/widgets.TaxLotBuffer.default#_set)
- [addHandles](../wiki/widgets.TaxLotBuffer.default#addhandles)
- [classes](../wiki/widgets.TaxLotBuffer.default#classes)
- [destroy](../wiki/widgets.TaxLotBuffer.default#destroy)
- [emit](../wiki/widgets.TaxLotBuffer.default#emit)
- [get](../wiki/widgets.TaxLotBuffer.default#get)
- [hasEventListener](../wiki/widgets.TaxLotBuffer.default#haseventlistener)
- [hasHandles](../wiki/widgets.TaxLotBuffer.default#hashandles)
- [isFulfilled](../wiki/widgets.TaxLotBuffer.default#isfulfilled)
- [isRejected](../wiki/widgets.TaxLotBuffer.default#isrejected)
- [isResolved](../wiki/widgets.TaxLotBuffer.default#isresolved)
- [notifyChange](../wiki/widgets.TaxLotBuffer.default#notifychange)
- [on](../wiki/widgets.TaxLotBuffer.default#on)
- [onHide](../wiki/widgets.TaxLotBuffer.default#onhide)
- [own](../wiki/widgets.TaxLotBuffer.default#own)
- [postInitialize](../wiki/widgets.TaxLotBuffer.default#postinitialize)
- [removeHandles](../wiki/widgets.TaxLotBuffer.default#removehandles)
- [render](../wiki/widgets.TaxLotBuffer.default#render)
- [renderNow](../wiki/widgets.TaxLotBuffer.default#rendernow)
- [scheduleRender](../wiki/widgets.TaxLotBuffer.default#schedulerender)
- [set](../wiki/widgets.TaxLotBuffer.default#set)
- [watch](../wiki/widgets.TaxLotBuffer.default#watch)
- [when](../wiki/widgets.TaxLotBuffer.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`TaxLotBufferProperties`](../wiki/widgets.TaxLotBuffer.TaxLotBufferProperties) |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/TaxLotBuffer.tsx:44](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L44)

## Properties

### \_bufferSymbol

• `Private` **\_bufferSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:75](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L75)

___

### \_distance

• `Private` **\_distance**: `number` = `0`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:84](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L84)

___

### \_featureSymbol

• `Private` **\_featureSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:86](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L86)

___

### \_graphics

• `Private` **\_graphics**: `GraphicsLayer`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:94](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L94)

___

### \_id

• `Private` **\_id**: `string` = `''`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:98](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L98)

___

### \_resultSymbol

• `Private` **\_resultSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:102](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L102)

___

### \_results

• `Private` **\_results**: [] \| `Graphic`[] = `[]`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:100](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L100)

___

### \_selectedFeature

• `Private` **\_selectedFeature**: `Graphic`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:113](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L113)

___

### \_viewState

• `Protected` **\_viewState**: ``"error"`` \| ``"ready"`` \| ``"selected"`` \| ``"buffering"`` \| ``"buffered"`` = `'ready'`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:116](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L116)

___

### \_visible

• `Private` **\_visible**: `boolean`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:121](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L121)

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

• **layer**: `FeatureLayer`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:68](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L68)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:70](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L70)

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

### \_buffer

▸ `Private` **_buffer**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Event` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/TaxLotBuffer.tsx:144](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L144)

___

### \_clear

▸ `Private` **_clear**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:133](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L133)

___

### \_download

▸ `Private` **_download**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:219](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L219)

___

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

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.TaxLotBuffer.default)

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

[`default`](../wiki/widgets.TaxLotBuffer.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

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

### onHide

▸ **onHide**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/TaxLotBuffer.tsx:126](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L126)

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

[src/widgets/TaxLotBuffer.tsx:48](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L48)

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

[src/widgets/TaxLotBuffer.tsx:254](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/TaxLotBuffer.tsx#L254)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.TaxLotBuffer.default)

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

[`default`](../wiki/widgets.TaxLotBuffer.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.TaxLotBuffer.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.TaxLotBuffer.default)

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
