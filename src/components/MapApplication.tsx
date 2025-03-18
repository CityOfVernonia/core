//////////////////////////////////////
// Namespaces, interfaces and types
//////////////////////////////////////
import esri = __esri;

import type { BasemapOptions } from './Basemap';
import type { DisclaimerOptions } from './DisclaimerDialog';
import type { ApplicationHeaderOptions } from './ApplicationHeader';
import type { ViewControlOptions } from './ViewControl2D';

/**
 * Options for shell panel component and action bar action.
 */
export interface Component {
  component: esri.Widget;
  icon: string;
  groupEnd?: boolean;
  text: string;
  type: 'calcite-dialog' | 'calcite-flow' | 'calcite-panel';
}

/**
 * Options to show alert.
 */
export interface AlertOptions {
  /**
   * Alert auto close duration.
   * Also sets `auto-close` property.
   */
  duration?: 'fast' | 'medium' | 'slow';
  /**
   * Alert icon.
   */
  icon?: string;
  /**
   * Alert kind.
   * @default 'brand'
   */
  kind?: 'brand' | 'danger' | 'info' | 'success' | 'warning';
  /**
   * Alert accessible label (required).
   */
  label: string;
  /**
   * Alert link options.
   */
  link?: {
    /**
     * Link text.
     */
    text: string;
    /**
     * Link href.
     * Also sets `target="_blank"`.
     */
    href?: string;
    /**
     * Link click event.
     */
    click?: () => void;
  };
  /**
   * Alert message (required).
   */
  message: string;
  /**
   * Alert title.
   */
  title?: string;
  /**
   * Width of alert in pixels.
   */
  width?: number;
}

/**
 * MapApplication component properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
  basemapOptions?: BasemapOptions;

  components?: Component[] | esri.Collection<Component>;

  disclaimerOptions?: DisclaimerOptions;

  endComponent?: Component;

  float?: boolean;

  header?: boolean;

  headerOptions?: ApplicationHeaderOptions;

  position?: 'end' | 'start';

  title: string;

  view: esri.MapView;

  viewControlOptions?: ViewControlOptions;
}

import esriConfig from '@arcgis/core/config';
import IdentityManager from '@arcgis/core/identity/IdentityManager';
import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';

//////////////////////////////////////
// Constants
//////////////////////////////////////
const CSS = {
  view: 'cov--map-application_view',
};

let KEY = 0;

export const SHOW_ALERT_TOPIC = 'map-application-show-alert';

/**
 * Map application component.
 */
