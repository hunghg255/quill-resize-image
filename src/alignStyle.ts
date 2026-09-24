// Inline style properties used by the toolbar alignment buttons
const ALIGN_PROPS = ["float", "display", "margin"];
const MARGIN_SIDES = ["margin-top", "margin-right", "margin-bottom", "margin-left"];

// Read the alignment related inline styles of an element as a css string
function getAlignStyle(el: HTMLElement): string {
  const style = el.style;
  const props = ALIGN_PROPS.slice();
  if (!style.getPropertyValue("margin")) {
    props.splice(props.indexOf("margin"), 1, ...MARGIN_SIDES);
  }
  return props
    .filter((prop) => style.getPropertyValue(prop))
    .map((prop) => `${prop}: ${style.getPropertyValue(prop)};`)
    .join(" ");
}

// Replace the alignment related inline styles of an element with `cssText`
function applyAlignStyle(el: HTMLElement, cssText: string) {
  const style = el.style;
  ALIGN_PROPS.concat(MARGIN_SIDES).forEach((prop) => style.removeProperty(prop));
  cssText.split(";").forEach((declaration) => {
    const index = declaration.indexOf(":");
    if (index < 0) return;
    const prop = declaration.slice(0, index).trim();
    const value = declaration.slice(index + 1).trim();
    if (ALIGN_PROPS.includes(prop) || MARGIN_SIDES.includes(prop)) {
      style.setProperty(prop, value);
    }
  });
  removeEmptyStyle(el);
}

// Drop an empty `style` attribute left behind by CSSOM edits
function removeEmptyStyle(el: HTMLElement) {
  // Reading the attribute first flushes Chrome's lazily synced inline style,
  // otherwise it re-creates `style=""` after the removal
  if (!el.getAttribute("style")?.trim()) el.removeAttribute("style");
}

// Let an embed format (image, video) keep its alignment as a `style` format,
// so it is stored in the delta instead of being dropped by Quill
function patchAlignFormat(Format: any) {
  if (!Format || Format.__resizeAlignPatched) return;
  const formats = Format.formats;
  const format = Format.prototype.format;
  if (typeof formats !== "function" || typeof format !== "function") return;

  Format.formats = function (domNode: HTMLElement, ...rest: any[]) {
    const result = formats.call(this, domNode, ...rest) || {};
    const style = getAlignStyle(domNode);
    if (style) result.style = style;
    return result;
  };
  Format.prototype.format = function (name: string, value: any) {
    if (name === "style") {
      applyAlignStyle(this.domNode, typeof value === "string" ? value : "");
    } else {
      format.call(this, name, value);
    }
  };
  Format.__resizeAlignPatched = true;
}

export { getAlignStyle, applyAlignStyle, patchAlignFormat, removeEmptyStyle };
