//////////////////////////////////////
// Interfaces
//////////////////////////////////////
import esri = __esri;

/**
 * Create and place BasemapToggle in view ui with calcite-tooltip.
 * @param view
 * @param nextBasemap
 * @param position
 */
const basemapToggle = async (
  view: esri.MapView | esri.SceneView,
  nextBasemap: esri.Basemap,
  position: string,
): Promise<void> => {
  const BasemapToggle = (await import('@arcgis/core/widgets/BasemapToggle')).default;

  const basemapToggle = new BasemapToggle({ view, nextBasemap });

  view.ui.add(basemapToggle, position);

  const container = basemapToggle.container as HTMLDivElement;

  const observer = new MutationObserver((): void => {
    container.removeAttribute('title');
    observer.disconnect();
  });

  observer.observe(container, { attributes: true, attributeFilter: ['title'] });

  const tooltip = Object.assign(document.createElement('calcite-tooltip'), {
    referenceElement: container,
    overlayPositioning: 'fixed',
    closeOnClick: true,
    innerHTML: 'Toggle basemap',
  });

  document.body.append(tooltip);
};

export default basemapToggle;
