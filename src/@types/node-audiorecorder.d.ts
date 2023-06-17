declare module "node-audiorecorder" {
  import { EventEmitter } from "events";

  export default class AudioRecorder extends EventEmitter {
    constructor(options: any, logger: any);
    start(): this;
    stop(): this;
    stream(): NodeJS.ReadableStream;
  }
}
