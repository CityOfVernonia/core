import { __decorate } from "tslib";
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import Collection from '@arcgis/core/core/Collection';
import PrintViewModel from '@arcgis/core/widgets/Print/PrintViewModel';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
let KEY = 0;
let Print = class Print extends Widget {
    constructor(properties) {
        super(properties);
        this.printer = new PrintViewModel();
        this.title = 'Map Print';
        this.layouts = {
            'Letter ANSI A Landscape': 'Letter Landscape',
            'Letter ANSI A Portrait': 'Letter Portrait',
            'Tabloid ANSI B Landscape': 'Tabloid Landscape',
            'Tabloid ANSI B Portrait': 'Tabloid Portrait',
        };
        this._printResults = new Collection();
        this._title = 'Map Print';
    }
    _print() {
        const { title, printer, _title, _layout, _printResults } = this;
        const titleText = _title || title;
        const layout = _layout.selectedOption.value;
        const result = {
            element: (tsx("calcite-button", { key: KEY++, style: "margin-top: 0.75rem;", width: "full", appearance: "transparent", loading: "" }, titleText)),
        };
        _printResults.add(result);
        printer
            .print(new PrintTemplate({
            format: 'pdf',
            layout,
            layoutOptions: {
                titleText,
            },
        }))
            .then((printResult) => {
            result.element = (tsx("calcite-button", { key: KEY++, style: "margin-top: 0.75rem;", width: "full", appearance: "transparent", "icon-start": "download", afterCreate: (button) => {
                    button.addEventListener('click', () => {
                        window.open(printResult.url, '_blank');
                    });
                } }, titleText));
        })
            .catch((printError) => {
            console.log(printError);
            result.element = (tsx("calcite-button", { key: KEY++, style: "margin-top: 0.75rem;", width: "full", color: "red", disabled: "", appearance: "transparent", "icon-start": "exclamation-mark-triangle" }, titleText));
        })
            .then(this.scheduleRender.bind(this));
    }
    render() {
        const { _printResults } = this;
        const results = _printResults
            .map((result) => {
            return result.element;
        })
            .toArray();
        return (tsx("calcite-panel", { heading: "Print" },
            tsx("div", { style: "padding: 0.75rem;" },
                tsx("calcite-label", null,
                    "Title",
                    tsx("calcite-input", { type: "text", afterCreate: (input) => {
                            input.value = this.title;
                            input.addEventListener('calciteInputInput', () => {
                                this._title = input.value;
                            });
                        } })),
                tsx("calcite-label", null,
                    "Layout",
                    tsx("calcite-select", { afterCreate: (select) => {
                            this._layout = select;
                        } }, this._renderLayoutSelects())),
                tsx("calcite-button", { style: "margin-top: 0.5rem;", width: "full", afterCreate: (button) => {
                        button.addEventListener('click', this._print.bind(this));
                    } }, "Print"),
                results)));
    }
    _renderLayoutSelects() {
        const { layouts } = this;
        const options = [];
        for (const layout in layouts) {
            options.push(tsx("calcite-option", { label: layouts[layout], value: layout }));
        }
        return options;
    }
};
__decorate([
    property({
        aliasOf: 'printer.view',
    })
], Print.prototype, "view", void 0);
__decorate([
    property({
        aliasOf: 'printer.printServiceUrl',
    })
], Print.prototype, "printServiceUrl", void 0);
Print = __decorate([
    subclass('Print')
], Print);
export default Print;
