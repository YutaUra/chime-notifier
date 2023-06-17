import AudioRecorder from "node-audiorecorder";
import fs from "fs";
import path from "path";
import pino from "pino";
import PinoPretty from "pino-pretty";
import prettyBytes from "pretty-bytes";
import prettyMs from "pretty-ms";

const logger = pino(PinoPretty({}));

const DIRECTORY = "examples-recordings";
// const MAX_BUFFER_SIZE = 1024 * 1024 * 512;
const BYTE_SIZE_PER_SEC = 31911;
const SAVE_PER_SEC = 60 * 5;

const options = {
  program: "sox",
  silence: 0,
};

const getSometimes = (times: number) => {
  let i = 0;

  return () => {
    i++;
    return i % times === 0;
  };
};

const main = async () => {
  logger.info("start");
  if (!fs.existsSync(DIRECTORY)) {
    logger.info("create directory");
    fs.mkdirSync(DIRECTORY);
  }

  const audioRecorder = new AudioRecorder(options, {
    log: logger.info.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
  });

  audioRecorder.on("error", function (err) {
    logger.warn("Recording error.", err);
  });
  audioRecorder.on("end", function () {
    logger.warn("Recording ended.");
  });

  // const filename = path.join(
  //   DIRECTORY,
  //   Math.random()
  //     .toString(36)
  //     .replace(/[^0-9a-zA-Z]+/g, "")
  //     .concat(".wav")
  // );

  // const fileStream = fs.createWriteStream(filename, { encoding: "binary" });

  const startRecording = () => {
    let buf = Buffer.from([]);
    logger.info("start recording");
    const sometimes = getSometimes(30);
    const startTime = Date.now();
    audioRecorder
      .start()
      .stream()
      .on("data", (data: Buffer) => {
        buf = Buffer.concat([buf, data]);

        if (sometimes()) {
          logger.info(
            `buffer size: ${prettyBytes(buf.byteLength)}, elapsed: ${prettyMs(
              Date.now() - startTime
            )}, current memory usage: ${prettyBytes(process.memoryUsage().rss)}`
          );
        }

        if (buf.byteLength <= BYTE_SIZE_PER_SEC * SAVE_PER_SEC) {
          // skip
          return;
        }

        logger.info("saving file");
        const now = new Date();
        const filename = path.join(
          DIRECTORY,
          `${now.getFullYear()}-${
            now.getMonth() + 1
          }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.wav`
        );
        fs.writeFileSync(filename, buf);
        logger.info(`saved file done: ${filename}`);

        audioRecorder.stop();
        buf = Buffer.from([]);
        startRecording();
        // if (buf.byteLength > MAX_BUFFER_SIZE) {
        //   // reduce buffer size
        //   buf = buf.slice(buf.byteLength - MAX_BUFFER_SIZE);
        //   console.log("too large");
        // }

        // console.log("data", buf.byteLength);
      });
  };

  startRecording();

  process.on("SIGINT", () => {
    logger.info("SIGINT");
    audioRecorder.stop();
    process.exit(0);
  });

  // setInterval(() => {
  //   fs.writeFileSync(filename, buf);
  // }, 1000 * 5);

  // await new Promise((resolve) => setTimeout(resolve, 10000));
  // audioRecorder.stop();

  // console.log(buf.byteLength);
};

main();
