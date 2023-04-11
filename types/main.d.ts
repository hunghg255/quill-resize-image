import { Locale } from "./i18n";
interface Quill {
    container: HTMLElement;
    root: HTMLElement;
    on: any;
}
interface QuillResizeModuleOptions {
    [index: string]: any;
    locale?: Locale;
}
declare function QuillResizeModule(quill: Quill, options?: QuillResizeModuleOptions): void;
export default QuillResizeModule;
