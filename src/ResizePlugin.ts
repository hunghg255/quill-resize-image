import "./ResizePlugin.less";
import { I18n, Locale, defaultLocale } from "./i18n";
import { format } from "./utils";
import { applyAlignStyle, removeEmptyStyle } from "./alignStyle";

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
class ResizeElement extends HTMLElement {
  public originSize?: Size | null = null;
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
  // Commit size changes (width/height attributes) so they end up in the delta
  onSizeChange?: (target: HTMLElement, size: { width: string | null; height: string | null }) => void;
  // Commit alignment styles so they end up in the delta
  onAlignChange?: (target: HTMLElement, cssText: string) => void;
  onChange?: (target: HTMLElement) => void;
}

const template = `
<div class="handler handler-nw" data-dir="nw" title="{0}"></div>
<div class="handler handler-ne" data-dir="ne" title="{0}"></div>
<div class="handler handler-sw" data-dir="sw" title="{0}"></div>
<div class="handler handler-se" data-dir="se" title="{0}"></div>
<div class="toolbar">
  <div class="group">
    <a class="btn" data-type="width" data-width="100%">100%</a>
    <a class="btn" data-type="width" data-width="50%">50%</a>
    <span class="input-wrapper"><input data-type="width" maxlength="3" /><span class="suffix">%</span><span class="tooltip">{5}</span></span>
    <a class="btn" data-type="width" data-width="">{4}</a>
  </div>
  <div class="group">
    <a class="btn" data-type="align" data-styles="float:left;margin:0 1em 1em 0;">{1}</a>
    <a class="btn" data-type="align" data-styles="display:block;margin:auto;">{2}</a>
    <a class="btn" data-type="align" data-styles="float:right;margin:0 0 1em 1em;">{3}</a>
    <a class="btn" data-type="align" data-styles="">{4}</a>
  </div>
</div>
`;
class ResizePlugin {
  resizeTarget: ResizeElement;
  resizer: HTMLElement | null = null;
  container: HTMLElement;
  editor: HTMLElement;
  startResizePosition: Position | null = null;
  i18n: I18n;
  options: ResizePluginOption;

  constructor(
    resizeTarget: ResizeElement,
    container: HTMLElement,
    editor: HTMLElement,
    options?: ResizePluginOption
  ) {
    this.i18n = new I18n(options?.locale || defaultLocale);
    this.options = options || {};
    this.resizeTarget = resizeTarget;
    if (!resizeTarget.originSize) {
      resizeTarget.originSize = {
        width: resizeTarget.clientWidth,
        height: resizeTarget.clientHeight,
      };
    }

    this.editor = editor;
    this.container = container;
    this.initResizer();
    this.positionResizerToTarget(resizeTarget);

    this.resizing = this.resizing.bind(this);
    this.endResize = this.endResize.bind(this);
    this.startResize = this.startResize.bind(this);
    this.toolbarClick = this.toolbarClick.bind(this);
    this.toolbarInputChange = this.toolbarInputChange.bind(this);
    this.onDblClick = this.onDblClick.bind(this);
    this.reposition = this.reposition.bind(this);
    this.bindEvents();
  }

