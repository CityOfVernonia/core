# Class: default

[layouts/ShellApplicationMap](../wiki/layouts.ShellApplicationMap).default

Shell application map layout.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/layouts.ShellApplicationMap.default#constructor)

### Properties

- [\_actionGroups](../wiki/layouts.ShellApplicationMap.default#_actiongroups)
- [\_alerts](../wiki/layouts.ShellApplicationMap.default#_alerts)
- [\_panelWidgets](../wiki/layouts.ShellApplicationMap.default#_panelwidgets)
- [\_visiblePanelWidget](../wiki/layouts.ShellApplicationMap.default#_visiblepanelwidget)
- [container](../wiki/layouts.ShellApplicationMap.default#container)
- [contentBehind](../wiki/layouts.ShellApplicationMap.default#contentbehind)
- [declaredClass](../wiki/layouts.ShellApplicationMap.default#declaredclass)
- [destroyed](../wiki/layouts.ShellApplicationMap.default#destroyed)
- [disclaimerOptions](../wiki/layouts.ShellApplicationMap.default#disclaimeroptions)
- [footer](../wiki/layouts.ShellApplicationMap.default#footer)
- [header](../wiki/layouts.ShellApplicationMap.default#header)
- [headerOptions](../wiki/layouts.ShellApplicationMap.default#headeroptions)
- [icon](../wiki/layouts.ShellApplicationMap.default#icon)
- [id](../wiki/layouts.ShellApplicationMap.default#id)
- [includeDisclaimer](../wiki/layouts.ShellApplicationMap.default#includedisclaimer)
- [includeHeader](../wiki/layouts.ShellApplicationMap.default#includeheader)
- [initialized](../wiki/layouts.ShellApplicationMap.default#initialized)
- [label](../wiki/layouts.ShellApplicationMap.default#label)
- [loaderOptions](../wiki/layouts.ShellApplicationMap.default#loaderoptions)
- [nextBasemap](../wiki/layouts.ShellApplicationMap.default#nextbasemap)
- [panelPosition](../wiki/layouts.ShellApplicationMap.default#panelposition)
- [panelWidgets](../wiki/layouts.ShellApplicationMap.default#panelwidgets)
- [shellPanel](../wiki/layouts.ShellApplicationMap.default#shellpanel)
- [title](../wiki/layouts.ShellApplicationMap.default#title)
- [view](../wiki/layouts.ShellApplicationMap.default#view)
- [viewControlOptions](../wiki/layouts.ShellApplicationMap.default#viewcontroloptions)
- [visible](../wiki/layouts.ShellApplicationMap.default#visible)

### Methods

- [\_actionAfterCreate](../wiki/layouts.ShellApplicationMap.default#_actionaftercreate)
- [\_alertEvent](../wiki/layouts.ShellApplicationMap.default#_alertevent)
- [\_createActionGroups](../wiki/layouts.ShellApplicationMap.default#_createactiongroups)
- [\_createShellPanelWidgets](../wiki/layouts.ShellApplicationMap.default#_createshellpanelwidgets)
- [\_get](../wiki/layouts.ShellApplicationMap.default#_get)
- [\_renderHeader](../wiki/layouts.ShellApplicationMap.default#_renderheader)
- [\_set](../wiki/layouts.ShellApplicationMap.default#_set)
- [\_widgetAfterCreate](../wiki/layouts.ShellApplicationMap.default#_widgetaftercreate)
- [addHandles](../wiki/layouts.ShellApplicationMap.default#addhandles)
- [classes](../wiki/layouts.ShellApplicationMap.default#classes)
- [destroy](../wiki/layouts.ShellApplicationMap.default#destroy)
- [emit](../wiki/layouts.ShellApplicationMap.default#emit)
- [get](../wiki/layouts.ShellApplicationMap.default#get)
- [hasEventListener](../wiki/layouts.ShellApplicationMap.default#haseventlistener)
- [hasHandles](../wiki/layouts.ShellApplicationMap.default#hashandles)
- [isFulfilled](../wiki/layouts.ShellApplicationMap.default#isfulfilled)
- [isRejected](../wiki/layouts.ShellApplicationMap.default#isrejected)
- [isResolved](../wiki/layouts.ShellApplicationMap.default#isresolved)
- [notifyChange](../wiki/layouts.ShellApplicationMap.default#notifychange)
- [on](../wiki/layouts.ShellApplicationMap.default#on)
- [own](../wiki/layouts.ShellApplicationMap.default#own)
- [postInitialize](../wiki/layouts.ShellApplicationMap.default#postinitialize)
- [removeHandles](../wiki/layouts.ShellApplicationMap.default#removehandles)
- [render](../wiki/layouts.ShellApplicationMap.default#render)
- [renderNow](../wiki/layouts.ShellApplicationMap.default#rendernow)
- [scheduleRender](../wiki/layouts.ShellApplicationMap.default#schedulerender)
- [set](../wiki/layouts.ShellApplicationMap.default#set)
- [showAlert](../wiki/layouts.ShellApplicationMap.default#showalert)
- [showWidget](../wiki/layouts.ShellApplicationMap.default#showwidget)
- [watch](../wiki/layouts.ShellApplicationMap.default#watch)
- [when](../wiki/layouts.ShellApplicationMap.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | [`ShellApplicationMapProperties`](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties) |

#### Overrides

Widget.constructor

#### Defined in

[src/layouts/ShellApplicationMap.tsx:274](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L274)

## Properties

### \_actionGroups

• `Private` **\_actionGroups**: `Collection`<`Element`\>

#### Defined in

[src/layouts/ShellApplicationMap.tsx:370](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L370)

___

### \_alerts

• `Private` **\_alerts**: `Collection`<`Element`\>

#### Defined in

[src/layouts/ShellApplicationMap.tsx:373](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L373)

___

### \_panelWidgets

• `Private` **\_panelWidgets**: `Collection`<`Element`\>

#### Defined in

[src/layouts/ShellApplicationMap.tsx:376](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L376)

___

### \_visiblePanelWidget

• `Private` **\_visiblePanelWidget**: ``null`` \| `string` = `null`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:379](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L379)

___

### container

• **container**: `HTMLCalciteShellElement`

#### Overrides

Widget.container

#### Defined in

[src/layouts/ShellApplicationMap.tsx:272](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L272)

___

### contentBehind

• **contentBehind**: `boolean` = `true`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:335](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L335)

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

[src/layouts/ShellApplicationMap.tsx:337](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L337)

___

### footer

• **footer**: `Widget`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:339](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L339)

___

### header

• **header**: `Widget`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:341](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L341)

___

### headerOptions

• **headerOptions**: `Object` = `{}`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `logoUrl?` | `string` \| ``false`` | Header logo URL. Set to `false` for no logo. Defaults to `Vernonia 3 Trees` logo. |
| `oAuth?` | [`default`](../wiki/support.OAuth.default) | OAuth instance for header user control. |
| `searchViewModel?` | `SearchViewModel` | Search view model for header search. |
| `title?` | `string` | Header title. **`Default`** ```ts 'Vernonia' ``` |

#### Defined in

[src/layouts/ShellApplicationMap.tsx:343](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L343)

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

[src/layouts/ShellApplicationMap.tsx:345](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L345)

___

### includeHeader

• **includeHeader**: `boolean` = `true`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:347](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L347)

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

[src/layouts/ShellApplicationMap.tsx:349](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L349)

___

### nextBasemap

• **nextBasemap**: `Basemap`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:351](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L351)

___

### panelPosition

• **panelPosition**: ``"end"`` \| ``"start"`` = `'start'`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:353](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L353)

___

### panelWidgets

• `Optional` **panelWidgets**: `Collection`<[`PanelWidget`](../wiki/layouts.ShellApplicationMap.PanelWidget)\>

#### Defined in

[src/layouts/ShellApplicationMap.tsx:360](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L360)

___

### shellPanel

• **shellPanel**: `Widget`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:355](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L355)

___

### title

• **title**: `string`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:357](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L357)

___

### view

• **view**: `SceneView` \| `MapView`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:362](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L362)

___

### viewControlOptions

• **viewControlOptions**: [`ViewControlOptions`](../wiki/widgets.ViewControl2D.ViewControlOptions) = `{}`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:364](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L364)

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

### \_actionAfterCreate

▸ `Private` **_actionAfterCreate**(`modal`, `widgetId`, `action`): `void`

Wire action events.

#### Parameters

| Name | Type |
| :------ | :------ |
| `modal` | ``null`` \| `HTMLCalciteModalElement` |
| `widgetId` | `string` |
| `action` | `HTMLCalciteActionElement` |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:409](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L409)

___

### \_alertEvent

▸ `Private` **_alertEvent**(`options`): `void`

Create alert.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AlertOptions`](../wiki/layouts.ShellApplicationMap.AlertOptions) |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:436](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L436)

___

### \_createActionGroups

▸ `Private` **_createActionGroups**(`actionInfos`): `void`

Create action groups.

#### Parameters

| Name | Type |
| :------ | :------ |
| `actionInfos` | { `action`: `Element` ; `actionEnd?`: `boolean` ; `groupEnd?`: `boolean`  }[] |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:472](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L472)

___

### \_createShellPanelWidgets

▸ `Private` **_createShellPanelWidgets**(`panelWidgets`): `void`

Create actions and panels/modals.

#### Parameters

| Name | Type |
| :------ | :------ |
| `panelWidgets` | `Collection`<[`PanelWidget`](../wiki/layouts.ShellApplicationMap.PanelWidget)\> |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:512](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L512)

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

### \_renderHeader

▸ `Private` **_renderHeader**(): ``null`` \| `Element`

Create default header.

#### Returns

``null`` \| `Element`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:717](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L717)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.ShellApplicationMap.default)

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

[`default`](../wiki/layouts.ShellApplicationMap.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_widgetAfterCreate

▸ `Private` **_widgetAfterCreate**(`widget`, `container`): `void`

Set widget `container` and wire events.

#### Parameters

| Name | Type |
| :------ | :------ |
| `widget` | `Widget` & { `onHide?`: () => `undefined` \| `void` ; `onShow?`: () => `undefined` \| `void`  } |
| `container` | `HTMLDivElement` \| `HTMLCalciteFlowElement` \| `HTMLCalcitePanelElement` |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:593](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L593)

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

[src/layouts/ShellApplicationMap.tsx:282](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L282)

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

[src/layouts/ShellApplicationMap.tsx:621](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L621)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/layouts.ShellApplicationMap.default)

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

[`default`](../wiki/layouts.ShellApplicationMap.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/layouts.ShellApplicationMap.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/layouts.ShellApplicationMap.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:24

___

### showAlert

▸ **showAlert**(`options`): `void`

Show alert.

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`AlertOptions`](../wiki/layouts.ShellApplicationMap.AlertOptions) |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:388](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L388)

___

### showWidget

▸ **showWidget**(`id`): `void`

Show (or hide) panel widget by id.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | ``null`` \| `string` |

#### Returns

`void`

#### Defined in

[src/layouts/ShellApplicationMap.tsx:396](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L396)

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
