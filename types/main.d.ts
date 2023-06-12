import { Locale } from "./i18n";
interface Quill {
    container: HTMLElement;
    root: HTMLElement;
    on: any;
}
interface QuillResizeImageOptions {
    [index: string]: any;
    locale?: Locale;
}
declare function QuillResizeImage(quill: Quill, options?: QuillResizeImageOptions): void;
export default QuillResizeImage;
