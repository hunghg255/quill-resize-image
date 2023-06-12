# QUILL-RESIZE-IMAGE


[![npm version](https://badge.fury.io/js/quill-resize-image.svg)](https://badge.fury.io/js/quill-resize-image) [![npm](https://img.shields.io/npm/dw/quill-resize-image.svg?logo=npm)](https://www.npmjs.com/package/quill-resize-image) [![npm](https://img.shields.io/bundlephobia/minzip/quill-resize-image)](https://www.npmjs.com/package/quill-resize-image)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

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
       <script defer src="https://cdn.jsdelivr.net/gh/hunghg255/quill-resize-module/dist/quill-resize-module.min.js"></script>
  </head>
  <body>
    <div id="editor">
      <p>Hello World!</p>
      <p>Some initial <strong>bold</strong> text</p>
      <p><br /></p>
    </div>
  </body>
  <script>
    Quill.register("modules/resize", window.QuillResizeModule);

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
