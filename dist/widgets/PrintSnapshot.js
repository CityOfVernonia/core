import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Print from './Print';
import Snapshot from './Snapshot';
let KEY = 0;
/**
 * Print and snapshot widgets in single UI widget.
 * NOTE: must include snapshot CSS.
 */
let PrintSnapshot = class PrintSnapshot extends Widget {
    constructor(properties) {
        super(properties);
        this.printTitle = 'Map Print';
        this.snapshotTitle = 'Map Snapshot';
        this.layouts = {
            'Letter ANSI A Landscape': 'Letter Landscape',
            'Letter ANSI A Portrait': 'Letter Portrait',
            'Tabloid ANSI B Landscape': 'Tabloid Landscape',
            'Tabloid ANSI B Portrait': 'Tabloid Portrait',
        };
        this.state = 'print';
    }
    render() {
        const { id, state } = this;
        const tooltips = [0, 1, 2].map((num) => {
            return `tooltip_${id}_${num}_${KEY++}`;
        });
        return (tsx("calcite-panel", { heading: state === 'print' ? 'Print' : 'Snapshot' },
            tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[0], active: state === 'print', icon: "print", onclick: () => {
                        this.state = 'print';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[0], "overlay-positioning": "fixed", placement: "bottom" }, "Print")),
            tsx("calcite-tooltip-manager", { slot: "header-actions-end" },
                tsx("calcite-action", { id: tooltips[1], active: state === 'snapshot', icon: "image", onclick: () => {
                        this.state = 'snapshot';
                    } }),
                tsx("calcite-tooltip", { "reference-element": tooltips[1], "overlay-positioning": "fixed", placement: "bottom" }, "Snapshot")),
            tsx("div", { hidden: state !== 'print' },
                tsx("div", { afterCreate: this._createPrint.bind(this) })),
            tsx("div", { hidden: state !== 'snapshot' },
                tsx("div", { afterCreate: this._createSnapshot.bind(this) }))));
    }
    /**
     * Create Print widget.
     * @param container
     */
    _createPrint(container) {
        const { view, printServiceUrl, printTitle: title, layouts } = this;
        new Print({
            view,
            printServiceUrl,
            title,
            layouts,
            container,
        });
    }
    /**
     * Create Snapshot widget.
     * @param container
     */
    _createSnapshot(container) {
        const { view, snapshotTitle: title } = this;
        new Snapshot({
            view,
            title,
            container,
        });
    }
};
__decorate([
    property()
], PrintSnapshot.prototype, "state", void 0);
PrintSnapshot = __decorate([
    subclass('PrintSnapshot')
], PrintSnapshot);
export default PrintSnapshot;
