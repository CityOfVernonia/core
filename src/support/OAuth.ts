import esri = __esri;

/**
 * OAuth properties.
 */
export interface OAuthProperties extends Object {
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

import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Accessor from '@arcgis/core/core/Accessor';
import Error from '@arcgis/core/core/Error';
import esriId from '@arcgis/core/identity/IdentityManager';
import Portal from '@arcgis/core/portal/Portal';

// oauth constants
const LS_CRED = 'jsapiauthcred';

/**
 * A module for handling OAuth and signing in and out of applications.
 */
@subclass('cov.support.OAuth')
export default class OAuth extends Accessor {
  constructor(properties: OAuthProperties) {
    super(properties);
  }

  @property()
  portal!: esri.Portal;

  @property()
  oAuthInfo!: esri.OAuthInfo;

  @property()
  signInUrl!: string;

  @property()
  credential!: esri.Credential;

  @property({ aliasOf: 'portal.user' })
  user!: esri.PortalUser;

  @property({ aliasOf: 'user.fullName' })
  name!: string;

  @property({ aliasOf: 'user.username' })
  username!: string;

  @property()
  signedIn = false;

  /**
   * Load the view model.
   *
   * @returns Promise<true | false> user signed in.
   */
  load(): Promise<boolean> {
    const { portal, oAuthInfo } = this;

    esriId.registerOAuthInfos([oAuthInfo]);

    // set `oAuthViewModel` on esriId to access auth, user, etc
    // via `esriId` in other modules and widgets
    // @ts-ignore
    esriId['oAuthViewModel'] = this;

    return new Promise((resolve, reject) => {
      if (portal.loaded) {
        // check for sign in
        esriId
          .checkSignInStatus(portal.url)
          .then((credential: esri.Credential) => {
            // complete successful sign in
            this._completeSignIn(credential, resolve as (value?: boolean | PromiseLike<boolean>) => void);
          })
          .catch((checkSignInError: esri.Error): void => {
            if (checkSignInError.message === 'User is not signed in.') {
              // check local storage
              const localStorageAuth = localStorage.getItem(LS_CRED);
              if (localStorageAuth) {
                const cred = JSON.parse(localStorageAuth);
                // check for stored credentials with null values
                if (!cred.token) {
                  localStorage.removeItem(LS_CRED);
                  resolve(false);
                  return;
                }
                // register token
                esriId.registerToken(cred);
                // check for sign in
                esriId
                  .checkSignInStatus(portal.url)
                  .then(async (credential: esri.Credential) => {
                    // replace portal instance
                    this.portal = new Portal();
                    await this.portal.load();
                    // complete successful sign in
                    this._completeSignIn(credential, resolve as (value?: boolean | PromiseLike<boolean>) => void);
                  })
                  .catch(() => {
                    // neither signed into portal or with valid local storage
                    resolve(false);
                  });
              } else {
                resolve(false);
              }
            } else {
              reject(checkSignInError);
            }
          });
      } else {
        // reject if portal is not loaded
        reject(
          new Error(
            'OAuthViewModelLoadError',
            'Portal instance must be loaded before loading OAuthViewModel instance.',
          ),
        );
      }
    });
  }

  /**
   * Complete successful sign in.
   * @param credential
   * @param resolve
   */
  private _completeSignIn(
    credential: esri.Credential,
    resolve: (value?: boolean | PromiseLike<boolean>) => void,
  ): void {
    // set local storage
    // @ts-ignore
    localStorage.setItem(LS_CRED, JSON.stringify(credential.toJSON()));
    // set class properties
    this.credential = credential;
    this.signedIn = true;
    // resolve signed in
    resolve(true);
    // reset local storage when token is changed
    // seems legit...but unsure if it will cause any issues at this point
    credential.on('token-change', (): void => {
      // @ts-ignore
      localStorage.setItem(LS_CRED, JSON.stringify(this.credential.toJSON()));
    });
  }

  /**
   * Sign into the application.
   */
  signIn(): void {
    const url = this.signInUrl || `${this.portal.url}/sharing/rest`;
    esriId
      // @ts-ignore
      .oAuthSignIn(url, esriId.findServerInfo(url), this.oAuthInfo, {
        oAuthPopupConfirmation: false,
        signal: new AbortController().signal,
      })
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        // do nothing...user aborted sign in
      });
  }

  /**
   * Sign out of the application.
   */
  signOut(): void {
    esriId.destroyCredentials();
    localStorage.removeItem(LS_CRED);
    window.location.reload();
  }
}
