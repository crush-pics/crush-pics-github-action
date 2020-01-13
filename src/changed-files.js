const core = require('@actions/core');
const github = require('@actions/github');
const path = require("path");
const token = core.getInput('repo-token', { required: true });
const client = new github.GitHub(token);

const getChangedFiles = async () => {
  const pullRequest = github.context.payload.pull_request;
  const images = [];

  if (!pullRequest) {
    return undefined;
  }

  const listFilesResponse = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: pullRequest.number
  });
  const changedFilePaths = listFilesResponse.data
    .map(f => f.filename)
    .filter(f => f.match(/^.*\.(png|jpeg|jpg|gif)$/i))
    .filter(f => !f.match(/\/node_modules\//));
  for await (const changedFilePath of changedFilePaths) {
    images.push({
      repoPath: changedFilePath,
      filePath: path.resolve(changedFilePath),
    });
  }

  return images;
}

module.exports = getChangedFiles;
