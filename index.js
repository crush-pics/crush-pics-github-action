const getChangedFiles = require("./src/changed-files");
const { generateMarkdownSuccessfulReport, generateMarkdownFailedReport } = require("./src/markdown-report");
const { convertToTreeBlobs, createCommit, createComment } = require("./src/github");
const getConfig = require("./src/config");
const { processImages } = require("./src/crush-api");
const downloadImages = require("./src/download-images");

const run = async () => {
  const changedFiles = await getChangedFiles();
  const config = await getConfig();

  if (changedFiles.length === 0) {
    return false
  } else {
    const compressedImages = await processImages(changedFiles, config);

    if (compressedImages.length > 0) {
      const markdown = await generateMarkdownSuccessfulReport(compressedImages);

      await downloadImages(compressedImages);
      await createCommit(compressedImages);
      await createComment(markdown);
    } else {
      const markdown = await generateMarkdownFailedReport(changedFiles);

      await createComment(markdown);
    }
  }
}

run();
