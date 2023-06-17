import AudioRecorder from "node-audiorecorder";
import fs from "fs";
import path from "path";
// import path from "path";

const DIRECTORY = "examples-recordings";
// const MAX_BUFFER_SIZE = 1024 * 1024 * 512;
const BYTE_SIZE_PER_SEC = 311296 / 10;

const options = {
  program: "sox",
  silence: 0,
};

const main = async () => {
  if (!fs.existsSync(DIRECTORY)) {
    fs.mkdirSync(DIRECTORY);
  }

  const audioRecorder = new AudioRecorder(options, console);

  audioRecorder.on("error", function (err) {
    console.warn("Recording error.", err);
  });
  audioRecorder.on("end", function () {
    console.warn("Recording ended.");
  });

  const filename = path.join(
    DIRECTORY,
    Math.random()
      .toString(36)
      .replace(/[^0-9a-zA-Z]+/g, "")
      .concat(".wav")
  );

  // const fileStream = fs.createWriteStream(filename, { encoding: "binary" });

  let buf = Buffer.from([]);

  audioRecorder
    .start()
    .stream()
    .on("data", (data: Buffer) => {
      buf = Buffer.concat([buf, data]).slice(
        buf.byteLength - BYTE_SIZE_PER_SEC * 60 * 60
      );
      // if (buf.byteLength > MAX_BUFFER_SIZE) {
      //   // reduce buffer size
      //   buf = buf.slice(buf.byteLength - MAX_BUFFER_SIZE);
      //   console.log("too large");
      // }

      // console.log("data", buf.byteLength);
    });
  // .stream().pipe(fileStream);

  setInterval(() => {
    fs.writeFileSync(filename, buf);
  }, 1000 * 5);

  // await new Promise((resolve) => setTimeout(resolve, 10000));
  // audioRecorder.stop();

  // console.log(buf.byteLength);
};

main();
