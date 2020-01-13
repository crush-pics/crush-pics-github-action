const { getPlan } = require("./crush-api");
const { filesize } = require("humanize");

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

module.exports = {
  generateMarkdownFailedReport,
  generateMarkdownSuccessfulReport,
}
