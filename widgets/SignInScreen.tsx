/**
 * A widget to display sign in button when auth is required.
 */

// namespaces and types
import cov = __cov;

// base imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './SignInScreen.scss';
const CSS = {
  base: 'cov-sign-in-screen',
  content: 'cov-sign-in-screen--content',
};

// class export
@subclass('cov.widgets.SignInScreen')
export default class SignInScreen extends Widget {
  @property()
  container = document.createElement('div');

  @property()
  oAuthViewModel!: cov.OAuthViewModel;

  @property()
  message = 'Please sign in to access this application.';

  constructor(properties: cov.SignInScreenProperties) {
    super(properties);
    // add directly to <body>
    document.body.append(this.container);
  }

  render(): tsx.JSX.Element {
    const { oAuthViewModel, message } = this;
    return (
      <div class={CSS.base}>
        <div class={CSS.content}>
          <p>{message}</p>
          <calcite-button width="full" icon-start="sign-in" onclick={oAuthViewModel.signIn.bind(oAuthViewModel)}>
            Sign In
          </calcite-button>
        </div>
      </div>
    );
  }
}
