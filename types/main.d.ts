import ResizePlugin from "./ResizePlugin";
import { Locale } from "./i18n";
interface Quill {
    container: HTMLElement;
    root: HTMLElement;
    on: any;
    off: any;
    updateContents: (delta: any) => void;
    getContents: () => any;
    getIndex: (blot: any) => number;
    formatText: (...args: any[]) => any;
    isEnabled: () => boolean;
    [key: string]: any;
}
interface QuillResizeImageOptions {
    [index: string]: any;
    locale?: Locale;
    disableMediaTypes?: {
        disableImages?: boolean;
        disableVideos?: boolean;
        disableIframes?: boolean;
    };
    keepAspectRatio?: boolean;
    showToolbar?: boolean;
    resizeConstraints?: {
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
    };
}
declare class QuillResizeImage {
    quill: Quill;
    options: QuillResizeImageOptions;
    resizeTarget: HTMLElement | null;
    resizePlugin: ResizePlugin | null;
    trackedIframes: HTMLIFrameElement[];
    constructor(quill: Quill, options?: QuillResizeImageOptions);
    triggerTextChange(): void;
    onSizeChange(target: HTMLElement, size: {
        width: string | null;
        height: string | null;
    }): void;
    showResizer(target: HTMLElement): void;
    hideResizer(): void;
    onClick(e: Event): void;
    onTextChange(): void;
    onPointerDown(e: Event): void;
    destroy(): void;
}
export default QuillResizeImage;
