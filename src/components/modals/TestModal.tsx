import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal for testing purposes which does not create or add its `container` to the DOM.
 */
@subclass('cov.modals.TestModal')
export default class TestModal extends Widget {
  render(): tsx.JSX.Element {
    return (
      <calcite-modal kind="brand">
        <div slot="header">Lorem Ipsum</div>
        <div slot="content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque laoreet, turpis sit amet aliquam tempus,
          est nunc fringilla orci, non gravida elit orci sollicitudin nisl. Nunc eu blandit mauris, ullamcorper interdum
          ex. Vestibulum fermentum libero in viverra bibendum. Suspendisse accumsan justo in nibh semper molestie vitae
          quis mi. Vivamus pharetra ante ut nunc sodales euismod. Maecenas dapibus diam id quam vehicula consequat.
          Etiam aliquet tortor vel sodales euismod. In sagittis velit in nunc pharetra rutrum. Mauris risus ex,
          convallis ac elit vitae, convallis volutpat risus. Donec varius eros sed magna aliquet bibendum. Aliquam
          laoreet at sem non aliquam. Phasellus vehicula varius maximus. Nulla non nisl mollis, consectetur urna et,
          placerat magna.
        </div>
        <calcite-button
          slot="primary"
          width="full"
          onclick={(): void => {
            (this.container as HTMLCalciteModalElement).open = false;
          }}
        >
          Bibendum
        </calcite-button>
      </calcite-modal>
    );
  }
}
