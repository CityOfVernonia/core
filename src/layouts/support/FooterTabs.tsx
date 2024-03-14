import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';

@subclass('FooterTabs')
export default class FooterTabs extends Widget {
  render(): tsx.JSX.Element {
    return (
      <calcite-shell-panel>
        <calcite-tabs style="height: 100%;">
          <calcite-tab-nav slot="title-group">
            <calcite-tab-title selected="">Tab 1</calcite-tab-title>
          </calcite-tab-nav>
          <calcite-tab selected="">
            <div style="padding: 0 0.75rem;">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nunc ipsum, maximus vel porta eget,
                cursus nec odio. Pellentesque at ligula a libero placerat posuere. Integer porta eget lacus at
                vulputate. Quisque sed urna rhoncus, suscipit eros vitae, gravida quam. Duis suscipit ut ipsum sed
                volutpat. Donec eu ex rutrum, dapibus libero eget, interdum ligula. Pellentesque et leo dignissim,
                commodo est in, mollis tortor. Pellentesque habitant morbi tristique senectus et netus et malesuada
                fames ac turpis egestas. Vestibulum eget erat felis. Suspendisse potenti. Nullam leo lacus, pulvinar vel
                eros eget, dictum tempor felis.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nunc ipsum, maximus vel porta eget,
                cursus nec odio. Pellentesque at ligula a libero placerat posuere. Integer porta eget lacus at
                vulputate. Quisque sed urna rhoncus, suscipit eros vitae, gravida quam. Duis suscipit ut ipsum sed
                volutpat. Donec eu ex rutrum, dapibus libero eget, interdum ligula. Pellentesque et leo dignissim,
                commodo est in, mollis tortor. Pellentesque habitant morbi tristique senectus et netus et malesuada
                fames ac turpis egestas. Vestibulum eget erat felis. Suspendisse potenti. Nullam leo lacus, pulvinar vel
                eros eget, dictum tempor felis.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nunc ipsum, maximus vel porta eget,
                cursus nec odio. Pellentesque at ligula a libero placerat posuere. Integer porta eget lacus at
                vulputate. Quisque sed urna rhoncus, suscipit eros vitae, gravida quam. Duis suscipit ut ipsum sed
                volutpat. Donec eu ex rutrum, dapibus libero eget, interdum ligula. Pellentesque et leo dignissim,
                commodo est in, mollis tortor. Pellentesque habitant morbi tristique senectus et netus et malesuada
                fames ac turpis egestas. Vestibulum eget erat felis. Suspendisse potenti. Nullam leo lacus, pulvinar vel
                eros eget, dictum tempor felis.
              </p>
            </div>
          </calcite-tab>
        </calcite-tabs>
      </calcite-shell-panel>
    );
  }
}
