import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A modal for testing purposes which does not create or add its `container` to the DOM.
 */
export default class TestModal extends Widget {
    render(): tsx.JSX.Element;
}
