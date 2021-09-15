/**
 * A widget to display sign in button or user account control in the header of layouts.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './HeaderAccountControl.scss';
const CSS = {
  base: 'cov-header-account-control',
  popup: 'cov-header-account-control--popup',
  popupClose: 'cov-header-account-control--popup--close',
  popupVisible: 'cov-header-account-control--popup--visible',
};

// class export
@subclass('cov.widgets.HeaderAccountControl')
export default class HeaderAccountControl extends Widget {
  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property()
  private _popupVisible = false;

  constructor(properties: cov.HeaderAccountControlProperties) {
    super(properties);
  }

  render(): tsx.JSX.Element {
    const { oAuthViewModel, _popupVisible } = this;
    return oAuthViewModel.signedIn ? (
      <div class={CSS.base}>
        <calcite-avatar
          scale="s"
          username={oAuthViewModel.username}
          full-name={oAuthViewModel.name}
          thumbnail={oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''}
          title={`Signed in as ${oAuthViewModel.name}`}
          onclick={(): void => {
            this._popupVisible = !this._popupVisible;
          }}
        ></calcite-avatar>

        {/* user menu */}
        <div class={this.classes(CSS.popup, _popupVisible ? CSS.popupVisible : '')}>
          <div>
            <calcite-avatar
              scale="l"
              username={oAuthViewModel.username}
              full-name={oAuthViewModel.name}
              thumbnail={
                oAuthViewModel.user && oAuthViewModel.user.thumbnailUrl ? oAuthViewModel.user.thumbnailUrl : ''
              }
            ></calcite-avatar>
          </div>
          <div>{oAuthViewModel.name}</div>
          <div>{oAuthViewModel.username}</div>
          <div>
            <calcite-link href={`${oAuthViewModel.portal.url}/home/content.html`} target="_blank">
              My Content
            </calcite-link>
          </div>
          <div>
            <calcite-link href={`${oAuthViewModel.portal.url}/home/user.html`} target="_blank">
              My Profile
            </calcite-link>
          </div>
          <calcite-button width="full" icon-start="sign-out" onclick={oAuthViewModel.signOut.bind(oAuthViewModel)}>
            Sign Out
          </calcite-button>
          {/* close button */}
          <calcite-action
            class={CSS.popupClose}
            appearance="clear"
            icon="x"
            onclick={(): void => {
              this._popupVisible = false;
            }}
          ></calcite-action>
        </div>
      </div>
    ) : (
      <div class={CSS.base}>
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