@subclass('cov.components.MapApplication')
export default class MapApplication extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  private _container = document.createElement('calcite-shell');

  get container(): HTMLCalciteShellElement {
    return this._container;
  }

  set container(value: HTMLCalciteShellElement) {
    this._container = value;
  }

  constructor(properties: MapApplicationProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  override async postInitialize(): Promise<void> {
    const {
      basemapOptions,
      components,
      disclaimerOptions,
      container,
      endComponent,
      float,
      position,
      title,
      view,
      view: { ui },
      viewControlOptions,
    } = this;

    container.contentBehind = float; // must be programmatically set

    const loading = new (await import('./Loading')).default({ title });

    let includeDisclaimer = true;

    const Disclaimer = (await import('./DisclaimerDialog')).default;

    try {
      if (await IdentityManager.checkSignInStatus(esriConfig.portalUrl)) includeDisclaimer = false;
    } catch (error) {
      // @ts-expect-error checkSignInStatus returns object with message
      if (error.message !== 'User is not signed in.') console.log(error);
      includeDisclaimer = true;
    }
    if (includeDisclaimer && !Disclaimer.isAccepted()) new Disclaimer(disclaimerOptions);

    if (components && components.length) this._addComponents(components);

    if (endComponent) this._addComponents(new Collection([endComponent]), true);

    ui.remove(['attribution', 'zoom']);

    ui.add(
      new (await import('./Attribution')).default({ view }),
      position === 'start' ? 'bottom-right' : 'bottom-left',
    );

    ui.add(
      new (await import('./ViewControl2D')).default({ view, ...viewControlOptions }),
      position === 'start' ? 'top-right' : 'top-left',
    );

    if (basemapOptions) {
      ui.add(
        new (await import('./Basemap')).default({ view, ...basemapOptions }),
        position === 'start' ? 'bottom-left' : 'bottom-right',
      );
    }

    (await import('pubsub-js')).subscribe(SHOW_ALERT_TOPIC, (message: string, options: AlertOptions): void => {
      this._showAlert(options);
    });

    await view.when();

    loading.end();
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  readonly basemapOptions?: BasemapOptions;

  @property({ type: Collection })
  readonly components?: esri.Collection<Component>;

  readonly disclaimerOptions: DisclaimerOptions = {};

  readonly endComponent?: Component;

  readonly float = true;

  readonly header = true;

  readonly headerOptions: ApplicationHeaderOptions = {};

  readonly position: 'end' | 'start' = 'end';

  readonly title!: string;

  readonly view!: esri.MapView;

  readonly viewControlOptions?: ViewControlOptions;

  //////////////////////////////////////
  // Component variables and methods
  //////////////////////////////////////
  private _actionGroups: esri.Collection<tsx.JSX.Element> = new Collection();

  private _components: esri.Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _visibleComponent: string | null = null;

  private _addComponents(components: esri.Collection<Component>, end?: boolean): void {
    const { _actionGroups, _components } = this;

    let actions: tsx.JSX.Element[] = [];

    components.forEach((_component: Component, index: number): void => {
      const { component, icon, groupEnd, text, type } = _component;

      let element: tsx.JSX.Element | undefined;

      component.addHandles(component.on(SHOW_ALERT_TOPIC, this._showAlert.bind(this)));

      switch (type) {
        case 'calcite-dialog': {
          component.container = document.createElement(type);

          (component.container as HTMLCalciteDialogElement).open = false; // ensure closed

          document.body.append(component.container);

          break;
        }
        case 'calcite-flow': {
          element = (
            <calcite-flow
              afterCreate={(flow: HTMLCalciteFlowElement): void => {
                component.container = flow;
              }}
            ></calcite-flow>
          );

          break;
        }
        case 'calcite-panel': {
          element = (
            <calcite-panel
              afterCreate={(panel: HTMLCalcitePanelElement): void => {
                component.container = panel;
              }}
            ></calcite-panel>
          );
        }
      }

      if (element) {
        _components.add(element);

        this.addHandles(
          watch(
            (): string | null => this._visibleComponent,
            (id?: string | null): void => {
              component.visible = id === component.id;
            },
          ),
        );
      }

      const action = (
        <calcite-action
          icon={icon}
          text={text}
          afterCreate={(action: HTMLCalciteActionElement): void => {
            if (type === 'calcite-dialog') {
              action.addEventListener('click', (): void => {
                (component.container as HTMLCalciteDialogElement).open = true;
              });
            } else {
              action.addEventListener('click', (): void => {
                this._visibleComponent = this._visibleComponent === component.id ? null : component.id;
              });
              this.addHandles(
                watch(
                  (): string | null => this._visibleComponent,
                  (id?: string | null): void => {
                    action.active = id === component.id;
                  },
                ),
              );
            }
          }}
        >
          <calcite-tooltip close-on-click="" overlay-positioning="fixed" slot="tooltip">
            {text}
          </calcite-tooltip>
        </calcite-action>
      );

      actions.push(action);

      if (groupEnd || index + 1 === components.length) {
        _actionGroups.add(
          <calcite-action-group key={KEY++} slot={end ? 'actions-end' : null}>
            {actions}
          </calcite-action-group>,
        );
        actions = [];
      }
    });
  }

  //////////////////////////////////////
  // Alert variables and methods
  //////////////////////////////////////
  private _alerts: Collection<tsx.JSX.Element> = new Collection([<calcite-alert></calcite-alert>]); // load with dummy alert to prevent rendering errors

  private _showAlert(options: AlertOptions): void {
    const { _alerts } = this;

    const { duration, icon, kind, label, link, message, title, width } = options;

    _alerts.add(
      <calcite-alert
        key={KEY++}
        icon={icon || null}
        kind={kind || 'brand'}
        open
        label={label}
        auto-close={duration ? '' : null}
        auto-close-duration={duration || null}
        style={width ? `--calcite-alert-width: ${width}px` : null}
      >
        {title ? <div slot="title">{title}</div> : null}
        <div slot="message">{message}</div>
        {link ? (
          <calcite-link
            href={link.href || null}
            slot="link"
            target={link.href ? '_blank' : null}
            onclick={(link: HTMLCalciteLinkElement): void => {
              if (link.click) {
                link.addEventListener('click', link.click);
              }
            }}
          >
            {link.text}
          </calcite-link>
        ) : null}
      </calcite-alert>,
    );
  }

  //////////////////////////////////////
  // Rendering
  //////////////////////////////////////
  override render(): tsx.JSX.Element {
    const { header, headerOptions, float, position, title, _actionGroups, _alerts, _components, _visibleComponent } =
      this;

    return (
      <calcite-shell>
        {/* header */}
        {header ? (
          <div
            afterCreate={async (container: HTMLDivElement): Promise<void> => {
              new (await import('./ApplicationHeader')).default({ container, title, ...headerOptions });
            }}
          ></div>
        ) : null}

        {/* view */}
        <div class={CSS.view} afterCreate={this._viewAfterCreate.bind(this)}></div>

        {/* component shell panel */}
        {_components.length ? (
          <calcite-shell-panel
            collapsed={_visibleComponent === null}
            display-mode={float ? 'float-content' : 'dock'}
            position={position}
            slot={`panel-${position}`}
          >
            {/* action bar */}
            <calcite-action-bar slot="action-bar" afterCreate={this._actionBarAfterCreate.bind(this)}>
              {_actionGroups.toArray()}
            </calcite-action-bar>
            {_components.toArray()}
          </calcite-shell-panel>
        ) : null}

        {/* alerts */}
        <div slot="alerts">{_alerts.length ? _alerts.toArray() : null}</div>
      </calcite-shell>
    );
  }

  //////////////////////////////////////
  // Render support methods
  //////////////////////////////////////
  private _actionBarAfterCreate(actionBar: HTMLCalciteActionBarElement): void {
    const { float, position, view } = this;

    if (!float) return;

    const setPadding = (): void => {
      const width = actionBar.getBoundingClientRect().width;
      view.padding =
        position === 'start'
          ? {
              ...view.padding,
              left: width,
            }
          : {
              ...view.padding,
              right: width,
            };
    };

    setPadding();

    new ResizeObserver((): void => {
      setPadding();
    }).observe(actionBar);
  }

  private _viewAfterCreate(div: HTMLDivElement): void {
    const { view } = this;
    view.container = div;
  }
}
