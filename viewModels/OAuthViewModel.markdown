## cov/viewModels/OAuthViewModel

A view model for handling OAuth and signing in and out of applications.

### Usage

```typescript
import OAuthViewModel from '@vernonia/core/viewModels/OAuthViewModel';

const oAuthViewModel = new OAuthViewModel({
  portal: new Portal(),
  oAuthInfo: new OAuthInfo({
    portalUrl: esriConfig.portalUrl,
    appId: 'abcde12345',
    popup: true,
  }),
});

// portal must be loaded
oAuthViewModel.portal.load()
  .then(() => {
    oAuthViewModel.load()
      .then((authed: boolean) => {
        // ... //
      });
  });
```

### Properties

```typescript
export interface OAuthViewModelProperties extends Object {
  /**
   * Portal instance to sign into.
   */
  portal: esri.Portal;
  /**
   * OAuthInfo instance to perform authentication against.
   */
  oAuthInfo: esri.OAuthInfo;
  /**
   * Alternate sign in url.
   *
   * Overrides default `${portal.url}/sharing/rest`.
   */
  signInUrl?: string;
}
```

### Class

```typescript
export class OAuthViewModel extends esri.Accessor {
  constructor(properties: OAuthViewModelProperties);
  portal: esri.Portal;
  oAuthInfo: esri.OAuthInfo;
  signInUrl: string;
  credential: esri.Credential;
  user: esri.PortalUser;
  name: string;
  username: string;
  signedIn: boolean;
  /**
   * Load the view model.
   *
   * @returns Promise<true | false> user signed in.
   */
  load(): Promise<boolean>;
  /**
   * Sign into the application.
   */
  signIn(): void;
  /**
   * Sign out of the application.
   */
  signOut(): void;
}
```
