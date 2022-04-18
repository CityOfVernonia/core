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
import Accessor from '@arcgis/core/core/Accessor';
/**
 * A module for handling OAuth and signing in and out of applications.
 */
export default class OAuth extends Accessor {
    constructor(properties: OAuthProperties);
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
     * Complete successful sign in.
     * @param credential
     * @param resolve
     */
    private _completeSignIn;
    /**
     * Sign into the application.
     */
    signIn(): void;
    /**
     * Sign out of the application.
     */
    signOut(): void;
}
