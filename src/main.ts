import ResizePlugin from "./ResizePlugin";
import IframeOnClick from "./IframeClick";
import { Locale } from "./i18n";

interface Quill {
  container: HTMLElement;
  root: HTMLElement; // edit area
  on: any;
  updateContents: (delta: any) => void;
  getContents: () => any;
}
interface QuillResizeModuleOptions {
  [index: string]: any;
  locale?: Locale;
}

function QuillResizeModule(quill: Quill, options?: QuillResizeModuleOptions) {
  const container: HTMLElement = quill.root as HTMLElement;
  let resizeTarge: HTMLElement | null;
  let resizePlugin: ResizePlugin | null;

  function triggerTextChange() {
    const Delta = quill.getContents().constructor;
    const delta = new Delta().retain(1);
    quill.updateContents(delta);
  }

  container.addEventListener("click", (e: Event) => {
    const target: HTMLElement = e.target as HTMLElement;
    if (e.target && ["img", "video"].includes(target.tagName.toLowerCase())) {
      resizeTarge = target;
      resizePlugin = new ResizePlugin(
        target,
        container.parentElement as HTMLElement,
        {
          ...options,
          onChange: triggerTextChange,
        }
      );
    }
  });

  quill.on("text-change", (delta: any, source: string) => {
    // iframe 大小调整
    container.querySelectorAll("iframe").forEach((item: HTMLIFrameElement) => {
      IframeOnClick.track(item, () => {
        resizeTarge = item;
        resizePlugin = new ResizePlugin(
          item,
          container.parentElement as HTMLElement,
          {
            ...options,
            onChange: triggerTextChange,
          }
        );
      });
    });
  });

  document.addEventListener(
    "mousedown",
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target !== resizeTarge &&
        !resizePlugin?.resizer?.contains?.(target)
      ) {
        resizePlugin?.destory?.();
        resizePlugin = null;
        resizeTarge = null;
      }
    },
    { capture: true }
  );
}

export default QuillResizeModule;
