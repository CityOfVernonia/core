# Class: default

[layouts/FullPageMap](../wiki/layouts.FullPageMap).default

Full page map layout.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/layouts.FullPageMap.default#constructor)

### Properties

- [container](../wiki/layouts.FullPageMap.default#container)
- [declaredClass](../wiki/layouts.FullPageMap.default#declaredclass)
- [destroyed](../wiki/layouts.FullPageMap.default#destroyed)
- [disclaimerOptions](../wiki/layouts.FullPageMap.default#disclaimeroptions)
- [icon](../wiki/layouts.FullPageMap.default#icon)
- [id](../wiki/layouts.FullPageMap.default#id)
- [includeDisclaimer](../wiki/layouts.FullPageMap.default#includedisclaimer)
- [initialized](../wiki/layouts.FullPageMap.default#initialized)
- [label](../wiki/layouts.FullPageMap.default#label)
- [loaderOptions](../wiki/layouts.FullPageMap.default#loaderoptions)
- [nextBasemap](../wiki/layouts.FullPageMap.default#nextbasemap)
- [view](../wiki/layouts.FullPageMap.default#view)
- [viewControlOptions](../wiki/layouts.FullPageMap.default#viewcontroloptions)
- [visible](../wiki/layouts.FullPageMap.default#visible)

### Methods

- [\_get](../wiki/layouts.FullPageMap.default#_get)
- [\_set](../wiki/layouts.FullPageMap.default#_set)
- [addHandles](../wiki/layouts.FullPageMap.default#addhandles)
- [classes](../wiki/layouts.FullPageMap.default#classes)
- [destroy](../wiki/layouts.FullPageMap.default#destroy)
- [emit](../wiki/layouts.FullPageMap.default#emit)
- [get](../wiki/layouts.FullPageMap.default#get)
- [hasEventListener](../wiki/layouts.FullPageMap.default#haseventlistener)
- [hasHandles](../wiki/layouts.FullPageMap.default#hashandles)
- [isFulfilled](../wiki/layouts.FullPageMap.default#isfulfilled)
- [isRejected](../wiki/layouts.FullPageMap.default#isrejected)
- [isResolved](../wiki/layouts.FullPageMap.default#isresolved)
- [notifyChange](../wiki/layouts.FullPageMap.default#notifychange)
- [on](../wiki/layouts.FullPageMap.default#on)
- [own](../wiki/layouts.FullPageMap.default#own)
- [postInitialize](../wiki/layouts.FullPageMap.default#postinitialize)
- [removeHandles](../wiki/layouts.FullPageMap.default#removehandles)
- [render](../wiki/layouts.FullPageMap.default#render)
- [renderNow](../wiki/layouts.FullPageMap.default#rendernow)
- [scheduleRender](../wiki/layouts.FullPageMap.default#schedulerender)
- [set](../wiki/layouts.FullPageMap.default#set)
- [watch](../wiki/layouts.FullPageMap.default#watch)
- [when](../wiki/layouts.FullPageMap.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`FullPageMapProperties`](../wiki/layouts.FullPageMap.FullPageMapProperties) |

#### Overrides

Widget.constructor

#### Defined in

[src/layouts/FullPageMap.tsx:73](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L73)

## Properties

### container

• **container**: `HTMLDivElement`

#### Overrides

Widget.container

#### Defined in

[src/layouts/FullPageMap.tsx:71](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L71)

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

### disclaimerOptions

• **disclaimerOptions**: [`DisclaimerOptions`](../wiki/widgets.Disclaimer.DisclaimerOptions) = `{}`

#### Defined in

[src/layouts/FullPageMap.tsx:115](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L115)

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

### includeDisclaimer

• **includeDisclaimer**: `boolean` = `true`

#### Defined in

[src/layouts/FullPageMap.tsx:117](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L117)

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

### loaderOptions

• **loaderOptions**: [`LoaderOptions`](../wiki/widgets.Loader.LoaderOptions) = `{}`

#### Defined in

[src/layouts/FullPageMap.tsx:119](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L119)

___

### nextBasemap

• **nextBasemap**: `Basemap`

#### Defined in

[src/layouts/FullPageMap.tsx:121](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L121)

___

### view

• **view**: `SceneView` \| `MapView`

#### Defined in

[src/layouts/FullPageMap.tsx:123](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L123)

___

### viewControlOptions

• **viewControlOptions**: [`ViewControlOptions`](../wiki/widgets.ViewControl2D.ViewControlOptions) = `{}`

#### Defined in

[src/layouts/FullPageMap.tsx:125](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L125)

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

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.FullPageMap.default)

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

[`default`](../wiki/layouts.FullPageMap.default)

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

[src/layouts/FullPageMap.tsx:80](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L80)

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

[src/layouts/FullPageMap.tsx:130](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L130)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.FullPageMap.default)

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

[`default`](../wiki/layouts.FullPageMap.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/layouts.FullPageMap.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/layouts.FullPageMap.default)

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
