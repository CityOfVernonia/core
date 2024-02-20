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
import Accessor from '@arcgis/core/core/Accessor';
/**
 * Module for handling auth.
 */
declare class OAuth extends Accessor {
    constructor(properties: OAuthProperties);
    oAuthInfo: esri.OAuthInfo;
    portal: esri.Portal;
    signInUrl: string;
    credential: esri.Credential;
    fullName: string;
    thumbnailUrl: string;
    user: esri.PortalUser;
    username: string;
    signedIn: boolean;
    /**
     * Load the view model.
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
    /**
     * Complete successful sign in.
     * @param credential
     * @param resolve
     */
    private _completeSignIn;
}
export default OAuth;
