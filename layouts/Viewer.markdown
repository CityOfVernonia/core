## cov/layouts/Viewer

Web map application layout with header and optional menu for most applications.

### Usage

```typescript
import Viewer from '@vernonia/core/layouts/Viewer';

new Viewer({
  view,
  title: 'My App',
});
```

**Note:** This widget creates its own `container` element and appends to document body.

### Properties

```typescript
export interface ViewerProperties extends esri.WidgetProperties {
  /**
   * Map or scene view.
   */
  view: esri.MapView | esri.SceneView;
  /**
   * Application title.
   */
  title?: string;
  /**
   * Include search in header.
   * @default true
   */
  includeSearch?: boolean;
  /**
   * Optional search view model to back header search.
   */
  searchViewModel?: esri.SearchViewModel;
  /**
   * OAuth view model to back header account control.
   */
  oAuthViewModel?: cov.OAuthViewModel;
  /**
   * Widgets to add to menu.
   */
  menuWidgets?: cov.WidgetInfo[] | esri.Collection<cov.WidgetInfo>;
}
```

### Class

```typescript
export class Viewer extends esri.Widget {
  constructor(properties: ViewerProperties);
  view: esri.MapView | esri.SceneView;
  title: string;
  includeSearch: boolean;
  searchViewModel: esri.SearchViewModel;
  oAuthViewModel: OAuthViewModel;
  menuWidgets: esri.Collection<WidgetInfo>;
}
```
