import { useEffect, useState } from "react";
import Playground from "./components/Playground";
import CodeBlock from "./components/CodeBlock";

const REPO = "https://github.com/hunghg255/quill-resize-image";

const NAV = [
  { id: "playground", label: "Playground" },
  { id: "install", label: "Installation" },
  { id: "react", label: "Usage with React" },
  { id: "browser", label: "Usage in the browser" },
  { id: "options", label: "Options" },
  { id: "persistence", label: "Saving to the Delta" },
  { id: "cleanup", label: "Cleanup" },
  { id: "recipes", label: "Recipes" },
  { id: "faq", label: "Troubleshooting" },
];

const FEATURES = [
  ["Four corner handles", "Drag any corner, with min / max constraints and an optional locked aspect ratio."],
  ["Stored in the Delta", "Width, height and alignment are written through the Quill API, so they persist and can be undone."],
  ["Images, videos, iframes", "Works with <img>, <video> and Quill's video embeds, each can be disabled."],
  ["Touch ready", "Pointer events and larger handles on touch screens."],
  ["Follows the layout", "Stays on the media inside lists, tables and scrolling containers."],
  ["Plays nice with React", "destroy() removes every listener when the editor unmounts."],
];

const OPTIONS: [string, string, string, string][] = [
  ["locale", "object", "{}", "Toolbar labels: floatLeft, center, floatRight, restore, altTip, inputTip."],
  ["showToolbar", "boolean", "true", "Show the floating toolbar with the width and alignment buttons. Set to false to keep only the handles."],
  ["keepAspectRatio", "boolean", "false", "Always keep the aspect ratio while dragging. Without it, hold Alt to lock the ratio."],
  ["persistAlignment", "boolean", "true", "Store left / center / right alignment in the Delta as a style attribute limited to float, display and margin."],
  ["resizeConstraints.minWidth", "number", "30", "Smallest width in px while dragging."],
  ["resizeConstraints.maxWidth", "number", "—", "Largest width in px while dragging."],
  ["resizeConstraints.minHeight", "number", "30", "Smallest height in px while dragging."],
  ["resizeConstraints.maxHeight", "number", "—", "Largest height in px while dragging."],
  ["disableMediaTypes.disableImages", "boolean", "false", "Do not show the resizer for <img>."],
  ["disableMediaTypes.disableVideos", "boolean", "false", "Do not show the resizer for <video>."],
  ["disableMediaTypes.disableIframes", "boolean", "false", "Do not show the resizer for <iframe> (Quill's video embed)."],
];

const reactHookCode = `
import { useEffect, useRef } from "react";
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
        resize: { locale: {} },
      },
    });

    return () => {
      (quill.getModule("resize") as { destroy(): void }).destroy();
      host.innerHTML = "";
    };
  }, []);

  return <div ref={ref} />;
}
`;

const reactQuillCode = `
import { useMemo } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import QuillResizeImage from "quill-resize-image";
import "react-quill-new/dist/quill.snow.css";

Quill.register("modules/resize", QuillResizeImage);

export default function Editor({ value, onChange }) {
  // Keep modules stable: a new object on every render re-creates the editor
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [["bold", "italic"], ["image", "video"]],
        handlers: { image: uploadImage },
      },
      resize: { locale: {} },
    }),
    []
  );

  return <ReactQuill theme="snow" modules={modules} value={value} onChange={onChange} />;
}
`;

const browserCode = `
<link href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>
<script src="https://cdn.jsdelivr.net/npm/quill-resize-image/dist/quill-resize-image.min.js"></script>

<div id="editor"></div>
<script>
  Quill.register("modules/resize", window.QuillResizeImage);

  const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: ["bold", "italic", "image", "video"],
      resize: { locale: { center: "center" } },
    },
  });
</script>
`;

const deltaCode = `
{
  "insert": { "image": "https://example.com/cat.png" },
  "attributes": {
    "width": "50%",
    "style": "float: left; margin: 0px 1em 1em 0px;"
  }
}
`;

