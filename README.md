<div align="center">

# Gifski Command

### Node.js module for [gifski](https://github.com/ImageOptim/gifski) GIF encoder CLI

[![NPM](https://nodei.co/npm/gifski-command.png?compact=true)](https://nodei.co/npm/gifski-command/)
<br />
[![](https://img.shields.io/npm/dt/gifski-command.svg?style=flat-square)](https://www.npmjs.com/package/gifski-command)

</div>

[![NPM Version](https://badgen.net/npm/v/gifski-command)](https://npmjs.org/package/gifski-command)
[![Coverage Status](https://coveralls.io/repos/github/pichillilorenzo/gifski-command/badge.svg?branch=main)](https://coveralls.io/github/pichillilorenzo/gifski-command?branch=main)
[![license](https://img.shields.io/github/license/pichillilorenzo/gifski-command)](/LICENSE)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/LorenzoPichilli)

## Getting started

To get started with this library, you need to install it and add it to your project.

### Installation

```bash
# npm
npm install gifski-command --save

# yarn
yarn add gifski-command
```

## Library Usage Example

```javascript
import * as path from 'path';
import {GifskiCommand} from 'gifski-command';

const command = new GifskiCommand({
  output: path.join(__dirname, 'test', 'video.gif'),
  frames: [ path.join(__dirname, 'test', 'video.mp4.frame*.png') ],
  quality: 100
});
command.on('progress', progress => {
  console.log(progress);
});
const result = await command.run();
```

## CLI Usage

- `<pattern>` represents a [glob pattern](https://www.npmjs.com/package/glob) used to specify PNG frames used by [gifski](https://github.com/ImageOptim/gifski). Surround with quotes to define the glob pattern.
- `[options]` are the same as the [gifski](https://github.com/ImageOptim/gifski) CLI options.

```
Usage: gifski-command [options] <pattern>

Example: 
  gifski-command -Q 100 -o './test/video.gif' './test/**/video.mp4.frame*.png'
  gifski-command -o - './test/**/video.mp4.frame*.png' > './test/video.gif'

Arguments:
  pattern                Glob pattern of PNG image files. Surround with quotes to define the glob pattern (example './test/**/*.png').

Options:
  -o, --output <a.gif>   Destination file to write to; "-" means stdout
  -r, --fps <num>        Frame rate of animation. This means the speed, as all frames are kept. [default: 20]
  --fast                 50% faster encoding, but 10% worse quality and larger file size
  --extra                50% slower encoding, but 1% better quality
  -Q, --quality <1-100>  Lower quality may give smaller file [default: 90]
  -W, --width <px>       Maximum width. By default anims are limited to about 800x600
  -H, --height <px>      Maximum height (stretches if the width is also set)
  --no-sort              Use files exactly in the order given, rather than sorted
  -q, --quiet            Do not display anything on standard output/console
  --repeat <num>         Number of times the animation is repeated (-1 none, 0 forever or <value> repetitions)
  -h, --help             display help for command
```

## CLI Usage Example

The recommended way is to first export video as PNG frames. If you have [ffmpeg](https://ffmpeg.org/) installed, you can run in terminal:

```bash
ffmpeg -i ./test/video.mp4 ./test/video.mp4.frame%04d.png
```

and then make the GIF from the frames:

```bash
gifski-command -Q 100 -o './test/video.gif' './test/**/video.mp4.frame*.png'

gifski-command -o - './test/**/video.mp4.frame*.png' > './test/video.gif'
```

To use the 

This code snippet shows how to put into action `gifski-command` to convert video frames into a high quality GIF using the [gifski](https://github.com/ImageOptim/gifski) encoder.

## Contributors

Any contribution is appreciated. You can get started with the steps below:

1. Fork [this repository](https://github.com/pichillilorenzo/gifski-command) (learn how to do this [here](https://help.github.com/articles/fork-a-repo)).

2. Clone the forked repository.

3. Make your changes and create a pull request ([learn how to do this](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)).

4. I will attend to your pull request and provide some feedback.

## License

This repository is licensed under the [ISC](LICENSE) License.
