import { __awaiter, __decorate } from "tslib";
import Collection from '@arcgis/core/core/Collection';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
//////////////////////////////////////
// Constants
//////////////////////////////////////
const STYLE = {
    content: 'padding: var(--calcite-font-size--2);',
    resultButton: 'margin-top: var(--calcite-font-size--2);',
    snapshotResult: `width: 100%; margin-top: var(--calcite-font-size--2); display: flex; flex-flow: row; justify-content: flex-end; background-size: cover; background-repeat: no-repeat; background-position: center center; box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04); border-inline-start: 2px solid var(--calcite-ui-brand);`,
};
const TITLES = {
    print: 'Map Print',
    snapshot: 'Map Snapshot',
};
let KEY = 0;
/**
 * Print (via print service) and map view snapshot widget.
 */
let PrintSnapshot = class PrintSnapshot extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Properties
        //////////////////////////////////////
        this.layouts = {
            'Letter ANSI A Landscape': 'Letter Landscape',
            'Letter ANSI A Portrait': 'Letter Portrait',
            'Tabloid ANSI B Landscape': 'Tabloid Landscape',
            'Tabloid ANSI B Portrait': 'Tabloid Portrait',
        };
        this.mode = 'default';
        this.printServiceUrl = 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';
        //////////////////////////////////////
        // Display state
        //////////////////////////////////////
        this._state = 'print';
        this._printResults = new Collection();
        //////////////////////////////////////
        // Snapshot variables and methods
        //////////////////////////////////////
        this._snapshotResults = new Collection();
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { mode, printServiceUrl, view } = this;
            if (mode === 'snapshot')
                this._state = 'snapshot';
            if (mode === 'default' || mode === 'snapshot') {
                this._photoModal = new (yield import('./../modals/PhotoModal')).default();
            }
            if (mode === 'default' || mode === 'print') {
                this._printer = new (yield import('@arcgis/core/widgets/Print/PrintViewModel'))
                    .default({
                    printServiceUrl,
                    view,
                });
                this._PrintTemplate = (yield import('@arcgis/core/rest/support/PrintTemplate'))
                    .default;
            }
        });
    }
    _setState(state) {
        this._state = state;
    }
    /**
     * Create a print.
     */
    _print() {
        const { container, _printer, _PrintTemplate, _printResults } = this;
        const titleText = container.querySelector('[data-print-snapshot="print title"]').value || TITLES.print;
        const layout = container.querySelector('[data-print-snapshot="print layout"]')
            .selectedOption.value;
        const result = {
            element: (tsx("calcite-button", { key: KEY++, style: STYLE.resultButton, width: "full", appearance: "transparent", loading: "" }, titleText)),
        };
        _printResults.add(result);
        _printer
            .print(new _PrintTemplate({
            format: 'pdf',
            layout,
            layoutOptions: {
                titleText,
            },
        }))
            .then((printResult) => {
            result.element = (tsx("calcite-button", { key: KEY++, style: STYLE.resultButton, width: "full", appearance: "transparent", "icon-start": "download", afterCreate: (button) => {
                    button.addEventListener('click', () => {
                        window.open(printResult.url, '_blank');
                    });
                } }, titleText));
        })
            .catch((printError) => {
            console.log(printError);
            result.element = (tsx("calcite-button", { key: KEY++, style: STYLE.resultButton, width: "full", color: "red", disabled: "", appearance: "transparent", "icon-start": "exclamation-mark-triangle" }, titleText));
        })
            .then(this.scheduleRender.bind(this));
    }
    /**
     * Create a snapshot.
     */
    _snapshot() {
        return __awaiter(this, void 0, void 0, function* () {
            const { container, view, _snapshotResults, _photoModal } = this;
            const title = container.querySelector('[data-print-snapshot="snapshot title"]').value ||
                TITLES.print;
            const format = container.querySelector('[data-print-snapshot="snapshot format"]')
                .value;
            const fileName = `${title}.${format}`;
            const data = (yield view.takeScreenshot({
                format,
            })).data;
            const dataUrl = this._dataUrl(data, title, format);
            _snapshotResults.add(tsx("div", { key: KEY++, style: this.classes(STYLE.snapshotResult, `background-image: url(${dataUrl});`) },
                tsx("calcite-action", { icon: "image", text: "View", onclick: _photoModal.show.bind(_photoModal, fileName, dataUrl) }),
                tsx("calcite-action", { icon: "download", text: "Download", onclick: _photoModal.download.bind(_photoModal, fileName, dataUrl) })));
        });
    }
    /**
     * Add title to image and return data url.
     * @param data Image data to be returned as data url string
     * @param title Title of the image
     * @param format Format of the image
     * @returns Data url string
     */
    _dataUrl(data, title, format) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = data.width;
        canvas.height = data.height;
        context.putImageData(data, 0, 0);
        context.font = 'bold 20px Arial';
        context.strokeStyle = '#fff';
        context.strokeText(`${title}`, 5, data.height - 5, data.width - 5);
        context.font = 'bold 20px Arial';
        context.fillStyle = '#000';
        context.fillText(`${title}`, 5, data.height - 5, data.width - 5);
        return canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { mode, _state, _printResults, _snapshotResults } = this;
        return (tsx("calcite-panel", { heading: _state === 'print' ? 'Print' : 'Snapshot' },
            mode === 'default'
                ? [
                    tsx("calcite-action", { active: _state === 'print', icon: "print", slot: "header-actions-end", text: "Print", onclick: this._setState.bind(this, 'print') },
                        tsx("calcite-tooltip", { "close-on-click": "", label: "Print", placement: "bottom", slot: "tooltip" }, "Print")),
                    tsx("calcite-action", { active: _state === 'snapshot', icon: "image", slot: "header-actions-end", text: "Snapshot", onclick: this._setState.bind(this, 'snapshot') },
                        tsx("calcite-tooltip", { "close-on-click": "", label: "Snapshot", placement: "bottom", slot: "tooltip" }, "Snapshot")),
                ]
                : null,
            mode !== 'snapshot' ? (tsx("div", { hidden: _state !== 'print', style: STYLE.content },
                tsx("calcite-label", null,
                    "Title",
                    tsx("calcite-input", { "data-print-snapshot": "print title", type: "text", value: TITLES.print })),
                tsx("calcite-label", null,
                    "Layout",
                    tsx("calcite-select", { "data-print-snapshot": "print layout" }, this._renderLayoutOptions())),
                tsx("calcite-button", { width: "full", onclick: this._print.bind(this) }, "Print"),
                _printResults
                    .map((result) => {
                    return result.element;
                })
                    .toArray())) : null,
            mode !== 'print' ? (tsx("div", { hidden: _state !== 'snapshot', style: STYLE.content },
                tsx("calcite-label", null,
                    "Title",
                    tsx("calcite-input", { "data-print-snapshot": "snapshot title", type: "text", value: TITLES.snapshot })),
                tsx("calcite-label", null,
                    "Format",
                    tsx("calcite-radio-group", { "data-print-snapshot": "snapshot format" },
                        tsx("calcite-radio-group-item", { value: "jpg", checked: "" }, "JPG"),
                        tsx("calcite-radio-group-item", { value: "png" }, "PNG"))),
                tsx("calcite-button", { width: "full", onclick: this._snapshot.bind(this) }, "Snapshot"),
                _snapshotResults.toArray())) : null));
    }
    /**
     * Create options for print layout select.
     * @returns Array of tsx elements
     */
    _renderLayoutOptions() {
        const { layouts } = this;
        const options = [];
        for (const layout in layouts) {
            options.push(tsx("calcite-option", { label: layouts[layout], value: layout }));
        }
        return options;
    }
};
__decorate([
    property()
], PrintSnapshot.prototype, "_state", void 0);
PrintSnapshot = __decorate([
    subclass('cov.widgets.PrintSnapshot')
], PrintSnapshot);
export default PrintSnapshot;
