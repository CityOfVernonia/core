import cov = __cov;
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

const CSS = {
  userControl: 'cov-application--user-control',
  userControlSignedIn: 'cov-application--user-control--signed-in',
  userControlSignedOut: 'cov-application--user-control--signed-out',
  user: 'cov-application--user',
  userInfo: 'cov-application--user--info',
  userLinks: 'cov-application--user--links',
};

/**
 * User control widget.
 */
@subclass('cov.Application.UserControl')
export class UserControl extends Widget {
  constructor(properties: esri.WidgetProperties & { oAuthViewModel: cov.OAuthViewModel }) {
    super(properties);
  }

  oAuthViewModel!: cov.OAuthViewModel;

  render(): esri.widget.tsx.JSX.Element {
    const { id, oAuthViewModel } = this;

    const _id = `popover_${id}`;

    return oAuthViewModel.signedIn ? (
      <div class={this.classes(CSS.userControl, CSS.userControlSignedIn)}>
        <calcite-popover-manager auto-close="">
          <calcite-popover placement="left-leading" overlay-positioning="fixed" reference-element={_id}>
            <div class={CSS.user}>
              <div class={CSS.userInfo}>
                <calcite-avatar
                  scale="l"
                  username={oAuthViewModel.username}
                  full-name={oAuthViewModel.name}
                  thumbnail={
                    oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''
                  }
                ></calcite-avatar>
                <div>
                  <div>{oAuthViewModel.name}</div>
                  <div>{oAuthViewModel.username}</div>
                </div>
              </div>
              <div class={CSS.userLinks}>
                <calcite-link href={`${oAuthViewModel.portal.url}/home/content.html`} target="_blank">
                  My Content
                </calcite-link>
                <calcite-link href={`${oAuthViewModel.portal.url}/home/user.html`} target="_blank">
                  My Profile
                </calcite-link>
              </div>
              <calcite-button
                width="full"
                appearance="outline"
                icon-start="sign-out"
                onclick={oAuthViewModel.signOut.bind(oAuthViewModel)}
              >
                Sign Out
              </calcite-button>
            </div>
          </calcite-popover>
          <calcite-avatar
            id={_id}
            style="cursor: pointer;"
            scale="s"
            username={oAuthViewModel.username}
            full-name={oAuthViewModel.name}
            thumbnail={oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''}
            title={`Signed in as ${oAuthViewModel.name}`}
          ></calcite-avatar>
        </calcite-popover-manager>
      </div>
    ) : (
      <div class={this.classes(CSS.userControl, CSS.userControlSignedOut)}>
        <calcite-button
          icon-start="sign-in"
          scale="s"
          round=""
          appearance="transparent"
          color="inverse"
          title="Sign In"
          onclick={oAuthViewModel.signIn.bind(oAuthViewModel)}
        >
          Sign In
        </calcite-button>
      </div>
    );
  }
}
