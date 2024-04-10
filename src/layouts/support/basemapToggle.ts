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

  new MutationObserver((mutationRecords, observer): void => {
    const button = container.querySelector('calcite-button') as HTMLCalciteButtonElement;

    if (button) {
      button.removeAttribute('title');
      observer.disconnect();
    }
  }).observe(container, { childList: true, subtree: true });

  const tooltip = Object.assign(document.createElement('calcite-tooltip'), {
    referenceElement: container,
    overlayPositioning: 'fixed',
    closeOnClick: true,
    innerHTML: 'Toggle basemap',
  });

  container.append(tooltip);
};

export default basemapToggle;
