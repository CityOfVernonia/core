# Interface: PanelWidget

[layouts/ShellApplicationMap](../wiki/layouts.ShellApplicationMap).PanelWidget

Properties to initialize a widget in the shell panel with an action in the action bar.
Must return a `calcite-panel`, `calcite-flow`, `calcite-modal`, or `div` VNode; widget `container` property must not be set; and corresponding VNode `type` must be provided.

## Table of contents

### Properties

- [actionEnd](../wiki/layouts.ShellApplicationMap.PanelWidget#actionend)
- [groupEnd](../wiki/layouts.ShellApplicationMap.PanelWidget#groupend)
- [icon](../wiki/layouts.ShellApplicationMap.PanelWidget#icon)
- [open](../wiki/layouts.ShellApplicationMap.PanelWidget#open)
- [text](../wiki/layouts.ShellApplicationMap.PanelWidget#text)
- [type](../wiki/layouts.ShellApplicationMap.PanelWidget#type)
- [widget](../wiki/layouts.ShellApplicationMap.PanelWidget#widget)

## Properties

### actionEnd

• `Optional` **actionEnd**: `boolean`

Group action in `actions-end` slot.
`groupEnd` has no effect on bottom slotted actions.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:107](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L107)

___

### groupEnd

• `Optional` **groupEnd**: `boolean`

Groups all actions above up to another ActionWidgets `groupEnd` into a group.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:111](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L111)

___

### icon

• **icon**: `string`

Action icon (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:115](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L115)

___

### open

• `Optional` **open**: `boolean`

Widget is `open` on load.
Only opens first widget with `open` property.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:120](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L120)

___

### text

• **text**: `string`

Action text (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:124](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L124)

___

### type

• **type**: ``"div"`` \| ``"calcite-flow"`` \| ``"calcite-modal"`` \| ``"calcite-panel"``

Type of element to create for widget (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:128](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L128)

___

### widget

• **widget**: `Widget` & { `onHide?`: () => `undefined` \| `void` ; `onShow?`: () => `undefined` \| `void`  }

The widget instance (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:132](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L132)
