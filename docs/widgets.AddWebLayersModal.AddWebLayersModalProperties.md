# Interface: AddWebLayersModalProperties

[widgets/AddWebLayersModal](../wiki/widgets.AddWebLayersModal).AddWebLayersModalProperties

## Hierarchy

- `WidgetProperties`

  ↳ **`AddWebLayersModalProperties`**

## Table of contents

### Properties

- [container](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#container)
- [icon](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#icon)
- [id](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#id)
- [label](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#label)
- [view](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#view)
- [visible](../wiki/widgets.AddWebLayersModal.AddWebLayersModalProperties#visible)

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

### view

• **view**: `SceneView` \| `MapView`

Map or scene view to add layers.

#### Defined in

[src/widgets/AddWebLayersModal.tsx:10](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/AddWebLayersModal.tsx#L10)

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
