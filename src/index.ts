import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio,
  spawnSync,
  SpawnSyncOptionsWithBufferEncoding, SpawnSyncReturns
} from "child_process";
import * as os from "os";
import * as path from "path";
import events from "events";
import * as fs from "fs";

const platform = process.env["npm_config_platform"] || os.platform();

let platformPath = '';
switch (platform) {
  case 'win32':
    platformPath = path.join('windows', 'gifski.exe');
    break;
  case 'darwin':
    platformPath = path.join('macos', 'gifski');
    break;
  case 'linux':
    platformPath = path.join('linux', 'gifski');
    break;
}
if (!platformPath) {
  throw Error(`gifski executable not found for platform ${platform}.`);
}

let _gifskiPath = path.join(
  __dirname, '..', 'node_modules', 'gifski', 'bin', platformPath
);
if (!fs.existsSync(_gifskiPath)) {
  _gifskiPath = path.join(
    __dirname, '..', '..', '..', 'node_modules', 'gifski', 'bin', platformPath
  );
}
if (!fs.existsSync(_gifskiPath)) {
  throw Error(`gifski executable not found in ${_gifskiPath}.`);
}

/**
 * gifski executable path.
 */
export const gifskiPath = _gifskiPath;

/**
 * gifski command options.
 */
export interface GifskiCommandOptions {
  /**
   * <a.gif>. Destination file to write to; "-" means stdout.
   */
  output: string;

  /**
   * PNG image files.
   */
  frames: string[];

  /**
   * Frame rate of animation. This means the speed, as all frames are kept. [default: 20].
   */
  fps?: number;

  /**
   * 50% faster encoding, but 10% worse quality and larger file size.
   */
  fast?: boolean;

  /**
   * 50% slower encoding, but 1% better quality.
   */
  extra?: boolean;

  /**
   * <1-100>. Lower quality may give smaller file [default: 90].
   */
  quality?: number;

  /**
   * <px>. Maximum width. By default anims are limited to about 800x600.
   */
  width?: number;

  /**
   * <px>. Maximum height (stretches if the width is also set).
   */
  height?: number;

  /**
   * Use files exactly in the order given, rather than sorted.
   */
  noSort?: boolean;

  /**
   * Do not display anything on standard output/console
   */
  quiet?: boolean;

  /**
   * <num> Number of times the animation is repeated (-1 none, 0 forever or <value> repetitions).
   */
  repeat?: number;

  /**
   * Maximum number of lines from gifski stdout/stderr to keep in memory (defaults to 100, use 0 for unlimited storage).
   */
  stdoutLines?: number;
}

/**
 * gifski progress event interface.
 */
export interface GifskiCommandProgress {
  /**
   * Current Frame number being processed.
   */
  currentFrame: number;

  /**
   * Total number of frames.
   */
  totalFrames: number;

  /**
   * Progress percentage.
   */
  percent: number;

  /**
   * Seconds left to completion.
   */
  secondsLeft: number;
}

export declare interface GifskiCommand {
  /**
   * Event called multiple times when gifski is running.
   *
   * @param event
   * @param listener
   */
  on(event: 'progress', listener: (name: GifskiCommandProgress) => void): this;

