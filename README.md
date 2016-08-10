# tradie-plugin-livereload

A `tradie` plugin for livereloading while building+watching.

## Installation

    npm --save-dev tradie-plugin-livereload

You'll also need to install one of [these browser extensions](http://livereload.com/extensions/), or add the [livereload snippet](http://feedback.livereload.com/knowledgebase/articles/86180-how-do-i-add-the-script-tag-manually) to your HTML.

## Usage

Configure `tradie.config.js`:

```js
var livereload = require('tradie-plugin-livereload').default;

module.exports = {
  plugins: [livereload()]
};
```

Run `tradie build --watch`

## Troubleshooting

Note, the `livereload` browser extensions have limitations with `file://` URLs.
