const path = require("path");
const { generateMarkdownSuccessfulReport, generateMarkdownFailedReport } = require("./src/markdown-report");
const { processImages } = require("./src/crush-api");
const downloadImages = require("./src/download-images");

const run = async () => {
  const files = ['images/4_.jpg'];
  const changedFiles = [];

  for (const file of files) {
    changedFiles.push({
      repoPath: file,
      filePath: path.resolve(file),
    });
  }

  const config = {
    compression_type: 'balanced',
    compresion_level: 85,
    strip_tags: true,
    api_url: 'https://apistaging.crush.pics/v1'
  };

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
