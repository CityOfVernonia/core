# Class: default

[widgets/SurveySearch](../wiki/widgets.SurveySearch).default

Search surveys related to a tax lot.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.SurveySearch.default#constructor)

### Properties

- [\_graphics](../wiki/widgets.SurveySearch.default#_graphics)
- [\_resultSymbol](../wiki/widgets.SurveySearch.default#_resultsymbol)
- [\_selectedResult](../wiki/widgets.SurveySearch.default#_selectedresult)
- [\_selectedSymbol](../wiki/widgets.SurveySearch.default#_selectedsymbol)
- [\_selectedTaxLot](../wiki/widgets.SurveySearch.default#_selectedtaxlot)
- [\_selectedTaxLotSymbol](../wiki/widgets.SurveySearch.default#_selectedtaxlotsymbol)
- [\_surveyInfoIndex](../wiki/widgets.SurveySearch.default#_surveyinfoindex)
- [\_surveyInfos](../wiki/widgets.SurveySearch.default#_surveyinfos)
- [\_viewState](../wiki/widgets.SurveySearch.default#_viewstate)
- [\_visible](../wiki/widgets.SurveySearch.default#_visible)
- [container](../wiki/widgets.SurveySearch.default#container)
- [declaredClass](../wiki/widgets.SurveySearch.default#declaredclass)
- [destroyed](../wiki/widgets.SurveySearch.default#destroyed)
- [icon](../wiki/widgets.SurveySearch.default#icon)
- [id](../wiki/widgets.SurveySearch.default#id)
- [initialized](../wiki/widgets.SurveySearch.default#initialized)
- [label](../wiki/widgets.SurveySearch.default#label)
- [surveys](../wiki/widgets.SurveySearch.default#surveys)
- [taxLots](../wiki/widgets.SurveySearch.default#taxlots)
- [view](../wiki/widgets.SurveySearch.default#view)
- [visible](../wiki/widgets.SurveySearch.default#visible)

### Methods

- [\_clear](../wiki/widgets.SurveySearch.default#_clear)
- [\_get](../wiki/widgets.SurveySearch.default#_get)
- [\_search](../wiki/widgets.SurveySearch.default#_search)
- [\_selectNextPrevious](../wiki/widgets.SurveySearch.default#_selectnextprevious)
- [\_set](../wiki/widgets.SurveySearch.default#_set)
- [\_setSelectedResult](../wiki/widgets.SurveySearch.default#_setselectedresult)
- [addHandles](../wiki/widgets.SurveySearch.default#addhandles)
- [classes](../wiki/widgets.SurveySearch.default#classes)
- [destroy](../wiki/widgets.SurveySearch.default#destroy)
- [emit](../wiki/widgets.SurveySearch.default#emit)
- [get](../wiki/widgets.SurveySearch.default#get)
- [hasEventListener](../wiki/widgets.SurveySearch.default#haseventlistener)
- [hasHandles](../wiki/widgets.SurveySearch.default#hashandles)
- [isFulfilled](../wiki/widgets.SurveySearch.default#isfulfilled)
- [isRejected](../wiki/widgets.SurveySearch.default#isrejected)
- [isResolved](../wiki/widgets.SurveySearch.default#isresolved)
- [notifyChange](../wiki/widgets.SurveySearch.default#notifychange)
- [on](../wiki/widgets.SurveySearch.default#on)
- [onHide](../wiki/widgets.SurveySearch.default#onhide)
- [own](../wiki/widgets.SurveySearch.default#own)
- [postInitialize](../wiki/widgets.SurveySearch.default#postinitialize)
- [removeHandles](../wiki/widgets.SurveySearch.default#removehandles)
- [render](../wiki/widgets.SurveySearch.default#render)
- [renderNow](../wiki/widgets.SurveySearch.default#rendernow)
- [scheduleRender](../wiki/widgets.SurveySearch.default#schedulerender)
- [set](../wiki/widgets.SurveySearch.default#set)
- [watch](../wiki/widgets.SurveySearch.default#watch)
- [when](../wiki/widgets.SurveySearch.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`SurveySearchProperties`](../wiki/widgets.SurveySearch.SurveySearchProperties) |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/SurveySearch.tsx:63](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L63)

## Properties

### \_graphics

• `Private` **\_graphics**: `GraphicsLayer`

#### Defined in

[src/widgets/SurveySearch.tsx:97](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L97)

___

### \_resultSymbol

• `Private` **\_resultSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/SurveySearch.tsx:126](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L126)

___

### \_selectedResult

• `Private` **\_selectedResult**: ``null`` \| `Graphic` = `null`

#### Defined in

[src/widgets/SurveySearch.tsx:111](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L111)

___

### \_selectedSymbol

• `Private` **\_selectedSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/SurveySearch.tsx:113](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L113)

___

### \_selectedTaxLot

• `Private` **\_selectedTaxLot**: `Graphic`

#### Defined in

[src/widgets/SurveySearch.tsx:100](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L100)

___

### \_selectedTaxLotSymbol

• `Private` **\_selectedTaxLotSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/SurveySearch.tsx:102](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L102)

___

### \_surveyInfoIndex

• `Private` **\_surveyInfoIndex**: ``null`` \| `number` = `null`

#### Defined in

[src/widgets/SurveySearch.tsx:124](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L124)

___

### \_surveyInfos

• `Private` **\_surveyInfos**: `Collection`<`SurveyInfo`\>

#### Defined in

[src/widgets/SurveySearch.tsx:121](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L121)

___

### \_viewState

• `Private` **\_viewState**: ``"error"`` \| ``"info"`` \| ``"ready"`` \| ``"selected"`` \| ``"searching"`` \| ``"results"`` = `'ready'`

#### Defined in

[src/widgets/SurveySearch.tsx:135](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L135)

___

### \_visible

• `Private` **\_visible**: `boolean`

#### Defined in

[src/widgets/SurveySearch.tsx:138](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L138)

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

### surveys

• **surveys**: `FeatureLayer` \| `GeoJSONLayer`

#### Defined in

[src/widgets/SurveySearch.tsx:88](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L88)

___

### taxLots

• **taxLots**: `FeatureLayer`

#### Defined in

[src/widgets/SurveySearch.tsx:90](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L90)

___

### view

• **view**: `MapView`

#### Defined in

[src/widgets/SurveySearch.tsx:92](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L92)

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

### \_clear

▸ `Private` **_clear**(): `void`

#### Returns

`void`

#### Defined in

[src/widgets/SurveySearch.tsx:150](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L150)

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

### \_search

▸ `Private` **_search**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/SurveySearch.tsx:158](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L158)

___

### \_selectNextPrevious

▸ `Private` **_selectNextPrevious**(`type`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"next"`` \| ``"previous"`` |

#### Returns

`void`

#### Defined in

[src/widgets/SurveySearch.tsx:348](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L348)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.SurveySearch.default)

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

[`default`](../wiki/widgets.SurveySearch.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_setSelectedResult

▸ `Private` **_setSelectedResult**(`feature?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `feature?` | `Graphic` |

#### Returns

`void`

#### Defined in

[src/widgets/SurveySearch.tsx:334](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L334)

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

[src/widgets/SurveySearch.tsx:143](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L143)

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

[src/widgets/SurveySearch.tsx:67](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L67)

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

[src/widgets/SurveySearch.tsx:361](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L361)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.SurveySearch.default)

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

[`default`](../wiki/widgets.SurveySearch.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.SurveySearch.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.SurveySearch.default)

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
