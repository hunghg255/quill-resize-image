/// <reference types="node" />
declare class Iframe {
    element: HTMLIFrameElement;
    cb: Function;
    hasTracked: boolean;
    constructor(element: HTMLIFrameElement, cb: Function);
}
declare class IframeClick {
    static resolution: number;
    static iframes: Array<Iframe>;
    static interval: NodeJS.Timeout | null;
    static track(element: HTMLIFrameElement, cb: Function): void;
    static checkClick(): void;
}
export default IframeClick;
