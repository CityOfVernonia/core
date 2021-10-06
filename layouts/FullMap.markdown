## cov/layouts/FullMap

Full page map application layout.

### Usage

```typescript
import FullMap from '@vernonia/core/layouts/FullMap';

new FullMap({
  view,
  title: 'My App',
});
```

**Note:** This widget creates its own `container` element and appends to document body.

### Properties

```typescript
export interface FullMapProperties extends esri.WidgetProperties {
  /**
   * Map or scene view.
   */
  view: esri.MapView | esri.SceneView;
  /**
   * Application title.
   */
  title?: string;
}
```

### Class

```typescript
export class FullMap extends esri.Widget {
  constructor(properties: FullMapProperties);
  view: esri.MapView | esri.SceneView;
  title: string;
}
```
