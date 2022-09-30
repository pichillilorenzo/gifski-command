/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { SpawnOptionsWithoutStdio } from "child_process";
import events from "events";
declare type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;
declare type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export declare const gifskiPath: string;
export interface GifskiCommandOptions {
    output: string;
    frames: string[];
    fps?: number;
    fast?: boolean;
    extra?: boolean;
    quality?: Range<1, 101>;
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
    on(event: 'end', listener: (err?: Error, stdout?: string | Buffer, stderr?: string) => void): this;
    on(event: 'error', listener: (err?: Error, stdout?: string | Buffer, stderr?: string) => void): this;
}
export declare class GifskiCommand extends events.EventEmitter {
    options: GifskiCommandOptions;
    constructor(options: GifskiCommandOptions);
    private _buildSpawnArgs;
    run(options?: SpawnOptionsWithoutStdio): Promise<{
        err?: Error;
        stdout?: string | Buffer;
        stderr?: string;
    }>;
}
export {};
