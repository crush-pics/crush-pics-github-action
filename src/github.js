const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;
const token = core.getInput('repo-token', { required: true });
const client = new github.GitHub(token);

const convertToTreeBlobs = async ({ owner, repo, images }) => {
  const blobs = [];

  for await (const image of images) {
    const encodedImage = await fs.readFile(image.filePath, { encoding: "base64" });

    const blob = await client.git.createBlob({
      owner,
      repo,
      content: encodedImage,
      encoding: "base64"
    });

    blobs.push({
      path: image.repoPath,
      type: "blob",
      mode: "100644",
      sha: blob.data.sha
    });
  }

  return blobs;
}

const createCommit = async (images) => {
  const owner = github.context.payload.repository.owner.login;
  const repo = github.context.payload.repository.name;
  const headSHA = github.context.payload.pull_request.head.sha;
  const headREF = github.context.payload.pull_request.head.ref;

  const lastCommit = await client.git.getCommit({
    owner,
    repo,
    commit_sha: headSHA
  });

  const baseTree = lastCommit.data.tree.sha;
  const treeBlobs = await convertToTreeBlobs({
    owner,
    repo,
    images: images
  });

  const newTree = await client.git.createTree({
    owner,
    repo,
    base_tree: baseTree,
    tree: treeBlobs
  });

  const commit = await client.git.createCommit({
    owner,
    repo,
    message: "Crushed images",
    tree: newTree.data.sha,
    parents: [headSHA]
  });

  console.log(`Committed ${commit.data.sha} (${headREF})`);

  await client.git.updateRef({
    owner,
    repo,
    ref: `heads/${headREF}`,
    sha: commit.data.sha
  });
}

const createComment = async (body) => {
  const owner = github.context.payload.repository.owner.login;
  const repo = github.context.payload.repository.name;
  const issue_number = github.context.payload.pull_request.number;

  return client.issues.createComment({ owner, repo, issue_number, body });
};

module.exports = {
  convertToTreeBlobs,
  createCommit,
  createComment,
}
