declare module "node-audiorecorder" {
  import { EventEmitter } from "events";
  import { ChildProcessWithoutNullStreams } from "child_process";

  export default class AudioRecorder extends EventEmitter {
    constructor(options: any, logger: any);
    start(): this;
    stop(): this;
    stream(): NodeJS.ReadableStream;
    readonly _childProcess: ChildProcessWithoutNullStreams | null;
  }
}
