import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal dialog for testing purposes which does not create or add its `container` to the DOM.
 */
export default class Test extends Widget {
    render(): tsx.JSX.Element;
}
