import esri = __esri;

import type OAuth from './../support/OAuth';

/**
 * Options for configuring ApplicationHeader search bar and user control.
 */
export interface ApplicationHeaderOptions {
  /**
   * OAuth instance for header user control.
   */
  oAuth?: OAuth;
  /**
   * Search view model instance for header search bar.
   * `view` property must be set to interact with the map view.
   */
  search?: esri.SearchViewModel;
}

/**
 * ApplicationHeader constructor properties.
 */
export interface ApplicationHeaderProperties extends esri.WidgetProperties, ApplicationHeaderOptions {
  /**
   * Application title.
   */
  title: string;
}

import { watch } from '@arcgis/core/core/reactiveUtils';
import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import logoSvg from './../support/logo';
import { referenceElement, wrapValuesInHtml } from './support';

const CSS_BASE = {
  HEADER: 'cov--application-header',
  SEARCH: 'cov--header-search',
  USER: 'cov--header-user',
};

const CSS = {
  header: CSS_BASE.HEADER,
  headerTitleContainer: `${CSS_BASE.HEADER}_title-container`,
  headerTitleLogo: `${CSS_BASE.HEADER}_title-logo`,
  headerTitleText: `${CSS_BASE.HEADER}_title-text`,
  headerSearchContainer: `${CSS_BASE.HEADER}_search-container`,
  headerControlsContainer: `${CSS_BASE.HEADER}_controls-container`,
  search: CSS_BASE.SEARCH,
  searchWrapper: `${CSS_BASE.SEARCH}_wrapper`,
  searchBar: `${CSS_BASE.SEARCH}_bar`,
  searchButton: `${CSS_BASE.SEARCH}_button`,
  searchForm: `${CSS_BASE.SEARCH}_form`,
  searchInput: `${CSS_BASE.SEARCH}_input`,
  searchDropdown: `${CSS_BASE.SEARCH}_dropdown`,
  user: CSS_BASE.USER,
  userPopover: `${CSS_BASE.USER}_popover`,
};

let KEY = 0;

/**
 * Header component for applications with search bar and user control.
 */
@subclass('cov.components.ApplicationHeader')
export default class ApplicationHeader extends Widget {
  constructor(properties: ApplicationHeaderProperties) {
    super(properties);
  }

  readonly oAuth?: OAuth;

  readonly search?: esri.SearchViewModel;

  readonly title!: string;

  override render(): tsx.JSX.Element {
    const { title } = this;

    return (
      <div class={CSS.header} slot="header">
        <div class={CSS.headerTitleContainer}>
          <img class={CSS.headerTitleLogo} src={logoSvg}></img>
          <div class={CSS.headerTitleText}>{title}</div>
        </div>
        <div class={CSS.headerSearchContainer}>
          <div
            afterCreate={(container: HTMLDivElement): void => {
              const { search } = this;
              if (search) new HeaderSearch({ container, search });
            }}
          ></div>
        </div>
        <div class={CSS.headerControlsContainer}>
          {/* other controls here */}
          <div
            afterCreate={(container: HTMLDivElement): void => {
              const { oAuth } = this;
              if (oAuth) new HeaderUser({ container, oAuth });
            }}
          ></div>
        </div>
      </div>
    );
  }
}

@subclass('HeaderSearch')
class HeaderSearch extends Widget {
  constructor(properties: esri.WidgetProperties & { search: esri.SearchViewModel }) {
    super(properties);

    const { search } = properties;

    search.includeDefaultSources = false;

    search.searchAllEnabled = false;
  }

  override async postInitialize(): Promise<void> {
    const { _sources } = this;

    this._addSources(_sources);

    this.addHandles(_sources.on('change', this._addSources.bind(this, _sources)));

    this.addHandles(
      watch(
        (): string => this._value,
        (value: string): void => {
          if (value) this._search(value);
        },
      ),
    );
  }

  readonly search!: esri.SearchViewModel;

  @property({ aliasOf: 'search.activeSource' })
  private _activeSource!: esri.LayerSearchSource;

  private _input!: HTMLInputElement;

  private _searchAbortController: AbortController | null = null;

  @property({ aliasOf: 'search.sources' })
  private _sources!: esri.Collection<esri.LayerSearchSource>;

  private _sourcesDropdown!: HTMLCalciteDropdownElement;

  private _sourcesDropdownItems: esri.Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _sourcesDropdownOpen = false;

  @property()
  private _suggestions: esri.Collection<esri.SuggestResult> = new Collection();

