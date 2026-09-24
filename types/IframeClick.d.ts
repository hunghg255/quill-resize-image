declare class Iframe {
    element: HTMLIFrameElement;
    cb: Function;
    hasTracked: boolean;
    constructor(element: HTMLIFrameElement, cb: Function);
}
declare class IframeClick {
    static resolution: number;
    static iframes: Array<Iframe>;
    static interval: ReturnType<typeof setInterval> | null;
    static track(element: HTMLIFrameElement, cb: Function): void;
    static untrack(element: HTMLIFrameElement): void;
    static checkClick(): void;
}
export default IframeClick;
