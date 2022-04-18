import { __awaiter, __decorate } from "tslib";
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
let OAuth = class OAuth extends Accessor {
    constructor(properties) {
        super(properties);
        this.signedIn = false;
    }
    /**
     * Load the view model.
     *
     * @returns Promise<true | false> user signed in.
     */
    load() {
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
                    .then((credential) => {
                    // complete successful sign in
                    this._completeSignIn(credential, resolve);
                })
                    .catch((checkSignInError) => {
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
                                .then((credential) => __awaiter(this, void 0, void 0, function* () {
                                // replace portal instance
                                this.portal = new Portal();
                                yield this.portal.load();
                                // complete successful sign in
                                this._completeSignIn(credential, resolve);
                            }))
                                .catch(() => {
                                // neither signed into portal or with valid local storage
                                resolve(false);
                            });
                        }
                        else {
                            resolve(false);
                        }
                    }
                    else {
                        reject(checkSignInError);
                    }
                });
            }
            else {
                // reject if portal is not loaded
                reject(new Error('OAuthViewModelLoadError', 'Portal instance must be loaded before loading OAuthViewModel instance.'));
            }
        });
    }
    /**
     * Complete successful sign in.
     * @param credential
     * @param resolve
     */
    _completeSignIn(credential, resolve) {
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
        credential.on('token-change', () => {
            // @ts-ignore
            localStorage.setItem(LS_CRED, JSON.stringify(this.credential.toJSON()));
        });
    }
    /**
     * Sign into the application.
     */
    signIn() {
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
    signOut() {
        esriId.destroyCredentials();
        localStorage.removeItem(LS_CRED);
        window.location.reload();
    }
};
__decorate([
    property()
], OAuth.prototype, "portal", void 0);
__decorate([
    property()
], OAuth.prototype, "oAuthInfo", void 0);
__decorate([
    property()
], OAuth.prototype, "signInUrl", void 0);
__decorate([
    property()
], OAuth.prototype, "credential", void 0);
__decorate([
    property({ aliasOf: 'portal.user' })
], OAuth.prototype, "user", void 0);
__decorate([
    property({ aliasOf: 'user.fullName' })
], OAuth.prototype, "name", void 0);
__decorate([
    property({ aliasOf: 'user.username' })
], OAuth.prototype, "username", void 0);
__decorate([
    property()
], OAuth.prototype, "signedIn", void 0);
OAuth = __decorate([
    subclass('cov.support.OAuth')
], OAuth);
export default OAuth;
