# QUILL-RESIZE-MODULE

A module for Quill rich text editor to allow images to be resized.

Also see [quill-resize-module](https://github.com/scrapooo/quill-resize-module),
a module that enables resize for image/iframe/video.

## Demo

![image](https://raw.githubusercontent.com/scrapooo/quill-resize-module/master/demo/demo.gif)

## Usage

### Webpack/ES6

`npm install @ssumo/quill-resize-module`

```javascript
import Quill from "quill";
import ResizeModule from "@ssumo/quill-resize-module";

Quill.register("modules/resize", ResizeModule);

const quill = new Quill(editor, {
  modules: {
    resize: {
      locale: {
        altTip: "按住alt键比例缩放",
        inputTip: "回车键确认",
        floatLeft: "靠左",
        floatRight: "靠右",
        center: "居中",
        restore: "还原",
      },
    },
  },
});
```

### browser

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
    <script src="../dist/quill-resize-module.js"></script>
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
