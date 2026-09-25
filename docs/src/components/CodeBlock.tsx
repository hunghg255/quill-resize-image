import { useState, type ReactNode } from "react";

const TOKEN =
  /(\/\/[^\n]*|<!--[\s\S]*?-->)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|default|const|let|function|return|new|true|false|null|undefined|if|else|await|async|type|interface)\b|\b(\d+(?:\.\d+)?)\b|(<\/?[A-Za-z][\w.-]*|\/?>)/g;

// Tiny highlighter, good enough for the short snippets on this page
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const cls = m[1] ? "tk-comment" : m[2] ? "tk-string" : m[3] ? "tk-keyword" : m[4] ? "tk-number" : "tk-tag";
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>
    );
    last = index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked, nothing else to do */
    }
  };
  return (
    <div className="code">
      <div className="code-head">
        <span>{lang}</span>
        <button type="button" className="ghost-btn" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{highlight(code.trim())}</code>
      </pre>
    </div>
  );
}
