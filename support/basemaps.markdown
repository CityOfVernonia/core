## cov/support/basemaps

Methods to return Vernonia hillshade and hybrid basemaps.

### Usage

```typescript
import { hybridBasemap } from '@vernonia/core/support/basemaps';

const basemap = hybridBasemap('my_key');
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
