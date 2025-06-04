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

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import logoSvg from './../support/logo';
import { referenceElement } from './support';

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
  }

  readonly search!: esri.SearchViewModel;

  @property({ aliasOf: 'search.activeSource' })
  private _activeSource!: esri.LayerSearchSource;

  private _autocomplete!: HTMLCalciteAutocompleteElement;

  private _searchAbortController: AbortController | null = null;

  private _selectingResult = false;

  @property({ aliasOf: 'search.sources' })
  private _sources!: esri.Collection<esri.LayerSearchSource>;

  @property()
  private _sourcesDropdownItems: esri.Collection<tsx.JSX.Element> = new Collection();

  @property()
  private _suggestions: esri.Collection<esri.SuggestResult> = new Collection();

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
              // this._sourcesDropdownOpen = false;

              search.activeSourceIndex = index;

              // this._input.focus();
            });
          }}
        >
          {name}
        </calcite-dropdown-item>,
      );
    });
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
    const { search, _autocomplete, _selectingResult, _suggestions, _view } = this;

    if (_selectingResult) return;

    this._selectingResult = true;

    _autocomplete.inputValue = suggestion.text as string;

    _suggestions.removeAll();

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

      this._selectingResult = false;
    } catch (error) {
      this._selectingResult = false;

      console.log(error);
    }
  }

  override render(): tsx.JSX.Element {
    const { _activeSource, _sources, _sourcesDropdownItems } = this;

    return _activeSource ? (
      <div class={CSS.search}>
        {_sources && _sources.length > 1 ? (
          <calcite-dropdown overlay-positioning="fixed" afterCreate={this._dropdownAfterCreate.bind(this)}>
            <calcite-button icon-start="chevron-down" slot="trigger"></calcite-button>
            <calcite-dropdown-group>{_sourcesDropdownItems.toArray()}</calcite-dropdown-group>
          </calcite-dropdown>
        ) : null}
        <form afterCreate={this._formAfterCreate.bind(this)}>
          <calcite-autocomplete
            autocomplete={false}
            icon={false}
            placeholder={_activeSource.placeholder}
            afterCreate={this._autocompleteAfterCreate.bind(this)}
          >
            {this._renderSuggestions()}
          </calcite-autocomplete>
        </form>
        <calcite-button icon-start="search" afterCreate={this._buttonAfterCreate.bind(this)}></calcite-button>
      </div>
    ) : (
      <div></div>
    );
  }

  private _renderSuggestions(): tsx.JSX.Element[] {
    const { _suggestions } = this;

    if (_suggestions.length === 0) return [];

    return _suggestions.toArray().map((suggestion: esri.SuggestResult): tsx.JSX.Element => {
      return (
        <calcite-autocomplete-item key={KEY++} heading={suggestion.text} value={suggestion}>
          <calcite-icon icon="search" scale="s" slot="content-start"></calcite-icon>
        </calcite-autocomplete-item>
      );
    });
  }

  private _autocompleteAfterCreate(autocomplete: HTMLCalciteAutocompleteElement): void {
    this._autocomplete = autocomplete;

    autocomplete.addEventListener('calciteAutocompleteTextInput', (): void => {
      const { _selectingResult, _suggestions } = this;

      if (_selectingResult) return;

      const { inputValue } = autocomplete;

      if (!inputValue) {
        _suggestions.removeAll();

        return;
      }

      this._search(inputValue);
    });

    autocomplete.addEventListener('calciteAutocompleteChange', (): void => {
      const suggestion = autocomplete.value as unknown as esri.SuggestResult;

      if (!suggestion) return;

      this._selectResult(suggestion);
    });
  }

  private _buttonAfterCreate(button: HTMLCalciteButtonElement): void {
    button.addEventListener('click', (): void => {
      const { _autocomplete, _suggestions } = this;

      const suggestion = _suggestions.getItemAt(0);

      if (suggestion) {
        this._selectResult(suggestion);
      } else if (_autocomplete.inputValue) {
        _autocomplete.selectText();
      } else {
        _autocomplete.setFocus();
      }
    });
  }

  private _dropdownAfterCreate(dropdown: HTMLCalciteDropdownElement): void {
    dropdown.addEventListener('calciteDropdownSelect', (): void => {
      const { _autocomplete, _suggestions } = this;

      _suggestions.removeAll();

      _autocomplete.inputValue = '';

      _autocomplete.setFocus();
    });
  }

  private _formAfterCreate(form: HTMLFormElement): void {
    form.addEventListener('submit', (event: Event): void => {
      event.preventDefault();

      const { _suggestions } = this;

      const suggestion = _suggestions.getItemAt(0);

      if (!suggestion) return;

      this._selectResult(suggestion);
    });
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