  /**
   * Event called when gifski command is completed.
   *
   * @param event
   * @param listener
   */
  on(event: 'end', listener: (err?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void): this;

  /**
   * Event called when gifski command emit an error.
   *
   * @param event
   * @param listener
   */
  on(event: 'error', listener: (err?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void): this;
}

/**
 * gifski command wrapper.
 */
export class GifskiCommand extends events.EventEmitter {
  /**
   * Options used by the gifski command.
   */
  options: GifskiCommandOptions;

  constructor(options: GifskiCommandOptions) {
    super();
    this.options = options;
  }

  private _buildSpawnArgs(): string[] {
    const processArgs: string[] = [];

    if (this.options.fps) {
      processArgs.push(
        '--fps',
        this.options.fps.toString()
      );
    }
    if (this.options.fast) {
      processArgs.push('--fast');
    }
    if (this.options.extra) {
      processArgs.push('--extra');
    }
    if (this.options.quality) {
      processArgs.push(
        '--quality',
        this.options.quality.toString()
      );
    }
    if (this.options.width) {
      processArgs.push(
        '--width',
        this.options.width.toString()
      );
    }
    if (this.options.height) {
      processArgs.push(
        '--height',
        this.options.height.toString()
      );
    }
    if (this.options.noSort) {
      processArgs.push('--no-sort');
    }
    if (this.options.quiet) {
      processArgs.push('--quiet');
    }
    if (this.options.repeat) {
      processArgs.push(
        '--repeat',
        this.options.repeat.toString()
      );
    }

    processArgs.push(
      '-o',
      this.options.output,
      ...this.options.frames
    );
    return processArgs;
  }

  /**
   * Run gifski command.
   *
   * @param options
   */
  async run(options?: SpawnOptionsWithoutStdio): Promise<{ err?: Error, stdout?: string | Buffer, stderr?: string | Buffer }> {
    options = {
      shell: true,
      ...options
    };

    const maxLines = this.options.stdoutLines ?? 100;

    const stdoutData: (string | Buffer)[] = [];
    let stdoutClosed = false;

    const stderrData: string[] = [];
    let stderrClosed = false;

    let processExited = false;
    let exitError: Error | undefined;

    return new Promise((resolve, _) => {
      const _handleExit = (err?: Error) => {
        if (err) {
          exitError = err;
        }

        if (processExited && stdoutClosed && stderrClosed) {
          const stdout = stdoutData.length > 0 ?
            (this.options.output !== '-' ? stdoutData.join('\n') : Buffer.concat(stdoutData as Buffer[])) :
            undefined;
          const stderr = stderrData.length > 0 ? stderrData.join('\n') : undefined;
          if (exitError && exitError.message.match(/gifski exited with code/) && stderr) {
            // Add gifski error message
            exitError.message += ': ' + stderr;
          }
          this.emit('end', exitError, stdout, stderr);
          resolve({err: exitError, stdout, stderr});
        }
      }

      let gifskiProcess: ChildProcessWithoutNullStreams | null = spawn(
        `${gifskiPath}`,
        this._buildSpawnArgs(),
        options
      );

      gifskiProcess.stdout.on('data', chunk => {
        if (this.options.output !== '-') {
          if (!this.options.quiet) {
            if (maxLines !== 0 && stdoutData.length === maxLines) {
              stdoutData.shift();
            }
            stdoutData.push(chunk.toString());
          }
        } else {
          stdoutData.push(chunk);
        }

        const matches = [...chunk.toString().trim().matchAll(/^Frame (\d+) \/ (\d+).*(\d*)s*$/g)][0];
        if (matches) {
          const currentFrame = parseInt(matches[1]);
          const totalFrames = parseInt(matches[2]);
          const secondsLeft = matches[3] ? parseInt(matches[3]) : 0;

          const progress: GifskiCommandProgress = {
            currentFrame,
            totalFrames,
            percent: currentFrame / totalFrames * 100,
            secondsLeft
          };

          this.emit('progress', progress);
        }
      });

      gifskiProcess.stdout.on('close', () => {
        stdoutClosed = true;
        _handleExit();
      });

      gifskiProcess.stderr.on('data', chunk => {
        if (maxLines !== 0 && stderrData.length === maxLines) {
          stderrData.shift();
        }
        stderrData.push(chunk.toString());
      });

      gifskiProcess.stderr.on('close', () => {
        stderrClosed = true;
        _handleExit();
      });

      gifskiProcess.on('error', err => {
        const stdout = stdoutData.length > 0 ?
          (this.options.output !== '-' ? stdoutData.join('\n') : Buffer.concat(stdoutData as Buffer[])) :
          undefined;
        const stderr = stderrData.length > 0 ? stderrData.join('\n') : undefined;

        this.emit('error', err, stdout, stderr);
      });

      gifskiProcess.on('exit', (code, signal) => {
        processExited = true;

        if (signal) {
          _handleExit(new Error('gifski was killed with signal ' + signal));
        } else if (code) {
          _handleExit(new Error('gifski exited with code ' + code));
        } else {
          _handleExit();
        }

        gifskiProcess = null;
      });
    });
  }

  /**
   * Run gifski command in sync way.
   *
   * @param options
   */
  runSync(options?: SpawnSyncOptionsWithBufferEncoding): { err?: Error, stdout?: string | Buffer, stderr?: string | Buffer } {
    options = {
      shell: true,
      stdio: 'inherit',
      ...options
    };

    const result: SpawnSyncReturns<string | Buffer> = spawnSync(
      `${gifskiPath}`,
      this._buildSpawnArgs(),
      options
    );

    let err = result.error;
    if (result.signal && result.signal !== 'SIGTERM') {
      if (err) {
        err.message += `: gifski was killed with signal ${result.signal}`;
      } else {
        err = new Error(`gifski was killed with signal ${result.signal}`);
      }
    } else if (result.status) {
      if (err) {
        err.message += `: gifski exited with code ${result.status}`;
      } else {
        err = new Error(`gifski exited with code ${result.status}`);
      }
    }

    return {
      err,
      stdout: result.stdout,
      stderr: result.stderr
    };
  }
}