const saveCode = `
// Save
const json = JSON.stringify(quill.getContents());

// Load: size and alignment come back as they were
quill.setContents(JSON.parse(json));
`;

const recipes: { title: string; text: string; code: string }[] = [
  {
    title: "Lock the aspect ratio",
    text: "Height follows width while dragging. Users can also hold Alt for the same effect without the option.",
    code: `resize: { keepAspectRatio: true }`,
  },
  {
    title: "Handles only, no toolbar",
    text: "Hide the floating toolbar when you do not want the width and alignment buttons.",
    code: `resize: { showToolbar: false }`,
  },
  {
    title: "Limit the size",
    text: "Clamp the size while dragging, in px.",
    code: `resize: {
  resizeConstraints: { minWidth: 80, maxWidth: 800 },
}`,
  },
  {
    title: "Only images",
    text: "Leave videos and iframes alone.",
    code: `resize: {
  disableMediaTypes: { disableVideos: true, disableIframes: true },
}`,
  },
  {
    title: "Translate the toolbar",
    text: "Any label you leave out falls back to English.",
    code: `resize: {
  locale: {
    floatLeft: "Trái",
    center: "Giữa",
    floatRight: "Phải",
    restore: "Đặt lại",
    altTip: "Giữ Alt để khóa tỉ lệ",
    inputTip: "Nhấn Enter để áp dụng",
  },
}`,
  },
  {
    title: "Double-click to preview",
    text: "The resizer forwards double clicks to the media, so your own listener keeps working.",
    code: `quill.root.addEventListener("dblclick", (e) => {
  if (e.target instanceof HTMLImageElement) openPreview(e.target.src);
});`,
  },
];

