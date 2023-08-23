# Class: default

[widgets/Layers](../wiki/widgets.Layers).default

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.Layers.default#constructor)

### Properties

- [\_addLayerItems](../wiki/widgets.Layers.default#_addlayeritems)
- [\_addWebLayersModal](../wiki/widgets.Layers.default#_addweblayersmodal)
- [addLayerInfos](../wiki/widgets.Layers.default#addlayerinfos)
- [addWebLayers](../wiki/widgets.Layers.default#addweblayers)
- [container](../wiki/widgets.Layers.default#container)
- [declaredClass](../wiki/widgets.Layers.default#declaredclass)
- [destroyed](../wiki/widgets.Layers.default#destroyed)
- [icon](../wiki/widgets.Layers.default#icon)
- [id](../wiki/widgets.Layers.default#id)
- [initialized](../wiki/widgets.Layers.default#initialized)
- [label](../wiki/widgets.Layers.default#label)
- [state](../wiki/widgets.Layers.default#state)
- [view](../wiki/widgets.Layers.default#view)
- [visible](../wiki/widgets.Layers.default#visible)

### Methods

- [\_addLayerFromPortalLayerInfo](../wiki/widgets.Layers.default#_addlayerfromportallayerinfo)
- [\_addLayerFromServerLayerInfo](../wiki/widgets.Layers.default#_addlayerfromserverlayerinfo)
- [\_addLayerInfo](../wiki/widgets.Layers.default#_addlayerinfo)
- [\_createLayerList](../wiki/widgets.Layers.default#_createlayerlist)
- [\_createLegend](../wiki/widgets.Layers.default#_createlegend)
- [\_get](../wiki/widgets.Layers.default#_get)
- [\_set](../wiki/widgets.Layers.default#_set)
- [\_showAddWebLayers](../wiki/widgets.Layers.default#_showaddweblayers)
- [addHandles](../wiki/widgets.Layers.default#addhandles)
- [classes](../wiki/widgets.Layers.default#classes)
- [destroy](../wiki/widgets.Layers.default#destroy)
- [emit](../wiki/widgets.Layers.default#emit)
- [get](../wiki/widgets.Layers.default#get)
- [hasEventListener](../wiki/widgets.Layers.default#haseventlistener)
- [hasHandles](../wiki/widgets.Layers.default#hashandles)
- [isFulfilled](../wiki/widgets.Layers.default#isfulfilled)
- [isRejected](../wiki/widgets.Layers.default#isrejected)
- [isResolved](../wiki/widgets.Layers.default#isresolved)
- [notifyChange](../wiki/widgets.Layers.default#notifychange)
- [on](../wiki/widgets.Layers.default#on)
- [onHide](../wiki/widgets.Layers.default#onhide)
- [own](../wiki/widgets.Layers.default#own)
- [postInitialize](../wiki/widgets.Layers.default#postinitialize)
- [removeHandles](../wiki/widgets.Layers.default#removehandles)
- [render](../wiki/widgets.Layers.default#render)
- [renderNow](../wiki/widgets.Layers.default#rendernow)
- [scheduleRender](../wiki/widgets.Layers.default#schedulerender)
- [set](../wiki/widgets.Layers.default#set)
- [watch](../wiki/widgets.Layers.default#watch)
- [when](../wiki/widgets.Layers.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `WidgetProperties` & { `addLayerInfos?`: ([`AddPortalLayerInfo`](../wiki/widgets.Layers.AddPortalLayerInfo) \| [`AddServerLayerInfo`](../wiki/widgets.Layers.AddServerLayerInfo))[] ; `addWebLayers?`: `boolean` ; `view`: `MapView`  } |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/Layers.tsx:74](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L74)

## Properties

### \_addLayerItems

• `Private` **\_addLayerItems**: `Collection`<`Element`\>

#### Defined in

[src/widgets/Layers.tsx:112](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L112)

___

### \_addWebLayersModal

• `Private` **\_addWebLayersModal**: [`default`](../wiki/widgets.AddWebLayersModal.default)

#### Defined in

[src/widgets/Layers.tsx:239](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L239)

___

### addLayerInfos

• **addLayerInfos**: ([`AddPortalLayerInfo`](../wiki/widgets.Layers.AddPortalLayerInfo) \| [`AddServerLayerInfo`](../wiki/widgets.Layers.AddServerLayerInfo))[]

#### Defined in

[src/widgets/Layers.tsx:101](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L101)

___

### addWebLayers

• **addWebLayers**: `boolean` = `false`

#### Defined in

[src/widgets/Layers.tsx:103](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L103)

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

### state

• `Protected` **state**: ``"add"`` \| ``"legend"`` \| ``"layers"`` = `'layers'`

#### Defined in

[src/widgets/Layers.tsx:106](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L106)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/Layers.tsx:99](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L99)

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

### \_addLayerFromPortalLayerInfo

▸ `Private` **_addLayerFromPortalLayerInfo**(`portalItem`, `action`, `addLayerInfo`, `item`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `portalItem` | `PortalItem` |
| `action` | `HTMLCalciteActionElement` |
| `addLayerInfo` | `AddLayerInfo` |
| `item` | `Element` |

#### Returns

`void`

#### Defined in

[src/widgets/Layers.tsx:179](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L179)

___

### \_addLayerFromServerLayerInfo

▸ `Private` **_addLayerFromServerLayerInfo**(`url`, `action`, `addLayerInfo`, `item`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `action` | `HTMLCalciteActionElement` |
| `addLayerInfo` | `AddLayerInfo` |
| `item` | `Element` |

#### Returns

`void`

#### Defined in

[src/widgets/Layers.tsx:209](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L209)

___

### \_addLayerInfo

▸ `Private` **_addLayerInfo**(`addLayerInfo`, `index`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `addLayerInfo` | [`AddPortalLayerInfo`](../wiki/widgets.Layers.AddPortalLayerInfo) \| [`AddServerLayerInfo`](../wiki/widgets.Layers.AddServerLayerInfo) |
| `index` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/Layers.tsx:114](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L114)

___

### \_createLayerList

▸ `Private` **_createLayerList**(`container`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLDivElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Layers.tsx:330](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L330)

___

### \_createLegend

▸ `Private` **_createLegend**(`container`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `container` | `HTMLDivElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Layers.tsx:337](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L337)

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

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Layers.default)

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

[`default`](../wiki/widgets.Layers.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_showAddWebLayers

▸ `Private` **_showAddWebLayers**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/Layers.tsx:241](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L241)

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

[src/widgets/Layers.tsx:108](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L108)

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

▸ **postInitialize**(): `void`

#### Returns

`void`

#### Overrides

Widget.postInitialize

#### Defined in

[src/widgets/Layers.tsx:93](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L93)

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

[src/widgets/Layers.tsx:253](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Layers.tsx#L253)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Layers.default)

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

[`default`](../wiki/widgets.Layers.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.Layers.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.Layers.default)

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
