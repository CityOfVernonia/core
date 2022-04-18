import esri = __esri;

import type OAuth from './../support/OAuth';

import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const CSS = {
  base: 'cov-account-control',
  info: 'cov-account-control--info',
  links: 'cov-account-control--links',
};

/**
 * Account control widget.
 */
@subclass('cov.widgets.AccountControl')
export default class AccountControl extends Widget {
  constructor(properties: esri.WidgetProperties & { oAuth: OAuth }) {
    super(properties);
  }

  oAuth!: OAuth;

  render(): tsx.JSX.Element {
    const { oAuth } = this;

    return oAuth.signedIn ? (
      <div class={CSS.base}>
        <div class={CSS.info}>
          <calcite-avatar
            scale="l"
            username={oAuth.username}
            full-name={oAuth.name}
            thumbnail={oAuth.user && oAuth.user.thumbnailUrl ? oAuth.user.thumbnailUrl : ''}
          ></calcite-avatar>
          <div>
            <div>{oAuth.name}</div>
            <div>{oAuth.username}</div>
          </div>
        </div>
        <div class={CSS.links}>
          <calcite-link href={`${oAuth.portal.url}/home/content.html`} target="_blank">
            My Content
          </calcite-link>
          <calcite-link href={`${oAuth.portal.url}/home/user.html`} target="_blank">
            My Profile
          </calcite-link>
        </div>
        <calcite-button width="full" appearance="outline" icon-start="sign-out" onclick={oAuth.signOut.bind(oAuth)}>
          Sign Out
        </calcite-button>
      </div>
    ) : (
      <div class={CSS.base}>
        <calcite-button width="full" onclick={oAuth.signIn.bind(oAuth)}>
          Sign In
        </calcite-button>
      </div>
    );
  }
}
