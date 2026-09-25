import { useCallback, useMemo, useRef, useState } from "react";
import type Quill from "quill";
import QuillEditor, { type ResizeOptions } from "./QuillEditor";
import CodeBlock from "./CodeBlock";
import { initialDelta, landscape, portrait, square, youtube } from "../samples";

const LOCALES: Record<string, { label: string; locale: Record<string, string> }> = {
  en: { label: "English (default)", locale: {} },
  vi: {
    label: "Tiếng Việt",
    locale: {
      floatLeft: "Trái",
      center: "Giữa",
      floatRight: "Phải",
      restore: "Đặt lại",
      altTip: "Giữ Alt để khóa tỉ lệ",
      inputTip: "Nhấn Enter để áp dụng",
    },
  },
  zh: {
    label: "中文",
    locale: {
      floatLeft: "居左",
      center: "居中",
      floatRight: "居右",
      restore: "还原",
      altTip: "按住 Alt 锁定比例",
      inputTip: "回车键应用",
    },
  },
};

interface Settings {
  showToolbar: boolean;
  keepAspectRatio: boolean;
  persistAlignment: boolean;
  disableImages: boolean;
  disableVideos: boolean;
  disableIframes: boolean;
  minWidth: string;
  maxWidth: string;
  locale: string;
  dblclickPreview: boolean;
}

const DEFAULTS: Settings = {
  showToolbar: true,
  keepAspectRatio: false,
  persistAlignment: true,
  disableImages: false,
  disableVideos: false,
  disableIframes: false,
  minWidth: "30",
  maxWidth: "",
  locale: "en",
  dblclickPreview: true,
};

type Tab = "delta" | "html" | "events" | "code";

function toOptions(s: Settings): ResizeOptions {
  const options: ResizeOptions = {};
  if (s.locale !== "en") options.locale = LOCALES[s.locale].locale;
  if (!s.showToolbar) options.showToolbar = false;
  if (s.keepAspectRatio) options.keepAspectRatio = true;
  if (!s.persistAlignment) options.persistAlignment = false;
  const constraints: NonNullable<ResizeOptions["resizeConstraints"]> = {};
  if (s.minWidth !== "" && Number(s.minWidth) !== 30) constraints.minWidth = Number(s.minWidth);
  if (s.maxWidth !== "") constraints.maxWidth = Number(s.maxWidth);
  if (Object.keys(constraints).length) options.resizeConstraints = constraints;
  const disabled: NonNullable<ResizeOptions["disableMediaTypes"]> = {};
  if (s.disableImages) disabled.disableImages = true;
  if (s.disableVideos) disabled.disableVideos = true;
  if (s.disableIframes) disabled.disableIframes = true;
  if (Object.keys(disabled).length) options.disableMediaTypes = disabled;
  return options;
}

function indent(json: string, pad: string) {
  return json.replace(/\n/g, `\n${pad}`);
}

function toCode(options: ResizeOptions) {
  const resize = JSON.stringify(options, null, 2).replace(/"([a-zA-Z]+)":/g, "$1:");
  return `import { useEffect, useRef } from "react";
import Quill from "quill";
import QuillResizeImage from "quill-resize-image";
import "quill/dist/quill.snow.css";

Quill.register("modules/resize", QuillResizeImage);

export default function Editor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current!;
    const quill = new Quill(host.appendChild(document.createElement("div")), {
      theme: "snow",
      modules: {
        toolbar: [["bold", "italic"], ["image", "video"]],
        resize: ${indent(resize, "        ")},
      },
    });

    return () => {
      (quill.getModule("resize") as { destroy(): void }).destroy();
      host.innerHTML = "";
    };
  }, []);

  return <div ref={ref} />;
}`;
}

interface LogEntry {
  id: number;
  time: string;
  source: string;
  delta: string;
}

