import {describe, expect, test} from '@jest/globals';
import {GifskiCommand} from "../src";
import * as path from "path";
import * as fs from "fs";
import {spawnSync} from "child_process";

const output = path.join(__dirname, 'video.gif');
const output2 = path.join(__dirname, 'video2.gif');
const frames = [path.join(__dirname, 'video.mp4.frame*.png')];

jest.setTimeout(20000);

describe('gifski-command', () => {
  beforeEach(cb => {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
    }
    if (fs.existsSync(output2)) {
      fs.unlinkSync(output2);
    }
    cb();
  });

  afterEach(cb => {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
    }
    if (fs.existsSync(output2)) {
      fs.unlinkSync(output2);
    }
    cb();
  });

  test('basic usage', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
  });

  test('basic usage with glob pattern frames', async () => {
    const command = new GifskiCommand({
      output,
      frames: path.join(__dirname, '**', 'video.mp4.frame*.png')
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
  });

  test('basic usage error', async () => {
    const command = new GifskiCommand({
      output,
      frames: [path.join(__dirname, 'video.mp4.frame*.not.existing')]
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeFalsy();
    expect(result.err).toBeDefined();
    expect(result.stderr).toBeDefined();
  });

  test('basic usage sync', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    const result = command.runSync();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
  });

  test('basic usage to stdout', async () => {
    const command = new GifskiCommand({
      output: '-',
      frames
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeFalsy();
    expect(result.err).toBeUndefined();
    expect(result.stdout).toBeDefined();
  });

  test('basic usage sync to stdout', async () => {
    const command = new GifskiCommand({
      output: '-',
      frames
    });
    const result = command.runSync();
    expect(fs.existsSync(output)).toBeFalsy();
    expect(result.err).toBeUndefined();
    expect(result.stdout).toBeDefined();
  });

  test('progress event', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    command.on('progress', progress => {
      expect(progress).toBeDefined();
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
  });

  test('progress event not called with sync', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    let i = 0;
    command.on('progress', () => {
      i++;
    });
    const result = command.runSync();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
    expect(i).toBe(0);
  });

  test('end event', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    command.on('end', (err) => {
      expect(err).toBeUndefined();
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
  });

  test('end event not called with sync', async () => {
    const command = new GifskiCommand({
      output,
      frames
    });
    let i = 0;
    command.on('end', () => {
      i++;
    });
    const result = command.runSync();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
    expect(i).toBe(0);
  });

  test('quality', async () => {
    const command = new GifskiCommand({
      output,
      frames,
      quality: 100
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
    const {size} = fs.statSync(output);

    const command2 = new GifskiCommand({
      output: output2,
      frames,
      quality: 10
    });
    const result2 = await command2.run();
    expect(fs.existsSync(output2)).toBeTruthy();
    expect(result2.err).toBeUndefined();
    const {size: size2} = fs.statSync(output2);

    expect(size).toBeGreaterThan(size2);
  });

  test('quiet', async () => {
    const command = new GifskiCommand({
      output,
      frames,
      quiet: true
    });
    const result = await command.run();
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.err).toBeUndefined();
    expect(result.stdout).toBeUndefined();
  });
});

describe('gifski-command CLI', () => {
  beforeEach(cb => {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
    }
    if (fs.existsSync(output2)) {
      fs.unlinkSync(output2);
    }
    cb();
  });

  afterEach(cb => {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
    }
    if (fs.existsSync(output2)) {
      fs.unlinkSync(output2);
    }
    cb();
  });

  test('basic usage', async () => {
    const result = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '-o', output,
        ...frames
      ], {
        stdio: 'inherit'
      }
    );
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.error).toBeUndefined();
  });

  test('basic usage to stdout', async () => {
    const result = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '-o', '-',
        ...frames
      ], {
        stdio: 'inherit'
      }
    );
    expect(fs.existsSync(output)).toBeFalsy();
    expect(result.error).toBeUndefined();
    expect(result.stdout).toBeDefined();
  });

  test('quality', async () => {
    const result = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '-Q', '100',
        '-o', output,
        ...frames
      ], {
        stdio: 'inherit'
      }
    );
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.error).toBeUndefined();
    const {size} = fs.statSync(output);

    const result2 = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '-Q', '10',
        '-o', output2,
        ...frames
      ], {
        stdio: 'inherit'
      }
    );
    expect(fs.existsSync(output2)).toBeTruthy();
    expect(result2.error).toBeUndefined();
    const {size: size2} = fs.statSync(output2);

    expect(size).toBeGreaterThan(size2);
  });

  test('quiet', async () => {
    const result = spawnSync('ts-node', [
        path.join(__dirname, '..', 'src', 'cli.ts'),
        '--quiet',
        '-o', output,
        ...frames
      ], {
        stdio: 'inherit'
      }
    );
    expect(fs.existsSync(output)).toBeTruthy();
    expect(result.error).toBeUndefined();
    expect(result.stdout).toBeNull();
  });
});