  private _suggestionsDropdown!: HTMLCalciteDropdownElement;

  @property()
  private _value = '';

  @property({ aliasOf: 'search.view' })
  private _view?: esri.MapView;

  private _addSources(sources: esri.Collection<esri.LayerSearchSource>): void {
    const { search, _activeSource, _sourcesDropdownItems } = this;

    _sourcesDropdownItems.removeAll();

    sources.forEach((source: esri.LayerSearchSource, index: number): void => {
      const { name } = source;

      _sourcesDropdownItems.add(
        <calcite-dropdown-item
          key={KEY++}
          selected={_activeSource === source}
          afterCreate={(dropdownItem: HTMLCalciteDropdownItemElement): void => {
            dropdownItem.addEventListener('calciteDropdownItemSelect', (): void => {
              this._sourcesDropdownOpen = false;

              search.activeSourceIndex = index;

              this._input.focus();
            });
          }}
        >
          {name}
        </calcite-dropdown-item>,
      );
    });
  }

  private _clear(): void {
    const { _input, _suggestions, _view } = this;

    _input.value = '';

    _suggestions.removeAll();

    if (_view) _view.closePopup();

    this._value = '';
  }

  private async _search(value: string): Promise<void> {
    const { search, _suggestions } = this;

    this._searchAbort();

    _suggestions.removeAll();

    const controller = new AbortController();
    const { signal } = controller;
    this._searchAbortController = controller;

    try {
      // @ts-expect-error signal is not typed
      const response = await search.suggest(value, null, { signal });

      if (this._searchAbortController !== controller) return;
      this._searchAbortController = null;

      if (!response || !response.numResults) return;

      _suggestions.addMany(response.results[0].results || []);
    } catch (error) {
      this._searchAbortController = null;
      // @ts-expect-error error has message
      if (error.message !== 'Aborted') console.log(error);
    }
  }

  private _searchAbort(): void {
    const { _searchAbortController } = this;
    if (_searchAbortController) {
      _searchAbortController.abort();
      this._searchAbortController = null;
    }
  }

  private async _selectResult(suggestion: esri.SuggestResult): Promise<void> {
    const { search, _input, _view } = this;

    _input.value = suggestion.text || '';

    try {
      const response = (await search.search(suggestion)) as esri.SearchViewModelSearchResponse;

      const results = response.results[0];

      if (!results.results) return;

      const feature = results.results[0].feature;

      this.emit('selected-result', feature);

      if (_view) {
        _view.goTo(feature.geometry);

        if (feature.geometry && feature.geometry.type === 'point') _view.scale = 1200;

        _view.openPopup({ features: [feature] });
      }
    } catch (error) {
      console.log(error);
    }
  }

  override render(): tsx.JSX.Element {
    const { _activeSource, _suggestions, _sources, _sourcesDropdownItems, _sourcesDropdownOpen, _value } = this;

    return _activeSource ? (
      <div class={CSS.search}>
        <div class={CSS.searchWrapper}>
          <div class={CSS.searchBar}>
            <calcite-icon
              class={CSS.searchButton}
              hidden={_sources && _sources.length <= 1 ? true : false}
              icon="chevron-down"
              roll="button"
              afterCreate={this._sourcesButtonAfterCreate.bind(this)}
            ></calcite-icon>
            <form class={CSS.searchForm} afterCreate={this._searchFormAfterCreate.bind(this)}>
              <input
                class={CSS.searchInput}
                placeholder={_activeSource.placeholder}
                type="text"
                afterCreate={this._searchInputAfterCreate.bind(this)}
              ></input>
            </form>
            <calcite-icon
              class={CSS.searchButton}
              hidden={!_value}
              icon="x"
              roll="button"
              afterCreate={this._clearButtonAfterCreate.bind(this)}
            ></calcite-icon>
            <calcite-icon class={CSS.searchButton} icon="search" roll="button"></calcite-icon>
          </div>
          {/* suggestions list */}
          <calcite-dropdown
            class={CSS.searchDropdown}
            role="listbox"
            open={_suggestions.length > 0}
            afterCreate={this._suggestionDropdownAfterCreate.bind(this)}
          >
            <calcite-button slot="trigger" style="display: none"></calcite-button>
            <calcite-dropdown-group selection-mode="none">{this._renderSuggestions()}</calcite-dropdown-group>
          </calcite-dropdown>

          {/* sources list */}
          <calcite-dropdown
            class={CSS.searchDropdown}
            role="listbox"
            open={_sourcesDropdownOpen}
            afterCreate={this._sourcesDropdownAfterCreate.bind(this)}
          >
            <calcite-button slot="trigger" style="display: none !important;"></calcite-button>
            <calcite-dropdown-group>{_sourcesDropdownItems.toArray()}</calcite-dropdown-group>
          </calcite-dropdown>
        </div>
      </div>
    ) : (
      <div></div>
    );
  }

