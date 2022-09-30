#!/usr/bin/env node
import {Command} from 'commander';
import {glob} from 'glob';
import {GifskiCommand, GifskiCommandOptions} from "./index";
import * as path from "path";

const program = new Command();

const Bar = require('progress-barjs');

function log(options: GifskiCommandOptions, ...args: any[]) {
  if (options.output !== '-' && !options.quiet) {
    console.log(...args);
  }
}

async function generateGIF(pattern: string) {
  const options: GifskiCommandOptions = {
    ...program.opts()
  };
  if (pattern && options.output) {
    const files = glob.sync(`${pattern}`, {
      absolute: true
    });

    if (options.output !== '-') {
      options.output = path.resolve(options.output);
    }

    log(options, `${files.length} PNG image file${files.length !== 1 ? 's' : ''} found!`);

    const command = new GifskiCommand({
      ...options,
      frames: files
    });

    if (options.output !== '-' && !options.quiet) {
      const bar = Bar({
        label: `Convert to .gif`,
        info: 'Processing',
        total: files.length,
      });
      let previousCurrentFrame = 0;
      command.on('progress', progress => {
        bar.tickChunk(progress.currentFrame - previousCurrentFrame);
        previousCurrentFrame = progress.currentFrame;
      });
    }

    const {err, stdout} = await command.run();
    if (err) {
      console.error(err);
      process.exit(1);
      return;
    }

    log(options, `🎉 ${files.length} PNG image file${files.length !== 1 ? 's have' : 'had'} been converted with success. 🎉`);
    log(options, `GIF saved at: ${options.output}`);

    if (options.output === '-' && stdout instanceof Buffer) {
      process.stdout.write(stdout as Buffer);
    }
  } else {
    if (!pattern)
      throw Error('Empty glob pattern of PNG image files!');
    if (!options.output)
      throw Error('Empty output destination file path!');
  }
}

async function run() {
  program
    .argument('<pattern>', `Glob pattern of PNG image files. Surround the glob pattern with quotes (example './test/**/*.png').`)
    .description(`Examples: 
  gifski-command -Q 100 -o './test/video.gif' './test/**/video.mp4.frame*.png'
  gifski-command -o - './test/**/video.mp4.frame*.png' > './test/video.gif'`)
    .requiredOption('-o, --output <a.gif>', 'Destination file to write to; "-" means stdout')
    .option('-r, --fps <num>', 'Frame rate of animation. This means the speed, as all frames are kept. [default: 20]')
    .option('--fast', '50% faster encoding, but 10% worse quality and larger file size')
    .option('--extra', '50% slower encoding, but 1% better quality')
    .option('-Q, --quality <1-100>', 'Lower quality may give smaller file [default: 90]')
    .option('-W, --width <px>', 'Maximum width. By default anims are limited to about 800x600')
    .option('-H, --height <px>', 'Maximum height (stretches if the width is also set)')
    .option('--no-sort', 'Use files exactly in the order given, rather than sorted')
    .option('-q, --quiet', 'Do not display anything on standard output/console')
    .option('--repeat <num>', 'Number of times the animation is repeated (-1 none, 0 forever or <value> repetitions)')
    .action(generateGIF);
  await program.parseAsync();
}

run();
