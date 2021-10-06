## cov/support/basemaps

Methods to return Vernonia hillshade and hybrid basemaps.

### Usage

```typescript
import FullMap from '@vernonia/core/layouts/FullMap';

new FullMap({
  view,
  title: 'My App',
});
```

```typescript
export interface basemaps {
  /**
   * Return hillshade basemap.
   */
  hillshadeBasemap(): esri.Basemap;
  /**
   * Return hybrid basemap.
   * @param key bingMapsKey
   */
  hybridBasemap(key: string): esri.Basemap;
}
```