const faq: { q: string; a: string }[] = [
  {
    q: "The resizer stops working after one pixel, or the editor resets while typing (React)",
    a: "Your modules object is re-created on every render (for example because toolbar handlers are defined inline), so React Quill builds a new editor. Wrap modules in useMemo, as in the React Quill example above.",
  },
  {
    q: "Sizes or alignment are lost after reloading",
    a: "Save quill.getContents() (the Delta), not the HTML of the resizer. Sizes are stored as width / height and alignment as style. If you set persistAlignment: false, alignment is not stored.",
  },
  {
    q: "The resize box is in the wrong place",
    a: "The box is positioned inside quill.container. If that element has no position, the module sets position: relative on it. When you move media programmatically, the box follows on the next text change or scroll.",
  },
  {
    q: "Memory keeps growing when I navigate between pages",
    a: "Call quill.getModule(\"resize\").destroy() when the editor unmounts. It removes the document, window and editor listeners registered by the module.",
  },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("qri-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* storage can be unavailable */
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("qri-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, setTheme] as const;
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeDasharray="3 2.2" />
      <rect x="6" y="6" width="9" height="9" rx="2" fill="var(--accent)" />
      <path d="M14 20 L20 20 L20 14" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [pm, setPm] = useState<"npm" | "pnpm" | "yarn">("npm");
  const installCmd = { npm: "npm i quill quill-resize-image", pnpm: "pnpm add quill quill-resize-image", yarn: "yarn add quill quill-resize-image" }[pm];

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top">
          <Logo />
          <span>Quill Resize Image</span>
        </a>
        <nav className="top-links">
          <a href="#playground">Playground</a>
          <a href="#options">Options</a>
          <a href="https://www.npmjs.com/package/quill-resize-image" target="_blank" rel="noreferrer">npm</a>
          <a href={REPO} target="_blank" rel="noreferrer">GitHub</a>
          <button type="button" className="ghost-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </nav>
      </header>

      <div className="layout" id="top">
        <aside className="sidebar">
          <nav aria-label="Contents">
            <p className="sidebar-title">On this page</p>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {n.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="content">
          <section className="hero">
            <p className="eyebrow">Quill 2 · React · Vanilla JS</p>
            <h1>Resize, align and keep media in Quill</h1>
            <p className="lead">
              A small Quill module that adds drag handles and a size / alignment toolbar to images, videos and iframes.
              Changes go through the Quill API, so they are saved in the Delta and can be undone.
            </p>
            <div className="btn-row">
              <a className="d-btn d-btn-primary" href="#playground">Try the playground</a>
              <a className="d-btn" href="#install">Get started</a>
            </div>
            <div className="features">
              {FEATURES.map(([title, text]) => (
                <div key={title} className="feature">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="playground" className="wide">
            <h2>Playground</h2>
            <p>
              Change any option and the editor is re-created with it, keeping your content. Click an image, drag a corner or use the
              toolbar, then look at the Delta. <strong>Recreate from Delta</strong> rebuilds the editor from the saved Delta so you can check that
              nothing is lost.
            </p>
            <Playground />
          </section>

          <section id="install">
            <h2>Installation</h2>
            <div className="seg" role="tablist">
              {(["npm", "pnpm", "yarn"] as const).map((p) => (
                <button key={p} type="button" className={pm === p ? "active" : ""} onClick={() => setPm(p)}>
                  {p}
                </button>
              ))}
            </div>
            <CodeBlock code={installCmd} lang="bash" />
          </section>

          <section id="react">
            <h2>Usage with React</h2>
            <h3>With Quill directly</h3>
            <p>Create the editor in an effect and destroy the module in the cleanup. This also works with React StrictMode.</p>
            <CodeBlock code={reactHookCode} lang="tsx" />
            <h3>With React Quill</h3>
            <p>
              Register the module on the <code>Quill</code> export of <code>react-quill-new</code> (or <code>react-quill</code>) and keep{" "}
              <code>modules</code> stable with <code>useMemo</code>.
            </p>
            <CodeBlock code={reactQuillCode} lang="tsx" />
          </section>

          <section id="browser">
            <h2>Usage in the browser</h2>
            <p>
              The UMD build exposes <code>window.QuillResizeImage</code>.
            </p>
            <CodeBlock code={browserCode} lang="html" />
          </section>

          <section id="options">
            <h2>Options</h2>
            <p>
              Pass options under the name you registered the module with, e.g. <code>modules: {"{ resize: { … } }"}</code>.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {OPTIONS.map(([name, type, def, desc]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                      </td>
                      <td>
                        <code>{type}</code>
                      </td>
                      <td>
                        <code>{def}</code>
                      </td>
                      <td>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="persistence">
            <h2>Saving to the Delta</h2>
            <p>
              Dragging and the width buttons write <code>width</code> / <code>height</code> attributes (e.g. <code>width="50%"</code>). Alignment
              is written as a <code>style</code> attribute that only keeps <code>float</code>, <code>display</code> and <code>margin</code>. Both go
              through <code>quill.formatText</code>, so an image looks like this in the Delta:
            </p>
            <CodeBlock code={deltaCode} lang="json" />
            <p>Save and load the Delta as usual:</p>
            <CodeBlock code={saveCode} lang="js" />
            <p className="note">
              While you drag, the size is only previewed. It is saved once when you release the handle, so each resize is a single{" "}
              <code>text-change</code> and a single undo step.
            </p>
          </section>

          <section id="cleanup">
            <h2>Cleanup</h2>
            <p>
              The module listens on <code>document</code> and <code>window</code>. Call <code>destroy()</code> when the editor goes away (route
              change, component unmount) to remove those listeners.
            </p>
            <CodeBlock code={`quill.getModule("resize").destroy();`} lang="js" />
          </section>

          <section id="recipes">
            <h2>Recipes</h2>
            <div className="recipes">
              {recipes.map((r) => (
                <div key={r.title} className="recipe">
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <CodeBlock code={r.code} lang="js" />
                </div>
              ))}
            </div>
          </section>

          <section id="faq">
            <h2>Troubleshooting</h2>
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <footer className="footer">
            MIT License ·{" "}
            <a href={REPO} target="_blank" rel="noreferrer">
              hunghg255/quill-resize-image
            </a>
          </footer>
        </main>
      </div>
    </>
  );
}
