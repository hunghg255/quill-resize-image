import { useEffect, useRef } from "react";
import Quill from "quill";
import type { Delta as DeltaType } from "quill";
import QuillResizeImage from "quill-resize-image";
import "quill/dist/quill.snow.css";

Quill.register("modules/resize", QuillResizeImage);

export interface ResizeOptions {
  locale?: Record<string, string>;
  showToolbar?: boolean;
  keepAspectRatio?: boolean;
  persistAlignment?: boolean;
  resizeConstraints?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  disableMediaTypes?: {
    disableImages?: boolean;
    disableVideos?: boolean;
    disableIframes?: boolean;
  };
}

interface Props {
  resize: ResizeOptions;
  defaultValue?: DeltaType | { ops: unknown[] };
  readOnly?: boolean;
  onReady?: (quill: Quill) => void;
  onTextChange?: (quill: Quill, delta: DeltaType, source: string) => void;
  onMediaDoubleClick?: (target: HTMLElement) => void;
}

const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "link"],
  [{ list: "ordered" }, { list: "bullet" }, { align: [] }],
  ["image", "video"],
  ["clean"],
];

/**
 * Minimal Quill wrapper. Options are read once on mount: remount (change `key`)
 * to apply new options, which is what the playground does.
 */
export default function QuillEditor({
  resize,
  defaultValue,
  readOnly,
  onReady,
  onTextChange,
  onMediaDoubleClick,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onTextChange, onMediaDoubleClick });
  callbacks.current = { onReady, onTextChange, onMediaDoubleClick };

  useEffect(() => {
    const host = hostRef.current!;
    const editorEl = host.appendChild(document.createElement("div"));

    const quill = new Quill(editorEl, {
      theme: "snow",
      readOnly,
      modules: { toolbar, resize },
    });
    if (defaultValue) quill.setContents(defaultValue as DeltaType, "silent");
    quill.history.clear();

    quill.on("text-change", (delta: DeltaType, _old: DeltaType, source: string) => {
      callbacks.current.onTextChange?.(quill, delta, source);
    });
    const onDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (["IMG", "VIDEO"].includes(target.tagName)) {
        callbacks.current.onMediaDoubleClick?.(target);
      }
    };
    quill.root.addEventListener("dblclick", onDblClick);
    callbacks.current.onReady?.(quill);

    return () => {
      // Remove the listeners registered by the resize module (also needed for StrictMode)
      (quill.getModule("resize") as { destroy?: () => void } | undefined)?.destroy?.();
      quill.root.removeEventListener("dblclick", onDblClick);
      host.innerHTML = "";
    };
    // Options are applied on mount only, see the comment above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="quill-host" />;
}
