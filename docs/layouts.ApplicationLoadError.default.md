# Class: default

[layouts/ApplicationLoadError](../wiki/layouts.ApplicationLoadError).default

Application load error widget.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/layouts.ApplicationLoadError.default#constructor)

### Properties

- [container](../wiki/layouts.ApplicationLoadError.default#container)
- [declaredClass](../wiki/layouts.ApplicationLoadError.default#declaredclass)
- [destroyed](../wiki/layouts.ApplicationLoadError.default#destroyed)
- [icon](../wiki/layouts.ApplicationLoadError.default#icon)
- [id](../wiki/layouts.ApplicationLoadError.default#id)
- [initialized](../wiki/layouts.ApplicationLoadError.default#initialized)
- [label](../wiki/layouts.ApplicationLoadError.default#label)
- [link](../wiki/layouts.ApplicationLoadError.default#link)
- [message](../wiki/layouts.ApplicationLoadError.default#message)
- [title](../wiki/layouts.ApplicationLoadError.default#title)
- [visible](../wiki/layouts.ApplicationLoadError.default#visible)

### Methods

- [\_get](../wiki/layouts.ApplicationLoadError.default#_get)
- [\_set](../wiki/layouts.ApplicationLoadError.default#_set)
- [addHandles](../wiki/layouts.ApplicationLoadError.default#addhandles)
- [classes](../wiki/layouts.ApplicationLoadError.default#classes)
- [destroy](../wiki/layouts.ApplicationLoadError.default#destroy)
- [emit](../wiki/layouts.ApplicationLoadError.default#emit)
- [get](../wiki/layouts.ApplicationLoadError.default#get)
- [hasEventListener](../wiki/layouts.ApplicationLoadError.default#haseventlistener)
- [hasHandles](../wiki/layouts.ApplicationLoadError.default#hashandles)
- [isFulfilled](../wiki/layouts.ApplicationLoadError.default#isfulfilled)
- [isRejected](../wiki/layouts.ApplicationLoadError.default#isrejected)
- [isResolved](../wiki/layouts.ApplicationLoadError.default#isresolved)
- [notifyChange](../wiki/layouts.ApplicationLoadError.default#notifychange)
- [on](../wiki/layouts.ApplicationLoadError.default#on)
- [own](../wiki/layouts.ApplicationLoadError.default#own)
- [postInitialize](../wiki/layouts.ApplicationLoadError.default#postinitialize)
- [removeHandles](../wiki/layouts.ApplicationLoadError.default#removehandles)
- [render](../wiki/layouts.ApplicationLoadError.default#render)
- [renderNow](../wiki/layouts.ApplicationLoadError.default#rendernow)
- [scheduleRender](../wiki/layouts.ApplicationLoadError.default#schedulerender)
- [set](../wiki/layouts.ApplicationLoadError.default#set)
- [watch](../wiki/layouts.ApplicationLoadError.default#watch)
- [when](../wiki/layouts.ApplicationLoadError.default#when)

## Constructors

### constructor

• **new default**(`properties?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties?` | `ApplicationLoadErrorProperties` |

#### Overrides

Widget.constructor

#### Defined in

[src/layouts/ApplicationLoadError.tsx:52](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L52)

## Properties

### container

• **container**: `HTMLDivElement`

#### Overrides

Widget.container

#### Defined in

[src/layouts/ApplicationLoadError.tsx:50](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L50)

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

### link

• **link**: `undefined` \| { `href`: `string` ; `text?`: `string`  }

#### Defined in

[src/layouts/ApplicationLoadError.tsx:60](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L60)

___

### message

• **message**: `string` = `'Application was unable to load. Try refreshing the page.'`

#### Defined in

[src/layouts/ApplicationLoadError.tsx:62](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L62)

___

### title

• **title**: `string` = `'Oh snap!'`

#### Defined in

[src/layouts/ApplicationLoadError.tsx:64](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L64)

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

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.ApplicationLoadError.default)

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

[`default`](../wiki/layouts.ApplicationLoadError.default)

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

[src/layouts/ApplicationLoadError.tsx:69](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ApplicationLoadError.tsx#L69)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.ApplicationLoadError.default)

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

[`default`](../wiki/layouts.ApplicationLoadError.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/layouts.ApplicationLoadError.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/layouts.ApplicationLoadError.default)

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
