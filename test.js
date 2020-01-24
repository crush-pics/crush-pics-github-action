const path = require("path");
const { generateMarkdownSuccessfulReport, generateMarkdownFailedReport } = require("./src/markdown-report");
const { processImages } = require("./src/crush-api");
const downloadImages = require("./src/download-images");
const getConfig = require("./src/config");

const run = async () => {
  const files = ['images/4_.jpg'];
  const changedFiles = [];
  const config = await getConfig();

  for (const file of files) {
    changedFiles.push({
      repoPath: file,
      filePath: path.resolve(file),
    });
  }

  const compressedImages = await processImages(changedFiles, config);

  if (compressedImages.length > 0) {
    const markdown = await generateMarkdownSuccessfulReport(compressedImages);
    await downloadImages(compressedImages);
    console.log(markdown);
  } else {
    const markdown = await generateMarkdownFailedReport(changedFiles);
    console.log(markdown)
  }
}

run();
