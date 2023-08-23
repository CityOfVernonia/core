# Class: default

[support/OAuth](../wiki/support.OAuth).default

Module for handling auth.

## Hierarchy

- `Accessor`

  ↳ **`default`**

## Table of contents

### Constructors

- [constructor](../wiki/support.OAuth.default#constructor)

### Properties

- [credential](../wiki/support.OAuth.default#credential)
- [declaredClass](../wiki/support.OAuth.default#declaredclass)
- [destroyed](../wiki/support.OAuth.default#destroyed)
- [fullName](../wiki/support.OAuth.default#fullname)
- [initialized](../wiki/support.OAuth.default#initialized)
- [oAuthInfo](../wiki/support.OAuth.default#oauthinfo)
- [portal](../wiki/support.OAuth.default#portal)
- [signInUrl](../wiki/support.OAuth.default#signinurl)
- [signedIn](../wiki/support.OAuth.default#signedin)
- [thumbnailUrl](../wiki/support.OAuth.default#thumbnailurl)
- [user](../wiki/support.OAuth.default#user)
- [username](../wiki/support.OAuth.default#username)

### Methods

- [\_completeSignIn](../wiki/support.OAuth.default#_completesignin)
- [\_get](../wiki/support.OAuth.default#_get)
- [\_set](../wiki/support.OAuth.default#_set)
- [addHandles](../wiki/support.OAuth.default#addhandles)
- [destroy](../wiki/support.OAuth.default#destroy)
- [get](../wiki/support.OAuth.default#get)
- [hasHandles](../wiki/support.OAuth.default#hashandles)
- [load](../wiki/support.OAuth.default#load)
- [notifyChange](../wiki/support.OAuth.default#notifychange)
- [own](../wiki/support.OAuth.default#own)
- [removeHandles](../wiki/support.OAuth.default#removehandles)
- [set](../wiki/support.OAuth.default#set)
- [signIn](../wiki/support.OAuth.default#signin)
- [signOut](../wiki/support.OAuth.default#signout)
- [watch](../wiki/support.OAuth.default#watch)

## Constructors

### constructor

• **new default**(`properties`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `properties` | `Object` | - |
| `properties.oAuthInfo` | `OAuthInfo` | OAuthInfo instance to perform authentication against. |
| `properties.portal` | `Portal` | Portal instance to sign into. |
| `properties.signInUrl?` | `string` | Alternate sign in url. Overrides default `${portal.url}/sharing/rest`. |

#### Overrides

Accessor.constructor

#### Defined in

[src/support/OAuth.ts:26](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L26)

## Properties

### credential

• **credential**: `Credential`

#### Defined in

[src/support/OAuth.ts:56](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L56)

___

### declaredClass

• **declaredClass**: `string`

#### Inherited from

Accessor.declaredClass

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:18

___

### destroyed

• **destroyed**: `boolean`

#### Inherited from

Accessor.destroyed

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:16

___

### fullName

• **fullName**: `string`

#### Defined in

[src/support/OAuth.ts:59](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L59)

___

### initialized

• **initialized**: `boolean`

#### Inherited from

Accessor.initialized

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:17

___

### oAuthInfo

• **oAuthInfo**: `OAuthInfo`

#### Defined in

[src/support/OAuth.ts:47](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L47)

___

### portal

• **portal**: `Portal`

#### Defined in

[src/support/OAuth.ts:49](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L49)

___

### signInUrl

• **signInUrl**: `string`

#### Defined in

[src/support/OAuth.ts:51](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L51)

___

### signedIn

• **signedIn**: `boolean` = `false`

#### Defined in

[src/support/OAuth.ts:70](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L70)

___

### thumbnailUrl

• **thumbnailUrl**: `string`

#### Defined in

[src/support/OAuth.ts:62](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L62)

___

### user

• **user**: `PortalUser`

#### Defined in

[src/support/OAuth.ts:65](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L65)

___

### username

• **username**: `string`

#### Defined in

[src/support/OAuth.ts:68](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L68)

## Methods

### \_completeSignIn

▸ `Private` **_completeSignIn**(`credential`, `resolve`): `void`

Complete successful sign in.

#### Parameters

| Name | Type |
| :------ | :------ |
| `credential` | `Credential` |
| `resolve` | (`value?`: `boolean` \| `PromiseLike`<`boolean`\>) => `void` |

#### Returns

`void`

#### Defined in

[src/support/OAuth.ts:176](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L176)

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

Accessor.\_get

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

Accessor.\_get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:33

___

### \_set

▸ `Protected` **_set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/support.OAuth.default)

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

[`default`](../wiki/support.OAuth.default)

#### Inherited from

Accessor.\_set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:34

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

Accessor.addHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:28

___

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

#### Inherited from

Accessor.destroy

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:20

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

Accessor.get

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

Accessor.get

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:22

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

Accessor.hasHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:30

___

### load

▸ **load**(): `Promise`<`boolean`\>

Load the view model.

#### Returns

`Promise`<`boolean`\>

Promise<true | false> user signed in.

#### Defined in

[src/support/OAuth.ts:79](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L79)

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

Accessor.notifyChange

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:31

___

### own

▸ **own**(`handles`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `handles` | `IHandle` \| `IHandle`[] |

#### Returns

`void`

**`Deprecated`**

Since 4.25. Use addHandles(), removeHandles() and hasHandles() instead.

#### Inherited from

Accessor.own

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:27

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

Accessor.removeHandles

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:29

___

### set

▸ **set**<`T`\>(`propertyName`, `value`): [`default`](../wiki/support.OAuth.default)

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

[`default`](../wiki/support.OAuth.default)

#### Inherited from

Accessor.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:23

▸ **set**(`props`): [`default`](../wiki/support.OAuth.default)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `HashMap`<`any`\> |

#### Returns

[`default`](../wiki/support.OAuth.default)

#### Inherited from

Accessor.set

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:24

___

### signIn

▸ **signIn**(): `void`

Sign into the application.

#### Returns

`void`

#### Defined in

[src/support/OAuth.ts:136](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L136)

___

### signOut

▸ **signOut**(): `void`

Sign out of the application.

#### Returns

`void`

#### Defined in

[src/support/OAuth.ts:162](https://github.com/CityOfVernonia/core/blob/ba79e76/src/support/OAuth.ts#L162)

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

Accessor.watch

#### Defined in

node_modules/@arcgis/core/interfaces.d.ts:25
