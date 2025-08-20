import esri = __esri;

interface I {
  state: 'Functional classification' | 'ODOT reported' | 'Surface condition' | 'Surface material';
}

import { property, subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('cov.components.StreetsInfoDialog')
export default class StreetsInfoDialog extends Widget {
  private _container = document.createElement('calcite-dialog');

  get container() {
    return this._container;
  }

  set container(value: HTMLCalciteDialogElement) {
    this._container = value;
  }

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.container = this._container;

    document.body.appendChild(this.container);
  }

  public show(type: I['state']): void {
    const { container } = this;

    this._viewState = type;

    container.open = true;
  }

  @property()
  private _viewState: I['state'] = 'Functional classification';

  render(): tsx.JSX.Element {
    const { _viewState } = this;

    return (
      <calcite-dialog heading={_viewState} modal style="--calcite-dialog-content-space: 0 1rem;" width="s">
        <div hidden={_viewState !== 'Functional classification'}>
          <p>
            <strong>Arterial:</strong> provides access between areas of a city and between cities
          </p>
          <p>
            <strong>Collector:</strong> provides access and traffic circulation within residential neighborhoods, and
            the central business district
          </p>
          <p>
            <strong>Local:</strong> provides access to land adjacent to the collector network
          </p>
          <p>
            <strong>Access:</strong> provides connectivity to specific use areas
          </p>
          <p>
            <strong>Alley:</strong> provides access to the rear of properties abutting the alley
          </p>
          <p>
            <strong>Trail:</strong> provides for dedicated use for pedestrian, bicycle, and equestrian traffic
          </p>
        </div>
        <div hidden={_viewState !== 'ODOT reported'}>
          <p>
            The City is required to report street assets by surface type to the Oregon Department of Transportation
            (ODOT) annually. Reported assets are publicly owned, open to travel by passenger vehicles, and maintained.
          </p>
        </div>
        <div hidden={_viewState !== 'Surface condition'}>
          <p>
            <strong>Pavement</strong>
          </p>
          <p>
            <strong>Poor (1):</strong> Pavement is in poor to very poor condition with extensive and severe cracking,
            alligatoring (a pattern of cracking in all directions on the road surface), and channeling. Ridability (a
            measure of surface smoothness) is poor, meaning that the surface is rough and uneven.
          </p>
          <p>
            <strong>Marginal (2):</strong> Pavement is in fair to poor condition with frequent cracking, alligatoring,
            and channeling. Ridability is poor to fair, meaning that the surface is moderately rough and uneven.
          </p>
          <p>
            <strong>Fair (3):</strong> Pavement is in fair condition with frequent slight cracking and intermittent,
            slight to moderate alligatoring and channeling. Ridability is fairly good, with intermittent rough and
            uneven sections.
          </p>
          <p>
            <strong>Good (4):</strong> Pavement is in good condition with very slight cracking. Ridability is good, with
            a few rough or uneven sections.
          </p>
          <p>
            <strong>Excellent (5):</strong> Pavement is in excellent condition with few cracks. Ridability is excellent,
            with only a few areas of slight distortion.
          </p>
          <p>
            <strong>Gravel</strong>
          </p>
          <p>
            <strong>Poor (1):</strong> No roadbed, gravel surface or crown. Severe rutting and potholes. Unsuitable for
            normal traffic with severe ponding. Road needs rebuilt.
          </p>
          <p>
            <strong>Marginal (2):</strong> Gravel surface is in poor condition with areas without aggregate and little
            crown with moderate to severe washboarding (3+" deep over 25% of area) and moderate rutting and potholes
            (greater than 2"). Ridability is poor without surface drainage. Road needs rebuilt.
          </p>
          <p>
            <strong>Fair (3):</strong> Gravel surface and crown is in good condition with moderate washboarding (2" deep
            up to 25% of area) and slight rutting and small potholes (less than 2" deep). Ridability is fair and
            drainage is adequate with slight ponding in ruts and potholes. Surface grading with additional aggregate
            required.
          </p>
          <p>
            <strong>Good (4):</strong> Gravel surface and crown is in good condition with isolated or slight
            washboarding and no ruts or potholes. Ridability is good and drainage is adequate. Surface grading without
            additional aggregate required.
          </p>
          <p>
            <strong>Excellent (5):</strong> Gravel surface and crown is in excellent condition. Rideability and drainage
            are excellent. No maintenance required.
          </p>
        </div>
        <div hidden={_viewState !== 'Surface material'}>
          <p>The City of Vernonia uses the Oregon Department of Transportation surface types convention.</p>
          <p>
            <strong>U:</strong> UNIMPROVED (Open for Travel)
          </p>
          <p>
            <strong>D:</strong> GRADED & DRAINED (Natural Surface)
          </p>
          <p>
            <strong>G:</strong> GRADED AND DRAINED (Gravel)
          </p>
          <p>
            <strong>O:</strong> OIL MAT
          </p>
          <p>
            <strong>A:</strong> ASPHALT CONCRETE
          </p>
          <p>
            <strong>N:</strong> CONCRETE, BRICK, STONE
          </p>
        </div>
        <calcite-button
          slot="footer-end"
          onclick={(): void => {
            (this.container as HTMLCalciteDialogElement).open = false;
          }}
        >
          Close
        </calcite-button>
      </calcite-dialog>
    );
  }
}
