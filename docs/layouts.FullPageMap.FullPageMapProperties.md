# Interface: FullPageMapProperties

[layouts/FullPageMap](../wiki/layouts.FullPageMap).FullPageMapProperties

FullPageMap widget constructor properties.

## Hierarchy

- `WidgetProperties`

  ↳ **`FullPageMapProperties`**

## Table of contents

### Properties

- [container](../wiki/layouts.FullPageMap.FullPageMapProperties#container)
- [disclaimerOptions](../wiki/layouts.FullPageMap.FullPageMapProperties#disclaimeroptions)
- [icon](../wiki/layouts.FullPageMap.FullPageMapProperties#icon)
- [id](../wiki/layouts.FullPageMap.FullPageMapProperties#id)
- [includeDisclaimer](../wiki/layouts.FullPageMap.FullPageMapProperties#includedisclaimer)
- [label](../wiki/layouts.FullPageMap.FullPageMapProperties#label)
- [loaderOptions](../wiki/layouts.FullPageMap.FullPageMapProperties#loaderoptions)
- [nextBasemap](../wiki/layouts.FullPageMap.FullPageMapProperties#nextbasemap)
- [view](../wiki/layouts.FullPageMap.FullPageMapProperties#view)
- [viewControlOptions](../wiki/layouts.FullPageMap.FullPageMapProperties#viewcontroloptions)
- [visible](../wiki/layouts.FullPageMap.FullPageMapProperties#visible)

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

### disclaimerOptions

• `Optional` **disclaimerOptions**: [`DisclaimerOptions`](../wiki/widgets.Disclaimer.DisclaimerOptions)

Disclaimer options.

#### Defined in

[src/layouts/FullPageMap.tsx:13](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L13)

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

### includeDisclaimer

• `Optional` **includeDisclaimer**: `boolean`

Include disclaimer.

**`Default`**

```ts
true
```

#### Defined in

[src/layouts/FullPageMap.tsx:18](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L18)

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

### loaderOptions

• `Optional` **loaderOptions**: [`LoaderOptions`](../wiki/widgets.Loader.LoaderOptions)

Loader options.

#### Defined in

[src/layouts/FullPageMap.tsx:22](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L22)

___

### nextBasemap

• `Optional` **nextBasemap**: `Basemap`

Next basemap for basemap toggle.

#### Defined in

[src/layouts/FullPageMap.tsx:26](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L26)

___

### view

• **view**: `SceneView` \| `MapView`

Map or scene to display.

#### Defined in

[src/layouts/FullPageMap.tsx:30](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L30)

___

### viewControlOptions

• `Optional` **viewControlOptions**: [`ViewControlOptions`](../wiki/widgets.ViewControl2D.ViewControlOptions)

View control options.

#### Defined in

[src/layouts/FullPageMap.tsx:34](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/FullPageMap.tsx#L34)

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
