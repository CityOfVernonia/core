# Class: default

[widgets/PrintFIRMette](../wiki/widgets.PrintFIRMette).default

A widget for generating and downloading FEMA FIRMettes.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.PrintFIRMette.default#constructor)

### Properties

- [\_clickHandle](../wiki/widgets.PrintFIRMette.default#_clickhandle)
- [\_layerVisible](../wiki/widgets.PrintFIRMette.default#_layervisible)
- [\_listItems](../wiki/widgets.PrintFIRMette.default#_listitems)
- [\_printing](../wiki/widgets.PrintFIRMette.default#_printing)
- [container](../wiki/widgets.PrintFIRMette.default#container)
- [declaredClass](../wiki/widgets.PrintFIRMette.default#declaredclass)
- [destroyed](../wiki/widgets.PrintFIRMette.default#destroyed)
- [icon](../wiki/widgets.PrintFIRMette.default#icon)
- [id](../wiki/widgets.PrintFIRMette.default#id)
- [initialized](../wiki/widgets.PrintFIRMette.default#initialized)
- [label](../wiki/widgets.PrintFIRMette.default#label)
- [layer](../wiki/widgets.PrintFIRMette.default#layer)
- [view](../wiki/widgets.PrintFIRMette.default#view)
- [visible](../wiki/widgets.PrintFIRMette.default#visible)

### Methods

- [\_get](../wiki/widgets.PrintFIRMette.default#_get)
- [\_print](../wiki/widgets.PrintFIRMette.default#_print)
- [\_printCheck](../wiki/widgets.PrintFIRMette.default#_printcheck)
- [\_printComplete](../wiki/widgets.PrintFIRMette.default#_printcomplete)
- [\_printError](../wiki/widgets.PrintFIRMette.default#_printerror)
- [\_set](../wiki/widgets.PrintFIRMette.default#_set)
- [\_switchAfterCreate](../wiki/widgets.PrintFIRMette.default#_switchaftercreate)
- [\_viewClick](../wiki/widgets.PrintFIRMette.default#_viewclick)
- [addHandles](../wiki/widgets.PrintFIRMette.default#addhandles)
- [classes](../wiki/widgets.PrintFIRMette.default#classes)
- [destroy](../wiki/widgets.PrintFIRMette.default#destroy)
- [emit](../wiki/widgets.PrintFIRMette.default#emit)
- [get](../wiki/widgets.PrintFIRMette.default#get)
- [hasEventListener](../wiki/widgets.PrintFIRMette.default#haseventlistener)
- [hasHandles](../wiki/widgets.PrintFIRMette.default#hashandles)
- [isFulfilled](../wiki/widgets.PrintFIRMette.default#isfulfilled)
- [isRejected](../wiki/widgets.PrintFIRMette.default#isrejected)
- [isResolved](../wiki/widgets.PrintFIRMette.default#isresolved)
- [notifyChange](../wiki/widgets.PrintFIRMette.default#notifychange)
- [on](../wiki/widgets.PrintFIRMette.default#on)
- [onHide](../wiki/widgets.PrintFIRMette.default#onhide)
- [onShow](../wiki/widgets.PrintFIRMette.default#onshow)
- [own](../wiki/widgets.PrintFIRMette.default#own)
- [postInitialize](../wiki/widgets.PrintFIRMette.default#postinitialize)
- [removeHandles](../wiki/widgets.PrintFIRMette.default#removehandles)
- [render](../wiki/widgets.PrintFIRMette.default#render)
- [renderNow](../wiki/widgets.PrintFIRMette.default#rendernow)
- [scheduleRender](../wiki/widgets.PrintFIRMette.default#schedulerender)
- [set](../wiki/widgets.PrintFIRMette.default#set)
- [watch](../wiki/widgets.PrintFIRMette.default#watch)
- [when](../wiki/widgets.PrintFIRMette.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`PrintFIRMetteProperties`](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties) |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/PrintFIRMette.tsx:53](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L53)

## Properties

### \_clickHandle

• `Private` **\_clickHandle**: `IHandle`

#### Defined in

[src/widgets/PrintFIRMette.tsx:67](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L67)

___

### \_layerVisible

• `Private` **\_layerVisible**: `boolean`

#### Defined in

[src/widgets/PrintFIRMette.tsx:70](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L70)

___

### \_listItems

• `Private` **\_listItems**: `Collection`<`_Item`\>

#### Defined in

[src/widgets/PrintFIRMette.tsx:72](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L72)

___

### \_printing

• `Private` **\_printing**: `boolean` = `false`

#### Defined in

[src/widgets/PrintFIRMette.tsx:75](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L75)

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

• **layer**: `MapImageLayer`

#### Defined in

[src/widgets/PrintFIRMette.tsx:60](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L60)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/PrintFIRMette.tsx:62](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L62)

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

### \_print

▸ `Private` **_print**(`point`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `Point` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:93](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L93)

___

### \_printCheck

▸ `Private` **_printCheck**(`item`, `response`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `_Item` |
| `response` | `any` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:135](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L135)

___

### \_printComplete

▸ `Private` **_printComplete**(`item`, `response`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `_Item` |
| `response` | `any` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:162](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L162)

___

### \_printError

▸ `Private` **_printError**(`item`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `_Item` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:207](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L207)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.PrintFIRMette.default)

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

[`default`](../wiki/widgets.PrintFIRMette.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_switchAfterCreate

▸ `Private` **_switchAfterCreate**(`_switch`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `_switch` | `HTMLCalciteSwitchElement` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:256](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L256)

___

### \_viewClick

▸ `Private` **_viewClick**(`event`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `ViewClickEvent` |

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:221](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L221)

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

[src/widgets/PrintFIRMette.tsx:85](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L85)

___

### onShow

▸ **onShow**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/PrintFIRMette.tsx:80](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L80)

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

*This method is primarily used by developers when implementing custom widgets.* Executes after widget is ready for rendering.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#postInitialize)

#### Returns

`void`

#### Inherited from

Widget.postInitialize

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112260

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

[src/widgets/PrintFIRMette.tsx:232](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L232)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.PrintFIRMette.default)

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

[`default`](../wiki/widgets.PrintFIRMette.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.PrintFIRMette.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.PrintFIRMette.default)

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
