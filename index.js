const core = require('@actions/core');
const github = require('@actions/github');
const crush = require('@crush-pics/crush-pics');
const axios = require('axios');
const util = require("util");
const path = require("path");
const fs = require('fs').promises;
const { filesize } = require("humanize");
const token = core.getInput('repo-token', { required: true });
const client = new github.GitHub(token);

const API_URL = "https://apistaging.crush.pics/v1";
const API_KEY = core.getInput('api-key', { required: true });

crush.configure({
  api_token: API_KEY,
  baseUrl: API_URL,
});

const processImages = async (imgs) => {
  const images = [];

  for await (const img of imgs) {
    await crush.original_images
      .compress({ file: img.filePath, compression_type: 'balanced' })
      .then(response => {
        const before = response.data.original_image.size;
        var after = response.data.original_image.optimized_images[0].size;
        var percent = 0;

        if (after === undefined) {
          after = before;
        } else {
          percent = Math.round(100 - (after / before) * 100)
        }

        console.log(
          "[Compression]",
          response.data.original_image.filename,
          filesize(before, 1000),
          "->",
          filesize(after, 1000),
          `(${percent}%)`
        );

        images.push({
          filePath: img.filePath,
          repoPath: img.repoPath,
          name: response.data.original_image.filename,
          before: before,
          after: after,
          status: response.data.original_image.optimized_images[0].status,
          url: response.data.original_image.optimized_images[0].link,
          percent: percent,
        });
      })
      .catch(error => {
        if (error.response) {
          console.log('[Compression failed] HTTP Status', error.response.status, error.response.statusText);
        } else if (error.request) {
          console.log('[Compression failed]', error.request);
        } else {
          console.log('[Compression failed]', error.message);
        }
      });
  };

  return images;
}

const parseIsoDate = str => {
  const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/;
  const months = [
    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const [, year, month, day, time] = regex.exec(str) || [];
  const monthNum = parseInt(month);
  const monthName = months[monthNum];
  const dayNum = parseInt(day);

  // 2 Jan 2020 14:24 UTC"
  return `${dayNum} ${monthName} ${year} ${time} UTC`;
}

const getPlan = async () => {
  const response = await crush.account.get();
  const next_charge_at = parseIsoDate(response.data.shop.next_charge_at);
  const plan = {
    code: response.data.shop.plan_data.code,
    name: response.data.shop.plan_data.name,
    quota: response.data.shop.plan_data.bytes,
    used: response.data.shop.plan_data.quota_usage,
    next_charge_at: next_charge_at,
    exhausted: (response.data.shop.plan_data.quota_usage >= response.data.shop.plan_data.bytes),
    paid: (response.data.shop.plan_data.code !== 'free'),
  };

  console.log('Plan name:', plan.name);
  console.log('Plan size:', filesize(plan.quota, 1000));
  console.log('Quota used:', filesize(plan.used, 1000));

  if (plan.exhausted) {
    console.log('[Warning] Quota exhausted');
  }

  if (plan.paid) {
    console.log('Renews:', plan.next_charge_at);
  }

  return plan;
}

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

const downloadImages = async (images) => {
  const compressed = images.filter(i => i.status === "completed");

  for await (const image of compressed) {
    axios({
      method: 'get',
      url: image.url,
      responseType: 'arraybuffer'
    }).then(response => {
      fs.writeFile(image.filePath, response.data);
    }).catch(error => {
      console.log(error);
    });
  }
}

const convertToTreeBlobs = async ({ owner, repo, images }) => {
  const blobs = [];
  const compressed = images.filter(i => i.status === "completed");

  for await (const image of compressed) {
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

  if (treeBlobs.length > 0) {
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
}

const createComment = async (body) => {
  const owner = github.context.payload.repository.owner.login;
  const repo = github.context.payload.repository.name;
  const issue_number = github.context.payload.pull_request.number;

  return client.issues.createComment({ owner, repo, issue_number, body });
};

const finishProcessing = async (images) => {
  downloadImages(images).then(() => {
    createCommit(images)
  });
}

const generateMarkdownSuccessfulReport = async (images) => {
  const lines = [];
  var totalBefore = 0;
  var totalAfter = 0;
  var totalPercent = 0;
  const plan = await getPlan();

  lines.push("Images automagically crushed by [Crush.pics](https://crush.pics) ✨\n");
  lines.push("| File | Before | After | Savings |");
  lines.push("| --- | --- | --- | --- |");

  for (const image of images) {
    lines.push(`| \`${image.repoPath}\` | ${filesize(image.before, 1000)} | ${filesize(image.after, 1000)} | ${image.percent}% |`);
    totalBefore += image.before;
    totalAfter += image.after;
    totalPercent += image.percent;
  };

  const avgPercent = Math.round(totalPercent / images.length);

  lines.push(`| **Total:** | **${filesize(totalBefore, 1000)}** | **${filesize(totalAfter, 1000)}** | **${avgPercent}%** |\n`);
  lines.push(`Plan: **${plan.name}**`);
  lines.push(`Usage: **${filesize(plan.used, 1000)}** of **${filesize(plan.quota, 1000)}**`);
  if (plan.paid) {
    lines.push(`Renews: ${plan.next_charge_at}`);
  }

  if (plan.exhausted) {
    lines.push('\n🚨 **Quota exhausted**');
  }

  return lines.join("\n");
};

const generateMarkdownFailedReport = async (images) => {
  const lines = [];
  const plan = await getPlan();

  for (const image of images) {
    lines.push(`- \`${image.repoPath}\``);
  };

  lines.push(`\nPlan: **${plan.name}**`);
  lines.push(`Usage: **${filesize(plan.used, 1000)}** of **${filesize(plan.quota, 1000)}**`);
  if (plan.paid) {
    lines.push(`Renews: ${plan.next_charge_at}`);
  }

  if (plan.exhausted) {
    lines.push('\n🚨 **Quota exhausted**');
  }

  return lines.join("\n");
};

const run = async () => {
  const changedFiles = await getChangedFiles();

  if (changedFiles.length === 0) {
    return false
  } else {
    const compressedImages = await processImages(changedFiles);

    if (compressedImages.length > 0) {
      await finishProcessing(compressedImages);
      const markdown = await generateMarkdownSuccessfulReport(compressedImages);
      await createComment(markdown);
    } else {
      const markdown = await generateMarkdownFailedReport(changedFiles);
      await createComment(markdown);
    }
  }
}

run();
