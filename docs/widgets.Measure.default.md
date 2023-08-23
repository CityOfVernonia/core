# Class: default

[widgets/Measure](../wiki/widgets.Measure).default

Measure widget for ArcGIS JS API including length, area, location, elevation and ground profiles.

## Hierarchy

- `Widget`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/widgets.Measure.default#constructor)

### Properties

- [\_sketchHandle](../wiki/widgets.Measure.default#_sketchhandle)
- [areaUnit](../wiki/widgets.Measure.default#areaunit)
- [areaUnits](../wiki/widgets.Measure.default#areaunits)
- [color](../wiki/widgets.Measure.default#color)
- [container](../wiki/widgets.Measure.default#container)
- [declaredClass](../wiki/widgets.Measure.default#declaredclass)
- [degreesPrecision](../wiki/widgets.Measure.default#degreesprecision)
- [destroyed](../wiki/widgets.Measure.default#destroyed)
- [elevationProfile](../wiki/widgets.Measure.default#elevationprofile)
- [elevationProfileLineGround](../wiki/widgets.Measure.default#elevationprofilelineground)
- [elevationUnit](../wiki/widgets.Measure.default#elevationunit)
- [elevationUnits](../wiki/widgets.Measure.default#elevationunits)
- [icon](../wiki/widgets.Measure.default#icon)
- [id](../wiki/widgets.Measure.default#id)
- [initialized](../wiki/widgets.Measure.default#initialized)
- [label](../wiki/widgets.Measure.default#label)
- [labelUnits](../wiki/widgets.Measure.default#labelunits)
- [labels](../wiki/widgets.Measure.default#labels)
- [labelsVisible](../wiki/widgets.Measure.default#labelsvisible)
- [layers](../wiki/widgets.Measure.default#layers)
- [lengthUnit](../wiki/widgets.Measure.default#lengthunit)
- [lengthUnits](../wiki/widgets.Measure.default#lengthunits)
- [localeFormat](../wiki/widgets.Measure.default#localeformat)
- [locationUnit](../wiki/widgets.Measure.default#locationunit)
- [locationUnits](../wiki/widgets.Measure.default#locationunits)
- [optionsVisible](../wiki/widgets.Measure.default#optionsvisible)
- [pointSymbol](../wiki/widgets.Measure.default#pointsymbol)
- [polygonSymbol](../wiki/widgets.Measure.default#polygonsymbol)
- [polylineSymbol](../wiki/widgets.Measure.default#polylinesymbol)
- [sketch](../wiki/widgets.Measure.default#sketch)
- [state](../wiki/widgets.Measure.default#state)
- [textSymbol](../wiki/widgets.Measure.default#textsymbol)
- [unitsPrecision](../wiki/widgets.Measure.default#unitsprecision)
- [view](../wiki/widgets.Measure.default#view)
- [visible](../wiki/widgets.Measure.default#visible)

### Methods

- [\_addGraphics](../wiki/widgets.Measure.default#_addgraphics)
- [\_addLabels](../wiki/widgets.Measure.default#_addlabels)
- [\_addPolygonOutline](../wiki/widgets.Measure.default#_addpolygonoutline)
- [\_addSnappingLayer](../wiki/widgets.Measure.default#_addsnappinglayer)
- [\_area](../wiki/widgets.Measure.default#_area)
- [\_areaEvent](../wiki/widgets.Measure.default#_areaevent)
- [\_clearEvent](../wiki/widgets.Measure.default#_clearevent)
- [\_createTextSymbol](../wiki/widgets.Measure.default#_createtextsymbol)
- [\_elevation](../wiki/widgets.Measure.default#_elevation)
- [\_elevationEvent](../wiki/widgets.Measure.default#_elevationevent)
- [\_format](../wiki/widgets.Measure.default#_format)
- [\_get](../wiki/widgets.Measure.default#_get)
- [\_length](../wiki/widgets.Measure.default#_length)
- [\_lengthEvent](../wiki/widgets.Measure.default#_lengthevent)
- [\_loadSettings](../wiki/widgets.Measure.default#_loadsettings)
- [\_location](../wiki/widgets.Measure.default#_location)
- [\_locationEvent](../wiki/widgets.Measure.default#_locationevent)
- [\_measure](../wiki/widgets.Measure.default#_measure)
- [\_measureEvent](../wiki/widgets.Measure.default#_measureevent)
- [\_midpoint](../wiki/widgets.Measure.default#_midpoint)
- [\_polylineLabels](../wiki/widgets.Measure.default#_polylinelabels)
- [\_profileEvent](../wiki/widgets.Measure.default#_profileevent)
- [\_renderColorSelector](../wiki/widgets.Measure.default#_rendercolorselector)
- [\_renderUnitOptions](../wiki/widgets.Measure.default#_renderunitoptions)
- [\_reset](../wiki/widgets.Measure.default#_reset)
- [\_round](../wiki/widgets.Measure.default#_round)
- [\_set](../wiki/widgets.Measure.default#_set)
- [\_setColors](../wiki/widgets.Measure.default#_setcolors)
- [\_textSymbolAngle](../wiki/widgets.Measure.default#_textsymbolangle)
- [\_unitChangeEvent](../wiki/widgets.Measure.default#_unitchangeevent)
- [\_unitsChange](../wiki/widgets.Measure.default#_unitschange)
- [\_updateSettings](../wiki/widgets.Measure.default#_updatesettings)
- [addHandles](../wiki/widgets.Measure.default#addhandles)
- [classes](../wiki/widgets.Measure.default#classes)
- [destroy](../wiki/widgets.Measure.default#destroy)
- [emit](../wiki/widgets.Measure.default#emit)
- [get](../wiki/widgets.Measure.default#get)
- [hasEventListener](../wiki/widgets.Measure.default#haseventlistener)
- [hasHandles](../wiki/widgets.Measure.default#hashandles)
- [isFulfilled](../wiki/widgets.Measure.default#isfulfilled)
- [isRejected](../wiki/widgets.Measure.default#isrejected)
- [isResolved](../wiki/widgets.Measure.default#isresolved)
- [notifyChange](../wiki/widgets.Measure.default#notifychange)
- [on](../wiki/widgets.Measure.default#on)
- [onHide](../wiki/widgets.Measure.default#onhide)
- [own](../wiki/widgets.Measure.default#own)
- [postInitialize](../wiki/widgets.Measure.default#postinitialize)
- [removeHandles](../wiki/widgets.Measure.default#removehandles)
- [render](../wiki/widgets.Measure.default#render)
- [renderNow](../wiki/widgets.Measure.default#rendernow)
- [scheduleRender](../wiki/widgets.Measure.default#schedulerender)
- [set](../wiki/widgets.Measure.default#set)
- [watch](../wiki/widgets.Measure.default#watch)
- [when](../wiki/widgets.Measure.default#when)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `properties` | `MeasureProperties` |

#### Overrides

Widget.constructor

#### Defined in

[src/widgets/Measure.tsx:206](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L206)

## Properties

### \_sketchHandle

• `Private` **\_sketchHandle**: ``null`` \| `Handle` = `null`

Handle for sketch create.

#### Defined in

[src/widgets/Measure.tsx:598](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L598)

___

### areaUnit

• **areaUnit**: `string` = `'acres'`

#### Defined in

[src/widgets/Measure.tsx:391](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L391)

___

### areaUnits

• **areaUnits**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `acres` | `string` |
| `square-feet` | `string` |
| `square-kilometers` | `string` |
| `square-meters` | `string` |
| `square-miles` | `string` |

#### Defined in

[src/widgets/Measure.tsx:393](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L393)

___

### color

• `Protected` **color**: `number`[] = `COLORS.primary`

Graphics color.

#### Defined in

[src/widgets/Measure.tsx:452](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L452)

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

### degreesPrecision

• **degreesPrecision**: `number` = `6`

Decimal degrees precision.

#### Defined in

[src/widgets/Measure.tsx:437](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L437)

___

### destroyed

• **destroyed**: `boolean`

#### Inherited from

Widget.destroyed

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:16

___

### elevationProfile

• `Protected` **elevationProfile**: `ElevationProfile`

#### Defined in

[src/widgets/Measure.tsx:546](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L546)

___

### elevationProfileLineGround

• `Protected` **elevationProfileLineGround**: `ElevationProfileLineGround`

#### Defined in

[src/widgets/Measure.tsx:559](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L559)

___

### elevationUnit

• **elevationUnit**: `string` = `'feet'`

#### Defined in

[src/widgets/Measure.tsx:410](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L410)

___

### elevationUnits

• **elevationUnits**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feet` | `string` |
| `meters` | `string` |

#### Defined in

[src/widgets/Measure.tsx:412](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L412)

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

### labelUnits

• **labelUnits**: `boolean` = `false`

Add units to labels.

#### Defined in

[src/widgets/Measure.tsx:427](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L427)

___

### labels

• `Protected` **labels**: `GraphicsLayer`

#### Defined in

[src/widgets/Measure.tsx:566](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L566)

___

### labelsVisible

• **labelsVisible**: `boolean` = `true`

Labels visible.

#### Defined in

[src/widgets/Measure.tsx:421](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L421)

___

### layers

• `Protected` **layers**: `GroupLayer`

#### Defined in

[src/widgets/Measure.tsx:561](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L561)

___

### lengthUnit

• **lengthUnit**: `string` = `'feet'`

#### Defined in

[src/widgets/Measure.tsx:380](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L380)

___

### lengthUnits

• **lengthUnits**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `feet` | `string` |
| `kilometers` | `string` |
| `meters` | `string` |
| `miles` | `string` |
| `nautical-miles` | `string` |

#### Defined in

[src/widgets/Measure.tsx:382](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L382)

___

### localeFormat

• **localeFormat**: `boolean` = `true`

Format numbers, e.i. thousand separated, etc.

#### Defined in

[src/widgets/Measure.tsx:443](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L443)

___

### locationUnit

• **locationUnit**: `string` = `'dec'`

#### Defined in

[src/widgets/Measure.tsx:402](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L402)

___

### locationUnits

• **locationUnits**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dec` | `string` |
| `dms` | `string` |

#### Defined in

[src/widgets/Measure.tsx:404](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L404)

___

### optionsVisible

• `Protected` **optionsVisible**: `boolean` = `false`

#### Defined in

[src/widgets/Measure.tsx:593](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L593)

___

### pointSymbol

• `Protected` **pointSymbol**: `SimpleMarkerSymbol`

#### Defined in

[src/widgets/Measure.tsx:473](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L473)

___

### polygonSymbol

• `Protected` **polygonSymbol**: `SimpleFillSymbol`

#### Defined in

[src/widgets/Measure.tsx:527](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L527)

___

### polylineSymbol

• `Protected` **polylineSymbol**: `CIMSymbol`

#### Defined in

[src/widgets/Measure.tsx:486](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L486)

___

### sketch

• `Protected` **sketch**: `SketchViewModel`

Sketch VM for draw operations.

#### Defined in

[src/widgets/Measure.tsx:457](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L457)

___

### state

• `Protected` **state**: `MeasureState`

Widget state and measurement values.

#### Defined in

[src/widgets/Measure.tsx:575](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L575)

___

### textSymbol

• `Protected` **textSymbol**: `TextSymbol`

#### Defined in

[src/widgets/Measure.tsx:534](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L534)

___

### unitsPrecision

• **unitsPrecision**: `number` = `2`

Length, area and elevation precision.

#### Defined in

[src/widgets/Measure.tsx:432](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L432)

___

### view

• **view**: `MapView`

Map view to measure in.

#### Defined in

[src/widgets/Measure.tsx:377](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L377)

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

### \_addGraphics

▸ `Private` **_addGraphics**(`geometry`): `void`

Add additional graphics when complete.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polygon` \| `Polyline` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:1199](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1199)

___

### \_addLabels

▸ `Private` **_addLabels**(`geometry`, `layer?`): `void`

Add label graphics.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polygon` \| `Point` \| `Polyline` |
| `layer?` | `GraphicsLayer` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:1269](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1269)

___

### \_addPolygonOutline

▸ `Private` **_addPolygonOutline**(`geometry`, `layer`): `void`

Add outline to area polygon.
As of 4.22 api's sketch polyline symbol only shows CIM on active polygon sketch segment.

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polygon` |
| `layer` | `GraphicsLayer` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:1240](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1240)

___

### \_addSnappingLayer

▸ `Private` **_addSnappingLayer**(`layer`): `void`

Add layer as snapping source.

#### Parameters

| Name | Type |
| :------ | :------ |
| `layer` | `Layer` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:739](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L739)

___

### \_area

▸ `Private` **_area**(`polygon`): `void`

Measure area and set state.

#### Parameters

| Name | Type |
| :------ | :------ |
| `polygon` | `Polygon` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:994](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L994)

___

### \_areaEvent

▸ `Private` **_areaEvent**(`event`): `void`

Handle area event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `SketchViewModelCreateEvent` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:948](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L948)

___

### \_clearEvent

▸ `Private` **_clearEvent**(`button`): `void`

Wire clear button event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `button` | `HTMLCalciteButtonElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:853](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L853)

___

### \_createTextSymbol

▸ `Private` **_createTextSymbol**(`text`, `point?`, `angle?`): `TextSymbol`

Create and return new text symbol.

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `point?` | `boolean` |
| `angle?` | `number` |

#### Returns

`TextSymbol`

#### Defined in

[src/widgets/Measure.tsx:1369](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1369)

___

### \_elevation

▸ `Private` **_elevation**(`point`): `Promise`<`number`\>

Query elevation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `Point` |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/widgets/Measure.tsx:1136](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1136)

___

### \_elevationEvent

▸ `Private` **_elevationEvent**(`event`): `Promise`<`void`\>

Handle elevation event and set state.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `SketchViewModelCreateEvent` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/Measure.tsx:1093](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1093)

___

### \_format

▸ `Private` **_format**(`measurement`, `unit`, `label?`): `string`

Format measurement and units for display and labels.

#### Parameters

| Name | Type |
| :------ | :------ |
| `measurement` | `number` |
| `unit` | `string` |
| `label?` | `boolean` |

#### Returns

`string`

string

#### Defined in

[src/widgets/Measure.tsx:816](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L816)

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

### \_length

▸ `Private` **_length**(`polyline`): `void`

Measure length and set state.

#### Parameters

| Name | Type |
| :------ | :------ |
| `polyline` | `Polyline` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:924](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L924)

___

### \_lengthEvent

▸ `Private` **_lengthEvent**(`event`): `void`

Handle length event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `SketchViewModelCreateEvent` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:884](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L884)

___

### \_loadSettings

▸ `Private` **_loadSettings**(): `void`

Load settings from local storage.

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:659](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L659)

___

### \_location

▸ `Private` **_location**(`point`): `Object`

Location coordinates.

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `Point` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `string` \| `number` |
| `y` | `string` \| `number` |

#### Defined in

[src/widgets/Measure.tsx:1068](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1068)

___

### \_locationEvent

▸ `Private` **_locationEvent**(`event`): `void`

Handle location event and set state.

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `SketchViewModelCreateEvent` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:1027](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1027)

___

### \_measure

▸ `Private` **_measure**(`type`): `void`

Initiate measuring.

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"length"`` \| ``"location"`` \| ``"area"`` \| ``"elevation"`` \| ``"profile"`` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:861](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L861)

___

### \_measureEvent

▸ `Private` **_measureEvent**(`type`, `button`): `void`

Wire measure button event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"length"`` \| ``"location"`` \| ``"area"`` \| ``"elevation"`` \| ``"profile"`` |
| `button` | `HTMLCalciteButtonElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:842](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L842)

___

### \_midpoint

▸ `Private` **_midpoint**(`polyline`): `Point`

Return midpoint of polyline.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `polyline` | `Polyline` | Polyline |

#### Returns

`Point`

esri.Point

#### Defined in

[src/widgets/Measure.tsx:1430](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1430)

___

### \_polylineLabels

▸ `Private` **_polylineLabels**(`geometry`): `Graphic`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `geometry` | `Polygon` \| `Polyline` |

#### Returns

`Graphic`[]

#### Defined in

[src/widgets/Measure.tsx:1381](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1381)

___

### \_profileEvent

▸ `Private` **_profileEvent**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `SketchViewModelCreateEvent` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/Measure.tsx:1158](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1158)

___

### \_renderColorSelector

▸ `Private` **_renderColorSelector**(): `Element`

Render color tiles to select color.

#### Returns

`Element`

#### Defined in

[src/widgets/Measure.tsx:1833](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1833)

___

### \_renderUnitOptions

▸ `Private` **_renderUnitOptions**(`units`, `defaultUnit`): `Element`[]

Render unit select options.

#### Parameters

| Name | Type |
| :------ | :------ |
| `units` | `Object` |
| `defaultUnit` | `string` |

#### Returns

`Element`[]

#### Defined in

[src/widgets/Measure.tsx:1819](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1819)

___

### \_reset

▸ `Private` **_reset**(): `void`

Reset the widget.

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:770](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L770)

___

### \_round

▸ `Private` **_round**(`value`, `digits`): `number`

Round a number.

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |
| `digits` | `number` |

#### Returns

`number`

number

#### Defined in

[src/widgets/Measure.tsx:805](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L805)

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Measure.default)

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

[`default`](../wiki/widgets.Measure.default)

#### Inherited from

Widget.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

___

### \_setColors

▸ `Private` **_setColors**(`color`): `void`

Set symbol and profile colors.

#### Parameters

| Name | Type |
| :------ | :------ |
| `color` | `number`[] |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:719](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L719)

___

### \_textSymbolAngle

▸ `Private` **_textSymbolAngle**(`x1`, `y1`, `x2`, `y2`): `number`

Text symbol angle between two sets of points.

#### Parameters

| Name | Type |
| :------ | :------ |
| `x1` | `number` |
| `y1` | `number` |
| `x2` | `number` |
| `y2` | `number` |

#### Returns

`number`

#### Defined in

[src/widgets/Measure.tsx:1504](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1504)

___

### \_unitChangeEvent

▸ `Private` **_unitChangeEvent**(`type`, `select`): `void`

Wire unit select event.

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | ``"length"`` \| ``"location"`` \| ``"area"`` \| ``"elevation"`` |
| `select` | `HTMLCalciteSelectElement` |

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:831](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L831)

___

### \_unitsChange

▸ `Private` **_unitsChange**(): `Promise`<`void`\>

Handle unit changes.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/widgets/Measure.tsx:617](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L617)

___

### \_updateSettings

▸ `Private` **_updateSettings**(): `void`

Update settings local storage.

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:692](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L692)

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

Convenience method for widget control classes.

#### Returns

`void`

#### Defined in

[src/widgets/Measure.tsx:606](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L606)

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

[src/widgets/Measure.tsx:213](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L213)

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

[src/widgets/Measure.tsx:1520](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/Measure.tsx#L1520)

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

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/widgets.Measure.default)

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

[`default`](../wiki/widgets.Measure.default)

#### Inherited from

Widget.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/widgets.Measure.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/widgets.Measure.default)

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
