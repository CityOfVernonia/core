import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * A widget to share an app via facebook and twitter.
 */
export default class Share extends Widget {
    postInitialize(): void;
    render(): tsx.JSX.Element;
}