export default function Playground() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [editorKey, setEditorKey] = useState(0);
  const [tab, setTab] = useState<Tab>("delta");
  const [deltaText, setDeltaText] = useState("");
  const [html, setHtml] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const quillRef = useRef<Quill | null>(null);
  const contentRef = useRef<unknown>(initialDelta);
  const logId = useRef(0);

  const options = useMemo(() => toOptions(settings), [settings]);

  const snapshot = useCallback((quill: Quill) => {
    const contents = quill.getContents();
    contentRef.current = contents;
    setDeltaText(JSON.stringify(contents.ops, null, 2));
    setHtml(quill.getSemanticHTML());
  }, []);

  const remount = (message: string) => {
    if (quillRef.current) contentRef.current = quillRef.current.getContents();
    setEditorKey((k) => k + 1);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    if (key !== "dblclickPreview") remount("Editor re-created with the new options");
  };

  const insert = (kind: "landscape" | "square" | "portrait" | "video") => {
    const quill = quillRef.current;
    if (!quill) return;
    const range = quill.getSelection(true);
    const index = range ? range.index : quill.getLength() - 1;
    if (kind === "video") quill.insertEmbed(index, "video", youtube, "user");
    else quill.insertEmbed(index, "image", { landscape, square, portrait }[kind], "user");
    quill.setSelection(index + 1, 0, "silent");
  };

  const reset = () => {
    contentRef.current = initialDelta;
    setSettings(DEFAULTS);
    setLog([]);
    setEditorKey((k) => k + 1);
  };

  return (
    <div className="playground">
      <aside className="pg-controls" aria-label="Options">
        <fieldset>
          <legend>Behaviour</legend>
          <Toggle label="showToolbar" hint="Floating toolbar with size & align buttons" checked={settings.showToolbar} onChange={(v) => update("showToolbar", v)} />
          <Toggle label="keepAspectRatio" hint="Always keep the ratio while dragging" checked={settings.keepAspectRatio} onChange={(v) => update("keepAspectRatio", v)} />
          <Toggle label="persistAlignment" hint="Store left / center / right in the Delta" checked={settings.persistAlignment} onChange={(v) => update("persistAlignment", v)} />
        </fieldset>

        <fieldset>
          <legend>resizeConstraints (px)</legend>
          <div className="num-row">
            <label>
              <span>minWidth</span>
              <input type="number" min={0} value={settings.minWidth} onChange={(e) => setSettings((s) => ({ ...s, minWidth: e.target.value }))} onBlur={() => remount("Constraints applied")} />
            </label>
            <label>
              <span>maxWidth</span>
              <input type="number" min={0} placeholder="none" value={settings.maxWidth} onChange={(e) => setSettings((s) => ({ ...s, maxWidth: e.target.value }))} onBlur={() => remount("Constraints applied")} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>disableMediaTypes</legend>
          <Toggle label="disableImages" checked={settings.disableImages} onChange={(v) => update("disableImages", v)} />
          <Toggle label="disableVideos" checked={settings.disableVideos} onChange={(v) => update("disableVideos", v)} />
          <Toggle label="disableIframes" hint="Quill videos are iframes" checked={settings.disableIframes} onChange={(v) => update("disableIframes", v)} />
        </fieldset>

        <fieldset>
          <legend>locale</legend>
          <select value={settings.locale} onChange={(e) => update("locale", e.target.value)}>
            {Object.entries(LOCALES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>Your own handlers</legend>
          <Toggle label="Preview on double-click" hint="A dblclick listener on the image still fires while the resizer is open" checked={settings.dblclickPreview} onChange={(v) => update("dblclickPreview", v)} />
        </fieldset>
      </aside>

      <div className="pg-main">
        <div className="pg-actions">
          <div className="btn-row">
            <button type="button" className="d-btn" onClick={() => insert("landscape")}>+ Landscape</button>
            <button type="button" className="d-btn" onClick={() => insert("square")}>+ Square</button>
            <button type="button" className="d-btn" onClick={() => insert("portrait")}>+ Portrait</button>
            <button type="button" className="d-btn" onClick={() => insert("video")}>+ YouTube</button>
          </div>
          <div className="btn-row">
            <button type="button" className="d-btn d-btn-primary" onClick={() => remount("Re-created from the saved Delta: sizes and alignment are kept")}>
              Recreate from Delta
            </button>
            <button type="button" className="d-btn" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className="pg-editor">
          <QuillEditor
            key={editorKey}
            resize={options}
            defaultValue={contentRef.current as { ops: unknown[] }}
            onReady={(quill) => {
              quillRef.current = quill;
              snapshot(quill);
            }}
            onTextChange={(quill, delta, source) => {
              snapshot(quill);
              const entry: LogEntry = {
                id: ++logId.current,
                time: new Date().toLocaleTimeString(),
                source,
                delta: JSON.stringify(delta.ops),
              };
              setLog((l) => [entry, ...l].slice(0, 30));
            }}
            onMediaDoubleClick={(target) => {
              if (settings.dblclickPreview && target instanceof HTMLImageElement) setPreview(target.src);
            }}
          />
          <div className={`toast ${notice ? "show" : ""}`} role="status">
            {notice}
          </div>
        </div>

        <div className="pg-output">
          <div className="tabs" role="tablist">
            {(
              [
                ["delta", "Delta"],
                ["html", "HTML"],
                ["events", `Events (${log.length})`],
                ["code", "Code"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
          <div className="tab-panel">
            {tab === "delta" && <pre className="output">{shorten(deltaText)}</pre>}
            {tab === "html" && <pre className="output">{shorten(html)}</pre>}
            {tab === "events" && (
              <div className="output events">
                {log.length === 0 ? (
                  <p className="muted">Resize or align an image: each change fires a single text-change event.</p>
                ) : (
                  log.map((e) => (
                    <div key={e.id} className="event">
                      <span className="muted">{e.time}</span> <span className="badge">{e.source}</span> <code>{shorten(e.delta, 160)}</code>
                    </div>
                  ))
                )}
              </div>
            )}
            {tab === "code" && <CodeBlock code={toCode(options)} lang="tsx" />}
          </div>
        </div>
      </div>

      {preview && (
        <div className="lightbox" role="dialog" aria-label="Image preview" onClick={() => setPreview(null)}>
          <img src={preview} alt="" />
          <span className="muted">Opened by your own dblclick handler · click to close</span>
        </div>
      )}
    </div>
  );
}

// Data URLs make the output unreadable, so they are shortened for display
function shorten(text: string, max?: number) {
  const out = text.replace(/data:image\/[^"'\s)]{40,}/g, (m) => `${m.slice(0, 32)}…`);
  return max && out.length > max ? `${out.slice(0, max)}…` : out;
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
      <span className="toggle-text">
        <code>{label}</code>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
