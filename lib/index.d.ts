/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { SpawnOptionsWithoutStdio, SpawnSyncOptionsWithBufferEncoding } from "child_process";
import events from "events";
export declare const gifskiPath: string;
export interface GifskiCommandOptions {
    output: string;
    frames: string[];
    fps?: number;
    fast?: boolean;
    extra?: boolean;
    quality?: number;
    width?: number;
    height?: number;
    noSort?: boolean;
    quiet?: boolean;
    repeat?: number;
    stdoutLines?: number;
}
export interface GifskiCommandProgress {
    currentFrame: number;
    totalFrames: number;
    percent: number;
    secondsLeft: number;
}
export declare interface GifskiCommand {
    on(event: 'progress', listener: (name: GifskiCommandProgress) => void): this;
    on(event: 'end', listener: (err?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void): this;
    on(event: 'error', listener: (err?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void): this;
}
export declare class GifskiCommand extends events.EventEmitter {
    options: GifskiCommandOptions;
    constructor(options: GifskiCommandOptions);
    private _buildSpawnArgs;
    run(options?: SpawnOptionsWithoutStdio): Promise<{
        err?: Error;
        stdout?: string | Buffer;
        stderr?: string | Buffer;
    }>;
    runSync(options?: SpawnSyncOptionsWithBufferEncoding): {
        err?: Error;
        stdout?: string | Buffer;
        stderr?: string | Buffer;
    };
}