  initResizer() {
    // The resizer is positioned relative to the container, so it must be a containing block
    if (window.getComputedStyle(this.container).position === "static") {
      this.container.style.position = "relative";
    }
    let resizer: HTMLElement | null =
      this.container.querySelector("#editor-resizer");
    if (!resizer) {
      resizer = document.createElement("div");
      resizer.setAttribute("id", "editor-resizer");
      resizer.innerHTML = format(
        template,
        this.i18n.findLabel("altTip"),
        this.i18n.findLabel("floatLeft"),
        this.i18n.findLabel("center"),
        this.i18n.findLabel("floatRight"),
        this.i18n.findLabel("restore"),
        this.i18n.findLabel("inputTip")
      );
      this.container.appendChild(resizer);
    }
    if (this.options.showToolbar === false) {
      resizer.classList.add("no-toolbar");
    }
    this.resizer = resizer;
  }
  positionResizerToTarget(el: HTMLElement) {
    if (!this.resizer) return;

    // Measure against the element the resizer is actually positioned in
    const parent = (this.resizer.offsetParent as HTMLElement) || this.container;
    const elRect = el.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const left = elRect.left - parentRect.left - parent.clientLeft + parent.scrollLeft;
    const top = elRect.top - parentRect.top - parent.clientTop + parent.scrollTop;

    this.resizer.style.left = `${left}px`;
    this.resizer.style.top = `${top}px`;
    this.resizer.style.width = `${elRect.width}px`;
    this.resizer.style.height = `${elRect.height}px`;

    // Show the toolbar below the media when there is no room above it
    const toolbar = this.resizer.querySelector(".toolbar") as HTMLElement | null;
    if (toolbar) {
      const spaceAbove = elRect.top - Math.max(parentRect.top + parent.clientTop, 0);
      this.resizer.classList.toggle(
        "toolbar-bottom",
        spaceAbove < toolbar.offsetHeight + 10
      );
    }
  }
  reposition() {
    this.positionResizerToTarget(this.resizeTarget);
  }
  bindEvents() {
    if (this.resizer !== null) {
      this.resizer.addEventListener("pointerdown", this.startResize);
      this.resizer.addEventListener("click", this.toolbarClick);
      this.resizer.addEventListener("change", this.toolbarInputChange);
      this.resizer.addEventListener("dblclick", this.onDblClick);
    }
    window.addEventListener("pointerup", this.endResize);
    window.addEventListener("pointercancel", this.endResize);
    window.addEventListener("pointermove", this.resizing);
    window.addEventListener("resize", this.reposition);
    // Capture scrolls from any ancestor (editor, container or page)
    document.addEventListener("scroll", this.reposition, true);
  }
  onDblClick(e: MouseEvent) {
    // The overlay sits on top of the media; forward double clicks to it
    const target = e.target as HTMLElement;
    if (target.closest(".toolbar") || target.classList.contains("handler")) return;
    this.resizeTarget.dispatchEvent(
      new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        clientX: e.clientX,
        clientY: e.clientY,
      })
    );
  }
  _setAlign(styles: string | undefined) {
    if (this.options.onAlignChange) {
      this.options.onAlignChange(this.resizeTarget, styles || "");
    } else {
      applyAlignStyle(this.resizeTarget, styles || "");
      this.options.onChange?.(this.resizeTarget);
    }
    this.positionResizerToTarget(this.resizeTarget);
  }
  _setSize(width: string | null, height: string | null) {
    const style = this.resizeTarget.style;
    // Inline sizes would override the attributes and are not kept by Quill
    style.removeProperty("width");
    style.removeProperty("height");
    removeEmptyStyle(this.resizeTarget);
    if (this.options.onSizeChange) {
      this.options.onSizeChange(this.resizeTarget, { width, height });
    } else {
      width === null
        ? this.resizeTarget.removeAttribute("width")
        : this.resizeTarget.setAttribute("width", width);
      height === null
        ? this.resizeTarget.removeAttribute("height")
        : this.resizeTarget.setAttribute("height", height);
    }
    this.positionResizerToTarget(this.resizeTarget);
  }
  toolbarInputChange(e: Event) {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    const type = target?.dataset?.type;
    const value = Number(target.value);
    if (type === "width" && value > 0) {
      this._setSize(`${value}%`, null);
    }
  }
  toolbarClick(e: MouseEvent) {
    const target: HTMLElement = e.target as HTMLElement;
    const type = target?.dataset?.type;

    if (!type || !target.classList.contains("btn")) return;
    if (type === "width") {
      this._setSize(target.dataset.width || null, null);
    } else if (type === "align") {
      this._setAlign(target.dataset.styles);
    }
  }
  startResize(e: PointerEvent) {
    const target: HTMLElement = e.target as HTMLElement;
    if (target.classList.contains("handler") && e.button === 0) {
      e.preventDefault();
      const rect = this.resizeTarget.getBoundingClientRect();
      this.startResizePosition = {
        left: e.clientX,
        top: e.clientY,
        width: rect.width,
        height: rect.height,
        dir: target.dataset.dir || "se",
      };
    }
  }
  endResize() {
    if (!this.startResizePosition) return;
    this.startResizePosition = null;
    const style = this.resizeTarget.style;
    const width = parseFloat(style.width);
    const height = parseFloat(style.height);
    if (!width) return;
    this._setSize(
      `${Math.round(width)}`,
      height ? `${Math.round(height)}` : this.resizeTarget.getAttribute("height")
    );
  }
  resizing(e: PointerEvent) {
    if (!this.startResizePosition) return;
    e.preventDefault();
    const { dir } = this.startResizePosition;
    let deltaX: number = e.clientX - this.startResizePosition.left;
    let deltaY: number = e.clientY - this.startResizePosition.top;
    // Handles on the left/top edge grow the element when dragged outwards
    if (dir.includes("w")) deltaX = -deltaX;
    if (dir.includes("n")) deltaY = -deltaY;

    let width = this.startResizePosition.width + deltaX;
    let height = this.startResizePosition.height + deltaY;

    const minWidth = this.options.resizeConstraints?.minWidth ?? 30;
    const minHeight = this.options.resizeConstraints?.minHeight ?? 30;
    const maxWidth = this.options.resizeConstraints?.maxWidth;
    const maxHeight = this.options.resizeConstraints?.maxHeight;

    width = Math.max(width, minWidth);
    if (maxWidth !== undefined) width = Math.min(width, maxWidth);

    if (this.options.keepAspectRatio || e.altKey) {
      const { width: startWidth, height: startHeight } = this.startResizePosition;
      height = startWidth ? (startHeight / startWidth) * width : height;
    }

    height = Math.max(height, minHeight);
    if (maxHeight !== undefined) height = Math.min(height, maxHeight);

    // Preview with inline styles while dragging; the size is committed as
    // attributes on release so Quill only records a single change
    this.resizeTarget.style.width = `${width}px`;
    this.resizeTarget.style.height = `${height}px`;
    this.positionResizerToTarget(this.resizeTarget);
  }

  destory() {
    if (this.resizer) {
      this.resizer.removeEventListener("pointerdown", this.startResize);
      this.resizer.removeEventListener("click", this.toolbarClick);
      this.resizer.removeEventListener("change", this.toolbarInputChange);
      this.resizer.removeEventListener("dblclick", this.onDblClick);
      this.resizer.parentNode?.removeChild(this.resizer);
    }
    window.removeEventListener("pointerup", this.endResize);
    window.removeEventListener("pointercancel", this.endResize);
    window.removeEventListener("pointermove", this.resizing);
    window.removeEventListener("resize", this.reposition);
    document.removeEventListener("scroll", this.reposition, true);
    this.startResizePosition = null;
    this.resizer = null;
  }

  destroy() {
    this.destory();
  }
}

export default ResizePlugin;
