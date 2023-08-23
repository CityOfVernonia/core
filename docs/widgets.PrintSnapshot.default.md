# Class: default

[widgets/PrintSnapshot](../wiki/widgets.PrintSnapshot).default

Print (via print service) and map view snapshot widget.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.PrintSnapshot.default#constructor)

### Properties

- [\_PrintTemplate](../wiki/widgets.PrintSnapshot.default#_printtemplate)
- [\_photoModal](../wiki/widgets.PrintSnapshot.default#_photomodal)
- [\_printResults](../wiki/widgets.PrintSnapshot.default#_printresults)
- [\_printer](../wiki/widgets.PrintSnapshot.default#_printer)
- [\_snapshotResults](../wiki/widgets.PrintSnapshot.default#_snapshotresults)
- [\_state](../wiki/widgets.PrintSnapshot.default#_state)
- [container](../wiki/widgets.PrintSnapshot.default#container)
- [declaredClass](../wiki/widgets.PrintSnapshot.default#declaredclass)
- [destroyed](../wiki/widgets.PrintSnapshot.default#destroyed)
- [icon](../wiki/widgets.PrintSnapshot.default#icon)
- [id](../wiki/widgets.PrintSnapshot.default#id)
- [initialized](../wiki/widgets.PrintSnapshot.default#initialized)
- [label](../wiki/widgets.PrintSnapshot.default#label)
- [layouts](../wiki/widgets.PrintSnapshot.default#layouts)
- [mode](../wiki/widgets.PrintSnapshot.default#mode)
- [printServiceUrl](../wiki/widgets.PrintSnapshot.default#printserviceurl)
- [view](../wiki/widgets.PrintSnapshot.default#view)
- [visible](../wiki/widgets.PrintSnapshot.default#visible)

### Methods

- [\_dataUrl](../wiki/widgets.PrintSnapshot.default#_dataurl)
- [\_get](../wiki/widgets.PrintSnapshot.default#_get)
- [\_print](../wiki/widgets.PrintSnapshot.default#_print)
- [\_renderLayoutOptions](../wiki/widgets.PrintSnapshot.default#_renderlayoutoptions)
- [\_set](../wiki/widgets.PrintSnapshot.default#_set)
- [\_setState](../wiki/widgets.PrintSnapshot.default#_setstate)
- [\_snapshot](../wiki/widgets.PrintSnapshot.default#_snapshot)
- [addHandles](../wiki/widgets.PrintSnapshot.default#addhandles)
- [classes](../wiki/widgets.PrintSnapshot.default#classes)
- [destroy](../wiki/widgets.PrintSnapshot.default#destroy)
- [emit](../wiki/widgets.PrintSnapshot.default#emit)
- [get](../wiki/widgets.PrintSnapshot.default#get)
- [hasEventListener](../wiki/widgets.PrintSnapshot.default#haseventlistener)
- [hasHandles](../wiki/widgets.PrintSnapshot.default#hashandles)
- [isFulfilled](../wiki/widgets.PrintSnapshot.default#isfulfilled)
- [isRejected](../wiki/widgets.PrintSnapshot.default#isrejected)
- [isResolved](../wiki/widgets.PrintSnapshot.default#isresolved)
- [notifyChange](../wiki/widgets.PrintSnapshot.default#notifychange)
- [on](../wiki/widgets.PrintSnapshot.default#on)
- [own](../wiki/widgets.PrintSnapshot.default#own)
- [postInitialize](../wiki/widgets.PrintSnapshot.default#postinitialize)
- [removeHandles](../wiki/widgets.PrintSnapshot.default#removehandles)
- [render](../wiki/widgets.PrintSnapshot.default#render)
- [renderNow](../wiki/widgets.PrintSnapshot.default#rendernow)
- [scheduleRender](../wiki/widgets.PrintSnapshot.default#schedulerender)
- [set](../wiki/widgets.PrintSnapshot.default#set)
- [watch](../wiki/widgets.PrintSnapshot.default#watch)
- [when](../wiki/widgets.PrintSnapshot.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `WidgetProperties` & { `layouts?`: { `[key: string]`: `string`;  } ; `mode?`: ``"default"`` \| ``"print"`` \| ``"snapshot"`` ; `printServiceUrl?`: `string` ; `view`: `MapView`  } |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/PrintSnapshot.tsx:51](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L51)

## Properties

### \_PrintTemplate

• `Private` **\_PrintTemplate**: typeof `PrintTemplate`

#### Defined in

[src/widgets/PrintSnapshot.tsx:127](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L127)

___

### \_photoModal

• `Private` **\_photoModal**: [`default`](../wiki/widgets.PhotoModal.default)

#### Defined in

[src/widgets/PrintSnapshot.tsx:205](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L205)

___

### \_printResults

• `Private` **\_printResults**: `Collection`<{ `element`: `Element`  }\>

#### Defined in

[src/widgets/PrintSnapshot.tsx:129](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L129)

___

### \_printer

• `Private` **\_printer**: `PrintViewModel`

#### Defined in

[src/widgets/PrintSnapshot.tsx:125](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L125)

___

### \_snapshotResults

• `Private` **\_snapshotResults**: `Collection`<`Element`\>

#### Defined in

[src/widgets/PrintSnapshot.tsx:203](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L203)

___

### \_state

• `Private` **\_state**: ``"print"`` \| ``"snapshot"`` = `'print'`

#### Defined in

[src/widgets/PrintSnapshot.tsx:116](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L116)

___

### container

• **container**: `HTMLCalcitePanelElement`

#### Overrides

Widget.container

#### Defined in

[src/widgets/PrintSnapshot.tsx:49](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L49)

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

### layouts

• **layouts**: `Object`

#### Index signature

▪ [key: `string`]: `string`

#### Defined in

[src/widgets/PrintSnapshot.tsx:98](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L98)

___

### mode

• **mode**: ``"default"`` \| ``"print"`` \| ``"snapshot"`` = `'default'`

#### Defined in

[src/widgets/PrintSnapshot.tsx:105](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L105)

___

### printServiceUrl

• **printServiceUrl**: `string` = `'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'`

#### Defined in

[src/widgets/PrintSnapshot.tsx:107](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L107)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/PrintSnapshot.tsx:110](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L110)

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

### \_dataUrl

▸ `Private` **_dataUrl**(`data`, `title`, `format`): `string`

Add title to image and return data url.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `ImageData` | Image data to be returned as data url string |
| `title` | `string` | Title of the image |
| `format` | ``"png"`` \| ``"jpg"`` | Format of the image |

#### Returns

`string`

Data url string

#### Defined in

[src/widgets/PrintSnapshot.tsx:254](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L254)

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

### \_print

▸ `Private` **_print**(): `void`

Create a print.

#### Returns

`void`

#### Defined in

[src/widgets/PrintSnapshot.tsx:134](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L134)

___

### \_renderLayoutOptions

▸ `Private` **_renderLayoutOptions**(): `Element`[]

Create options for print layout select.

#### Returns

`Element`[]

Array of tsx elements

#### Defined in

[src/widgets/PrintSnapshot.tsx:353](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L353)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.PrintSnapshot.default)

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

[`default`](../wiki/widgets.PrintSnapshot.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_setState

▸ `Private` **_setState**(`state`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | ``"print"`` \| ``"snapshot"`` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintSnapshot.tsx:118](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L118)

___

### \_snapshot

▸ `Private` **_snapshot**(): `Promise`<`void`\>

Create a snapshot.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/PrintSnapshot.tsx:210](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L210)

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

[src/widgets/PrintSnapshot.tsx:76](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L76)

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

[src/widgets/PrintSnapshot.tsx:272](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintSnapshot.tsx#L272)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.PrintSnapshot.default)

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

[`default`](../wiki/widgets.PrintSnapshot.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.PrintSnapshot.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.PrintSnapshot.default)

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
