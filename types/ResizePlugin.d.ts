import "./ResizePlugin.less";
import { I18n, Locale } from "./i18n";
interface Size {
    width: number;
    height: number;
}
interface Position {
    left: number;
    top: number;
    width: number;
    height: number;
    dir: string;
}
declare class ResizeElement extends HTMLElement {
    originSize?: Size | null;
    [key: string]: any;
}
interface ResizePluginOption {
    locale?: Locale;
    [index: string]: any;
    keepAspectRatio?: boolean;
    showToolbar?: boolean;
    resizeConstraints?: {
        minWidth?: number;
        maxWidth?: number;
        minHeight?: number;
        maxHeight?: number;
    };
    onSizeChange?: (target: HTMLElement, size: {
        width: string | null;
        height: string | null;
    }) => void;
    onChange?: (target: HTMLElement) => void;
}
declare class ResizePlugin {
    resizeTarget: ResizeElement;
    resizer: HTMLElement | null;
    container: HTMLElement;
    editor: HTMLElement;
    startResizePosition: Position | null;
    i18n: I18n;
    options: ResizePluginOption;
    constructor(resizeTarget: ResizeElement, container: HTMLElement, editor: HTMLElement, options?: ResizePluginOption);
    initResizer(): void;
    positionResizerToTarget(el: HTMLElement): void;
    reposition(): void;
    bindEvents(): void;
    onDblClick(e: MouseEvent): void;
    _setStylesForToolbar(type: string, styles: string | undefined): void;
    _setSize(width: string | null, height: string | null): void;
    toolbarInputChange(e: Event): void;
    toolbarClick(e: MouseEvent): void;
    startResize(e: PointerEvent): void;
    endResize(): void;
    resizing(e: PointerEvent): void;
    destory(): void;
    destroy(): void;
}
export default ResizePlugin;
