# Interface: ShellApplicationMapProperties

[layouts/ShellApplicationMap](../wiki/layouts.ShellApplicationMap).ShellApplicationMapProperties

ShellApplicationMap widget constructor properties.

## Hierarchy

- `WidgetProperties`

  ↳ **`ShellApplicationMapProperties`**

## Table of contents

### Properties

- [container](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#container)
- [contentBehind](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#contentbehind)
- [disclaimerOptions](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#disclaimeroptions)
- [footer](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#footer)
- [header](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#header)
- [headerOptions](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#headeroptions)
- [icon](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#icon)
- [id](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#id)
- [includeDisclaimer](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#includedisclaimer)
- [includeHeader](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#includeheader)
- [label](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#label)
- [loaderOptions](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#loaderoptions)
- [nextBasemap](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#nextbasemap)
- [panelPosition](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#panelposition)
- [panelWidgets](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#panelwidgets)
- [shellPanel](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#shellpanel)
- [title](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#title)
- [view](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#view)
- [viewControlOptions](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#viewcontroloptions)
- [visible](../wiki/layouts.ShellApplicationMap.ShellApplicationMapProperties#visible)

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

### contentBehind

• `Optional` **contentBehind**: `boolean`

Floating panels.

**`Default`**

```ts
true
```

#### Defined in

[src/layouts/ShellApplicationMap.tsx:152](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L152)

___

### disclaimerOptions

• `Optional` **disclaimerOptions**: [`DisclaimerOptions`](../wiki/widgets.Disclaimer.DisclaimerOptions)

Disclaimer options.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:156](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L156)

___

### footer

• `Optional` **footer**: `Widget`

Custom footer widget.
Must return a `div` VNode, and widget `container` must not be set.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:161](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L161)

___

### header

• `Optional` **header**: `Widget`

Custom header widget.
Must return a `div` VNode, and widget `container` must not be set.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:166](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L166)

___

### headerOptions

• `Optional` **headerOptions**: `Object`

Header options for default header.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `logoUrl?` | `string` \| ``false`` | Header logo URL. Set to `false` for no logo. Defaults to `Vernonia 3 Trees` logo. |
| `oAuth?` | [`default`](../wiki/support.OAuth.default) | OAuth instance for header user control. |
| `searchViewModel?` | `SearchViewModel` | Search view model for header search. |
| `title?` | `string` | Header title. **`Default`** ```ts 'Vernonia' ``` |

#### Defined in

[src/layouts/ShellApplicationMap.tsx:170](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L170)

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

[src/layouts/ShellApplicationMap.tsx:175](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L175)

___

### includeHeader

• `Optional` **includeHeader**: `boolean`

Include header.

**`Default`**

```ts
true
```

#### Defined in

[src/layouts/ShellApplicationMap.tsx:180](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L180)

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

[src/layouts/ShellApplicationMap.tsx:184](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L184)

___

### nextBasemap

• `Optional` **nextBasemap**: `Basemap`

Next basemap for basemap toggle.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:188](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L188)

___

### panelPosition

• `Optional` **panelPosition**: ``"end"`` \| ``"start"``

Position of the shell panel (action bar and widgets) and places view control opposite.

**`Default`**

```ts
'start'
```

#### Defined in

[src/layouts/ShellApplicationMap.tsx:193](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L193)

___

### panelWidgets

• `Optional` **panelWidgets**: `Collection`<[`PanelWidget`](../wiki/layouts.ShellApplicationMap.PanelWidget)\> \| [`PanelWidget`](../wiki/layouts.ShellApplicationMap.PanelWidget)[]

Widgets to add to action bar.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:197](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L197)

___

### shellPanel

• `Optional` **shellPanel**: `Widget`

Shell panel widget. Supersedes `panelWidgets`.
Must return a `calcite-shell-panel` VNode, and widget `container` must not be set.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:202](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L202)

___

### title

• `Optional` **title**: `string`

Application title.
Convenience property to set loader and header titles without needing to pass loader or header options.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:207](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L207)

___

### view

• **view**: `SceneView` \| `MapView`

Map or scene to display.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:211](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L211)

___

### viewControlOptions

• `Optional` **viewControlOptions**: [`ViewControlOptions`](../wiki/widgets.ViewControl2D.ViewControlOptions)

View control options.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:215](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L215)

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
