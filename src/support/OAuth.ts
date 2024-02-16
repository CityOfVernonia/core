//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * OAuth constructor properties.
 */
export interface OAuthProperties {
  /**
   * OAuthInfo instance to perform authentication against.
   */
  oAuthInfo: esri.OAuthInfo;
  /**
   * Portal instance to sign into.
   */
  portal: esri.Portal;
  /**
   * Alternate sign in url.
   * Overrides default `${portal.url}/sharing/rest`.
   */
  signInUrl?: string;
}

//////////////////////////////////////
// Modules
//////////////////////////////////////
import Accessor from '@arcgis/core/core/Accessor';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Error from '@arcgis/core/core/Error';
import esriId from '@arcgis/core/identity/IdentityManager';
import Portal from '@arcgis/core/portal/Portal';

// OAuth local storage credential name
const LS_CRED = 'jsapiauthcred';

/**
 * Module for handling auth.
 */
@subclass('cov.support.OAuth')
class OAuth extends Accessor {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(properties: OAuthProperties) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  oAuthInfo!: esri.OAuthInfo;

  portal!: esri.Portal;

  signInUrl!: string;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  protected credential!: esri.Credential;

  @property({ aliasOf: 'user.fullName' })
  protected fullName!: string;

  @property({ aliasOf: 'user.thumbnailUrl' })
  protected thumbnailUrl!: string;

  @property({ aliasOf: 'portal.user' })
  protected user!: esri.PortalUser;

  @property({ aliasOf: 'user.username' })
  protected username!: string;

  protected signedIn = false;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Load the view model.
   * @returns Promise<true | false> user signed in.
   */
  load(): Promise<boolean> {
    const { portal, oAuthInfo } = this;
    esriId.registerOAuthInfos([oAuthInfo]);
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
                  .catch((): void => {
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
        reject(new Error('OAuthLoadError', 'Portal instance must be loaded before loading OAuth instance.'));
      }
    });
  }

  /**
   * Sign into the application.
   */
  signIn(): void {
    const url = this.signInUrl || `${this.portal.url}/sharing/rest`;
    const auth = esriId as esri.IdentityManager & {
      oAuthSignIn: (
        url: string,
        serverInfo: esri.ServerInfo,
        oAuthInfo: esri.OAuthInfo,
        options: { oAuthPopupConfirmation?: boolean; signal: AbortSignal },
      ) => Promise<any>;
    };
    auth
      .oAuthSignIn(url, esriId.findServerInfo(url), this.oAuthInfo, {
        oAuthPopupConfirmation: false,
        signal: new AbortController().signal,
      })
      .then((): void => {
        window.location.reload();
      })
      .catch((): void => {
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

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
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
    localStorage.setItem(LS_CRED, JSON.stringify((credential as esri.Credential & { toJSON: () => any }).toJSON()));
    // set class properties
    this.credential = credential;
    this.signedIn = true;
    // resolve signed in
    resolve(true);
    // reset local storage when token is changed
    // seems legit...but unsure if it will cause any issues at this point
    credential.on('token-change', (): void => {
      localStorage.setItem(
        LS_CRED,
        JSON.stringify((this.credential as esri.Credential & { toJSON: () => any }).toJSON()),
      );
    });
  }
}

export default OAuth;
