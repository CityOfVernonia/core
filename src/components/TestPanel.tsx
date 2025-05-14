// import esri = __esri;

import type { AlertOptions } from './MapApplication';

import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('TestPanel')
export default class TestPanel extends Widget {
  override postInitialize(): void {
    this.addHandles(
      watch(
        (): boolean | null => this.visible,
        (visible?: boolean | null): void => {
          console.log(visible);
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          visible ? console.log('i was just shown') : console.log('i was just hidden');
        },
      ),
    );
  }

  override render(): tsx.JSX.Element {
    return (
      <calcite-panel heading="Test">
        <calcite-block heading="Testing 1 2 3" expanded>
          A panel for testing...
        </calcite-block>
        <calcite-button
          slot="footer"
          width="full"
          afterCreate={(button: HTMLCalciteButtonElement): void => {
            button.addEventListener('click', (): void => {
              const alertOptions: AlertOptions = {
                duration: 'medium',
                icon: 'information',
                label: 'Information',
                message: 'Something very important you should know...',
                title: 'Information',
              };
              this.emit('map-application-show-alert', alertOptions);
            });
          }}
        >
          Click Me
        </calcite-button>
      </calcite-panel>
    );
  }
}