  private _renderSuggestions(): tsx.JSX.Element[] {
    const { _suggestions, _value } = this;

    if (_suggestions.length === 0) return [];

    return _suggestions.toArray().map((suggestion: esri.SuggestResult): tsx.JSX.Element => {
      return (
        <calcite-dropdown-item
          key={KEY++}
          afterCreate={(dropdownItem: HTMLCalciteDropdownItemElement): void => {
            dropdownItem.innerHTML = wrapValuesInHtml(suggestion.text || '', _value);

            dropdownItem.addEventListener('calciteDropdownItemSelect', this._selectResult.bind(this, suggestion));
          }}
        ></calcite-dropdown-item>
      );
    });
  }

  private _clearButtonAfterCreate(icon: HTMLCalciteIconElement): void {
    icon.addEventListener('click', this._clear.bind(this));
  }

  private _searchFormAfterCreate(form: HTMLFormElement): void {
    form.addEventListener('submit', (event: Event): void => {
      event.preventDefault();

      const {
        _input: { value },
        _suggestions,
      } = this;

      if (_suggestions.length) {
        const item = _suggestions.find((suggestion: esri.SuggestResult): boolean => {
          return value === suggestion.text;
        });

        if (item) this._selectResult(item);
      }
    });
  }

  private _searchInputAfterCreate(input: HTMLInputElement): void {
    this._input = input;

    input.addEventListener('input', (): void => {
      const { value } = input;

      this._value = value;
    });

    input.addEventListener('keydown', (event: KeyboardEvent): void => {
      const { key } = event;

      if (key !== 'Escape' && key !== 'ArrowDown') return;

      const { _suggestions, _suggestionsDropdown } = this;

      if (key === 'Escape') this._clear();

      if (key === 'ArrowDown' && _suggestions.length)
        _suggestionsDropdown.querySelector('calcite-dropdown-item')?.setFocus();
    });
  }

  private _sourcesDropdownAfterCreate(dropdown: HTMLCalciteDropdownElement): void {
    this._sourcesDropdown = dropdown;

    dropdown.addEventListener('calciteDropdownClose', (): void => {
      this._sourcesDropdownOpen = false;
    });
  }

  private _sourcesButtonAfterCreate(button: HTMLCalciteIconElement): void {
    button.addEventListener('click', (): void => {
      const { _sourcesDropdown } = this;

      this._clear();

      this._sourcesDropdownOpen = true;

      _sourcesDropdown.querySelector('calcite-dropdown-item')?.setFocus();
    });
  }

  private _suggestionDropdownAfterCreate(dropdown: HTMLCalciteDropdownElement): void {
    this._suggestionsDropdown = dropdown;
  }
}

@subclass('HeaderUser')
class HeaderUser extends Widget {
  constructor(
    properties: esri.WidgetProperties & {
      oAuth: OAuth;
    },
  ) {
    super(properties);
  }

  readonly oAuth!: OAuth;

  render(): tsx.JSX.Element {
    const {
      oAuth,
      oAuth: { signedIn, fullName, username, thumbnailUrl },
    } = this;

    return signedIn ? (
      <div class={CSS.user}>
        <calcite-avatar full-name={fullName} thumbnail={thumbnailUrl} role="button"></calcite-avatar>
        <calcite-popover auto-close="" label="Sign out" overlay-positioning="fixed" afterCreate={referenceElement}>
          <div class={CSS.userPopover}>
            <div>{fullName}</div>
            <span>{username}</span>
            <calcite-button scale="small" width="full" onclick={oAuth.signOut.bind(oAuth)}>
              Sign out
            </calcite-button>
          </div>
        </calcite-popover>
      </div>
    ) : (
      <div class={CSS.user}>
        <calcite-icon icon="sign-in" role="button" onclick={oAuth.signIn.bind(oAuth)}></calcite-icon>
        <calcite-tooltip label="Sign in" overlay-positioning="fixed" afterCreate={referenceElement}>
          Sign in
        </calcite-tooltip>
      </div>
    );
  }
}
