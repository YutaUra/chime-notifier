const AudioRecorder = require("node-audiorecorder");
const fs = require("fs");
const path = require("path");

const DIRECTORY = "examples-recordings";
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

  const fileStream = fs.createWriteStream(filename, { encoding: "binary" });

  audioRecorder.start().stream().pipe(fileStream);

  await new Promise((resolve) => setTimeout(resolve, 10000));
  audioRecorder.stop();
};

main();
