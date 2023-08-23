# Interface: PrintFIRMetteProperties

[widgets/PrintFIRMette](../wiki/widgets.PrintFIRMette).PrintFIRMetteProperties

## Hierarchy

- `WidgetProperties`

  ↳ **`PrintFIRMetteProperties`**

## Table of contents

### Properties

- [container](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#container)
- [icon](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#icon)
- [id](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#id)
- [label](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#label)
- [layer](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#layer)
- [view](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#view)
- [visible](../wiki/widgets.PrintFIRMette.PrintFIRMetteProperties#visible)

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

### layer

• **layer**: `MapImageLayer`

Flood hazard map layer.

#### Defined in

[src/widgets/PrintFIRMette.tsx:16](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L16)

___

### view

• **view**: `MapView`

Map view.

#### Defined in

[src/widgets/PrintFIRMette.tsx:20](https://github.com/CityOfVernonia/core/blob/ba79e76/src/widgets/PrintFIRMette.tsx#L20)

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
