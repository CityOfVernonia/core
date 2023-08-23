# Interface: AlertOptions

[layouts/ShellApplicationMap](../wiki/layouts.ShellApplicationMap).AlertOptions

Options to show alert.

## Table of contents

### Properties

- [duration](../wiki/layouts.ShellApplicationMap.AlertOptions#duration)
- [icon](../wiki/layouts.ShellApplicationMap.AlertOptions#icon)
- [kind](../wiki/layouts.ShellApplicationMap.AlertOptions#kind)
- [label](../wiki/layouts.ShellApplicationMap.AlertOptions#label)
- [link](../wiki/layouts.ShellApplicationMap.AlertOptions#link)
- [message](../wiki/layouts.ShellApplicationMap.AlertOptions#message)
- [title](../wiki/layouts.ShellApplicationMap.AlertOptions#title)

## Properties

### duration

• `Optional` **duration**: ``"medium"`` \| ``"fast"`` \| ``"slow"``

Alert auto close duration.
Also sets `auto-close` property.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:56](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L56)

___

### icon

• `Optional` **icon**: `string`

Alert icon.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:60](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L60)

___

### kind

• `Optional` **kind**: ``"success"`` \| ``"info"`` \| ``"warning"`` \| ``"danger"`` \| ``"brand"``

Alert kind.

**`Default`**

```ts
'brand'
```

#### Defined in

[src/layouts/ShellApplicationMap.tsx:65](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L65)

___

### label

• **label**: `string`

Alert accessible label (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:69](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L69)

___

### link

• `Optional` **link**: `Object`

Alert link options.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `click?` | () => `void` | Link click event. |
| `href?` | `string` | Link href. Also sets `target="_blank"`. |
| `text` | `string` | Link text. |

#### Defined in

[src/layouts/ShellApplicationMap.tsx:73](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L73)

___

### message

• **message**: `string`

Alert message (required).

#### Defined in

[src/layouts/ShellApplicationMap.tsx:91](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L91)

___

### title

• `Optional` **title**: `string`

Alert title.

#### Defined in

[src/layouts/ShellApplicationMap.tsx:95](https://github.com/CityOfVernonia/core/blob/ba79e76/src/layouts/ShellApplicationMap.tsx#L95)
