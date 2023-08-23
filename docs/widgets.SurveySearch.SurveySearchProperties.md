# Interface: SurveySearchProperties

[widgets/SurveySearch](../wiki/widgets.SurveySearch).SurveySearchProperties

Survey Search widget properties.

## Hierarchy

- `WidgetProperties`

  ↳ **`SurveySearchProperties`**

## Table of contents

### Properties

- [container](../wiki/widgets.SurveySearch.SurveySearchProperties#container)
- [icon](../wiki/widgets.SurveySearch.SurveySearchProperties#icon)
- [id](../wiki/widgets.SurveySearch.SurveySearchProperties#id)
- [label](../wiki/widgets.SurveySearch.SurveySearchProperties#label)
- [surveys](../wiki/widgets.SurveySearch.SurveySearchProperties#surveys)
- [taxLots](../wiki/widgets.SurveySearch.SurveySearchProperties#taxlots)
- [view](../wiki/widgets.SurveySearch.SurveySearchProperties#view)
- [visible](../wiki/widgets.SurveySearch.SurveySearchProperties#visible)

## Properties

### container

• `Optional` **container**: `string` \| `HTMLElement`

The ID or node representing the DOM element containing the widget.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#container)

#### Inherited from

esri.WidgetProperties.container

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112296

___

### icon

• `Optional` **icon**: `string`

Icon which represents the widget.

**`Default`**

```ts
null

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#icon)
```

#### Inherited from

esri.WidgetProperties.icon

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112304

___

### id

• `Optional` **id**: `string`

The unique ID assigned to the widget when the widget is created.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#id)

#### Inherited from

esri.WidgetProperties.id

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112310

___

### label

• `Optional` **label**: `string`

The widget's label.

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#label)

#### Inherited from

esri.WidgetProperties.label

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112316

___

### surveys

• **surveys**: `FeatureLayer` \| `GeoJSONLayer`

Surveys layer.

#### Defined in

[src/widgets/SurveySearch.tsx:22](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L22)

___

### taxLots

• **taxLots**: `FeatureLayer`

Tax lots layer.

#### Defined in

[src/widgets/SurveySearch.tsx:26](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L26)

___

### view

• **view**: `MapView`

Map view.

#### Defined in

[src/widgets/SurveySearch.tsx:30](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/SurveySearch.tsx#L30)

___

### visible

• `Optional` **visible**: `boolean`

Indicates whether the widget is visible.

**`Default`**

```ts
true

[Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html#visible)
```

#### Inherited from

esri.WidgetProperties.visible

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:112324
