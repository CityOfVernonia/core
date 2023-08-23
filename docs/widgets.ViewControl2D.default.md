# Class: default

[widgets/ViewControl2D](../wiki/widgets.ViewControl2D).default

View control widget for map view.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.ViewControl2D.default#constructor)

### Properties

- [\_home](../wiki/widgets.ViewControl2D.default#_home)
- [\_magnifierHandle](../wiki/widgets.ViewControl2D.default#_magnifierhandle)
- [\_zoom](../wiki/widgets.ViewControl2D.default#_zoom)
- [container](../wiki/widgets.ViewControl2D.default#container)
- [declaredClass](../wiki/widgets.ViewControl2D.default#declaredclass)
- [destroyed](../wiki/widgets.ViewControl2D.default#destroyed)
- [icon](../wiki/widgets.ViewControl2D.default#icon)
- [id](../wiki/widgets.ViewControl2D.default#id)
- [includeFullscreen](../wiki/widgets.ViewControl2D.default#includefullscreen)
- [includeLocate](../wiki/widgets.ViewControl2D.default#includelocate)
- [includeMagnifier](../wiki/widgets.ViewControl2D.default#includemagnifier)
- [initialized](../wiki/widgets.ViewControl2D.default#initialized)
- [label](../wiki/widgets.ViewControl2D.default#label)
- [locateProperties](../wiki/widgets.ViewControl2D.default#locateproperties)
- [magnifierProperties](../wiki/widgets.ViewControl2D.default#magnifierproperties)
- [view](../wiki/widgets.ViewControl2D.default#view)
- [visible](../wiki/widgets.ViewControl2D.default#visible)

### Methods

- [\_compassRotation](../wiki/widgets.ViewControl2D.default#_compassrotation)
- [\_get](../wiki/widgets.ViewControl2D.default#_get)
- [\_initializeFullscreen](../wiki/widgets.ViewControl2D.default#_initializefullscreen)
- [\_initializeLocate](../wiki/widgets.ViewControl2D.default#_initializelocate)
- [\_set](../wiki/widgets.ViewControl2D.default#_set)
- [\_toggleMagnifier](../wiki/widgets.ViewControl2D.default#_togglemagnifier)
- [addHandles](../wiki/widgets.ViewControl2D.default#addhandles)
- [classes](../wiki/widgets.ViewControl2D.default#classes)
- [destroy](../wiki/widgets.ViewControl2D.default#destroy)
- [emit](../wiki/widgets.ViewControl2D.default#emit)
- [get](../wiki/widgets.ViewControl2D.default#get)
- [hasEventListener](../wiki/widgets.ViewControl2D.default#haseventlistener)
- [hasHandles](../wiki/widgets.ViewControl2D.default#hashandles)
- [isFulfilled](../wiki/widgets.ViewControl2D.default#isfulfilled)
- [isRejected](../wiki/widgets.ViewControl2D.default#isrejected)
- [isResolved](../wiki/widgets.ViewControl2D.default#isresolved)
- [notifyChange](../wiki/widgets.ViewControl2D.default#notifychange)
- [on](../wiki/widgets.ViewControl2D.default#on)
- [own](../wiki/widgets.ViewControl2D.default#own)
- [postInitialize](../wiki/widgets.ViewControl2D.default#postinitialize)
- [removeHandles](../wiki/widgets.ViewControl2D.default#removehandles)
- [render](../wiki/widgets.ViewControl2D.default#render)
- [renderNow](../wiki/widgets.ViewControl2D.default#rendernow)
- [scheduleRender](../wiki/widgets.ViewControl2D.default#schedulerender)
- [set](../wiki/widgets.ViewControl2D.default#set)
- [watch](../wiki/widgets.ViewControl2D.default#watch)
- [when](../wiki/widgets.ViewControl2D.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `WidgetProperties` & [`ViewControlOptions`](../wiki/widgets.ViewControl2D.ViewControlOptions) & { `view`: `MapView`  } |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/ViewControl2D.tsx:61](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L61)

## Properties

### \_home

• `Private` **\_home**: `HomeViewModel`

#### Defined in

[src/widgets/ViewControl2D.tsx:103](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L103)

___

### \_magnifierHandle

• `Private` **\_magnifierHandle**: `IHandle`

#### Defined in

[src/widgets/ViewControl2D.tsx:105](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L105)

___

### \_zoom

• `Private` **\_zoom**: `ZoomViewModel`

#### Defined in

[src/widgets/ViewControl2D.tsx:107](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L107)

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

### includeFullscreen

• **includeFullscreen**: `boolean` = `false`

#### Defined in

[src/widgets/ViewControl2D.tsx:88](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L88)

___

### includeLocate

• **includeLocate**: `boolean` = `false`

#### Defined in

[src/widgets/ViewControl2D.tsx:90](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L90)

___

### includeMagnifier

• **includeMagnifier**: `boolean` = `false`

#### Defined in

[src/widgets/ViewControl2D.tsx:92](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L92)

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

### locateProperties

• **locateProperties**: `LocateProperties`

#### Defined in

[src/widgets/ViewControl2D.tsx:94](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L94)

___

### magnifierProperties

• **magnifierProperties**: `MagnifierProperties`

#### Defined in

[src/widgets/ViewControl2D.tsx:96](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L96)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/ViewControl2D.tsx:98](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L98)

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

### \_compassRotation

▸ `Private` **_compassRotation**(`action`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `HTMLCalciteActionElement` |

#### Returns

`void`

#### Defined in

[src/widgets/ViewControl2D.tsx:113](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L113)

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

### \_initializeFullscreen

▸ `Private` **_initializeFullscreen**(`action`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `HTMLCalciteActionElement` |

#### Returns

`void`

#### Defined in

[src/widgets/ViewControl2D.tsx:135](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L135)

___

### \_initializeLocate

▸ `Private` **_initializeLocate**(`action`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `action` | `HTMLCalciteActionElement` |

#### Returns

`void`

#### Defined in

[src/widgets/ViewControl2D.tsx:171](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L171)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.ViewControl2D.default)

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

[`default`](../wiki/widgets.ViewControl2D.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_toggleMagnifier

▸ `Private` **_toggleMagnifier**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/ViewControl2D.tsx:203](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L203)

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

▸ **postInitialize**(): `void`

#### Returns

`void`

#### Overrides

Widget.postInitialize

#### Defined in

[src/widgets/ViewControl2D.tsx:73](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L73)

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

[src/widgets/ViewControl2D.tsx:223](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/ViewControl2D.tsx#L223)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.ViewControl2D.default)

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

[`default`](../wiki/widgets.ViewControl2D.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.ViewControl2D.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.ViewControl2D.default)

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
