import cov = __cov;
import { watch } from '@arcgis/core/core/watchUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx, storeNode } from '@arcgis/core/widgets/support/widget';
import md5 from 'md5';
import Cookie from 'js-cookie';

const CSS = {
  loader: 'cov-application--loader',
  loaderContent: 'cov-application--loader--content',
  loaderTitle: 'cov-application--loader--title',
  loaderText: 'cov-application--loader--text',
  loaderHeart: 'cov-application--loader--heart',
  loaderCoffee: 'cov-application--loader--coffee',
};

const LOADER_COOKIE = 'loader-credentials';

/**
 * Loading screen widget with options to lazy password protect an app or force oAuth sign in.
 */
@subclass('cov.Application.Loader')
export default class Loader extends Widget {
  constructor(properties?: esri.WidgetProperties & cov.ApplicationProperties['loaderOptions']) {
    super(properties);
    document.body.append(this.container);
  }

  postInitialize(): void {
    const { credentials } = this;
    const cookie = Cookie.get(LOADER_COOKIE);

    if (!cookie || !credentials) return;

    const [_user, _password] = cookie.split('.');

    if (_user === credentials.user && _password === credentials.password) {
      this._signedIn = true;
      this._cookie = true;
    }
  }

  readonly container = document.createElement('div');

  copyright = 'City of Vernonia';

  credentials!: {
    password: string;
    user: string;
  };

  oAuthViewModel?: cov.OAuthViewModel;

  title = 'My Map';

  where = 'Vernonia, Oregon';

  private _user!: HTMLCalciteInputElement;

  private _userMessage!: HTMLCalciteInputMessageElement;

  private _password!: HTMLCalciteInputElement;

  private _passwordMessage!: HTMLCalciteInputMessageElement;

  private _button!: HTMLCalciteButtonElement;

  // requires decoration to watch
  @property()
  private _signedIn = false;

  private _cookie = false;

  private _heart =
    'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z';

  private _coffee =
    'M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z';

  /**
   * Begin countdown to fade out and destroy.
   */
  end(): void {
    const { credentials, oAuthViewModel, _signedIn, _cookie } = this;

    if (oAuthViewModel && !oAuthViewModel.signedIn) return;

    if (credentials && !_cookie) {
      if (_signedIn) {
        this._end(0, 1000);
      } else {
        this.own(
          watch(this, '_signedIn', (signedIn: boolean): void => {
            signedIn ? this._end(0, 1000) : null;
          }),
        );
      }
    } else {
      this._end(3000, 4000);
    }
  }

  /**
   * Fade and destroy.
   * @param fade
   * @param destroy
   */
  private _end(fade: number, destroy: number): void {
    setTimeout((): void => {
      (this.container as HTMLDivElement).style.opacity = '0';
    }, fade);
    setTimeout((): void => {
      this.destroy();
    }, destroy);
  }

  /**
   * Check credentials.
   * @param event
   */
  private _signIn(event: Event): void {
    event.preventDefault();

    const {
      credentials: { user, password },
      _user,
      _userMessage,
      _password,
      _passwordMessage,
      _button,
    } = this;

    _user.status = 'idle';
    _password.status = 'idle';

    const userValid = md5(_user.value) === user;

    const passwordValid = md5(_password.value) === password;

    if (!userValid) {
      _user.status = 'invalid';
      _userMessage.active = true;
    }

    if (!passwordValid) {
      _password.status = 'invalid';
      _passwordMessage.active = true;
    }

    if (!userValid) {
      _user.setFocus();
    } else if (!passwordValid) {
      _password.setFocus();
    }

    if (userValid && passwordValid) {
      _user.disabled = true;
      _password.disabled = true;
      _button.disabled = true;
      this._signedIn = true;
      Cookie.set(LOADER_COOKIE, `${user}.${password}`, { expires: 30 });
    }
  }

  /**
   * Render widget.
   * @returns VNode
   */
  render(): esri.widget.tsx.JSX.Element {
    const { copyright, credentials, oAuthViewModel, title, where, _coffee, _heart, _signedIn } = this;

    return (
      <div class={CSS.loader} style="transition: opacity 1s;">
        <div class={CSS.loaderContent}>
          {title ? <div class={CSS.loaderTitle}>{title}</div> : null}

          {credentials && !oAuthViewModel && !_signedIn ? (
            <form onsubmit={this._signIn.bind(this)}>
              <calcite-label>
                User
                <calcite-input type="text" afterCreate={storeNode.bind(this)} data-node-ref="_user"></calcite-input>
                <calcite-input-message
                  icon=""
                  status="invalid"
                  afterCreate={storeNode.bind(this)}
                  data-node-ref="_userMessage"
                >
                  Invalid user
                </calcite-input-message>
              </calcite-label>
              <calcite-label>
                Password
                <calcite-input
                  type="password"
                  name="P"
                  afterCreate={storeNode.bind(this)}
                  data-node-ref="_password"
                ></calcite-input>
                <calcite-input-message
                  icon=""
                  status="invalid"
                  afterCreate={storeNode.bind(this)}
                  data-node-ref="_passwordMessage"
                >
                  Invalid password
                </calcite-input-message>
              </calcite-label>
              <calcite-button
                type="submit"
                icon-start="sign-in"
                afterCreate={storeNode.bind(this)}
                data-node-ref="_button"
              >
                Sign in
              </calcite-button>
            </form>
          ) : null}

          {oAuthViewModel && !oAuthViewModel.signedIn ? (
            <calcite-button icon-start="sign-in" width="auto" onclick={oAuthViewModel.signIn.bind(oAuthViewModel)}>
              Sign In
            </calcite-button>
          ) : null}

          {!credentials && (!oAuthViewModel || (oAuthViewModel && oAuthViewModel.signedIn)) ? (
            <calcite-progress type="indeterminate"></calcite-progress>
          ) : null}

          {copyright ? (
            <div class={CSS.loaderText}>
              Copyright &copy; {new Date().getFullYear()} {copyright}
            </div>
          ) : null}

          {where ? (
            <div class={CSS.loaderText}>
              <span>Made with</span>
              <svg
                class={CSS.loaderHeart}
                aria-hidden="true"
                focusable="false"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path fill="currentColor" d={_heart}></path>
              </svg>
              <span>and</span>
              <svg
                class={CSS.loaderCoffee}
                aria-hidden="true"
                focusable="false"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
              >
                <path fill="currentColor" d={_coffee}></path>
              </svg>
              <span>in Vernonia, Oregon</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
