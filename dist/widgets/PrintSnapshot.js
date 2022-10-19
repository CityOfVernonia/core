import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Print from './Print';
import Snapshot from './Snapshot';
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
        const { state } = this;
        return (tsx("calcite-panel", { heading: state === 'print' ? 'Print' : 'Snapshot' },
            tsx("calcite-action", { slot: "header-actions-end", active: state === 'print', icon: "print", onclick: () => {
                    this.state = 'print';
                } },
                tsx("calcite-tooltip", { placement: "bottom", slot: "tooltip" }, "Print")),
            tsx("calcite-action", { slot: "header-actions-end", active: state === 'snapshot', icon: "image", onclick: () => {
                    this.state = 'snapshot';
                } },
                tsx("calcite-tooltip", { placement: "bottom", slot: "tooltip" }, "Snapshot")),
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
