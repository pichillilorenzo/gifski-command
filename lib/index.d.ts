/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { SpawnOptionsWithoutStdio, SpawnSyncOptionsWithBufferEncoding } from "child_process";
import events from "events";
/**
 * gifski executable path.
 */
export declare const gifskiPath: string;
/**
 * gifski command options.
 */
export interface GifskiCommandOptions {
    /**
     * <a.gif>. Destination file to write to; "-" means stdout.
     */
    output: string;
    /**
     * Glob pattern or list of PNG image files.
     */
    frames: string | string[];
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
export declare class GifskiCommand extends events.EventEmitter {
    /**
     * Options used by the gifski command.
     */
    options: GifskiCommandOptions;
    constructor(options: GifskiCommandOptions);
    private _buildSpawnArgs;
    /**
     * Run gifski command.
     *
     * @param options
     */
    run(options?: SpawnOptionsWithoutStdio): Promise<{
        err?: Error;
        stdout?: string | Buffer;
        stderr?: string | Buffer;
    }>;
    /**
     * Run gifski command in sync way.
     *
     * @param options
     */
    runSync(options?: SpawnSyncOptionsWithBufferEncoding): {
        err?: Error;
        stdout?: string | Buffer;
        stderr?: string | Buffer;
    };
}
