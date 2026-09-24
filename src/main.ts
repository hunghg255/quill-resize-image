import ResizePlugin from "./ResizePlugin";
import IframeOnClick from "./IframeClick";
import { Locale } from "./i18n";
import { applyAlignStyle, patchAlignFormat } from "./alignStyle";

interface Quill {
  container: HTMLElement;
  root: HTMLElement; // edit area
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
  persistAlignment?: boolean;
  resizeConstraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

class QuillResizeImage {
  quill: Quill;
  options: QuillResizeImageOptions;
  resizeTarget: HTMLElement | null = null;
  resizePlugin: ResizePlugin | null = null;
  trackedIframes: HTMLIFrameElement[] = [];

  constructor(quill: Quill, options?: QuillResizeImageOptions) {
    this.quill = quill;
    this.options = options || {};

    this.onClick = this.onClick.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onSizeChange = this.onSizeChange.bind(this);
    this.onAlignChange = this.onAlignChange.bind(this);
    this.triggerTextChange = this.triggerTextChange.bind(this);

    if (this.options.persistAlignment !== false) {
      const Quill = quill.constructor as any;
      ["formats/image", "formats/video"].forEach((path) => {
        try {
          patchAlignFormat(Quill?.import?.(path));
        } catch (e) {}
      });
    }

    quill.root.addEventListener("click", this.onClick);
    quill.on("text-change", this.onTextChange);
    document.addEventListener("pointerdown", this.onPointerDown, {
      capture: true,
    });
    this.onTextChange();
  }

  triggerTextChange() {
    const Delta = this.quill.getContents().constructor;
    const delta = new Delta().retain(1);
    this.quill.updateContents(delta);
  }

  // Apply width/height through Quill so the change is stored in the delta
  onSizeChange(
    target: HTMLElement,
    size: { width: string | null; height: string | null }
  ) {
    const blot = this.findBlot(target);
    if (blot) {
      const index = this.quill.getIndex(blot);
      this.quill.formatText(
        index,
        1,
        { width: size.width || false, height: size.height || false },
        "user"
      );
      // Formats not whitelisted by the blot are ignored by Quill; keep the DOM in sync
      ["width", "height"].forEach((name) => {
        const value = (size as any)[name];
        if (value && target.getAttribute(name) !== value) {
          target.setAttribute(name, value);
        } else if (!value) {
          target.removeAttribute(name);
        }
      });
    } else {
      size.width === null
        ? target.removeAttribute("width")
        : target.setAttribute("width", size.width);
      size.height === null
        ? target.removeAttribute("height")
        : target.setAttribute("height", size.height);
      this.triggerTextChange();
    }
  }

  // Apply alignment through Quill so it is stored as a `style` format in the delta
  onAlignChange(target: HTMLElement, cssText: string) {
    const blot = this.findBlot(target);
    if (
      blot &&
      this.options.persistAlignment !== false &&
      blot.statics?.__resizeAlignPatched
    ) {
      this.quill.formatText(
        this.quill.getIndex(blot),
        1,
        { style: cssText || false },
        "user"
      );
    } else {
      applyAlignStyle(target, cssText);
      this.triggerTextChange();
    }
  }

  findBlot(target: HTMLElement) {
    const Quill = this.quill.constructor as any;
    const blot = Quill?.find?.(target);
    return blot && blot.domNode === target && typeof blot.format === "function"
      ? blot
      : null;
  }

  showResizer(target: HTMLElement) {
    if (this.resizePlugin && this.resizeTarget === target) {
      this.resizePlugin.reposition();
      return;
    }
    this.hideResizer();
    this.resizeTarget = target;
    this.resizePlugin = new ResizePlugin(
      target,
      this.quill.container || (this.quill.root.parentElement as HTMLElement),
      this.quill.root,
      {
        ...this.options,
        onChange: this.triggerTextChange,
        onSizeChange: this.onSizeChange,
        onAlignChange: this.onAlignChange,
      }
    );
  }

  hideResizer() {
    this.resizePlugin?.destory();
    this.resizePlugin = null;
    this.resizeTarget = null;
  }

  onClick(e: Event) {
    const target: HTMLElement = e.target as HTMLElement;
    const types = [
      !this.options.disableMediaTypes?.disableImages && "img",
      !this.options.disableMediaTypes?.disableVideos && "video",
    ];
    if (
      target &&
      types.includes(target.tagName.toLowerCase()) &&
      this.quill.isEnabled()
    ) {
      this.showResizer(target);
    }
  }

  onTextChange() {
    // The selected media may have been removed or moved by the change
    if (this.resizeTarget) {
      if (!this.quill.root.contains(this.resizeTarget)) {
        this.hideResizer();
      } else {
        this.resizePlugin?.reposition();
      }
    }

    // Stop tracking iframes that are no longer in the editor
    this.trackedIframes = this.trackedIframes.filter((item) => {
      if (this.quill.root.contains(item)) return true;
      IframeOnClick.untrack(item);
      return false;
    });

    if (this.options.disableMediaTypes?.disableIframes) return;
    this.quill.root
      .querySelectorAll("iframe")
      .forEach((item: HTMLIFrameElement) => {
        if (this.trackedIframes.includes(item)) return;
        this.trackedIframes.push(item);
        IframeOnClick.track(item, () => {
          if (this.quill.isEnabled()) this.showResizer(item);
        });
      });
  }

  onPointerDown(e: Event) {
    const target = e.target as HTMLElement;
    if (
      this.resizePlugin &&
      target !== this.resizeTarget &&
      !this.resizePlugin.resizer?.contains?.(target)
    ) {
      this.hideResizer();
    }
  }

  // Remove every listener registered by the module (e.g. when the editor unmounts)
  destroy() {
    this.hideResizer();
    this.quill.root.removeEventListener("click", this.onClick);
    this.quill.off?.("text-change", this.onTextChange);
    document.removeEventListener("pointerdown", this.onPointerDown, {
      capture: true,
    });
    this.trackedIframes.forEach((item) => IframeOnClick.untrack(item));
    this.trackedIframes = [];
  }
}

export default QuillResizeImage;
