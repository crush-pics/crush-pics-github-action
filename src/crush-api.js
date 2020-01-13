const core = require('@actions/core');
const parseIsoDate = require("./iso-date");
const { filesize } = require("humanize");
const crush = require('@crush-pics/crush-pics');
const API_KEY = process.env.CRUSH_API_KEY || core.getInput('api-key', { required: true });

crush.configure({ api_token: API_KEY });

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

const processImages = async (imgs, config) => {
  const images = [];

  if (config.api_url) {
    crush.configure({ baseUrl: config.api_url });
  }

  for await (const img of imgs) {
    await crush.original_images
      .compress({
        file: img.filePath,
        compression_type: config.compression_type,
        compression_level: `${config.compression_level}`,
        strip_tags: `${config.strip_tags}`,
      })
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

        if (response.data.original_image.status === 'completed') {
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
        }
      })
      .catch(error => {
        if (error.response) {
          console.log('[Compression failed] HTTP Status', error.response.status, error.response.statusText);
        } else if (error.request) {
          console.log('[Compression request failed]', error);
        } else {
          console.log('[Compression failed]', error.message);
        }
      });
  };

  return images;
}

module.exports = {
  getPlan,
  processImages,
}
