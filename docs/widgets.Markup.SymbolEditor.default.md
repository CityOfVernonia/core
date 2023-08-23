# Class: default

[widgets/Markup/SymbolEditor](../wiki/widgets.Markup.SymbolEditor).default

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.Markup.SymbolEditor.default#constructor)

### Properties

- [container](../wiki/widgets.Markup.SymbolEditor.default#container)
- [declaredClass](../wiki/widgets.Markup.SymbolEditor.default#declaredclass)
- [destroyed](../wiki/widgets.Markup.SymbolEditor.default#destroyed)
- [graphic](../wiki/widgets.Markup.SymbolEditor.default#graphic)
- [icon](../wiki/widgets.Markup.SymbolEditor.default#icon)
- [id](../wiki/widgets.Markup.SymbolEditor.default#id)
- [initialized](../wiki/widgets.Markup.SymbolEditor.default#initialized)
- [label](../wiki/widgets.Markup.SymbolEditor.default#label)
- [symbol](../wiki/widgets.Markup.SymbolEditor.default#symbol)
- [visible](../wiki/widgets.Markup.SymbolEditor.default#visible)

### Methods

- [\_colorPicker](../wiki/widgets.Markup.SymbolEditor.default#_colorpicker)
- [\_get](../wiki/widgets.Markup.SymbolEditor.default#_get)
- [\_set](../wiki/widgets.Markup.SymbolEditor.default#_set)
- [\_setProperty](../wiki/widgets.Markup.SymbolEditor.default#_setproperty)
- [\_simpleFillSymbol](../wiki/widgets.Markup.SymbolEditor.default#_simplefillsymbol)
- [\_simpleLineSymbol](../wiki/widgets.Markup.SymbolEditor.default#_simplelinesymbol)
- [\_simpleMarkerSymbol](../wiki/widgets.Markup.SymbolEditor.default#_simplemarkersymbol)
- [\_textSymbol](../wiki/widgets.Markup.SymbolEditor.default#_textsymbol)
- [addHandles](../wiki/widgets.Markup.SymbolEditor.default#addhandles)
- [classes](../wiki/widgets.Markup.SymbolEditor.default#classes)
- [destroy](../wiki/widgets.Markup.SymbolEditor.default#destroy)
- [emit](../wiki/widgets.Markup.SymbolEditor.default#emit)
- [get](../wiki/widgets.Markup.SymbolEditor.default#get)
- [hasEventListener](../wiki/widgets.Markup.SymbolEditor.default#haseventlistener)
- [hasHandles](../wiki/widgets.Markup.SymbolEditor.default#hashandles)
- [isFulfilled](../wiki/widgets.Markup.SymbolEditor.default#isfulfilled)
- [isRejected](../wiki/widgets.Markup.SymbolEditor.default#isrejected)
- [isResolved](../wiki/widgets.Markup.SymbolEditor.default#isresolved)
- [notifyChange](../wiki/widgets.Markup.SymbolEditor.default#notifychange)
- [on](../wiki/widgets.Markup.SymbolEditor.default#on)
- [own](../wiki/widgets.Markup.SymbolEditor.default#own)
- [postInitialize](../wiki/widgets.Markup.SymbolEditor.default#postinitialize)
- [removeHandles](../wiki/widgets.Markup.SymbolEditor.default#removehandles)
- [render](../wiki/widgets.Markup.SymbolEditor.default#render)
- [renderNow](../wiki/widgets.Markup.SymbolEditor.default#rendernow)
- [scheduleRender](../wiki/widgets.Markup.SymbolEditor.default#schedulerender)
- [set](../wiki/widgets.Markup.SymbolEditor.default#set)
- [watch](../wiki/widgets.Markup.SymbolEditor.default#watch)
- [when](../wiki/widgets.Markup.SymbolEditor.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `WidgetProperties` & { `graphic?`: `Graphic`  } |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:17](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L17)

## Properties

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

### graphic

• **graphic**: `Graphic`

Graphic of interest.

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:32](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L32)

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

### symbol

• `Protected` **symbol**: `SimpleLineSymbol` \| `SimpleMarkerSymbol` \| `SimpleFillSymbol` \| `TextSymbol`

Graphic's symbol.

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:38](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L38)

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

### \_colorPicker

▸ `Private` **_colorPicker**(`symbol`, `property`, `container`): `void`

Create and wire color picker.

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `Symbol` |
| `property` | `string` |
| `container` | `HTMLDivElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:92](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L92)

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

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Markup.SymbolEditor.default)

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

[`default`](../wiki/widgets.Markup.SymbolEditor.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_setProperty

▸ `Private` **_setProperty**(`property`, `value`): `void`

Set symbol property with dot notation and value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `value` | `string` \| `number` \| `Color` |

#### Returns

`void`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:45](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L45)

___

### \_simpleFillSymbol

▸ `Private` **_simpleFillSymbol**(`symbol`): `Element`

Simple fill symbol editor.

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `SimpleFillSymbol` |

#### Returns

`Element`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:250](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L250)

___

### \_simpleLineSymbol

▸ `Private` **_simpleLineSymbol**(`symbol`): `Element`

Simple line symbol editor.

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `SimpleLineSymbol` |

#### Returns

`Element`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:192](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L192)

___

### \_simpleMarkerSymbol

▸ `Private` **_simpleMarkerSymbol**(`symbol`): `Element`

Simple marker symbol editor.

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `SimpleMarkerSymbol` |

#### Returns

`Element`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:110](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L110)

___

### \_textSymbol

▸ `Private` **_textSymbol**(`symbol`): `Element`

Text symbol editor.

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `TextSymbol` |

#### Returns

`Element`

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:348](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L348)

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

Render widget.

#### Returns

`Element`

#### Overrides

Widget.render

#### Defined in

[src/widgets/Markup/SymbolEditor.tsx:68](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Markup/SymbolEditor.tsx#L68)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Markup.SymbolEditor.default)

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

[`default`](../wiki/widgets.Markup.SymbolEditor.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.Markup.SymbolEditor.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.Markup.SymbolEditor.default)

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
