/**
 * Full page map application layout.
 */

// namespaces and types
import cov = __cov;

// imports
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

// styles
import './FullMap.scss';
const CSS = {
  base: 'cov-full-map',
  title: 'cov-full-map--title',
};

// class export
@subclass('cov.layouts.FullMap')
export default class FullMap extends Widget {
  @property()
  container = document.createElement('div');

  @property()
  view!: esri.MapView | esri.SceneView;

  @property()
  title!: string;

  constructor(properties: cov.FullMapProperties) {
    super(properties);

    // append container to body
    document.body.append(this.container);
  }

  async postInitialize(): Promise<void> {
    const { view, title } = this;

    // clear default zoom
    view.ui.empty('top-left');

    // add title
    if (title) {
      const _title = document.createElement('div');
      _title.classList.add(CSS.title);
      _title.innerHTML = title;
      view.ui.add(_title, 'top-left');
    }

    // assure no view or dom race conditions
    await setTimeout(() => {
      return 0;
    }, 0);

    // set view container
    view.container = document.querySelector('div[data-full-map-view-container]') as HTMLDivElement;
  }

  render(): tsx.JSX.Element {
    return <div class={CSS.base} data-full-map-view-container=""></div>;
  }
}
