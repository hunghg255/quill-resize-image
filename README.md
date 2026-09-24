<p align="center">
<a href="https://www.npmjs.com/package/quill-resize-image" target="_blank" rel="noopener noreferrer">
<img src="https://api.iconify.design/fluent:resize-image-20-filled.svg?color=%23fdb4e2" alt="logo" width='100'/></a>
</p>

<p align="center">
  A library resize image for <a href="https://quilljs.com/" target="_blank" rel="noopener noreferrer">Quill</a> editor.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/quill-resize-image" target="_blank" rel="noopener noreferrer"><img src="https://badge.fury.io/js/csvs-parsers.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/quill-resize-image" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/dt/csvs-parsers.svg?logo=npm" alt="NPM Downloads" /></a>
  <a href="https://bundlephobia.com/result?p=quill-resize-image" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/bundlephobia/minzip/quill-resize-image" alt="Minizip" /></a>
  <a href="https://github.com/hunghg255/quill-resize-image/graphs/contributors" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/all_contributors-1-orange.svg" alt="Contributors" /></a>
  <a href="https://github.com/hunghg255/quill-resize-image/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/hunghg255/quill-resize-image" alt="License" /></a>
</p>

## Demo

[Quill Resize Image](https://quill-resize-image.vercel.app/)

## Install

```bash
npm i quill-resize-image@latest
```

With `yarn`

```bash
yarn add quill-resize-image
```

## Reactjs

```tsx
import ReactQuill, { Quill } from 'react-quill';
import QuillResizeImage from 'quill-resize-image';

/**
- add object resize to modules.
**/

// resize: {
//   locale: {},
// },


Quill.register("modules/resize", window.QuillResizeImage);

const App = () => {
  const Editor = {
      modules: {
        toolbar: {
          container: [
            ['image'],
          ],
        },
        resize: {
          locale: {},
        },
      },
      formats: [
        'image',
      ],
    };

  return <ReactQuill
      modules={Editor.modules}
      formats={Editor.formats}
      theme='snow'
    />
}

```

## Browser

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link
      crossorigin="anonymous"
      integrity="sha384-7kltdnODhBho8GSWnwD9l9rilXkpuia4Anp4TKHPOrp8/MS/+083g4it4MYED/hc"
      href="http://lib.baomitu.com/quill/2.0.0-dev.3/quill.snow.min.css"
      rel="stylesheet"
    />
    <script
      crossorigin="anonymous"
      integrity="sha384-MDio1/ps0nK1tabxUqZ+1w2NM9faPltR1mDqXcNleeuiSi0KBXqIsWofIp4r5A0+"
      src="http://lib.baomitu.com/quill/2.0.0-dev.3/quill.min.js"
    ></script>
       <script defer src="https://cdn.jsdelivr.net/gh/hunghg255/quill-resize-module/dist/quill-resize-image.min.js"></script>
  </head>
  <body>
    <div id="editor">
      <p>Hello World!</p>
      <p>Some initial <strong>bold</strong> text</p>
      <p><br /></p>
    </div>
  </body>
  <script>
    Quill.register("modules/resize", window.QuillResizeImage);

    var toolbarOptions = [
      "bold",
      "italic",
      "underline",
      "strike",
      "image",
      "video",
    ];
    var quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
        resize: {
          locale: {
            center: "center",
          },
        },
      },
    });
  </script>
</html>
```


## Options

```js
resize: {
  locale: {},                 // labels: floatLeft, floatRight, center, restore, altTip, inputTip
  showToolbar: true,          // set to false to hide the floating toolbar and keep only the resize handles
  keepAspectRatio: false,     // always keep the aspect ratio (or hold Alt while dragging)
  resizeConstraints: {        // limits in px
    minWidth: 30,
    minHeight: 30,
    maxWidth: undefined,
    maxHeight: undefined,
  },
  disableMediaTypes: {
    disableImages: false,
    disableVideos: false,
    disableIframes: false,
  },
}
```

- Sizes are written as `width` / `height` attributes (e.g. `width="50%"`) through the Quill API, so they are kept in the delta, in undo history and in `getSemanticHTML()`.
- Resize handles are available on all four corners and work with touch (pointer events).
- Double clicks on a selected image are forwarded to the image, so your own `dblclick` handlers keep working.
- Alignment (left / center / right) is applied as inline style. Quill does not keep inline styles in the delta, so alignment is not persisted when you reload from a delta.

## Cleanup

Call `destroy()` on the module when the editor is unmounted to remove every listener it registered:

```js
quill.getModule("resize").destroy();
```

## React: keep `modules` stable

If `modules` (for example a toolbar `handlers` object) is created inside the component body, React Quill re-creates the editor on every render and the resizer stops working. Memoize it:

```tsx
const modules = useMemo(() => ({
  toolbar: { container: [["image"]], handlers: { image: handleImageUpload } },
  resize: { locale: {} },
}), []);
```

## All Contributors

Thanks to the following friends for their contributions to project:

<a href="https://github.com/hunghg255/quill-resize-image/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hunghg255/quill-resize-image" alt="contributors">
</a>
