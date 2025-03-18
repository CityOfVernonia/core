import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

/**
 * A modal dialog for testing purposes which does not create or add its `container` to the DOM.
 */
@subclass('cov.components.dialogs.Test')
export default class Test extends Widget {
  render(): tsx.JSX.Element {
    return (
      <calcite-dialog heading="Lorem Ipsum" kind="brand" modal>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque laoreet, turpis sit amet aliquam tempus,
        est nunc fringilla orci, non gravida elit orci sollicitudin nisl. Nunc eu blandit mauris, ullamcorper interdum
        ex. Vestibulum fermentum libero in viverra bibendum. Suspendisse accumsan justo in nibh semper molestie vitae
        quis mi. Vivamus pharetra ante ut nunc sodales euismod. Maecenas dapibus diam id quam vehicula consequat. Etiam
        aliquet tortor vel sodales euismod. In sagittis velit in nunc pharetra rutrum. Mauris risus ex, convallis ac
        elit vitae, convallis volutpat risus. Donec varius eros sed magna aliquet bibendum. Aliquam laoreet at sem non
        aliquam. Phasellus vehicula varius maximus. Nulla non nisl mollis, consectetur urna et, placerat magna.
        <calcite-button
          slot="footer-end"
          onclick={(): void => {
            (this.container as HTMLCalciteDialogElement).open = false;
          }}
        >
          Bibendum
        </calcite-button>
      </calcite-dialog>
    );
  }
}
